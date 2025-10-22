import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OPProgramada } from '../../model/op-programada';
import { GrupoProducao } from '../../model/grupo-producao';

@Component({
  selector: 'app-remanejar-saldo-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isVisible) {
      <div class="modal-overlay" (click)="onBackdropClick($event)">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Remanejar Saldo</h3>
            <button class="modal-close" (click)="onCancel()" type="button">
              <span>&times;</span>
            </button>
          </div>

          <div class="modal-body">
            @if (opSelecionada) {
              <div class="info-section">
                <h4>Informações da OP</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">OP:</span>
                    <span class="value">{{ opSelecionada.codigo_op }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Modelo:</span>
                    <span class="value">{{ opSelecionada.cd_modelo }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Grupo:</span>
                    <span class="value">{{ opSelecionada.grupo_descricao }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Data Atual:</span>
                    <span class="value">{{ formatDate(opSelecionada.dt_ordem_producao) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Prevista:</span>
                    <span class="value">{{ opSelecionada.qtd_prevista }} peças</span>
                  </div>
                  <div class="info-item">
                    <span class="label">Realizada:</span>
                    <span class="value">{{ opSelecionada.qtd_realizada }} peças</span>
                  </div>
                  <div class="info-item saldo-destaque">
                    <span class="label">Saldo a Remanejar:</span>
                    <span class="value"><strong>{{ opSelecionada.saldo }} peças</strong></span>
                  </div>
                </div>
              </div>

              <div class="form-section">
                <h4>Configurações de Remanejamento</h4>

                <div class="form-group">
                  <label for="grupo_remanejamento" class="form-label required">
                    Grupo de Produção
                  </label>
                  <select
                    id="grupo_remanejamento"
                    [(ngModel)]="grupoSelecionado"
                    class="form-select"
                  >
                    <option [value]="0">Selecione um grupo</option>
                    <option *ngFor="let grupo of grupos" [value]="grupo.id_grupo_producao">
                      {{ grupo.descricao }}
                    </option>
                  </select>
                  <small class="form-hint">
                    Grupo que receberá o saldo remanejado
                  </small>
                </div>

                <div class="form-group">
                  <label for="data_remanejamento" class="form-label required">
                    Data para Início do Remanejamento
                  </label>
                  <input
                    type="date"
                    id="data_remanejamento"
                    [(ngModel)]="dataRemanejamento"
                    class="form-control"
                    [min]="dataMinima"
                  />
                  <small class="form-hint">
                    O saldo será redistribuído a partir desta data
                  </small>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      [(ngModel)]="usarHoraExtra"
                      class="checkbox-input"
                    />
                    <span class="checkbox-text">Permitir Hora Extra</span>
                  </label>
                  <small class="form-hint">
                    Se marcado, poderá utilizar horas extras para o remanejamento
                  </small>
                </div>
              </div>

              @if (errorMessage) {
                <div class="alert alert-error">
                  {{ errorMessage }}
                </div>
              }
            }
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-primary"
              [disabled]="!dataRemanejamento || grupoSelecionado <= 0 || saving"
              (click)="onConfirmar()"
            >
              @if (!saving) {
                <span>🔄 Confirmar Remanejamento</span>
              }
              @if (saving) {
                <span>
                  <span class="spinner-border spinner-border-sm"></span>
                  Processando...
                </span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-container {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #dee2e6;
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      color: #000;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #dee2e6;
    }

    .info-section, .form-section {
      margin-bottom: 1.5rem;
    }

    .info-section h4, .form-section h4 {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #495057;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .info-item .label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }

    .info-item .value {
      font-size: 0.95rem;
      color: #212529;
    }

    .saldo-destaque {
      grid-column: span 2;
      background: #fff3cd;
      padding: 0.75rem;
      border-radius: 4px;
      border-left: 4px solid #ffc107;
    }

    .saldo-destaque .value {
      color: #856404;
      font-size: 1.1rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #495057;
    }

    .form-label.required::after {
      content: ' *';
      color: #dc3545;
    }

    .form-control, .form-select {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-hint {
      display: block;
      margin-top: 0.25rem;
      font-size: 0.85rem;
      color: #6c757d;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .alert {
      padding: 0.75rem 1rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .alert-error {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    @media (max-width: 768px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .saldo-destaque {
        grid-column: span 1;
      }
    }
  `]
})
export class RemanejarSaldoModalComponent implements OnChanges {
  @Input() isVisible: boolean = false;
  @Input() opSelecionada: OPProgramada | null = null;
  @Input() grupos: GrupoProducao[] = [];
  @Output() confirmar = new EventEmitter<{dataRemanejamento: string, idGrupo: number, usarHoraExtra: boolean}>();
  @Output() cancelar = new EventEmitter<void>();

  dataRemanejamento: string = '';
  grupoSelecionado: number = 0;
  usarHoraExtra: boolean = false;
  errorMessage: string | null = null;
  saving: boolean = false;
  dataMinima: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isVisible && this.opSelecionada) {
      // Definir data mínima como dia seguinte à data atual da OP
      const dataAtual = new Date(this.opSelecionada.dt_ordem_producao);
      dataAtual.setDate(dataAtual.getDate() + 1);
      this.dataMinima = this.formatDateToInput(dataAtual);
      this.dataRemanejamento = this.dataMinima;
      this.grupoSelecionado = this.opSelecionada.id_grupo_producao; // Grupo atual por padrão
      this.usarHoraExtra = false;
      this.errorMessage = null;
    }
  }

  formatDateToInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const [year, month, day] = dateString.split(/[-T]/);
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR');
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  onCancel(): void {
    this.cancelar.emit();
  }

  onConfirmar(): void {
    if (!this.dataRemanejamento) {
      this.errorMessage = 'Selecione uma data para o remanejamento';
      return;
    }

    if (this.grupoSelecionado <= 0) {
      this.errorMessage = 'Selecione um grupo para o remanejamento';
      return;
    }

    this.saving = true;
    this.confirmar.emit({
      dataRemanejamento: this.dataRemanejamento,
      idGrupo: this.grupoSelecionado,
      usarHoraExtra: this.usarHoraExtra
    });
  }

  setSaving(saving: boolean): void {
    this.saving = saving;
  }

  setError(error: string | null): void {
    this.errorMessage = error;
  }
}

