import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DistribuirOPService, DistribuirOPRequest, DisponibilidadeHorario } from '../../services/distribuir-op.service';
import { ModeloPecaService } from '../../services/modelo-peca.service';
import { ModeloPeca } from '../../model/modelo-peca';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { GrupoProducao } from '../../model/grupo-producao';
import { OrdemProducaoService } from '../../services/ordem-producao.service';
import { OrdemProducao } from '../../model/ordem-producao';
import { DistribuicaoOpViewComponent } from '../distribuicao-op-view/distribuicao-op-view.component';
import { DistribuicaoOpViewService } from '../../services/distribuicao-op-view.service';

@Component({
  selector: 'app-distribuir-op',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DistribuicaoOpViewComponent],
  templateUrl: './distribuir-op.component.html',
  styleUrl: './distribuir-op.component.css'
})
export class DistribuirOPComponent implements OnInit {
  distribuirForm!: FormGroup;
  modelos: ModeloPeca[] = [];
  grupos: GrupoProducao[] = [];
  ordens: OrdemProducao[] = [];
  disponibilidade: DisponibilidadeHorario[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  distribuicaoResult: any = null;

  // Controle de distribuição
  opJaDistribuida = false;
  qtdJaDistribuida = 0;
  qtdRestante = 0;
  distribuicaoExistente: any = null;

  // Controle de visualização
  mostrarDistribuicao = false;
  distribuicaoAtual: any = null;

  constructor(
    private fb: FormBuilder,
    private distribuirOPService: DistribuirOPService,
    private modeloPecaService: ModeloPecaService,
    private grupoProducaoService: GrupoProducaoService,
    private ordemProducaoService: OrdemProducaoService,
    private distribuicaoOpViewService: DistribuicaoOpViewService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obter data atual no formato YYYY-MM-DD
    const hoje = new Date();
    const dataAtual = hoje.toISOString().split('T')[0];

    this.distribuirForm = this.fb.group({
      id_ordem_producao: ['', Validators.required],
      id_grupo_producao: ['', Validators.required],
      data_inicio: [dataAtual, Validators.required],
      qtd_total: ['', [Validators.required, Validators.min(1)]],
      id_modelo: ['', Validators.required]
    });

    this.loadModelos();
    this.loadGrupos();
    this.loadOrdens();
    this.loadDataFromQueryParams();
  }

  loadModelos(): void {
    this.modeloPecaService.list(1).subscribe({
      next: (response) => {
        this.modelos = response.modelos || [];
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar modelos: ' + error.message;
      }
    });
  }

  loadGrupos(): void {
    this.grupoProducaoService.list(1, 100).subscribe({
      next: (response) => {
        this.grupos = response.data.grupos || [];
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar grupos: ' + error.message;
      }
    });
  }

  loadOrdens(): void {
    this.ordemProducaoService.list(1, 100).subscribe({
      next: (response) => {
        this.ordens = response.data.ordens || [];
      },
      error: (error) => {
        console.error('Erro ao carregar ordens:', error);
        this.errorMessage = 'Erro ao carregar ordens: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
      }
    });
  }

  loadDataFromQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id_ordem_producao']) {
        this.distribuirForm.patchValue({
          id_ordem_producao: params['id_ordem_producao']
        });
        this.onOrdemChange();
      }
      if (params['id_modelo']) {
        this.distribuirForm.patchValue({
          id_modelo: params['id_modelo']
        });
        this.onModeloChange();
      }
      if (params['qtd_total']) {
        this.distribuirForm.patchValue({
          qtd_total: params['qtd_total']
        });
      }
    });
  }

  onVoltar(): void {
    this.router.navigate(['/ordem-producao']);
  }

  onModeloChange(): void {
    const id_modelo = this.distribuirForm.get('id_modelo')?.value;
    if (id_modelo) {
      const modelo = this.modelos.find(m => m.id_modelo == id_modelo);
      if (modelo) {
        this.distribuirForm.patchValue({
          meta_por_hora: modelo.meta_por_hora
        });
      }
    }
  }

  onOrdemChange(): void {
    const idOrdem = this.distribuirForm.get('id_ordem_producao')?.value;
    if (idOrdem) {
      this.verificarDistribuicaoExistente(idOrdem);
    }
  }

  verificarDistribuicaoExistente(idOrdem: number): void {
    this.distribuirOPService.verificarDistribuicaoExistente(idOrdem).subscribe({
      next: (response) => {
        console.log(response);
        if (response.success) {
          this.distribuicaoExistente = response.data;
          this.qtdJaDistribuida = response.data.qtd_distribuida || 0;
          this.opJaDistribuida = this.qtdJaDistribuida >= (response.data.qtd_total || 0);

          if (this.opJaDistribuida) {
            this.qtdRestante = 0;
            this.errorMessage = 'Esta OP já foi completamente distribuída. Não é possível distribuir novamente.';
          } else {
            this.qtdRestante = (response.data.qtd_total || 0) - this.qtdJaDistribuida;
            this.errorMessage = null;
            this.successMessage = `OP parcialmente distribuída. Quantidade restante: ${this.qtdRestante} peças.`;
          }
        }
      },
      error: (error) => {
        console.error('Erro ao verificar distribuição existente:', error);
        this.errorMessage = 'Erro ao verificar distribuição existente: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
      }
    });
  }

  verificarDisponibilidade(): void {
    if (this.distribuirForm.get('id_grupo_producao')?.invalid ||
        this.distribuirForm.get('data_inicio')?.invalid) {
      this.errorMessage = 'Preencha o grupo de produção e data de início';
      return;
    }

    const id_grupo_producao = this.distribuirForm.get('id_grupo_producao')?.value;
    const data_inicio = this.distribuirForm.get('data_inicio')?.value;

    this.loading = true;
    this.errorMessage = null;

    this.distribuirOPService.verificarDisponibilidade(id_grupo_producao, data_inicio, 14).subscribe({
      next: (response) => {
        console.log(response);
        this.disponibilidade = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao verificar disponibilidade:', error);
        this.errorMessage = 'Erro ao verificar disponibilidade: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }

  getGrupoDescricao(id: number): string {
    const grupo = this.grupos.find(g => g.id_grupo_producao === id);
    return grupo ? grupo.descricao : 'Grupo não encontrado';
  }

  getOrdemCodigo(id: number): string {
    const ordem = this.ordens.find(o => o.id_ordem_producao === id);
    return ordem ? ordem.codigo_op : 'OP não encontrada';
  }

  onSubmit(): void {
    if (this.distribuirForm.invalid) {
      this.errorMessage = 'Preencha todos os campos obrigatórios';
      return;
    }

    if (this.opJaDistribuida) {
      this.errorMessage = 'Esta OP já foi completamente distribuída. Não é possível distribuir novamente.';
      return;
    }

    const formData = this.distribuirForm.value;
    const request: DistribuirOPRequest = {
      id_ordem_producao: parseInt(formData.id_ordem_producao),
      id_grupo_producao: parseInt(formData.id_grupo_producao),
      data_inicio: formData.data_inicio,
      qtd_total: this.qtdRestante > 0 ? this.qtdRestante : parseInt(formData.qtd_total)
    };

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.distribuicaoResult = null;

    this.distribuirOPService.distribuirOP(request).subscribe({
      next: (response) => {
        this.distribuicaoResult = response.data;
        this.successMessage = `OP distribuída com sucesso! Utilizados ${response.data.dias_utilizados} dias.`;
        this.loading = false;
        this.verificarDisponibilidade(); // Atualizar disponibilidade
      },
      error: (error) => {
        console.error('Erro ao distribuir OP:', error);
        this.errorMessage = 'Erro ao distribuir OP: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }

  getDiaSemana(dia: number): string {
    const dias = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    return dias[dia] || 'Desconhecido';
  }

  getStatusClass(horarios_livres: number, total_horarios: number): string {
    const percentual = (horarios_livres / total_horarios) * 100;
    if (percentual >= 80) return 'status-livre';
    if (percentual >= 50) return 'status-parcial';
    return 'status-ocupado';
  }

  getStatusText(horarios_livres: number, total_horarios: number): string {
    const percentual = (horarios_livres / total_horarios) * 100;
    if (percentual >= 80) return 'Livre';
    if (percentual >= 50) return 'Parcial';
    return 'Ocupado';
  }

  getTotalDistribuido(): number {
    if (!this.distribuicaoResult?.distribuicao) return 0;
    return this.distribuicaoResult.distribuicao.reduce((sum: number, dia: any) => sum + dia.qtd_distribuida, 0);
  }

  /**
   * Cancelar distribuição de OP
   */
  cancelarDistribuicao(): void {
    const formData = this.distribuirForm.value;

    if (!formData.id_ordem_producao || !formData.id_grupo_producao) {
      this.errorMessage = 'Selecione uma OP e grupo de produção para cancelar a distribuição';
      return;
    }

    if (!confirm('Tem certeza que deseja cancelar a distribuição desta OP? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const request = {
      id_ordem_producao: parseInt(formData.id_ordem_producao),
      id_grupo_producao: parseInt(formData.id_grupo_producao)
    };

    this.distribuirOPService.cancelarDistribuicao(request).subscribe({
      next: (response) => {
        this.successMessage = 'Distribuição cancelada com sucesso!';
        this.loading = false;
        this.distribuicaoResult = null;
        this.opJaDistribuida = false;
        this.qtdJaDistribuida = 0;
        this.qtdRestante = 0;
        this.distribuicaoExistente = null;
        this.verificarDisponibilidade(); // Atualizar disponibilidade
      },
      error: (error) => {
        console.error('Erro ao cancelar distribuição:', error);
        this.errorMessage = 'Erro ao cancelar distribuição: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }

  /**
   * Verificar se pode cancelar distribuição
   */
  podeCancelarDistribuicao(): boolean {
    const formData = this.distribuirForm.value;
    return formData.id_ordem_producao && formData.id_grupo_producao && this.opJaDistribuida;
  }

  /**
   * Consultar distribuição existente
   */
  consultarDistribuicao(): void {
    const formData = this.distribuirForm.value;

    if (!formData.id_ordem_producao || !formData.id_grupo_producao) {
      this.errorMessage = 'Selecione uma OP e grupo de produção para consultar a distribuição';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.mostrarDistribuicao = false;

    // Buscar distribuição existente usando o serviço correto
    this.distribuicaoOpViewService.getDistribuicao(
      parseInt(formData.id_ordem_producao),
      parseInt(formData.id_grupo_producao),
      formData.data_inicio,
      6
    ).subscribe({
      next: (response) => {
        console.log('Resposta da consulta de distribuição:', response);
        if (response.success && response.data && response.data.distribuicao && response.data.distribuicao.length > 0) {
          this.distribuicaoAtual = response.data;
          this.mostrarDistribuicao = true;
          this.successMessage = 'Distribuição encontrada!';
        } else {
          this.errorMessage = 'Nenhuma distribuição encontrada para esta OP e grupo de produção';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao consultar distribuição:', error);
        this.errorMessage = 'Erro ao consultar distribuição: ' + (error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }

  /**
   * Voltar para o formulário de distribuição
   */
  voltarParaFormulario(): void {
    this.mostrarDistribuicao = false;
    this.distribuicaoAtual = null;
    this.distribuicaoResult = null;
    this.errorMessage = null;
    this.successMessage = null;
  }

  /**
   * Verificar se pode consultar distribuição
   */
  podeConsultarDistribuicao(): boolean {
    const formData = this.distribuirForm.value;
    return formData.id_ordem_producao && formData.id_grupo_producao;
  }
}
