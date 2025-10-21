import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../services/base.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../environment/environment';

interface PeriodoHorario {
  id?: number;
  hora_ini: string;
  hora_fim: string;
  qtd_realizada: number;
  qtd_perda: number;
}

interface DiaDistribuicao {
  id_ordem_producao_data?: number;
  data: string;
  qtd_prevista: number;
  qtd_realizada: number;
  qtd_perda: number;
  saldo: number;
  periodos: PeriodoHorario[];
  status_dia: string;
  distribuir_diferenca: string;
  distribuir_diferenca_se_alterada: string;
  observacao: string;
}

interface OpInfo {
  codigo_op: string;
  cd_modelo: string;
}

@Component({
  selector: 'app-edit-hours-day-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-hours-day-modal.html',
  styleUrls: ['./edit-hours-day-modal.css']
})
export class EditHoursDayModalComponent extends BaseService implements OnInit {
  @Input() selectedDay: any = null;
  @Input() opInfo: OpInfo | null = null;
  @Input() isVisible: boolean = false;
  @Input() idGrupoProducao: number = 0;
  @Input() idOrdemProducao: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  urlBase = environment.apiUrlv1;

  diaDistribuicao: DiaDistribuicao = {
    data: '',
    qtd_prevista: 0,
    qtd_realizada: 0,
    qtd_perda: 0,
    saldo: 0,
    periodos: [],
    status_dia: 'Previsto',
    distribuir_diferenca: 'N',
    distribuir_diferenca_se_alterada: 'N',
    observacao: ''
  };

  novoPeriodo: PeriodoHorario = {
    hora_ini: '',
    hora_fim: '',
    qtd_realizada: 0,
    qtd_perda: 0
  };

