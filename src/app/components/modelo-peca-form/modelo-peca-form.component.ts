import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModeloPecaService, ModeloPeca } from '../../services/modelo-peca.service';
import { EmpresaService } from '../../services/empresa.service';
import { NotificationService } from '../../services/notification.service';
import { Empresa } from '../../model/empresa';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modelo-peca-form',
  templateUrl: './modelo-peca-form.component.html',
  styleUrls: ['./modelo-peca-form.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule]
})
export class ModeloPecaFormComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() modelo: ModeloPeca | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ModeloPeca>();

  modeloForm: FormGroup;
  loading = false;
  saving = false;
  errorMessage = '';
  isEditMode = false;
  modeloId: number = 0;
  empresas: Empresa[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private modeloPecaService: ModeloPecaService,
    private empresaService: EmpresaService,
    private notificationService: NotificationService
  ) {
    this.modeloForm = this.formBuilder.group({
      cd_modelo: ['', [Validators.required], [this.codigoValidator.bind(this)]],
      meta_por_hora: [0, [Validators.required]],
      descricao: ['', [Validators.required]],
      id_empresa: [''],
      fl_ativo: [true]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadEmpresas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modelo'] || changes['isVisible']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.modelo && this.modelo.id_modelo) {
      this.isEditMode = true;
      this.modeloId = this.modelo.id_modelo;
      this.loadModelo();
    } else {
      this.isEditMode = false;
      this.modeloId = 0;
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.modeloForm.patchValue({
      cd_modelo: '',
      meta_por_hora: 0,
      descricao: '',
      id_empresa: '',
      fl_ativo: true
    });
    this.errorMessage = '';
  }

  loadModelo(): void {
    if (!this.modelo) return;

    this.loading = true;
    this.errorMessage = '';

    this.modeloForm.patchValue({
      cd_modelo: this.modelo.cd_modelo,
      meta_por_hora: this.modelo.meta_por_hora,
      descricao: this.modelo.descricao,
      id_empresa: this.modelo.id_empresa || '',
      fl_ativo: this.modelo.fl_ativo
    });
    this.loading = false;
  }

  loadEmpresas(): void {
    this.empresaService.list(1, 100, '', '1').subscribe({
      next: (response) => {
        this.empresas = response.data.empresas || [];

        // Se houver apenas uma empresa e não estiver em modo edição, selecionar automaticamente
        if (this.empresas.length === 1 && !this.isEditMode) {
          this.modeloForm.patchValue({
            id_empresa: this.empresas[0].id_empresa
          });
        }
      },
      error: (error) => {
        console.error('Erro ao carregar empresas:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.modeloForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = '';

      const formData = this.modeloForm.value;

      const operation = this.isEditMode
        ? this.modeloPecaService.update(this.modeloId!, formData)
        : this.modeloPecaService.create(formData);

      operation.subscribe({
        next: (response) => {
          if (response.success) {
            const action = this.isEditMode ? 'atualizado' : 'criado';
            this.notificationService.success(
              'Modelo de Peça ' + action,
              `Modelo ${formData.cd_modelo} foi ${action} com sucesso!`
            );
            this.saved.emit(response.data);
            this.closeModal();
          } else {
            this.errorMessage = response.message || 'Erro ao salvar modelo';
            this.notificationService.error(
              'Erro ao salvar',
              this.errorMessage
            );
          }
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error || 'Erro ao salvar modelo';
          this.notificationService.error(
            'Erro ao salvar',
            this.errorMessage
          );
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.modeloForm.controls).forEach(key => {
      const control = this.modeloForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.modeloForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getFieldLabel(fieldName) + ' é obrigatório';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return this.getFieldLabel(fieldName) + ` deve ter pelo menos ${requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return this.getFieldLabel(fieldName) + ` deve ter no máximo ${maxLength} caracteres`;
      }
      if (field.errors['min']) {
        return this.getFieldLabel(fieldName) + ' deve ser maior que zero';
      }
      if (field.errors['codigoExists']) {
        return 'Código do modelo já existe';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.modeloForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'cd_modelo': 'Código do modelo',
      'meta_por_hora': 'Meta por hora',
      'descricao': 'Descrição',
      'id_empresa': 'Empresa'
    };
    return labels[fieldName] || fieldName;
  }

  codigoValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    console.log('codigoValidator chamado!', control.value);

    const codigo = control.value;
    const isEdit = this.isEditMode;
    const currentId = this.modeloId;

    if (!codigo || codigo.length < 1) {
      console.log('codigoValidator: código vazio, retornando null');
      return of(null);
    }

    console.log('codigoValidator: verificando código', codigo, 'isEdit:', isEdit, 'currentId:', currentId);

    return this.modeloPecaService.checkCodigoExists(codigo, isEdit ? currentId : undefined).pipe(
      map(exists => {
        console.log('codigoValidator: resultado da API', exists);
        return exists ? { codigoExists: true } : null;
      }),
      catchError((error) => {
        console.log('codigoValidator: erro na API', error);
        return of(null);
      })
    );
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Modelo de Peça' : 'Novo Modelo de Peça';
  }

  get submitButtonText(): string {
    if (this.saving) {
      return this.isEditMode ? 'Salvando...' : 'Criando...';
    }
    return this.isEditMode ? 'Salvar Alterações' : 'Criar Modelo';
  }
}
