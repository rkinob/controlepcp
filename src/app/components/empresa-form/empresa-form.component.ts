import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../services/empresa.service';
import { NotificationService } from '../../services/notification.service';
import { Empresa } from '../../model/empresa';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css'
})
export class EmpresaFormComponent implements OnInit {
  empresaForm!: FormGroup;
  isEditMode = false;
  empresaId: number | null = null;
  errorMessage: string | null = null;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private empresaService: EmpresaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.empresaForm = this.fb.group({
      cnpj: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(18)]],
      nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      logradouro: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      estado: [''],
      cep: [''],
      celular: [''],
      email: ['', [Validators.email]],
      fl_ativo: [true]
    });

    this.empresaId = this.route.snapshot.params['id'];
    if (this.empresaId) {
      this.isEditMode = true;
      this.loadEmpresa(this.empresaId);
    }
  }

  loadEmpresa(id: number): void {
    this.loading = true;
    this.empresaService.getById(id).subscribe({
      next: (response) => {
        const empresa = response.data;
        this.empresaForm.patchValue({
          cnpj: empresa.cnpj,
          nome: empresa.nome,
          logradouro: empresa.logradouro || '',
          numero: empresa.numero || '',
          complemento: empresa.complemento || '',
          bairro: empresa.bairro || '',
          cidade: empresa.cidade || '',
          estado: empresa.estado || '',
          cep: empresa.cep || '',
          celular: empresa.celular || '',
          email: empresa.email || '',
          fl_ativo: empresa.fl_ativo === 1
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar empresa: ' + error.message;
        this.loading = false;
      }
    });
  }

  onCnpjBlur(): void {
    const cnpj = this.empresaForm.get('cnpj')?.value;
    if (cnpj && cnpj.replace(/\D/g, '').length === 14) {
      this.empresaService.checkCnpjExists(cnpj, this.empresaId || undefined).subscribe({
        next: (response) => {
          if (response.data.exists) {
            this.empresaForm.get('cnpj')?.setErrors({ cnpjExists: true });
          }
        },
        error: (error) => {
          console.error('Erro ao verificar CNPJ:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.empresaForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.empresaForm.value;
    const empresaData: Partial<Empresa> = {
      cnpj: formData.cnpj.replace(/\D/g, ''),
      nome: formData.nome,
      logradouro: formData.logradouro || null,
      numero: formData.numero || null,
      complemento: formData.complemento || null,
      bairro: formData.bairro || null,
      cidade: formData.cidade || null,
      estado: formData.estado || null,
      cep: formData.cep || null,
      celular: formData.celular || null,
      email: formData.email || null,
      fl_ativo: formData.fl_ativo ? 1 : 0
    };

    this.saving = true;
    this.errorMessage = null;

    if (this.isEditMode && this.empresaId) {
      this.empresaService.update(this.empresaId, empresaData).subscribe({
        next: (response) => {
          this.saving = false;
          this.notificationService.success(
            'Empresa Atualizada',
            `Empresa ${empresaData.nome} foi atualizada com sucesso!`
          );
          this.router.navigate(['/empresa']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.message || 'Erro ao atualizar empresa';
        }
      });
    } else {
      this.empresaService.create(empresaData).subscribe({
        next: (response) => {
          this.saving = false;
          this.notificationService.success(
            'Empresa Criada',
            `Empresa ${empresaData.nome} foi criada com sucesso!`
          );
          this.router.navigate(['/empresa']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.message || 'Erro ao criar empresa';
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.empresaForm.controls).forEach(key => {
      const control = this.empresaForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.empresaForm.get(fieldName);
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
      if (field.errors['email']) {
        return 'Email inválido';
      }
      if (field.errors['cnpjExists']) {
        return 'CNPJ já cadastrado';
      }
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'cnpj': 'CNPJ',
      'nome': 'Nome',
      'logradouro': 'Logradouro',
      'numero': 'Número',
      'complemento': 'Complemento',
      'bairro': 'Bairro',
      'cidade': 'Cidade',
      'estado': 'Estado',
      'cep': 'CEP',
      'celular': 'Celular',
      'email': 'E-mail'
    };
    return labels[fieldName] || fieldName;
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Editar Empresa' : 'Nova Empresa';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }
}

