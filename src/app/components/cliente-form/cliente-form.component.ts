import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { NotificationService } from '../../services/notification.service';
import { Cliente } from '../../model/cliente';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cliente-form.component.html',
  styleUrl: './cliente-form.component.css'
})
export class ClienteFormComponent implements OnInit {
  clienteForm!: FormGroup;
  isEditMode = false;
  clienteId: number | null = null;
  errorMessage: string | null = null;
  loading = false;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private clienteService: ClienteService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.clienteForm = this.fb.group({
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

    this.clienteId = this.route.snapshot.params['id'];
    if (this.clienteId) {
      this.isEditMode = true;
      this.loadCliente(this.clienteId);
    }
  }

  loadCliente(id: number): void {
    this.loading = true;
    this.clienteService.getById(id).subscribe({
      next: (response) => {
        const cliente = response.data;
        this.clienteForm.patchValue({
          cnpj: cliente.cnpj,
          nome: cliente.nome,
          logradouro: cliente.logradouro || '',
          numero: cliente.numero || '',
          complemento: cliente.complemento || '',
          bairro: cliente.bairro || '',
          cidade: cliente.cidade || '',
          estado: cliente.estado || '',
          cep: cliente.cep || '',
          celular: cliente.celular || '',
          email: cliente.email || '',
          fl_ativo: cliente.fl_ativo === 1
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar cliente: ' + error.message;
        this.loading = false;
      }
    });
  }

  onCnpjBlur(): void {
    const cnpj = this.clienteForm.get('cnpj')?.value;
    if (cnpj && cnpj.replace(/\D/g, '').length === 14) {
      this.clienteService.checkCnpjExists(cnpj, this.clienteId || undefined).subscribe({
        next: (response) => {
          if (response.data.exists) {
            this.clienteForm.get('cnpj')?.setErrors({ cnpjExists: true });
          }
        },
        error: (error) => {
          console.error('Erro ao verificar CNPJ:', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formData = this.clienteForm.value;
    const clienteData: Partial<Cliente> = {
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

    if (this.isEditMode && this.clienteId) {
      this.clienteService.update(this.clienteId, clienteData).subscribe({
        next: (response) => {
          this.saving = false;
          this.notificationService.success(
            'Cliente Atualizado',
            `Cliente ${clienteData.nome} foi atualizado com sucesso!`
          );
          this.router.navigate(['/cliente']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.message || 'Erro ao atualizar cliente';
        }
      });
    } else {
      this.clienteService.create(clienteData).subscribe({
        next: (response) => {
          this.saving = false;
          this.notificationService.success(
            'Cliente Criado',
            `Cliente ${clienteData.nome} foi criado com sucesso!`
          );
          this.router.navigate(['/cliente']);
        },
        error: (error) => {
          this.saving = false;
          this.errorMessage = error.message || 'Erro ao criar cliente';
        }
      });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
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
    return this.isEditMode ? 'Editar Cliente' : 'Novo Cliente';
  }

  get submitButtonText(): string {
    return this.isEditMode ? 'Atualizar' : 'Criar';
  }
}

