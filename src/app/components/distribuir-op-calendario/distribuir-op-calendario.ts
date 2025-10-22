import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { EditHoursModalComponent } from './edit-hours-modal';
import { EditHoursDayModalComponent } from './edit-hours-day-modal';
import { OrdemProducaoService } from '../../services/ordem-producao.service';
import { GrupoProducaoService } from '../../services/grupo-producao.service';
import { ModeloPecaService } from '../../services/modelo-peca.service';
import { DistribuirOPService } from '../../services/distribuir-op.service';
import { DiaDistribuicao, DistribuicaoOpViewService, DistribuicaoResponse } from '../../services/distribuicao-op-view.service';
import { NotificationService } from '../../services/notification.service';
import { OrdemProducao, OrdemProducaoListResponse } from '../../model/ordem-producao';
import { GrupoProducao } from '../../model/grupo-producao';
import { ModeloPeca } from '../../model/modelo-peca';
import { sessionStorageUtils } from '../../util/sessionStorage';

interface CalendarDay {
  date: string;
  dayNumber: number;
  isToday: boolean;
  selected: boolean;
  qtdPrevista: number;
  hasDistribution: boolean;
  status: string;
  aprovado: number;
  qtdHorasUtilizadas: number;
  timeSlots: TimeSlot[];
}

interface TimeSlot {
  id: string;
  horaIni: string;
  horaFim: string;
  hours: number;
  status: string;
  qtdPrevista?: number;
  qtdRealizada?: number;
}

@Component({
  selector: 'app-distribuir-op-calendario',
  standalone: true,
  imports: [CommonModule, FormsModule, EditHoursModalComponent, EditHoursDayModalComponent],
  templateUrl: './distribuir-op-calendario.html',
  styleUrls: ['./distribuir-op-calendario.css']
})
export class DistribuirOpCalendarioComponent implements OnInit {
  // Dados da OP
  ordens: OrdemProducao[] = [];
  grupos: GrupoProducao[] = [];
  modelos: ModeloPeca[] = [];

  selectedOP: number = 0;
  selectedGrupo: number = 0;
  selectedModelo: ModeloPeca | null = null;

  // Quantidades
  qtdRestante: number = 0;
  qtdAlocada: number = 0;
  qtdRealizada: number = 0;
  qtdAlocadaGrupo: number = 0;
  qtdDistribuir: number = 0;
  metaPorHora: number = 0;
  quantidadeHorasExtras: number = 0;
  porcentagemMaximaAlocacaoGrupo: number = 100;
  // Calendário
  currentDate: Date = new Date();
  currentYear: number = this.currentDate.getFullYear();
  currentMonth: number = this.currentDate.getMonth();
  currentMonthName: string = '';
  calendarWeeks: CalendarDay[][] = [];

  // Estados
  loading: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Modal de editar horas
  showEditHoursModal: boolean = false;
  selectedDayForEdit: any = null;

  // Modal de editar horas do dia
  showEditHoursDayModal: boolean = false;
  selectedDayForDayEdit: any = null;

  // Navigation tracking
  cameFromForm: boolean = false;
  cameFromList: boolean = false;
  formOpId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ordemProducaoService: OrdemProducaoService,
    private grupoProducaoService: GrupoProducaoService,
    private modeloPecaService: ModeloPecaService,
    private distribuirOPService: DistribuirOPService,
    private distribuicaoOpViewService: DistribuicaoOpViewService,
    private notificationService: NotificationService,
    private sessionStorage: sessionStorageUtils,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Verificar query parameters para saber se veio do formulário ou da lista
    this.route.queryParams.subscribe(params => {
      if (params['opId']) {
        this.formOpId = parseInt(params['opId']);
        this.selectedOP = this.formOpId;

        if (params['fromList'] === 'true') {
          this.cameFromList = true;
        } else {
          this.cameFromForm = true;
        }
      }
    });

    // Verificar se o usuário está autenticado
    const token = this.sessionStorage.obterTokenUsuario();

    if (!token) {
      this.errorMessage = 'Usuário não autenticado. Redirecionando para login...';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.currentMonthName = this.getMonthName(this.currentMonth);
    this.loadData();
    this.generateCalendar();
  }

