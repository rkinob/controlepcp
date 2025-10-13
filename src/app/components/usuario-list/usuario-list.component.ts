import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';
import { TipoUsuarioService } from '../../services/tipo-usuario.service';
import { NotificationService } from '../../services/notification.service';
import { Usuario } from '../../model/usuario';
import { TipoUsuario } from '../../model/tipo-usuario';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-list.component.html',
  styleUrls: ['./usuario-list.component.css']
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  tiposUsuario: TipoUsuario[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 20;
  searchTerm = '';
  searchTimeout: any;

  constructor(
    private usuarioService: UsuarioService,
    private tipoUsuarioService: TipoUsuarioService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTiposUsuario();
    this.loadUsuarios();
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
      }
    });
  }

  loadUsuarios(): void {
    this.loading = true;

    this.usuarioService.listUsuarios(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.usuarios = response.data.usuarios;
          this.totalItems = response.data.pagination.total;
          this.totalPages = response.data.pagination.pages;
        } else {
          this.usuarios = [];
          this.totalItems = 0;
          this.totalPages = 1;
        }
      },
      error: (error) => {
        this.loading = false;
        this.notificationService.error('Erro', 'Erro ao carregar usuários');
        console.error('Erro:', error);
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage = 1;
      this.loadUsuarios();
    }, 500);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsuarios();
  }

  onEditUsuario(usuario: Usuario): void {
    if (usuario.id_usuario) {
      this.router.navigate(['/usuario/edit', usuario.id_usuario]);
    }
  }

  onDeleteUsuario(usuario: Usuario): void {
    if (!usuario.id_usuario) return;

    const confirmMessage = `Tem certeza que deseja excluir o usuário "${usuario.nome_usuario}"?`;

    if (confirm(confirmMessage)) {
      this.loading = true;

      this.usuarioService.deleteUsuario(usuario.id_usuario, usuario).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            this.notificationService.success('Sucesso', 'Usuário excluído com sucesso!');
            this.loadUsuarios();
          } else {
            this.notificationService.error('Erro', response.message || 'Erro ao excluir usuário');
          }
        },
        error: (error) => {
          this.loading = false;
          this.notificationService.error('Erro', 'Erro ao excluir usuário');
          console.error('Erro:', error);
        }
      });
    }
  }

  onNewUsuario(): void {
    this.router.navigate(['/usuario/new']);
  }

  getTipoUsuarioDescricao(idTipoUsuario?: number): string {
    if (!idTipoUsuario) return 'Não definido';

    const tipo = this.tiposUsuario.find(t => t.id_tipo_usuario === idTipoUsuario);
    return tipo ? tipo.descricao : 'Tipo não encontrado';
  }

  formatDate(dateString?: string): string {
    return this.usuarioService.formatDate(dateString);
  }

  formatDateTime(dateString?: string): string {
    return this.usuarioService.formatDateTime(dateString);
  }

  getStatusText(flAtivo?: number): string {
    return flAtivo === 1 ? 'Ativo' : 'Inativo';
  }

  getStatusClass(flAtivo?: number): string {
    return flAtivo === 1 ? 'status-active' : 'status-inactive';
  }

  getPaginationPages(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
