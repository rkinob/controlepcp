import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { GrupoProducao, GrupoProducaoListResponse } from '../../model/grupo-producao';
import { NotificationService } from '../../services/notification.service';
import { GrupoProducaoFormComponent } from '../grupo-producao-form/grupo-producao-form.component';

@Component({
  selector: 'app-grupo-producao-list',
  templateUrl: './grupo-producao-list.component.html',
  styleUrls: ['./grupo-producao-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, GrupoProducaoFormComponent]
})
export class GrupoProducaoListComponent implements OnInit {
  grupos: GrupoProducao[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  Math = Math;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 20;
  showInactive = 1;

  // Modal properties
  showModal = false;
  selectedGrupo: GrupoProducao | null = null;
  isEditMode = false;

  constructor(
    private grupoProducaoService: GrupoProducaoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.loading = true;
    this.errorMessage = '';

      this.grupoProducaoService.list(this.currentPage, this.itemsPerPage, this.searchTerm, this.showInactive ? '-1' : '1').subscribe({
      next: (response: GrupoProducaoListResponse) => {
        this.grupos = response.data.grupos || [];
        this.totalPages = response.data.pagination.pages;
        this.totalItems = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Erro ao carregar grupos.';
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadGrupos();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadGrupos();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadGrupos();
  }

  onNew(): void {
    this.selectedGrupo = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editGrupo(id: number | undefined): void {
    if (id) {
      const grupo = this.grupos.find(g => g.id_grupo_producao === id);
      if (grupo) {
        this.selectedGrupo = grupo;
        this.isEditMode = true;
        this.showModal = true;
      }
    }
  }

  onModalClose(): void {
    this.showModal = false;
    this.selectedGrupo = null;
    this.isEditMode = false;
  }

  onGrupoSaved(grupo: GrupoProducao): void {
    this.loadGrupos();
    this.onModalClose();
  }

  toggleActiveStatus(grupo: GrupoProducao): void {
    const action = grupo.fl_ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} este grupo?`)) {
      if (grupo.id_grupo_producao) {
        this.grupoProducaoService.delete(grupo.id_grupo_producao).subscribe({
          next: () => {
            this.notificationService.success(
              'Status alterado',
              `Grupo ${grupo.descricao} foi ${action}do com sucesso!`
            );
            this.loadGrupos();
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'Erro ao alterar status do grupo';
            this.notificationService.error(
              'Erro ao alterar status',
              this.errorMessage
            );
          }
        });
      }
    }
  }

  getStatusClass(fl_ativo: number | boolean | undefined): string {
    return fl_ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(fl_ativo: number | boolean | undefined): string {
    return fl_ativo ? 'Ativo' : 'Inativo';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  onClearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadGrupos();
  }

  getPaginationArray(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }
}
