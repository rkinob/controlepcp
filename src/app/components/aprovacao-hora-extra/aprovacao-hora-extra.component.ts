import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AprovadoresHoraExtraService, AprovacaoPendente } from '../../services/aprovadores-hora-extra.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-aprovacao-hora-extra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprovacao-hora-extra.component.html',
  styleUrl: './aprovacao-hora-extra.component.css'
})
export class AprovacaoHoraExtraComponent implements OnInit {
  aprovacoesPendentes: AprovacaoPendente[] = [];
  loading = false;
  showModal = false;
  aprovacaoSelecionada: AprovacaoPendente | null = null;
  observacao = '';
  operacao: number = 0; // 1 = aprovar, 2 = reprovar

  constructor(
    private aprovadoresService: AprovadoresHoraExtraService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarAprovacoesPendentes();
  }

  carregarAprovacoesPendentes(): void {
    this.loading = true;
    this.aprovadoresService.getAprovacoesPendentes().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.aprovacoesPendentes = Array.isArray(response.data) ? response.data : [];
        } else {
          this.aprovacoesPendentes = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.aprovacoesPendentes = [];
        this.notification.error('Erro', 'Erro ao carregar aprovações pendentes');
        this.loading = false;
      }
    });
  }

  abrirModalAprovacao(aprovacao: AprovacaoPendente, operacao: number): void {
    this.aprovacaoSelecionada = aprovacao;
    this.operacao = operacao;
    this.observacao = '';
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
    this.aprovacaoSelecionada = null;
    this.observacao = '';
  }

  confirmarAprovacao(): void {
    if (!this.aprovacaoSelecionada) {
      return;
    }

    this.loading = true;
    this.aprovadoresService.aprovarReprovar(
      this.aprovacaoSelecionada.id_ordem_producao_data,
      this.operacao,
      this.observacao || undefined
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success('Sucesso', response.data?.message || 'Operação realizada com sucesso');
          this.fecharModal();
          this.carregarAprovacoesPendentes();
        }
        this.loading = false;
      },
      error: (error) => {
        this.notification.error('Erro', error.error?.message || 'Erro ao processar aprovação');
        this.loading = false;
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR');
  }

  getStatusText(tipo: string): string {
    return tipo === 'E' ? 'Todos devem aprovar' : 'Pelo menos um deve aprovar';
  }

  calcularHorasExtras(horaIni: string, horaFim: string): number {
    const [hIni, mIni] = horaIni.split(':').map(Number);
    const [hFim, mFim] = horaFim.split(':').map(Number);

    const minutosIni = hIni * 60 + mIni;
    const minutosFim = hFim * 60 + mFim;

    const totalMinutos = minutosFim - minutosIni;
    const horas = totalMinutos / 60;

    // Considerando jornada normal de 8 horas
    const horasExtras = horas > 8 ? horas - 8 : 0;
    return horasExtras;
  }
}

