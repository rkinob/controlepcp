import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DistribuicaoOpViewService, DistribuicaoResponse, HorarioDistribuicao, DiaDistribuicao, OrdemProducaoInfo } from '../../services/distribuicao-op-view.service';
import { NotificationService } from '../../services/notification.service';

interface DiaDistribuicaoEditavel extends DiaDistribuicao {
  horarios: HorarioDistribuicao[];
}

@Component({
  selector: 'app-distribuicao-op-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './distribuicao-op-view.component.html',
  styleUrl: './distribuicao-op-view.component.css'
})
export class DistribuicaoOpViewComponent implements OnInit, OnChanges {
  // Inputs para receber dados externos
  @Input() id_ordem_producao_input: number = 0;
  @Input() id_grupo_producao_input: number = 0;
  @Input() data_inicio_input: string = '';
  @Input() autoLoad: boolean = true; // Se deve carregar automaticamente

  // Propriedades internas (mantidas para compatibilidade)
  id_ordem_producao: number = 0;
  id_grupo_producao: number = 0;
  data_inicio: string = '';

  distribuicao: DiaDistribuicaoEditavel[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Dados da OP
  ordemProducao: OrdemProducaoInfo | null = null;

  constructor(
    private fb: FormBuilder,
    private distribuicaoOpViewService: DistribuicaoOpViewService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Se não há inputs externos, usar query params (comportamento original)
    if (!this.id_ordem_producao_input && !this.id_grupo_producao_input && !this.data_inicio_input) {
      this.route.queryParams.subscribe(params => {
        this.id_ordem_producao = parseInt(params['id_ordem_producao'] || '0');
        this.id_grupo_producao = parseInt(params['id_grupo_producao'] || '0');
        this.data_inicio = params['data_inicio'] || '';

        if (this.id_ordem_producao && this.id_grupo_producao && this.data_inicio) {
          this.carregarDistribuicao();
        }
      });
    } else {
      // Usar inputs externos
      this.atualizarDados();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Quando os inputs mudarem, atualizar os dados internos
    if (changes['id_ordem_producao_input'] || changes['id_grupo_producao_input'] || changes['data_inicio_input']) {
      this.atualizarDados();
    }
  }

  private atualizarDados(): void {
    this.id_ordem_producao = this.id_ordem_producao_input;
    this.id_grupo_producao = this.id_grupo_producao_input;
    this.data_inicio = this.data_inicio_input;

    console.log('DistribuicaoOpView - atualizarDados:', {
      id_ordem_producao: this.id_ordem_producao,
      id_grupo_producao: this.id_grupo_producao,
      data_inicio: this.data_inicio,
      autoLoad: this.autoLoad
    });

    if (this.autoLoad && this.id_ordem_producao && this.id_grupo_producao && this.data_inicio) {
      this.carregarDistribuicao();
    } else if (this.autoLoad) {
      console.log('DistribuicaoOpView - Condições não atendidas para carregar distribuição');
      this.errorMessage = 'Parâmetros insuficientes para carregar distribuição';
    }
  }

  carregarDistribuicao(): void {
    this.loading = true;
    this.errorMessage = null;

    console.log('DistribuicaoOpView - carregarDistribuicao:', {
      id_ordem_producao: this.id_ordem_producao,
      id_grupo_producao: this.id_grupo_producao,
      data_inicio: this.data_inicio
    });

    this.distribuicaoOpViewService.getDistribuicao(
      this.id_ordem_producao,
      this.id_grupo_producao,
      this.data_inicio,
      6
    ).subscribe({
      next: (response: DistribuicaoResponse) => {
        console.log('DistribuicaoOpView - Resposta:', response);
        if (response.success) {
          this.ordemProducao = response.data.ordem_producao;
          this.distribuicao = response.data.distribuicao;
          console.log('DistribuicaoOpView - Distribuição carregada:', this.distribuicao);
        } else {
          this.errorMessage = response.message || 'Erro ao carregar distribuição';
          console.log('DistribuicaoOpView - Erro na resposta:', this.errorMessage);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('DistribuicaoOpView - Erro na requisição:', error);
        this.errorMessage = 'Erro ao carregar distribuição: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });
  }


  replicarQuantidade(dia: DiaDistribuicaoEditavel): void {
    const quantidade = prompt(`Digite a quantidade realizada para replicar em todos os horários de ${this.formatarData(dia.data)}:`);

    if (quantidade !== null && !isNaN(Number(quantidade))) {
      const qtd = Number(quantidade);
      if (qtd >= 0) {
        // Atualizar interface localmente primeiro
        dia.horarios.forEach(horario => {
          horario.qtd_realizada = qtd;
        });

        // Tentar salvar no banco apenas para horários com ID
        const promises = dia.horarios
          .filter(horario => horario.id_ordem_producao_horas_data)
          .map(horario => this.atualizarQuantidadeNoBanco(horario, qtd));

        if (promises.length > 0) {
          Promise.all(promises).then(() => {
            this.recalcularTotaisDia(dia.horarios[0]);
            this.aplicarLogicaSaldo();
            this.notificationService.success('Sucesso', 'Quantidade replicada com sucesso!');
          }).catch(error => {
            console.error('Erro ao replicar quantidade:', error);
            this.errorMessage = 'Erro ao replicar quantidade: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
          });
        } else {
          // Se nenhum horário tem ID, apenas atualizar localmente
          this.recalcularTotaisDia(dia.horarios[0]);
          this.aplicarLogicaSaldo();
          this.notificationService.warning('Aviso', 'Quantidade replicada localmente. Os horários serão criados no banco automaticamente.');
        }
      } else {
        this.errorMessage = 'Quantidade deve ser um número positivo ou zero';
      }
    }
  }

  replicarQuantidadeHorario(horario: HorarioDistribuicao, dia: DiaDistribuicaoEditavel): void {
    const quantidade = horario.qtd_realizada;

    if (quantidade >= 0) {
      // Atualizar interface localmente primeiro
      dia.horarios.forEach(h => {
        h.qtd_realizada = quantidade;
      });

      // Tentar salvar no banco apenas para horários com ID
      const promises = dia.horarios
        .filter(h => h.id_ordem_producao_horas_data)
        .map(h => this.atualizarQuantidadeNoBanco(h, quantidade));

      if (promises.length > 0) {
        Promise.all(promises).then(() => {
          this.recalcularTotaisDia(dia.horarios[0]);
          this.aplicarLogicaSaldo();
          this.notificationService.success('Sucesso', 'Quantidade replicada com sucesso!');
        }).catch(error => {
          console.error('Erro ao replicar quantidade:', error);
          this.errorMessage = 'Erro ao replicar quantidade: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        });
      } else {
        // Se nenhum horário tem ID, apenas atualizar localmente
        this.recalcularTotaisDia(dia.horarios[0]);
        this.aplicarLogicaSaldo();
        this.notificationService.warning('Aviso', 'Quantidade replicada localmente. Os horários serão criados no banco automaticamente.');
      }
    }
  }

  private atualizarQuantidadeNoBanco(horario: HorarioDistribuicao, quantidade: number): Promise<any> {
    if (!horario.id_ordem_producao_horas_data) {
      return Promise.resolve();
    }

    return this.distribuicaoOpViewService.updateQuantidadeRealizada({
      id_ordem_producao_horas_data: horario.id_ordem_producao_horas_data,
      qtd_realizada: quantidade
    }).toPromise();
  }

  salvarQuantidadeRealizada(horario: HorarioDistribuicao, novaQuantidade: number): void {
    // Se não tem ID, apenas atualizar localmente e notificar
    if (!horario.id_ordem_producao_horas_data) {
      horario.qtd_realizada = novaQuantidade;
      this.recalcularTotaisDia(horario);
     // this.aplicarLogicaSaldo();
      this.notificationService.warning('Aviso', 'Quantidade salva localmente. O horário será criado no banco de dados automaticamente.');
      return;
    }

    this.distribuicaoOpViewService.updateQuantidadeRealizada({
      id_ordem_producao_horas_data: horario.id_ordem_producao_horas_data,
      qtd_realizada: novaQuantidade
    }).subscribe({
      next: (response) => {
        if (response.success) {
          horario.qtd_realizada = novaQuantidade;

          // Recalcular totais do dia
          this.recalcularTotaisDia(horario);

          // Aplicar lógica de saldo
         // this.aplicarLogicaSaldo();

          this.notificationService.success('Sucesso', 'Quantidade realizada atualizada com sucesso!');
        } else {
          this.errorMessage = response.message || 'Erro ao atualizar quantidade realizada';
        }
      },
      error: (error) => {
        console.error('Erro ao atualizar quantidade realizada:', error);
        this.errorMessage = 'Erro ao atualizar quantidade realizada: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
      }
    });
  }


  recalcularTotaisDia(horario: HorarioDistribuicao): void {
    // Encontrar o dia que contém este horário
    for (const dia of this.distribuicao) {
      if (dia.horarios.includes(horario)) {
        // Recalcular apenas total realizado e saldo
       // dia.total_realizado = dia.horarios.reduce((sum, h) => sum + h.qtd_realizada, 0);
       console.log(dia.total_realizado);
        dia.saldo = dia.total_realizado - dia.total_previsto;
        break;
      }
    }
  }

  recalcularTotaisCompletosDia(dia: DiaDistribuicao): void {
    // Recalcular totais previstos, realizados e saldo
    dia.total_previsto = dia.horarios.reduce((sum, h) => sum + h.qtd_prevista, 0);
    dia.total_realizado = dia.horarios.reduce((sum, h) => sum + h.qtd_realizada, 0);
    dia.saldo = dia.total_realizado - dia.total_previsto;
  }

  aplicarLogicaSaldo(): void {
    // Implementar lógica de redistribuição de saldo
    // Saldo negativo: jogar para próximos dias
    // Saldo positivo: retirar das próximas produções
    for (let i = 0; i < this.distribuicao.length; i++) {
      const dia = this.distribuicao[i];

      if (dia.saldo < 0) {
        // Saldo negativo: distribuir para próximos dias
        this.distribuirSaldoNegativo(dia, i);
      } else if (dia.saldo > 0) {
        // Saldo positivo: reduzir próximas produções
        this.reduzirSaldoPositivo(dia, i);
      }
    }
  }

  distribuirSaldoNegativo(dia: DiaDistribuicao, indiceDia: number): void {
    const saldoNegativo = Math.abs(dia.saldo);
    let saldoRestante = saldoNegativo;

    // Distribuir para próximos dias
    for (let i = indiceDia + 1; i < this.distribuicao.length && saldoRestante > 0; i++) {
      const proximoDia = this.distribuicao[i];

      for (const horario of proximoDia.horarios) {
        if (saldoRestante <= 0) break;

        const capacidade = horario.qtd_prevista - horario.qtd_realizada;
        const adicionar = Math.min(saldoRestante, capacidade);

        horario.qtd_prevista += adicionar;
        saldoRestante -= adicionar;
      }

      // Recalcular totais do próximo dia
      this.recalcularTotaisCompletosDia(proximoDia);
    }

    // Zerar saldo do dia atual
    dia.saldo = 0;
  }

  reduzirSaldoPositivo(dia: DiaDistribuicao, indiceDia: number): void {
    const saldoPositivo = dia.saldo;
    let saldoRestante = saldoPositivo;

    // Reduzir próximas produções
    for (let i = indiceDia + 1; i < this.distribuicao.length && saldoRestante > 0; i++) {
      const proximoDia = this.distribuicao[i];

      for (const horario of proximoDia.horarios) {
        if (saldoRestante <= 0) break;

        const reduzir = Math.min(saldoRestante, horario.qtd_prevista);
        horario.qtd_prevista -= reduzir;
        saldoRestante -= reduzir;
      }

      // Recalcular totais do próximo dia
      this.recalcularTotaisCompletosDia(proximoDia);
    }

    // Zerar saldo do dia atual
    dia.saldo = 0;
  }

  fecharProducao(): void {
    if (!confirm('Tem certeza que deseja fechar a produção? Esta ação não pode ser desfeita.')) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Processar saldos negativos
    this.processarSaldosNegativos();

    // Atualizar status para Concluído
    this.atualizarStatusConcluido();

    // Preparar dados para envio
    const dadosFechamento = {
      distribuicao: this.distribuicao,
      id_ordem_producao: this.id_ordem_producao,
      id_grupo_producao: this.id_grupo_producao,
      meta_por_hora: this.ordemProducao?.meta_por_hora || 0
    };

    // Salvar no backend
    this.distribuicaoOpViewService.fecharProducao(dadosFechamento).subscribe({
      next: (response) => {
        this.successMessage = 'Produção fechada com sucesso!';
        this.loading = false;
        this.notificationService.success('Sucesso', 'Produção fechada com sucesso!');
      },
      error: (error) => {
        console.error('Erro ao fechar produção:', error);
        this.errorMessage = 'Erro ao fechar produção: ' + (error?.message || error?.error?.message || 'Erro desconhecido');
        this.loading = false;
        this.notificationService.error('Erro', this.errorMessage);
      }
    });
  }

  private processarSaldosNegativos(): void {
    // Calcular saldo total negativo apenas de dias com produção realizada
    let saldoTotalNegativo = 0;
    for (const dia of this.distribuicao) {
      // Só considerar dias que têm produção realizada (total_realizado > 0)
      if (dia.total_realizado > 0 && dia.saldo < 0) {
        saldoTotalNegativo += Math.abs(dia.saldo);
        dia.saldo = 0; // Zerar saldo do dia
      }
    }

    // Se há saldo negativo, adicionar ao último dia
    if (saldoTotalNegativo > 0) {
      const ultimoDia = this.distribuicao[this.distribuicao.length - 1];

      // Criar novo horário para o saldo negativo
      const novoHorario: HorarioDistribuicao = {
        id_ordem_producao_horas_data: undefined,
        hora_ini: '18:00',
        hora_fim: '19:00',
        qtd_prevista: saldoTotalNegativo,
        qtd_realizada: 0,
        status: 'Previsto'
      };

      ultimoDia.horarios.push(novoHorario);

      // Recalcular totais do último dia
      this.recalcularTotaisCompletosDia(ultimoDia);
    }
  }

  private atualizarStatusConcluido(): void {
    // Atualizar status de todos os horários para Concluído
    for (const dia of this.distribuicao) {
      for (const horario of dia.horarios) {
        horario.status = 'Concluído';
      }
    }
  }

  salvarDistribuicao(): void {
    this.loading = true;
    this.errorMessage = null;

    this.distribuicaoOpViewService.salvarDistribuicao(this.distribuicao).subscribe({
      next: (response) => {
        this.successMessage = 'Distribuição salva com sucesso!';
        this.loading = false;
        this.notificationService.success('Sucesso', 'Distribuição salva com sucesso!');
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/ordem-producao']);
  }

  getDiaSemana(dia: number): string {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[dia];
  }

  formatarData(data: string): string {
    // Criar data local para evitar problemas de UTC
    const [ano, mes, dia] = data.split('-');
    const dataLocal = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return dataLocal.toLocaleDateString('pt-BR');
  }

  getSaldoClass(saldo: number): string {
    if (saldo > 0) return 'saldo-positivo';
    if (saldo < 0) return 'saldo-negativo';
    return 'saldo-zero';
  }
}