  loadData(): void {
    this.loading = true;

    // Carregar ordens de produção
    this.ordemProducaoService.list(1, 100, '', '', 0, '', '', this.selectedOP, '').subscribe({
      next: (response: OrdemProducaoListResponse) => {
        if (response.success && response.data && response.data.ordens) {
          this.ordens = Array.isArray(response.data.ordens) ? response.data.ordens : [];

        } else {
          this.ordens = [];
        }
        this.loading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Erro ao carregar ordens de produção: ' + (error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    });

    // Carregar grupos de produção
    this.grupoProducaoService.list(1, 100).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.grupos) {
          this.grupos = Array.isArray(response.data.grupos) ? response.data.grupos : [];
        } else {
          this.grupos = [];
        }
      },
      error: (error: any) => {
        this.grupos = [];
      }
    });
  }

  onOPChange(): void {

    if (this.selectedOP) {
      // Converter para número se necessário
      const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;

      const ordem = this.ordens.find(o => o.id_ordem_producao === opId);

      if (ordem) {

        // Carregar dados do modelo para obter a meta
        this.loadModeloData(ordem.id_modelo);

        // Carregar dados de distribuição existente (que também atualiza as quantidades)
        this.loadDistribuicaoData(ordem.id_ordem_producao);

        // Definir quantidade total da OP (não sobrescrever os outros valores)
        this.qtdRestante = ordem.qtd_total;

      } else {
        console.error('Ordem não encontrada para ID:', opId);
      }
    } else {
      this.resetQuantities();
    }
  }

  onGrupoChange(): void {
    // SEMPRE resetar primeiro
    this.qtdAlocadaGrupo = 0;

    if (this.selectedGrupo && this.selectedOP) {
      this.calculateGroupQuantities();
      this.onOPChange();

    } else {
      this.qtdAlocadaGrupo = 0;
    }
  }

  loadModeloData(idModelo: number): void {
    this.modeloPecaService.getById(idModelo).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.selectedModelo = response.data;
          this.metaPorHora = response.data.meta_por_hora;
        }
      },
      error: (error: any) => {
        // Handle error silently
      }
    });
  }

  loadDistribuicaoData(idOrdemProducao: number): void {

    // Usar a nova API para buscar quantidades totais
    this.distribuicaoOpViewService.getQuantidadesOP(idOrdemProducao).subscribe({
      next: (response: any) => {

        // A API retorna os dados no campo 'message', não 'data'
        if (response.success && response.message) {
          this.updateQuantitiesFromAPI(response.message);
        } else if (response.success && response.data) {
          this.updateQuantitiesFromAPI(response.data);
        } else {

          // Definir valores padrão quando não há dados
          this.qtdAlocada = 0;
          this.qtdRealizada = 0;
          this.metaPorHora = 0;
        }
      },
      error: (error: any) => {
        console.log('❌ Erro ao buscar quantidades:', error);
        console.log('Erro completo:', error);

        // Manter valores padrão em caso de erro
        this.qtdAlocada = 0;
        this.qtdRealizada = 0;
        this.metaPorHora = 0;
      }
    });
  }

  updateQuantitiesFromAPI(data: any): void {

    // Atualizar campos com os dados da API
    this.qtdAlocada = data.qtd_alocada || 0;
    this.qtdRealizada = data.qtd_realizada || 0;
    this.metaPorHora = data.meta_por_hora || 0;

    // Recalcular quantidade restante baseada na quantidade total da OP
    const qtdTotal = data.qtd_total || 0;
    const novoQtdRestante = qtdTotal - this.qtdAlocada;

    this.qtdRestante = novoQtdRestante;


  }

  // Método removido - agora usamos updateQuantitiesFromAPI diretamente

  calculateQuantitiesFromDistribuicao(data: any): void {
    const distribuicao = data.distribuicao;

    if (distribuicao && Array.isArray(distribuicao)) {
      // Calcular qtd alocada (soma de qtd_prevista quando vazio usar qtd_realizada)
      this.qtdAlocada = distribuicao.reduce((total: number, dia: any) => {
        const diaTotal = dia.horarios.reduce((diaTotal: number, horario: any) => {
          const qtd = horario.qtd_prevista || horario.qtd_realizada || 0;
          return diaTotal + qtd;
        }, 0);
        return total + diaTotal;
      }, 0);

      // Calcular qtd realizada (soma de qtd_realizada)
      this.qtdRealizada = distribuicao.reduce((total: number, dia: any) => {
        const diaTotal = dia.horarios.reduce((diaTotal: number, horario: any) => {
          const qtd = horario.qtd_realizada || 0;
          return diaTotal + qtd;
        }, 0);
        return total + diaTotal;
      }, 0);

      // Recalcular qtd restante baseado na quantidade total da OP
      // Precisa ter acesso ao qtdTotal da OP para calcular corretamente
      // this.qtdRestante = qtdTotal - this.qtdAlocada;
    }
  }

  calculateGroupQuantities(): void {
    // SEMPRE resetar o valor antes de calcular
    this.qtdAlocadaGrupo = 0;

    if (!this.selectedGrupo || !this.selectedOP) {
      return;
    }

    // Usar o primeiro dia visível no calendário (incluindo dias do mês anterior)
    const primeiroDiaCalendario = this.getPrimeiroDiaCalendario();
    const ultimoDiaCalendario = this.getUltimoDiaCalendario();
    const diasParaBuscar = this.calcularDiasEntreDatas(primeiroDiaCalendario, ultimoDiaCalendario);


    this.distribuicaoOpViewService.getDistribuicao(this.selectedOP, this.selectedGrupo, primeiroDiaCalendario, diasParaBuscar).subscribe({
      next: (response: DistribuicaoResponse) => {
        // SEMPRE resetar antes de calcular
        this.qtdAlocadaGrupo = 0;

        if (response.success && response.data && response.data.distribuicao) {
          const distribuicao = response.data.distribuicao;
          this.qtdAlocadaGrupo = response.data.qtd_alocada_grupo;
          // Calcular qtd alocada do grupo (soma de qtd_prevista quando vazio usar qtd_realizada)
         /* this.qtdAlocadaGrupo = distribuicao.reduce((total: number, dia: DiaDistribuicao) => {
            return total + dia.total_previsto+ dia.horarios.reduce((diaTotal: number, horario: any) => {
              return diaTotal + (horario.qtd_prevista || horario.qtd_realizada || 0);
            }, 0);
          }, 0);*/
          // Carregar distribuição no calendário
          this.loadDistributionInCalendar(distribuicao);
        } else {
          this.qtdAlocadaGrupo = 0;
          // Limpar calendário quando não há distribuição
          this.clearCalendarDistribution();
        }
      },
      error: (error: any) => {
        this.qtdAlocadaGrupo = 0;
      }
    });
  }

  resetQuantities(): void {
    this.qtdRestante = 0;
    this.qtdAlocada = 0;
    this.qtdRealizada = 0;
    this.qtdAlocadaGrupo = 0;
    this.qtdDistribuir = 0;
    this.metaPorHora = 0;
    this.quantidadeHorasExtras = 0;
    this.selectedModelo = null;
  }

  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const startDate = new Date(firstDay);

    // Ajustar para começar no domingo
    startDate.setDate(startDate.getDate() - startDate.getDay());

    this.calendarWeeks = [];
    let currentWeek: CalendarDay[] = [];

    // Gerar 6 semanas (42 dias) para garantir que o calendário seja completo
    for (let i = 0; i < 36; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const day: CalendarDay = {
        date: date.toISOString().split('T')[0],
        dayNumber: date.getDate(),
        isToday: this.isToday(date),
        selected: false,
        hasDistribution: false,
        status: 'previsto',
        aprovado: 1,
        qtdHorasUtilizadas: 0,
        timeSlots: [],
        qtdPrevista: 0
      };


      currentWeek.push(day);

      if (currentWeek.length === 7) {
        this.calendarWeeks.push(currentWeek);
        currentWeek = [];
      }
    }
    this.onGrupoChange();

  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getMonthName(month: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month];
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.currentMonthName = this.getMonthName(this.currentMonth);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.currentMonthName = this.getMonthName(this.currentMonth);
    this.generateCalendar();
  }

  toggleDay(day: CalendarDay): void {
    day.selected = !day.selected;
  }

  editHours(day: CalendarDay, event: Event): void {
    event.stopPropagation();

    if (!this.selectedOP || !this.selectedGrupo) {
      this.errorMessage = 'Selecione uma OP e um grupo de produção primeiro';
      return;
    }

    // Abrir modal de edição de horas
    this.selectedDayForEdit = day;
    this.showEditHoursModal = true;
  }

  editDayHours(day: CalendarDay, event: Event): void {
    event.stopPropagation();

    if (!this.selectedOP || !this.selectedGrupo) {
      this.errorMessage = 'Selecione uma OP e um grupo de produção primeiro';
      return;
    }

    // Abrir modal de edição de horas do dia
    this.selectedDayForDayEdit = day;
    this.showEditHoursDayModal = true;
  }

  salvarDistribuicao(): void {
    if (!this.podeSalvar()) {
      this.errorMessage = 'Selecione uma OP e um grupo de produção';
      return;
    }

    const diasSelecionados = this.calendarWeeks
      .flat()
      .filter(day => day.selected);

    if (diasSelecionados.length === 0) {
      this.errorMessage = 'Selecione pelo menos um dia';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // TODO: Implementar salvamento da distribuição

    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Distribuição salva com sucesso!';
    }, 1000);
  }

  loadDistributionInCalendar(distribuicao: any[]): void {
    // Criar um mapa das datas com distribuição para facilitar a busca
    const distribuicaoMap = new Map<string, any>();
    distribuicao.forEach(dia => {

      distribuicaoMap.set(dia.data, dia);
    });
    // Atualizar o calendário com os dados da distribuição
    this.calendarWeeks.forEach((week, weekIndex) => {
      week.forEach((day, dayIndex) => {
        const diaDistribuicao = distribuicaoMap.get(day.date);
        if (diaDistribuicao) {
          // Apenas marcar como hasDistribution se tiver quantidade prevista maior que zero
          const totalPrevisto = diaDistribuicao.total_previsto || 0;
          day.hasDistribution = totalPrevisto > 0;
          day.qtdPrevista = totalPrevisto;
          day.status = diaDistribuicao.status || 'previsto';
          day.aprovado = diaDistribuicao.aprovado !== undefined ? diaDistribuicao.aprovado : 1;
          day.qtdHorasUtilizadas = diaDistribuicao.qtd_horas_utilizadas || 0;
          day.timeSlots = diaDistribuicao.horarios.map((horario: any) => ({
            id: horario.id_ordem_producao_horas_data?.toString() || '',
            horaIni: horario.hora_ini || '',
            horaFim: horario.hora_fim || '',
            hours: this.calculateHours(horario.hora_ini, horario.hora_fim),
            status: horario.status || 'pendente',
            qtdPrevista: horario.qtd_prevista || 0,
            qtdRealizada: horario.qtd_realizada || 0
          }));
        } else {
          day.hasDistribution = false;
          day.status = 'previsto';
          day.aprovado = 1;
          day.qtdHorasUtilizadas = 0;
          day.timeSlots = [];
          day.qtdPrevista = 0;
        }
      });
    });

    // Forçar detecção de mudanças
    this.cdr.detectChanges();
  }

  clearCalendarDistribution(): void {
    this.calendarWeeks.forEach(week => {
      week.forEach(day => {
        day.hasDistribution = false;
        day.qtdPrevista = 0;
        day.status = 'previsto';
        day.aprovado = 1;
        day.qtdHorasUtilizadas = 0;
        day.timeSlots = [];
      });
    });
  }

  calculateHours(horaIni: string, horaFim: string): number {
    const inicio = new Date(`2000-01-01T${horaIni}`);
    const fim = new Date(`2000-01-01T${horaFim}`);
    return (fim.getTime() - inicio.getTime()) / (1000 * 60 * 60); // Converter para horas
  }

  getPrimeiroDiaCalendario(): string {
    if (this.calendarWeeks.length === 0) {
      return new Date().toISOString().split('T')[0];
    }

    // Encontrar o primeiro dia válido (não vazio) no calendário
    for (const week of this.calendarWeeks) {
      for (const day of week) {
        if (day.dayNumber > 0 && day.date) {
          return day.date;
        }
      }
    }

    return new Date().toISOString().split('T')[0];
  }

  getUltimoDiaCalendario(): string {
    if (this.calendarWeeks.length === 0) {
      return new Date().toISOString().split('T')[0];
    }

    // Encontrar o último dia válido (não vazio) no calendário
    for (let i = this.calendarWeeks.length - 1; i >= 0; i--) {
      const week = this.calendarWeeks[i];
      for (let j = week.length - 1; j >= 0; j--) {
        const day = week[j];
        if (day.dayNumber > 0 && day.date) {
          return day.date;
        }
      }
    }

    return new Date().toISOString().split('T')[0];
  }

  calcularDiasEntreDatas(dataInicio: string, dataFim: string): number {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 para incluir ambos os dias
  }

  getTotalQty(timeSlots: TimeSlot[]): number {
    return timeSlots.reduce((total, slot) => {
      return total + (slot.qtdPrevista || slot.qtdRealizada || 0);
    }, 0);
  }

  limparSelecao(): void {
    this.calendarWeeks.forEach(week => {
      week.forEach(day => {
        day.selected = false;
      });
    });
    this.successMessage = null;
    this.errorMessage = null;
  }

  podeSalvar(): boolean {
    return this.selectedOP > 0 && this.selectedGrupo > 0;
  }

  podeDistribuir(): boolean {
    return this.selectedOP > 0 &&
           this.selectedGrupo > 0 &&
           this.qtdDistribuir > 0 &&
           this.qtdDistribuir <= this.qtdRestante;
  }

  distribuirOP(): void {
    if (!this.podeDistribuir()) {
      this.errorMessage = 'Preencha todos os campos obrigatórios e verifique a quantidade';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const request = {
      id_ordem_producao: this.selectedOP,
      id_grupo_producao: this.selectedGrupo,
      data_inicio: this.getPrimeiroDiaCalendario(),
      qtd_total: this.qtdDistribuir,
      quantidade_horas_extras: this.quantidadeHorasExtras,
      porcentagem_maxima_alocacao_grupo: this.porcentagemMaximaAlocacaoGrupo
    };

    this.distribuirOPService.distribuirOP(request).subscribe({
      next: (response: any) => {
        this.loading = false;

        if (response.success) {
          this.notificationService.success(
            'OP Distribuída',
            `OP distribuída com sucesso! ${response.message || ''}`
          );

          // Recarregar dados após distribuição
          this.loadDistribuicaoData(this.selectedOP);
          if (this.selectedGrupo) {
            this.calculateGroupQuantities();
          }

          // Limpar quantidade a distribuir
          this.qtdDistribuir = 0;
          this.quantidadeHorasExtras = 0;
          this.porcentagemMaximaAlocacaoGrupo = 100;
        } else {
          this.notificationService.error(
            'Erro ao Distribuir OP',
            response.message || 'Erro desconhecido ao distribuir a OP'
          );
        }
      },
      error: (error: any) => {
        this.loading = false;
        this.notificationService.error(
          'Erro ao Distribuir OP',
          error.message || 'Erro de conexão ao distribuir a OP'
        );
        console.error('Erro na distribuição:', error);
      }
    });
  }

  onVoltar(): void {
    if (this.cameFromForm && this.formOpId) {
      // Se veio do formulário (OP recém-criada), voltar para a lista de OPs
      this.router.navigate(['/ordem-producao']);
    } else if (this.cameFromList) {
      // Se veio da lista, voltar para a lista de OPs
      this.router.navigate(['/ordem-producao']);
    } else {
      // Caso contrário, voltar para a lista de OPs (comportamento padrão)
      this.router.navigate(['/ordem-producao']);
    }
  }

  // Métodos para o modal de edição de horas
  onModalClose(): void {
    this.showEditHoursModal = false;
    this.selectedDayForEdit = null;
  }

  onModalSave(data: any): void {
    // Recarregar dados após salvamento bem-sucedido
    if (this.selectedOP) {
      const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;
      this.loadDistribuicaoData(opId);
    }
/*
    this.notificationService.success(
      'Horários Salvos',
      `Horários salvos com sucesso para ${data.data}`
    );*/
    this.showEditHoursModal = false;
    this.selectedDayForEdit = null;
  }

  // Métodos para o modal de edição de horas do dia
  onDayModalClose(): void {
    this.showEditHoursDayModal = false;
    this.selectedDayForDayEdit = null;
  }

  onDayModalSave(data: any): void {
    // Recarregar dados após salvamento bem-sucedido
    if (this.selectedOP) {
      const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;
      this.loadDistribuicaoData(opId);

      // Recarregar distribuição no calendário para o grupo selecionado
      if (this.selectedGrupo) {
        this.calculateGroupQuantities();
      }
    }

/*    this.notificationService.success(
      'Dados do Dia Salvos',
      `Dados do dia salvos com sucesso para ${data.data}`
    );*/
    this.showEditHoursDayModal = false;
    this.selectedDayForDayEdit = null;
  }

  getOpInfo(): any {

    if (!this.selectedOP) {
      console.log('Nenhuma OP selecionada');
      return null;
    }

    // Converter selectedOP para número se necessário
    const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;

    const ordem = this.ordens.find(o => o.id_ordem_producao === opId);

    if (!ordem) {
      const ordemOriginal = this.ordens.find(o => o.id_ordem_producao === this.selectedOP);
      return null;
    }

    const result = {
      codigo_op: ordem.codigo_op,
      cd_modelo: ordem.cd_modelo
    };

    return result;
  }

  /**
   * Obter código da OP selecionada
   */
  getOpCodigo(): string {
    if (!this.selectedOP) return '';

    const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;
    const ordem = this.ordens.find(o => o.id_ordem_producao === opId);

    return ordem?.codigo_op || '';
  }

  /**
   * Obter data de início da OP selecionada
   */
  getOpDataInicio(): string {
    if (!this.selectedOP) return '';

    const opId = typeof this.selectedOP === 'string' ? parseInt(this.selectedOP) : this.selectedOP;
    const ordem = this.ordens.find(o => o.id_ordem_producao === opId);

    return ordem?.data_inicio || '';
  }

  /**
   * Formatar data para exibição
   */
  formatDateDisplay(dateString: string): string {
    if (!dateString) return '';

    const [year, month, day] = dateString.split(/[-T]/);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    return date.toLocaleDateString('pt-BR');
  }
}
