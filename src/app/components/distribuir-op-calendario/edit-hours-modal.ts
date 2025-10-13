import { Component, Input, Output, EventEmitter, OnInit, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../../services/base.service';

interface HorarioDisponivel {
  id: string;
  hora_ini: string;
  hora_fim: string;
  qtd_prevista?: number;
  qtd_realizada?: number;
  status?: string;
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

interface OpInfo {
  codigo_op: string;
  cd_modelo: string;
}

@Component({
  selector: 'app-edit-hours-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-hours-modal.html',
  styleUrls: ['./edit-hours-modal.css']
})
export class EditHoursModalComponent extends BaseService implements OnInit, OnChanges {
  @Input() selectedDay: any = null;
  @Input() opInfo: OpInfo | null = null;
  @Input() qtdRestante: number = 0;
  @Input() metaPorHora: number = 0;
  @Input() isVisible: boolean = false;
  @Input() existingTimeSlots: TimeSlot[] = [];
  @Input() idGrupoProducao: number = 0;
  @Input() idOrdemProducao: number = 0;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  horariosDisponiveis: HorarioDisponivel[] = [];
  horarioSelecionados: string[] = [];
  quantidadeDisponivel: number = 0; // Quantidade restante disponível para alocação

  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {
    super();
  }

  ngOnInit() {
    this.gerarHorariosDisponiveis();
  }

  ngOnChanges() {
    if (this.isVisible) {

      this.gerarHorariosDisponiveis();
      this.inicializarCheckboxes();
      this.calcularQuantidadeDisponivel();

      // Forçar detecção de mudanças
      this.cdr.detectChanges();
    }
  }

  gerarHorariosDisponiveis(): void {
    // Gerar horários padrão de 1 hora cada
    this.horariosDisponiveis = [];

    const horarios = [
      '07:30', '08:30', '09:30', '10:30', '11:30', '12:30',
      '13:30', '14:30', '15:30', '16:30', '17:30', '18:30'
    ];


    for (let i = 0; i < horarios.length - 1; i++) {
      const id = `horario-${i + 1}`;
      const horaIni = horarios[i];

      // Calcular hora fim corretamente (subtrair 1 minuto)
      const horaFimParts = horarios[i + 1].split(':');
      let horaFimHora = parseInt(horaFimParts[0]);
      let horaFimMinuto = parseInt(horaFimParts[1]) - 1;

      // Ajustar se minuto ficar negativo
      if (horaFimMinuto < 0) {
        horaFimMinuto = 59;
        horaFimHora -= 1;
      }

      const horaFim = `${horaFimHora.toString().padStart(2, '0')}:${horaFimMinuto.toString().padStart(2, '0')}`;


      // Verificar se já existe um horário alocado para este período
      const existingSlot = this.existingTimeSlots.find(slot => {
        // Comparação mais flexível para diferentes formatos de horário
        const slotHoraIni = slot.horaIni?.substring(0, 5) || slot.horaIni; // Remove segundos se existir
        const slotHoraFim = slot.horaFim?.substring(0, 5) || slot.horaFim; // Remove segundos se existir

        return slotHoraIni === horaIni && slotHoraFim === horaFim;
      });


      this.horariosDisponiveis.push({
        id: id,
        hora_ini: horaIni,
        hora_fim: horaFim,
        qtd_prevista: existingSlot?.qtdPrevista || 0,
        qtd_realizada: existingSlot?.qtdRealizada || 0,
        status: existingSlot?.status || 'livre'
      });
    }

  }

  inicializarCheckboxes(): void {
    // Não limpar horarioSelecionados - manter estado atual
    // Apenas adicionar horários que não estão na lista mas deveriam estar

    // Marcar checkboxes para horários já alocados que não estão selecionados
    this.horariosDisponiveis.forEach(horario => {
      if ((horario.qtd_prevista && horario.qtd_prevista > 0) ||
          (horario.qtd_realizada && horario.qtd_realizada > 0)) {

        // Só adicionar se não estiver já na lista
        if (!this.horarioSelecionados.includes(horario.id)) {
          this.horarioSelecionados.push(horario.id);
        }
      }
    });

  }

  calcularQuantidadeDisponivel(): void {
    // Calcular quantidade total já alocada
    const quantidadeAlocada = this.horariosDisponiveis.reduce((total, horario) => {
      return total + (horario.qtd_prevista || horario.qtd_realizada || 0);
    }, 0);

    // Quantidade disponível = quantidade restante + quantidade já alocada
    this.quantidadeDisponivel = this.qtdRestante + quantidadeAlocada;


  }

  isHorarioPermitido(horario: HorarioDisponivel): boolean {
    if (!this.selectedDay) return false;

    // Criar data de forma explícita para evitar problemas de fuso horário
    const [year, month, day] = this.selectedDay.date.split('-').map(Number);
    const data = new Date(year, month - 1, day); // month é 0-indexed
    const diaSemana = data.getDay(); // 0 = domingo, 6 = sábado

    const horaIni = parseInt(horario.hora_ini.split(':')[0]);
    const minutoIni = parseInt(horario.hora_ini.split(':')[1]);
    const horaIniDecimal = horaIni + (minutoIni / 60);

    // Dias úteis (segunda a sexta): 07:30 até 16:30
    if (diaSemana >= 1 && diaSemana <= 5) {
      return horaIniDecimal >= 7.5 && horaIniDecimal <= 16.5;
    }

    // Sábado: 07:30 até 11:30
    if (diaSemana === 6) {
      return horaIniDecimal >= 7.5 && horaIniDecimal <= 11.5;
    }

    // Domingo: não permitido
    return false;
  }

  getQuantidadeHorario(horario: HorarioDisponivel): number {
    // Se já está alocado, usar a quantidade já alocada
    if ((horario.qtd_prevista && horario.qtd_prevista > 0) ||
        (horario.qtd_realizada && horario.qtd_realizada > 0)) {
      return horario.qtd_prevista || horario.qtd_realizada || 0;
    }

    // Para horários livres, sempre usar meta por hora (não depende de qtdRestante)
    return this.metaPorHora;
  }

  getQuantidadeDisponivelParaHorario(horario: HorarioDisponivel): number {
    // Se já está alocado, usar a quantidade já alocada
    if ((horario.qtd_prevista && horario.qtd_prevista > 0) ||
        (horario.qtd_realizada && horario.qtd_realizada > 0)) {
      return horario.qtd_prevista || horario.qtd_realizada || 0;
    }

    // Para horários livres, usar a menor entre meta por hora e quantidade restante atual
    return Math.min(this.metaPorHora, this.qtdRestante);
  }

  getQuantidadeParaExibicao(horario: HorarioDisponivel): number {
    // Se já está alocado, usar a quantidade já alocada
    if ((horario.qtd_prevista && horario.qtd_prevista > 0) ||
        (horario.qtd_realizada && horario.qtd_realizada > 0)) {
      return horario.qtd_prevista || horario.qtd_realizada || 0;
    }

    // Para horários livres, sempre mostrar meta por hora (mesmo que não possa ser alocada)
    return this.metaPorHora;
  }

  isHorarioLivre(horario: HorarioDisponivel): boolean {
    const isLivre = !((horario.qtd_prevista && horario.qtd_prevista > 0) ||
             (horario.qtd_realizada && horario.qtd_realizada > 0));
    return isLivre;
  }

  podeMarcarHorarioLivre(horario: HorarioDisponivel): boolean {
    if (!this.isHorarioLivre(horario)) return true; // Horários já alocados sempre podem ser marcados

    // Para horários livres, verificar se há quantidade restante suficiente para a meta por hora
    const podeMarcar = this.qtdRestante > 0 && this.qtdRestante >= this.metaPorHora;
    return podeMarcar;
  }

  toggleHorario(horario: HorarioDisponivel, event: Event): void {

    if (!this.isHorarioPermitido(horario)) return;
     //horario.id
     var checkbox =(event.target as HTMLInputElement);
     var checkboxChecked =(event.target as HTMLInputElement).checked;
     console.log('checkbox:', checkbox);
     const isHorarioJaAlocado = (horario.qtd_prevista && horario.qtd_prevista > 0) ||
     (horario.qtd_realizada && horario.qtd_realizada > 0);

     if(checkboxChecked){
      this.horarioSelecionados.push(horario.id);
      this.qtdRestante -= this.metaPorHora;
      if(this.qtdRestante < 0){
        this.qtdRestante = 0;
        this.horarioSelecionados.splice(this.horarioSelecionados.indexOf(horario.id), 1);
        checkbox.checked = false;
        return;
      }

     }
     else{
      this.horarioSelecionados.splice(this.horarioSelecionados.indexOf(horario.id), 1);
      this.qtdRestante += this.metaPorHora;
      console.log('qtdRestante:', this.qtdRestante);
     }

    const index = this.horarioSelecionados.indexOf(horario.id);


/*
    if (index > -1) {
      // Desmarcando checkbox
      this.horarioSelecionados.splice(index, 1);

      if (!isHorarioJaAlocado) {
        this.qtdRestante += this.metaPorHora;
      }
    }
    else {
      const quantidadeDisponivel = this.getQuantidadeDisponivelParaHorario(horario);
      this.qtdRestante -= quantidadeDisponivel;
      // Marcando checkbox
      if (isHorarioJaAlocado) {
        // Horário já alocado - sempre pode marcar, NÃO modificar qtdRestante
        this.horarioSelecionados.push(horario.id);
      } else {
        // Horário livre - verificar se há quantidade restante disponível


        if (this.qtdRestante > 0 && this.qtdRestante >= quantidadeDisponivel) {
          this.horarioSelecionados.push(horario.id);

        } else {
          return;
        }
      }
    }*/

  }

  getQuantidadeTotal(): number {
    return this.horarioSelecionados.reduce((total, horarioId) => {
      const horario = this.horariosDisponiveis.find(h => h.id === horarioId);
      return total + (horario ? this.getQuantidadeDisponivelParaHorario(horario) : 0);
    }, 0);
  }

  getSaldoRestante(): number {
    return this.qtdRestante;
  }

  temHorariosForaPeriodo(): boolean {
    return this.horarioSelecionados.some(id => {
      const horario = this.horariosDisponiveis.find(h => h.id === id);
      return horario && !this.isHorarioPermitido(horario);
    });
  }

  salvarHorarios(): void {
    // Validação front-end
    if (!this.validarHorarios()) {
      return;
    }

    const horariosSalvos = this.horarioSelecionados.map(id => {
      const horario = this.horariosDisponiveis.find(h => h.id === id);
      return {
        ...horario,
        qtd_prevista: this.getQuantidadeHorario(horario!),
        precisa_aprovacao: !this.isHorarioPermitido(horario!)
      };
    });

    const dadosParaSalvar = {
      data: this.selectedDay?.date,
      horarios: horariosSalvos,
      quantidade_total: this.getQuantidadeTotal(),
      precisa_aprovacao: this.temHorariosForaPeriodo(),
      qtd_restante: this.qtdRestante,
      opInfo: this.opInfo
    };

    // Fazer chamada para API
    this.salvarDistribuicao(dadosParaSalvar);
  }

  private salvarDistribuicao(dados: any): void {
    const url = 'http://localhost/controle_pcp/api/distribuicao_op_view.php?action=salvar_distribuicao';

    // Formatar dados no formato esperado pela API
    const distribuicao = [{
      data: dados.data,
      horarios: dados.horarios.map((horario: any) => ({
        id_ordem_producao_horas_data: horario.id || null,
        hora_ini: horario.hora_ini,
        hora_fim: horario.hora_fim,
        qtd_prevista: horario.qtd_prevista || 0,
        qtd_realizada: horario.qtd_realizada || 0,
        status: horario.status || 'Previsto'
      }))
    }];

    const params = {
      distribuicao: distribuicao,
      id_ordem_producao: this.idOrdemProducao,
      id_grupo_producao: this.idGrupoProducao,
      quantidade_total: dados.quantidade_total,
      precisa_aprovacao: dados.precisa_aprovacao ? 1 : 0,
      qtd_restante: dados.qtd_restante
    };

    this.http.post(url, params, { headers: this.ObterAuthHeaderJson() }).subscribe({
      next: (response: any) => {
        if (response.success) {
          alert('Distribuição salva com sucesso!');
          this.save.emit(dados);
          this.close.emit();
        } else {
          alert('Erro ao salvar distribuição: ' + (response.message || 'Erro desconhecido'));
        }
      },
      error: (error) => {
        console.error('Erro na requisição:', error);
        alert('Erro ao salvar distribuição: ' + (error.message || 'Erro de conexão'));
      }
    });
  }

  validarHorarios(): boolean {
    // Validar se há quantidade suficiente para todos os horários selecionados
    const quantidadeNecessaria = this.getQuantidadeTotal();

    if (this.qtdRestante < 0) {
      alert(`Erro: Quantidade necessária (${quantidadeNecessaria}) excede quantidade restante (${this.qtdRestante})`);
      return false;
    }

    // Validar se todos os horários selecionados são permitidos
    const horariosInvalidos = this.horarioSelecionados.filter(id => {
      const horario = this.horariosDisponiveis.find(h => h.id === id);
      return horario && !this.isHorarioPermitido(horario);
    });

    if (horariosInvalidos.length > 0) {
      alert('Erro: Alguns horários selecionados estão fora do período permitido');
      return false;
    }

    return true;
  }

  closeModal(): void {
    this.close.emit();
  }
}
