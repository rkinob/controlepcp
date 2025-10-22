import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdemProducaoService } from '../../services/ordem-producao.service';
import { ModeloPecaService } from '../../services/modelo-peca.service';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { OrdemProducao } from '../../model/ordem-producao';
import { ModeloPeca } from '../../model/modelo-peca';
import { GrupoProducao } from '../../model/grupo-producao';
import { Cliente } from '../../model/cliente';

@Component({
  selector: 'app-ordem-producao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ordem-producao-form.component.html',
  styleUrl: './ordem-producao-form.component.css'
})
export class OrdemProducaoFormComponent implements OnInit {
  opForm!: FormGroup;
  isEditMode = false;
  opId: number | null = null;
  modelos: ModeloPeca[] = [];
  grupos: GrupoProducao[] = [];
  clientes: Cliente[] = [];
  errorMessage: string | null = null;
  loading = false;
  codigoExists = false;
  ordemProducao: OrdemProducao | null = null;


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private ordemProducaoService: OrdemProducaoService,
    private modeloPecaService: ModeloPecaService,
    private grupoProducaoService: GrupoProducaoService,
    private clienteService: ClienteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.opForm = this.fb.group({
      id_modelo: ['', Validators.required],
      id_grupo_principal: [''],
      id_cliente: [''],
      codigo_op: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      data_inicio: ['', Validators.required],
      prazo_final: [''],
      qtd_total: ['', [Validators.required, Validators.min(1)]],
      observacao: [''],
      fl_ativo: [true]
    });

    this.opId = this.route.snapshot.params['id'];
    if (this.opId) {
      this.isEditMode = true;
      this.loadOP(this.opId);
    }

