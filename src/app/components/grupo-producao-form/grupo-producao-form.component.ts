import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { GrupoProducao } from '../../model/grupo-producao';
import { NotificationService } from '../../services/notification.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupo-producao-form',
  templateUrl: './grupo-producao-form.component.html',
  styleUrls: ['./grupo-producao-form.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule]
})
export class GrupoProducaoFormComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() grupo: GrupoProducao | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<GrupoProducao>();

  grupoForm: FormGroup;
  loading = false;
  saving = false;
  errorMessage = '';
  isEditMode = false;
  grupoId: number = 0;

  constructor(
    private formBuilder: FormBuilder,
    private grupoProducaoService: GrupoProducaoService,
    private notificationService: NotificationService
  ) {
    this.grupoForm = this.formBuilder.group({
      descricao: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      fl_ativo: [true]
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grupo'] || changes['isVisible']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.grupo && this.grupo.id_grupo_producao) {
      this.isEditMode = true;
      this.grupoId = this.grupo.id_grupo_producao;
      this.loadGrupo();
    } else {
      this.isEditMode = false;
      this.grupoId = 0;
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.grupoForm.patchValue({
      descricao: '',
      fl_ativo: true
    });
    this.errorMessage = '';
  }

  loadGrupo(): void {
    if (!this.grupo) return;

    this.loading = true;
    this.errorMessage = '';

    this.grupoForm.patchValue({
      descricao: this.grupo.descricao,
      fl_ativo: this.grupo.fl_ativo
    });
    this.loading = false;
  }

  onSubmit(): void {
    if (this.grupoForm.valid && !this.saving) {
      this.saving = true;
      this.errorMessage = '';

      const formData = this.grupoForm.value;

      const operation = this.isEditMode
        ? this.grupoProducaoService.update(this.grupoId!, formData)
        : this.grupoProducaoService.create(formData);

      operation.subscribe({
        next: (response) => {
          if (response.success) {
            const action = this.isEditMode ? 'atualizado' : 'criado';
            this.notificationService.success(
              'Grupo de Produção ' + action,
              `Grupo ${formData.descricao} foi ${action} com sucesso!`
            );
            this.saved.emit(response.data);
            this.closeModal();
          } else {
            this.errorMessage = response.message || 'Erro ao salvar grupo';
            this.notificationService.error(
              'Erro ao salvar',
              this.errorMessage
            );
          }
          this.saving = false;
        },
        error: (error) => {
          this.errorMessage = error || 'Erro ao salvar grupo';
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
    Object.keys(this.grupoForm.controls).forEach(key => {
      const control = this.grupoForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.grupoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return this.getFieldLabel(fieldName) + ' é obrigatório';
      }
      if (field.errors['minlength']) {
        return this.getFieldLabel(fieldName) + ' deve ter no mínimo ' + field.errors['minlength'].requiredLength + ' caracteres';
      }
      if (field.errors['maxlength']) {
        return this.getFieldLabel(fieldName) + ' deve ter no máximo ' + field.errors['maxlength'].requiredLength + ' caracteres';
      }
      if (field.errors['descricaoExists']) {
        return 'Esta descrição já existe';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'descricao': 'Descrição',
      'fl_ativo': 'Status Ativo'
    };
    return labels[fieldName] || fieldName;
  }

  descricaoValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    const descricao = control.value;
    const isEdit = this.isEditMode;
    const currentId = this.grupoId;

    if (!descricao || descricao.length < 2) {
      return of(null);
    }

    return this.grupoProducaoService.checkDescricaoExists(descricao, isEdit ? currentId : undefined).pipe(
      map(exists => {
        return exists ? { descricaoExists: true } : null;
      }),
      catchError(() => of(null))
    );
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Grupo de Produção' : 'Novo Grupo de Produção';
  }

  get submitButtonText(): string {
    if (this.saving) {
      return this.isEditMode ? 'Salvando...' : 'Criando...';
    }
    return this.isEditMode ? 'Salvar Alterações' : 'Criar Grupo';
  }
}
