import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { TipoUsuarioService } from '../../services/tipo-usuario.service';
import { NotificationService } from '../../services/notification.service';
import { Usuario, UsuarioRequest, UsuarioUpdateRequest } from '../../model/usuario';
import { TipoUsuario } from '../../model/tipo-usuario';
import { sessionStorageUtils } from '../../util/sessionStorage';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario-form.component.html',
  styleUrls: ['./usuario-form.component.css']
})
export class UsuarioFormComponent implements OnInit {
  usuarioForm: FormGroup;
  tiposUsuario: TipoUsuario[] = [];
  loading = false;
  isEdit = false;
  usuarioId: number | null = null;
  passwordStrength = { score: 0, feedback: [] as string[] };
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private tipoUsuarioService: TipoUsuarioService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private sessionStorage: sessionStorageUtils
  ) {
    this.usuarioForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadTiposUsuario();
    this.checkEditMode();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      login: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', [Validators.required]],
      nome_usuario: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(150)]],
      id_tipo_usuario: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const senha = form.get('senha');
    const confirmarSenha = form.get('confirmarSenha');

    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ passwordMismatch: true });
    } else if (confirmarSenha && confirmarSenha.hasError('passwordMismatch')) {
      confirmarSenha.setErrors(null);
    }

    return null;
  }

  private loadTiposUsuario(): void {
    this.tipoUsuarioService.getActiveTypes().subscribe({
      next: (response) => {
        if (response.success && response.data && response.data.tipos) {
          this.tiposUsuario = response.data.tipos;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de usuário:', error);
        this.notificationService.error('Erro', 'Erro ao carregar tipos de usuário');
      }
    });
  }

  private checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.usuarioId = parseInt(id);
      this.loadUsuario();
      // Remover validação de senha obrigatória no modo edição
      this.usuarioForm.get('senha')?.clearValidators();
      this.usuarioForm.get('confirmarSenha')?.clearValidators();
      this.usuarioForm.get('senha')?.updateValueAndValidity();
      this.usuarioForm.get('confirmarSenha')?.updateValueAndValidity();
    }
  }

  private loadUsuario(): void {
    if (!this.usuarioId) return;

    this.loading = true;
    this.usuarioService.getUsuario(this.usuarioId).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.populateForm(response.data);
        } else {
          this.notificationService.error('Erro', 'Usuário não encontrado');
          this.router.navigate(['/usuario']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Erro', 'Erro ao carregar usuário');
        console.error('Erro:', error);
      }
    });
  }

  private populateForm(usuario: Usuario): void {
    this.usuarioForm.patchValue({
      login: usuario.login,
      nome_usuario: usuario.nome_usuario,
      id_tipo_usuario: usuario.id_tipo_usuario || usuario.tipo_usuario
    });
  }

  onPasswordChange(): void {
    const senha = this.usuarioForm.get('senha')?.value;
    if (senha) {
      this.passwordStrength = this.usuarioService.validatePasswordStrength(senha);
    }
  }

  generateRandomPassword(): void {
    const randomPassword = this.usuarioService.generateRandomPassword();
    this.usuarioForm.patchValue({
      senha: randomPassword,
      confirmarSenha: randomPassword
    });
    this.onPasswordChange();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.usuarioForm.valid && !this.loading) {
      this.loading = true;

      const formData = this.usuarioForm.value;
      const userData = this.sessionStorage.obterUsuario();

      if (this.isEdit && this.usuarioId) {
        this.updateUsuario(formData, userData?.id_usuario);
      } else {
        this.createUsuario(formData, userData?.id_usuario);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createUsuario(formData: any, idUsuarioLogado?: number): void {
    const usuarioRequest: UsuarioRequest = {
      login: formData.login,
      senha: formData.senha,
      nome_usuario: formData.nome_usuario,
      id_tipo_usuario: parseInt(formData.id_tipo_usuario)
    };

    this.usuarioService.createUsuario(usuarioRequest, idUsuarioLogado).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notificationService.success('Sucesso', 'Usuário criado com sucesso!');
          this.router.navigate(['/usuario']);
        } else {
          this.notificationService.error('Erro', response.message || 'Erro ao criar usuário');
        }
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Erro', 'Erro ao criar usuário');
        console.error('Erro:', error);
      }
    });
  }

  private updateUsuario(formData: any, idUsuarioLogado?: number): void {
    const updateRequest: UsuarioUpdateRequest = {
      login: formData.login,
      nome_usuario: formData.nome_usuario,
      id_tipo_usuario: parseInt(formData.id_tipo_usuario)
    };

    // Incluir senha apenas se foi informada
    if (formData.senha && formData.senha.trim()) {
      updateRequest.senha = formData.senha;
    }

    this.usuarioService.updateUsuario(this.usuarioId!, updateRequest, undefined, idUsuarioLogado).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notificationService.success('Sucesso', 'Usuário atualizado com sucesso!');
          this.router.navigate(['/usuario']);
        } else {
          this.notificationService.error('Erro', response.message || 'Erro ao atualizar usuário');
        }
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Erro', 'Erro ao atualizar usuário');
        console.error('Erro:', error);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.usuarioForm.controls).forEach(key => {
      const control = this.usuarioForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/usuario']);
  }

  getFieldError(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Campo obrigatório';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `Mínimo de ${requiredLength} caracteres`;
      }
      if (field.errors['maxlength']) {
        const maxLength = field.errors['maxlength'].requiredLength;
        return `Máximo de ${maxLength} caracteres`;
      }
      if (field.errors['passwordMismatch']) {
        return 'Senhas não coincidem';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrength.score < 3) return '#dc3545'; // Vermelho
    if (this.passwordStrength.score < 5) return '#ffc107'; // Amarelo
    return '#28a745'; // Verde
  }

  getPasswordStrengthText(): string {
    if (this.passwordStrength.score < 3) return 'Fraca';
    if (this.passwordStrength.score < 5) return 'Média';
    return 'Forte';
  }
}
