import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OPProgramadaService } from '../../services/op-programada.service';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { NotificationService } from '../../services/notification.service';
import { OPProgramada, OPProgramadaListResponse } from '../../model/op-programada';
import { GrupoProducao } from '../../model/grupo-producao';
import { RemanejarSaldoModalComponent } from './remanejar-saldo-modal.component';

@Component({
  selector: 'app-op-programada-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RemanejarSaldoModalComponent],
  templateUrl: './op-programada-list.component.html',
  styleUrl: './op-programada-list.component.css'
})
export class OPProgramadaListComponent implements OnInit {
  @ViewChild(RemanejarSaldoModalComponent) remanejarModal!: RemanejarSaldoModalComponent;

  ops: OPProgramada[] = [];
  grupos: GrupoProducao[] = [];
  loading = false;
  errorMessage: string | null = null;
  searchTerm: string = '';
  filterGrupo: number = 0;
  filterSituacao: string = '';
  dataInicio: string = '';
  dataFim: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 50;
  totalPages: number = 1;
  totalItems: number = 0;
  podeRemanejar: boolean = false;
  editingOpId: number | null = null;
  Math = Math;

  // Modal de remanejamento
  showRemanejarModal: boolean = false;
  opParaRemanejar: OPProgramada | null = null;

  constructor(
    private opProgramadaService: OPProgramadaService,
    private grupoProducaoService: GrupoProducaoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOPs();
    this.loadGrupos();
  }

  loadOPs(): void {
    this.loading = true;
    this.errorMessage = null;

    this.opProgramadaService.list(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.filterGrupo,
      this.dataInicio,
      this.dataFim,
      this.filterSituacao
    ).subscribe({
      next: (response: OPProgramadaListResponse) => {
        this.ops = response.data.ops || [];
        this.totalPages = response.data.pagination.pages;
        this.totalItems = response.data.pagination.total;
        this.podeRemanejar = response.data.pode_remanejar || false;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar OPs programadas: ' + error.message;
        this.loading = false;
      }
    });
  }

  loadGrupos(): void {
    this.grupoProducaoService.list(1, 100).subscribe({
      next: (response) => {
        this.grupos = response.data.grupos || [];
      },
      error: (error) => {
        console.error('Erro ao carregar grupos:', error);
      }
    });
  }

  onBuscar(): void {
    this.currentPage = 1;
    this.loadOPs();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOPs();
  }

  enableEditRealizada(op: OPProgramada): void {
    this.editingOpId = op.id_ordem_producao_data;
  }

  cancelEditRealizada(): void {
    this.editingOpId = null;
  }

  isEditingRealizada(op: OPProgramada): boolean {
    return this.editingOpId === op.id_ordem_producao_data;
  }

  onChangeQtdRealizada(op: OPProgramada, novaQtd: string): void {
    const qtd_realizada = parseInt(novaQtd) || 0;

    if (qtd_realizada < 0) {
      this.notificationService.error('Erro', 'Quantidade não pode ser negativa');
      this.editingOpId = null;
      return;
    }

    this.opProgramadaService.updateQtdRealizada(op.id_ordem_producao_data, qtd_realizada).subscribe({
      next: () => {
        this.notificationService.success(
          'Quantidade Atualizada',
          `Quantidade realizada da OP ${op.codigo_op} foi atualizada com sucesso!`
        );
        this.editingOpId = null;
        this.loadOPs();
      },
      error: (error) => {
        this.notificationService.error(
          'Erro ao Atualizar',
          error.message || 'Erro desconhecido'
        );
        this.editingOpId = null;
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split(/[-T]/);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }

  formatNumber(value: number | undefined): string {
    if (!value && value !== 0) return '0';
    return value.toLocaleString('pt-BR');
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Previsto': 'status-previsto',
      'Andamento': 'status-andamento',
      'Concluido': 'status-concluido',
      'Cancelada': 'status-cancelada',
      'ag_aprovacao': 'status-aguardando'
    };
    return statusMap[status] || 'status-default';
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Previsto': 'Previsto',
      'Andamento': 'Em Andamento',
      'Concluido': 'Concluído',
      'Cancelada': 'Cancelada',
      'ag_aprovacao': 'Aguardando Aprovação'
    };
    return statusMap[status] || status;
  }

  getSaldoClass(saldo: number): string {
    if (saldo <= 0) return 'saldo-zero';
    if (saldo < 50) return 'saldo-baixo';
    return 'saldo-normal';
  }

  mostrarBotaoRemanejar(op: OPProgramada): boolean {
    return this.podeRemanejar && op.saldo > 0 && op.qtd_realizada > 0 && op.fl_remanejado === 0;
  }

  onRemanejarSaldo(op: OPProgramada): void {
    this.opParaRemanejar = op;
    this.showRemanejarModal = true;
  }

  onCancelarRemanejamento(): void {
    this.showRemanejarModal = false;
    this.opParaRemanejar = null;
  }

  onConfirmarRemanejamento(config: {dataRemanejamento: string, idGrupo: number, usarHoraExtra: boolean}): void {
    if (!this.opParaRemanejar) return;

    const quantidadeHorasExtras = config.usarHoraExtra ? 2 : 0; // 2 horas extras por padrão

    this.opProgramadaService.remanejarSaldo(
      this.opParaRemanejar.id_ordem_producao_data,
      config.dataRemanejamento,
      config.idGrupo,
      quantidadeHorasExtras
    ).subscribe({
      next: () => {
        if (this.remanejarModal) {
          this.remanejarModal.setSaving(false);
        }
        this.notificationService.success(
          'Saldo Remanejado',
          `O saldo de ${this.opParaRemanejar?.saldo} peças foi redistribuído com sucesso!`
        );
        this.showRemanejarModal = false;
        this.opParaRemanejar = null;
        this.loadOPs(); // Recarregar lista
      },
      error: (error) => {
        if (this.remanejarModal) {
          this.remanejarModal.setSaving(false);
          this.remanejarModal.setError(error.message || 'Erro ao remanejar saldo');
        }
      }
    });
  }
}

