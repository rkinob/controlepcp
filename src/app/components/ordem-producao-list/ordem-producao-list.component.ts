import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OrdemProducaoService } from '../../services/ordem-producao.service';
import { ModeloPecaService } from '../../services/modelo-peca.service';
import { OrdemProducao, OrdemProducaoListResponse } from '../../model/ordem-producao';
import { ModeloPeca } from '../../model/modelo-peca';

@Component({
  selector: 'app-ordem-producao-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordem-producao-list.component.html',
  styleUrl: './ordem-producao-list.component.css'
})
export class OrdemProducaoListComponent implements OnInit {
  ordens: OrdemProducao[] = [];
  modelos: ModeloPeca[] = [];
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  searchTerm: string = '';
  filterActive: string = '1';
  filterModelo: string = '';
  dataInicioDe: string = '';
  dataInicioAte: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalPages: number = 1;
  totalItems: number = 0;
  Math = Math;

  constructor(
    private ordemProducaoService: OrdemProducaoService,
    private modeloPecaService: ModeloPecaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initDefaultDates();
    this.loadOrdens();
    this.loadModelos();
  }

  /**
   * Inicializar datas padrão: ontem e hoje
   */
  initDefaultDates(): void {
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    this.dataInicioDe = this.formatDateToInput(ontem);
    this.dataInicioAte = this.formatDateToInput(hoje);
  }

  /**
   * Formatar data para input type="date" (YYYY-MM-DD)
   */
  formatDateToInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  loadOrdens(): void {
    this.loading = true;
    this.errorMessage = null;

    this.ordemProducaoService.list(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.filterActive,
      0,
      this.dataInicioDe,
      this.dataInicioAte
    ).subscribe({
      next: (response: OrdemProducaoListResponse) => {
        console.log('response', response);
        this.ordens = response.data.ordens || [];
        this.totalPages = response.data.pagination.pages;
        this.totalItems = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar ordens de produção: ' + error.message;
        this.loading = false;
      }
    });
  }

  loadModelos(): void {
    this.modeloPecaService.list(1).subscribe({
      next: (response) => {
        this.modelos = response.modelos || [];
      },
      error: (error) => {
        console.error('Erro ao carregar modelos:', error);
      }
    });
  }

  /**
   * Executar busca com os filtros
   */
  onBuscar(): void {
    this.currentPage = 1;
    this.loadOrdens();
  }

  /**
   * Limpar filtros e voltar aos valores padrão
   */
  onLimparFiltros(): void {
    this.searchTerm = '';
    this.filterActive = '1';
    this.initDefaultDates();
    this.currentPage = 1;
    this.loadOrdens();
  }

  onNew(): void {
    this.router.navigate(['/ordem-producao/new']);
  }

  onEdit(ordem: OrdemProducao): void {
    this.router.navigate(['/ordem-producao/edit', ordem.id_ordem_producao]);
  }

  onToggleActive(ordem: OrdemProducao): void {
    const action = ordem.fl_ativo ? 'desativar' : 'ativar';
    if (confirm(`Tem certeza que deseja ${action} esta ordem de produção?`)) {
      this.ordemProducaoService.delete(ordem.id_ordem_producao).subscribe({
        next: () => {
          this.successMessage = `Ordem de produção ${action}da com sucesso`;
          this.loadOrdens();
          setTimeout(() => this.successMessage = null, 3000);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'Erro ao alterar status da ordem de produção';
        }
      });
    }
  }

  onProgramar(ordem: OrdemProducao): void {
    this.router.navigate(['/distribuir-op-calendario'], {
      queryParams: {
        opId: ordem.id_ordem_producao,
        fromList: 'true'
      }
    });
  }


  getStatusClass(fl_ativo: number | undefined): string {
    return fl_ativo ? 'status-active' : 'status-inactive';
  }

  getStatusText(fl_ativo: number | undefined): string {
    return fl_ativo ? 'Ativa' : 'Inativa';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';

    // Separar a data para evitar problemas de timezone
    const [year, month, day] = dateString.split(/[-T]/);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('pt-BR');
  }

  formatNumber(value: number | undefined): string {
    if (!value) return '0';
    return value.toLocaleString('pt-BR');
  }

  /**
   * Calcular percentual realizado
   */
  getPercentualRealizado(ordem: OrdemProducao): string {
    if (!ordem.qtd_total || ordem.qtd_total === 0) return '0%';
    const qtd_realizada = ordem.qtd_realizada || 0;
    const percentual = (qtd_realizada / ordem.qtd_total) * 100;
    return `${percentual.toFixed(1)}%`;
  }

  /**
   * Calcular percentual alocado
   */
  getPercentualAlocado(ordem: OrdemProducao): string {
    if (!ordem.qtd_total || ordem.qtd_total === 0) return '0%';
    const qtd_alocada = ordem.qtd_alocada || 0;
    const percentual = (qtd_alocada / ordem.qtd_total) * 100;
    return `${percentual.toFixed(1)}%`;
  }

  /**
   * Classe CSS para quantidade realizada
   */
  getRealizadoClass(ordem: OrdemProducao): string {
    if (!ordem.qtd_total || ordem.qtd_total === 0) return 'realizado-zero';

    const qtd_realizada = ordem.qtd_realizada || 0;
    const percentual = (qtd_realizada / ordem.qtd_total) * 100;

    if (percentual === 0) return 'realizado-zero';
    if (percentual < 50) return 'realizado-baixo';
    if (percentual < 100) return 'realizado-medio';
    return 'realizado-completo';
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrdens();
  }
}