    this.loadModelos();
    this.loadGrupos();
    this.loadClientes();
  }

  loadModelos(): void {
    this.modeloPecaService.list(1, 100, '', '1').subscribe({
      next: (response) => {
        this.modelos = response.modelos || [];
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar modelos: ' + error.message;
      }
    });
  }

  loadOP(id: number): void {
    this.loading = true;
    this.ordemProducaoService.getById(id).subscribe({
      next: (opResponse) => {
        const op = opResponse.data;
        this.ordemProducao = op;
        this.opForm.patchValue({
          id_modelo: op.id_modelo,
          id_grupo_principal: op.id_grupo_principal || '',
          id_cliente: op.id_cliente || '',
          codigo_op: op.codigo_op,
          data_inicio: op.data_inicio.split('T')[0], // Converter para formato de data
          prazo_final: op.prazo_final ? op.prazo_final.split('T')[0] : '',
          qtd_total: op.qtd_total,
          observacao: op.observacao || '',
          fl_ativo: op.fl_ativo === 1
        });
        this.loading = false;

      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar OP: ' + error.message;
        this.loading = false;
      }
    });
  }

  onCodigoChange(): void {
    const codigo = this.opForm.get('codigo_op')?.value;
    if (codigo && codigo.length >= 1) {
      this.ordemProducaoService.checkCodigoExists(codigo, this.opId || undefined).subscribe({
        next: (response) => {
          this.codigoExists = response.exists;
          if (this.codigoExists) {
            this.opForm.get('codigo_op')?.setErrors({ codigoExists: true });
          } else {
            const currentErrors = this.opForm.get('codigo_op')?.errors;
            if (currentErrors) {
              delete currentErrors['codigoExists'];
              if (Object.keys(currentErrors).length === 0) {
                this.opForm.get('codigo_op')?.setErrors(null);
              } else {
                this.opForm.get('codigo_op')?.setErrors(currentErrors);
              }
            }
          }
        },
        error: (error) => {
          console.error('Erro ao verificar código:', error);
        }
      });
    }
  }

  onModeloChange(): void {
    const id_modelo = this.opForm.get('id_modelo')?.value;
    if (id_modelo) {
      const modelo = this.modelos.find(m => m.id_modelo == id_modelo);
      if (modelo) {
        // Pode adicionar lógica adicional aqui se necessário
        console.log('Modelo selecionado:', modelo);
      }
    }
  }

  onSubmit(): void {
    if (this.opForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.codigoExists) {
      this.errorMessage = 'Código da OP já existe';
      return;
    }

    const formData = this.opForm.value;
    const opData: Partial<OrdemProducao> = {
      id_modelo: parseInt(formData.id_modelo),
      id_grupo_principal: formData.id_grupo_principal ? parseInt(formData.id_grupo_principal) : undefined,
      id_cliente: formData.id_cliente ? parseInt(formData.id_cliente) : undefined,
      codigo_op: formData.codigo_op,
      data_inicio: formData.data_inicio,
      prazo_final: formData.prazo_final || undefined,
      qtd_total: parseInt(formData.qtd_total),
      observacao: formData.observacao || undefined,
      fl_ativo: formData.fl_ativo ? 1 : 0
    };

    this.loading = true;
    this.errorMessage = null;

    if (this.isEditMode && this.opId) {
      this.ordemProducaoService.update(this.opId, opData).subscribe({
        next: (response) => {
          this.loading = false;
          this.notificationService.success(
            'OP Atualizada',
            `Ordem de produção ${opData.codigo_op} foi atualizada com sucesso!`
          );
          this.router.navigate(['/ordem-producao']);
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            'Erro ao Atualizar OP',
            error.message || 'Erro desconhecido ao atualizar a ordem de produção'
          );
        }
      });
    } else {
      this.ordemProducaoService.create(opData).subscribe({
        next: (response) => {
          this.loading = false;

          // Obter o ID da OP criada da resposta
          // A API retorna: { success: true, data: { id_ordem_producao, codigo_op, ... } }
          const opCriadaId = response.data?.id_ordem_producao || response.data?.ordem_producao?.id_ordem_producao;

          console.log('Resposta da API:', response);
          console.log('ID da OP criada:', opCriadaId);

          this.notificationService.success(
            'OP Criada',
            `Ordem de produção ${opData.codigo_op} foi criada com sucesso! Redirecionando para programação...`
          );

          // Redirecionar para a tela de programação com o ID da OP criada
          if (opCriadaId) {
            this.router.navigate(['/distribuir-op-calendario'], {
              queryParams: {
                opId: opCriadaId,
                fromForm: 'true'
              }
            });
          } else {
            console.error('ID da OP não encontrado na resposta');
            // Se não conseguir o ID, redirecionar para a lista
            this.router.navigate(['/ordem-producao']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error(
            'Erro ao Criar OP',
            error.message || 'Erro desconhecido ao criar a ordem de produção'
          );
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.opForm.controls).forEach(key => {
      const control = this.opForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.opForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} é obrigatório`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} deve ter no máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} deve ser maior que ${field.errors['min'].min}`;
      }
      if (field.errors['codigoExists']) {
        return 'Código da OP já existe';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'id_modelo': 'Modelo',
      'id_grupo_principal': 'Grupo Principal',
      'id_cliente': 'Cliente',
      'codigo_op': 'Código da OP',
      'data_inicio': 'Data de início',
      'prazo_final': 'Prazo Final',
      'qtd_pecas': 'Quantidade de peças',
      'observacao': 'Observação'
    };
    return labels[fieldName] || fieldName;
  }

  getModeloDescricao(modelo: ModeloPeca): string {
    return `${modelo.cd_modelo} - ${modelo.descricao} (${modelo.meta_por_hora}/h)`;
  }

  /**
   * Carregar grupos de produção
   */
  loadGrupos(): void {
    this.grupoProducaoService.list(1, 100).subscribe({
      next: (response) => {
        this.grupos = response.data.grupos || [];
      },
      error: (error) => {
        console.error('Erro ao carregar grupos:', error);
      }
    });
  }

  /**
   * Carregar clientes
   */
  loadClientes(): void {
    this.clienteService.list(1, 100, '', '1').subscribe({
      next: (response) => {
        this.clientes = response.data.clientes || [];
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
      }
    });
  }

  programarOP(): void {
    if (this.opId) {
      this.router.navigate(['/distribuir-op-calendario'], {
        queryParams: { opId: this.opId }
      });
    }
  }

}
