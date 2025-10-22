import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa, EmpresaListResponse } from '../../model/empresa';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.css'
})
export class EmpresaListComponent implements OnInit {
  empresas: Empresa[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  searchTerm: string = '';
  filterActive: string = '1';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;
  totalItems: number = 0;
  Math = Math;

  constructor(
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEmpresas();
  }

  loadEmpresas(): void {
    this.loading = true;
    this.errorMessage = null;

    this.empresaService.list(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.filterActive
    ).subscribe({
      next: (response: EmpresaListResponse) => {
        this.empresas = response.data.empresas || [];
        this.totalPages = response.data.pagination.pages;
        this.totalItems = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar empresas: ' + error.message;
        this.loading = false;
      }
    });
  }

  onBuscar(): void {
    this.currentPage = 1;
    this.loadEmpresas();
  }

  onNew(): void {
    this.router.navigate(['/empresa/new']);
  }

  onEdit(empresa: Empresa): void {
    this.router.navigate(['/empresa/edit', empresa.id_empresa]);
  }

  onToggleActive(empresa: Empresa): void {
    const action = empresa.fl_ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} esta empresa?`)) {
      this.empresaService.delete(empresa.id_empresa).subscribe({
        next: () => {
          this.successMessage = `Empresa ${action}da com sucesso`;
          this.loadEmpresas();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Erro ao alterar status da empresa';
        }
      });
    }
  }

  getStatusClass(fl_ativo: number | undefined): string {
    return fl_ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(fl_ativo: number | undefined): string {
    return fl_ativo ? 'Ativa' : 'Inativa';
  }

  formatCnpj(cnpj: string): string {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  formatCelular(celular: string | undefined): string {
    if (!celular) return '-';
    return celular.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEmpresas();
  }
}