  loading: boolean = false;
  errorMessage: string | null = null;
  usuarioEAprovador: boolean = false;

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient, private notificationService: NotificationService) {
    super();
  }

  ngOnInit() {
    if (this.isVisible) {
      this.carregarDadosDia();
      this.verificarSeUsuarioEAprovador();
    }
  }

  verificarSeUsuarioEAprovador(): void {
    const url = this.urlBase + '/aprovadores_hora_extra.php';

    this.http.get(url, { headers: this.ObterAuthHeaderJson() }).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const aprovadores = Array.isArray(response.data) ? response.data : [];
          // Buscar ID do usuário atual do sessionStorage
          const userDataStr = sessionStorage.getItem('user');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            const idUsuarioAtual = userData.id_usuario;

            // Verificar se o usuário está na lista de aprovadores ativos
            this.usuarioEAprovador = aprovadores.some((a: any) =>
              a.id_usuario === idUsuarioAtual && a.ativo === 1
            );
          }
        }
      },
      error: () => {
        this.usuarioEAprovador = false;
      }
    });
  }



  carregarDadosDia(): void {
    if (!this.selectedDay || !this.idOrdemProducao || !this.idGrupoProducao) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    // Buscar dados do dia específico
    const url = this.urlBase + `/distribuicao_op_view.php?action=get_dia_distribuicao&id_ordem_producao=${this.idOrdemProducao}&id_grupo_producao=${this.idGrupoProducao}&data=${this.selectedDay.date}`;

    this.http.get(url, { headers: this.ObterAuthHeaderJson() }).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log(response);
        if (response.success && response.data) {
          this.diaDistribuicao = {
            id_ordem_producao_data: response.data.id_ordem_producao_data,
            data: this.selectedDay.date,
            qtd_prevista: response.data.qtd_prevista || 0,
            qtd_realizada: response.data.qtd_realizada || 0,
            qtd_perda: response.data.qtd_perda || 0,
            saldo: response.data.saldo || 0,
            periodos: response.data.periodos || [],
            status_dia: response.data.status || 'Previsto',
            distribuir_diferenca: response.data.distribuir_diferenca || 'N',
            distribuir_diferenca_se_alterada: response.data.distribuir_diferenca_se_alterada || 'N',
            observacao: response.data.observacao || ''
          };
        } else {
          // Inicializar com dados vazios se não existir distribuição
          this.diaDistribuicao = {
            data: this.selectedDay.date,
            qtd_prevista: 0,
            qtd_realizada: 0,
            qtd_perda: 0,
            saldo: 0,
            periodos: [],
            status_dia: 'Previsto',
            distribuir_diferenca: 'N',
            distribuir_diferenca_se_alterada: 'N',
            observacao: ''
          };
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erro ao carregar dados do dia: ' + (error.message || 'Erro de conexão');
        console.error('Erro ao carregar dados:', error);
      }
    });
  }

  adicionarPeriodo(): void {
    if (!this.validarNovoPeriodo()) {
      return;
    }

    // Adicionar novo período à lista
    this.diaDistribuicao.periodos.push({ ...this.novoPeriodo });

    // Recalcular quantidade realizada
    this.recalcularQuantidadeRealizada();

    // Limpar formulário
    this.novoPeriodo = {
      hora_ini: '',
      hora_fim: '',
      qtd_realizada: 0,
      qtd_perda: 0
    };
  }

  removerPeriodo(index: number): void {
    this.diaDistribuicao.periodos.splice(index, 1);
    this.recalcularQuantidadeRealizada();
  }

  atualizarQuantidadeRealizada(index: number, valor: number): void {
    this.diaDistribuicao.periodos[index].qtd_realizada = valor;
    this.recalcularQuantidadeRealizada();
  }

  atualizarQuantidadePerda(index: number, valor: number): void {
    this.diaDistribuicao.periodos[index].qtd_perda = valor;
    this.recalcularQuantidadeRealizada();
  }

  recalcularQuantidadeRealizada(): void {
    this.diaDistribuicao.qtd_realizada = this.diaDistribuicao.periodos.reduce(
      (total, periodo) => total + periodo.qtd_realizada, 0
    );
    this.diaDistribuicao.qtd_perda = this.diaDistribuicao.periodos.reduce(
      (total, periodo) => total + periodo.qtd_perda, 0
    );
    this.diaDistribuicao.saldo = this.diaDistribuicao.qtd_prevista - this.diaDistribuicao.qtd_realizada;
  }

  validarNovoPeriodo(): boolean {
    if (!this.novoPeriodo.hora_ini || !this.novoPeriodo.hora_fim) {
      this.errorMessage = 'Horário de início e fim são obrigatórios';
      return false;
    }

    if (this.novoPeriodo.qtd_realizada <= 0) {
      this.errorMessage = 'Quantidade realizada deve ser maior que zero';
      return false;
    }

    // Verificar se há sobreposição de horários
    const conflito = this.diaDistribuicao.periodos.some(periodo => {
      return this.horariosSobrepostos(
        this.novoPeriodo.hora_ini, this.novoPeriodo.hora_fim,
        periodo.hora_ini, periodo.hora_fim
      );
    });

    if (conflito) {
      this.errorMessage = 'Horário conflita com período já existente';
      return false;
    }

    this.errorMessage = null;
    return true;
  }

  horariosSobrepostos(ini1: string, fim1: string, ini2: string, fim2: string): boolean {
    const inicio1 = this.converterParaMinutos(ini1);
    const final1 = this.converterParaMinutos(fim1);
    const inicio2 = this.converterParaMinutos(ini2);
    const final2 = this.converterParaMinutos(fim2);

    return !(final1 <= inicio2 || final2 <= inicio1);
  }

  converterParaMinutos(horario: string): number {
    const [hora, minuto] = horario.split(':').map(Number);
    return hora * 60 + minuto;
  }

  salvarDados(): void {
    if (!this.validarDados()) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const dadosParaSalvar = {
      id_ordem_producao_data: this.diaDistribuicao.id_ordem_producao_data,
      data: this.diaDistribuicao.data,
      qtd_prevista: this.diaDistribuicao.qtd_prevista,
      periodos: this.diaDistribuicao.periodos,
      id_ordem_producao: this.idOrdemProducao,
      id_grupo_producao: this.idGrupoProducao,
      status_dia: this.diaDistribuicao.status_dia,
      distribuir_diferenca: this.diaDistribuicao.distribuir_diferenca,
      distribuir_diferenca_se_alterada: this.diaDistribuicao.distribuir_diferenca_se_alterada,
      observacao: this.diaDistribuicao.observacao || ''
    };

    this.salvarDistribuicao(dadosParaSalvar);
  }

  private salvarDistribuicao(dados: any): void {
    const url = this.urlBase + '/distribuicao_op_view.php?action=salvar_dia_distribuicao';

    // Verificar se há hora extra
    const temHoraExtra = this.verificarHoraExtra(dados.periodos, dados.data);

    this.http.post(url, dados, { headers: this.ObterAuthHeaderJson() }).subscribe({
      next: (response: any) => {
        this.loading = false;

        if (response.success) {
          // Mostrar mensagem de feedback sobre aprovação
          if (temHoraExtra) {
            this.notificationService.success(
              'Dados Salvos',
              'Programação com hora extra salva. Aprovação automática realizada!'
            );
          } else {
            this.notificationService.success(
              'Dados Salvos',
              'Dados do dia salvos com sucesso!'
            );
          }
          this.save.emit(dados);
          this.close.emit();
        } else {
          this.errorMessage = 'Erro ao salvar dados: ' + (response.message || 'Erro desconhecido');
          this.notificationService.error(
            'Erro ao Salvar',
            this.errorMessage
          );
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Erro ao salvar dados: ' + (error.message || 'Erro de conexão');
        this.notificationService.error(
          'Erro ao Salvar',
          this.errorMessage
        );
        console.error('Erro na requisição:', error);
      }
    });
  }

  private verificarHoraExtra(periodos: PeriodoHorario[], data: string): boolean {
    if (!periodos || periodos.length === 0) {
      return false;
    }

    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay(); // 0=Domingo, 1=Segunda, ..., 6=Sábado

    // Calcular total de horas
    let totalHoras = 0;
    periodos.forEach(periodo => {
      const [hIni, mIni] = periodo.hora_ini.split(':').map(Number);
      const [hFim, mFim] = periodo.hora_fim.split(':').map(Number);

      const minutosIni = hIni * 60 + mIni;
      const minutosFim = hFim * 60 + mFim;

      const minutos = minutosFim - minutosIni;
      totalHoras += minutos / 60;
    });

    // Verificar limites
    if (diaSemana >= 1 && diaSemana <= 5) {
      return totalHoras > 8; // Segunda a sexta: máximo 8 horas
    } else if (diaSemana === 6) {
      return totalHoras > 4; // Sábado: máximo 4 horas
    }

    return false; // Domingo
  }

  validarDados(): boolean {
    if (this.diaDistribuicao.qtd_prevista < 0) {
      this.errorMessage = 'Quantidade prevista não pode ser negativa';
      return false;
    }
/*
    if (this.diaDistribuicao.periodos.length === 0) {
      this.errorMessage = 'Adicione pelo menos um período';
      return false;
    }*/

    this.errorMessage = null;
    return true;
  }

  closeModal(): void {
    this.close.emit();
  }

  formatarData(data: string): string {
    if (!data) return '';
    // Separar a data e criar como data local para evitar problemas de timezone
    const [ano, mes, dia] = data.split('-').map(Number);
    const date = new Date(ano, mes - 1, dia);
    return date.toLocaleDateString('pt-BR');
  }
}
