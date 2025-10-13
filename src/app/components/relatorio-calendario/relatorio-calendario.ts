import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DistribuicaoOpViewService } from '../../services/distribuicao-op-view.service';
import { EditHoursDayModalComponent } from '../distribuir-op-calendario/edit-hours-day-modal';
import { NotificationService } from '../../services/notification.service';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  isToday: boolean;
  isCurrentMonth: boolean;
  distribuicoes: DistribuicaoInfo[];
}

interface DistribuicaoInfo {
  id_ordem_producao: number;
  id_grupo_producao: number;
  codigo_op: string;
  cd_modelo: string;
  grupo_descricao: string;
  qtd_prevista: number;
  qtd_realizada: number;
  status: string;
}

@Component({
  selector: 'app-relatorio-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, EditHoursDayModalComponent],
  templateUrl: './relatorio-calendario.html',
  styleUrl: './relatorio-calendario.css'
})
export class RelatorioCalendarioComponent implements OnInit {
  // Filtros
  dataInicioDe: string = '';
  dataInicioAte: string = '';
  filtroOP: string = '';
  filtroModelo: string = '';
  filtroGrupo: string = '';

  // Calendário
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarWeeks: CalendarDay[][] = [];
  currentMonthName: string = '';

  // Estados
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  mostrarCalendario: boolean = false;

  // Dados
  distribuicoesData: any[] = [];

  // Modal
  showEditHoursDayModal: boolean = false;
  selectedDayForEdit: any = null;
  currentOpInfo: any = null;
  currentGrupoId: number = 0;
  currentOpId: number = 0;

  constructor(
    private distribuicaoService: DistribuicaoOpViewService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initDefaultDates();
    this.updateMonthName();
    // Não gerar calendário inicialmente - só após buscar
  }

  /**
   * Inicializar datas padrão (mês atual)
   */
  initDefaultDates(): void {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    this.dataInicioDe = this.formatDateToInput(primeiroDia);
    this.dataInicioAte = this.formatDateToInput(ultimoDia);
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

  /**
   * Atualizar nome do mês
   */
  updateMonthName(): void {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    this.currentMonthName = months[this.currentMonth];
  }

  /**
   * Gerar calendário
   */
  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks: CalendarDay[][] = [];
    let currentWeek: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const day: CalendarDay = {
        date: currentDate,
        dayNumber: currentDate.getDate(),
        isToday: currentDate.getTime() === today.getTime(),
        isCurrentMonth: currentDate.getMonth() === this.currentMonth,
        distribuicoes: []
      };

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    this.calendarWeeks = weeks;
  }

  /**
   * Mês anterior
   */
  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.updateMonthName();
    this.generateCalendar();
    if (this.distribuicoesData.length > 0) {
      this.loadDistribuicoesInCalendar();
    }
  }

  /**
   * Próximo mês
   */
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.updateMonthName();
    this.generateCalendar();
    if (this.distribuicoesData.length > 0) {
      this.loadDistribuicoesInCalendar();
    }
  }

  /**
   * Buscar distribuições
   */
  buscarDistribuicoes(): void {
    if (!this.dataInicioDe || !this.dataInicioAte) {
      this.errorMessage = 'Por favor, informe o período de datas';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.mostrarCalendario = false;

    // Chamar API para buscar distribuições
    this.distribuicaoService.getRelatorioCalendario(
      this.dataInicioDe,
      this.dataInicioAte,
      this.filtroOP,
      this.filtroModelo,
      this.filtroGrupo
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.distribuicoesData = response.data || [];
          this.generateCalendar();
          this.loadDistribuicoesInCalendar();
          this.mostrarCalendario = true;
          this.successMessage = `${this.distribuicoesData.length} distribuição(ões) encontrada(s)`;
          setTimeout(() => this.successMessage = null, 3000);
        } else {
          this.errorMessage = response.message || 'Erro ao carregar distribuições';
        }
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erro ao carregar distribuições: ' + error.message;
        this.loading = false;
      }
    });
  }

  /**
   * Carregar distribuições no calendário
   */
  loadDistribuicoesInCalendar(): void {
    // Limpar distribuições existentes
    this.calendarWeeks.forEach(week => {
      week.forEach(day => {
        day.distribuicoes = [];
      });
    });

    // Adicionar distribuições aos dias
    this.distribuicoesData.forEach((dist: any) => {
      // Criar data sem conversão de timezone
      const [year, month, day] = dist.dt_ordem_producao.split(/[-T]/);
      const distDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      distDate.setHours(0, 0, 0, 0);

      this.calendarWeeks.forEach(week => {
        week.forEach(calDay => {
          const dayDate = new Date(calDay.date);
          dayDate.setHours(0, 0, 0, 0);

          if (dayDate.getTime() === distDate.getTime()) {
            calDay.distribuicoes.push({
              id_ordem_producao: dist.id_ordem_producao,
              id_grupo_producao: dist.id_grupo_producao,
              codigo_op: dist.codigo_op,
              cd_modelo: dist.cd_modelo,
              grupo_descricao: dist.grupo_descricao,
              qtd_prevista: dist.qtd_prevista || 0,
              qtd_realizada: dist.qtd_realizada || 0,
              status: dist.status || 'previsto'
            });
          }
        });
      });
    });
  }

  /**
   * Limpar filtros
   */
  limparFiltros(): void {
    this.filtroOP = '';
    this.filtroModelo = '';
    this.filtroGrupo = '';
    this.initDefaultDates();
    this.distribuicoesData = [];
    this.mostrarCalendario = false;
  }

  /**
   * Formatar número
   */
  formatNumber(value: number): string {
    return value.toLocaleString('pt-BR');
  }

  /**
   * Editar dia de uma OP específica
   */
  editarDiaOP(day: CalendarDay, dist: DistribuicaoInfo, event: Event): void {
    event.stopPropagation();

    // Converter data para o formato esperado pelo modal
    const dateObj = typeof day.date === 'string' ? new Date(day.date) : day.date;

    this.selectedDayForEdit = {
      date: typeof day.date === 'string' ? day.date : day.date.toISOString().split('T')[0],
      dayNumber: day.dayNumber,
      isToday: day.isToday,
      selected: false,
      hasDistribution: true,
      status: dist.status,
      timeSlots: [],
      qtdPrevista: dist.qtd_prevista
    };

    this.currentOpInfo = {
      codigo_op: dist.codigo_op,
      cd_modelo: dist.cd_modelo
    };

    this.currentOpId = dist.id_ordem_producao;
    this.currentGrupoId = dist.id_grupo_producao;

    this.showEditHoursDayModal = true;
  }

  /**
   * Fechar modal
   */
  onModalClose(): void {
    this.showEditHoursDayModal = false;
    this.selectedDayForEdit = null;
    this.currentOpInfo = null;
    this.currentOpId = 0;
    this.currentGrupoId = 0;
  }

  /**
   * Salvar modal
   */
  onModalSave(data: any): void {
    this.showEditHoursDayModal = false;
    this.selectedDayForEdit = null;

    this.notificationService.success(
      'Dados Salvos',
      'Dados do dia salvos com sucesso!'
    );

    // Recarregar distribuições
    this.buscarDistribuicoes();
  }

  /**
   * Voltar
   */
  onVoltar(): void {
    this.router.navigate(['/ordem-producao']);
  }
}
