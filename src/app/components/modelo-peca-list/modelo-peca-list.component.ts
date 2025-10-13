import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModeloPecaService, ModeloPeca, ModeloPecaListResponse } from '../../services/modelo-peca.service';
import { NotificationService } from '../../services/notification.service';
import { ModeloPecaFormComponent } from '../modelo-peca-form/modelo-peca-form.component';

@Component({
  selector: 'app-modelo-peca-list',
  templateUrl: './modelo-peca-list.component.html',
  styleUrls: ['./modelo-peca-list.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ModeloPecaFormComponent]
})
export class ModeloPecaListComponent implements OnInit {
  modelos: ModeloPeca[] = [];
  loading = false;
  errorMessage = '';
  searchTerm = '';
  Math = Math;
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 20;
  showInactive = false;

  // Modal properties
  showModal = false;
  selectedModelo: ModeloPeca | null = null;
  isEditMode = false;

  constructor(
    private modeloPecaService: ModeloPecaService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadModelos();
  }

  loadModelos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.modeloPecaService.list(this.currentPage, this.itemsPerPage, this.searchTerm, this.showInactive ? '' : '1')
      .subscribe({
        next: (response: ModeloPecaListResponse) => {
          this.modelos = response.modelos || [];
          this.totalPages = response.pagination.pages;
          this.totalItems = response.pagination.total;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Erro ao carregar modelos';
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadModelos();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadModelos();
  }

  onNew(): void {
    this.selectedModelo = null;
    this.isEditMode = false;
    this.showModal = true;
  }

  editModelo(id: number | undefined): void {
    if (id) {
      const modelo = this.modelos.find(m => m.id_modelo === id);
      if (modelo) {
        this.selectedModelo = modelo;
        this.isEditMode = true;
        this.showModal = true;
      }
    }
  }

  onModalClose(): void {
    this.showModal = false;
    this.selectedModelo = null;
    this.isEditMode = false;
  }

  onModeloSaved(modelo: ModeloPeca): void {
    this.loadModelos();
    this.onModalClose();
  }

  toggleActiveStatus(modelo: ModeloPeca): void {
    const action = modelo.fl_ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} este modelo?`)) {
      if (modelo.id_modelo) {
        this.modeloPecaService.delete(modelo.id_modelo).subscribe({
          next: () => {
            this.notificationService.success(
              'Status alterado',
              `Modelo ${modelo.cd_modelo} foi ${action}do com sucesso!`
            );
            this.loadModelos();
          },
          error: (error: any) => {
            this.errorMessage = error.message || 'Erro ao alterar status do modelo';
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

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadModelos();
  }
}
