import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule,CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Verificar se já está logado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/ordem-producao']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      this.errorMessage = '';

      const { login, senha } = this.loginForm.value;

      this.authService.login(login, senha).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.success('Login realizado!', 'Bem-vindo ao sistema Controle PCP');
            this.router.navigate(['/ordem-producao']);
          } else {
            this.errorMessage = response.message || 'Erro ao fazer login';
            this.notificationService.error('Erro no login', this.errorMessage);
          }
          this.loading = false;
        },
        error: (error) => {
          console.log(error);
          this.errorMessage =  error.error.message || 'Erro ao fazer login';
          this.notificationService.error('Erro no login', this.errorMessage);
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'login' ? 'Login' : 'Senha'} é obrigatório`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName === 'login' ? 'Login' : 'Senha'} deve ter pelo menos ${requiredLength} caracteres`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
