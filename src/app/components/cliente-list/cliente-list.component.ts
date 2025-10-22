import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClienteService } from '../../services/cliente.service';
import { Cliente, ClienteListResponse } from '../../model/cliente';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cliente-list.component.html',
  styleUrl: './cliente-list.component.css'
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
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
    private clienteService: ClienteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.loading = true;
    this.errorMessage = null;

    this.clienteService.list(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.filterActive
    ).subscribe({
      next: (response: ClienteListResponse) => {
        this.clientes = response.data.clientes || [];
        this.totalPages = response.data.pagination.pages;
        this.totalItems = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar clientes: ' + error.message;
        this.loading = false;
      }
    });
  }

  onBuscar(): void {
    this.currentPage = 1;
    this.loadClientes();
  }

  onNew(): void {
    this.router.navigate(['/cliente/new']);
  }

  onEdit(cliente: Cliente): void {
    this.router.navigate(['/cliente/edit', cliente.id_cliente]);
  }

  onToggleActive(cliente: Cliente): void {
    const action = cliente.fl_ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} este cliente?`)) {
      this.clienteService.delete(cliente.id_cliente).subscribe({
        next: () => {
          this.successMessage = `Cliente ${action}do com sucesso`;
          this.loadClientes();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Erro ao alterar status do cliente';
        }
      });
    }
  }

  getStatusClass(fl_ativo: number | undefined): string {
    return fl_ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(fl_ativo: number | undefined): string {
    return fl_ativo ? 'Ativo' : 'Inativo';
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
    this.loadClientes();
  }
}

