import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';

export interface DistribuirOPRequest {
  id_ordem_producao: number;
  id_grupo_producao: number;
  data_inicio: string;
  qtd_total: number;
}

export interface DistribuicaoDia {
  data: string;
  qtd_distribuida: number;
  horarios_utilizados: Array<{
    hora_ini: string;
    hora_fim: string;
  }>;
}

export interface DistribuirOPResponse {
  dias_utilizados: number;
  distribuicao: DistribuicaoDia[];
}

export interface DisponibilidadeHorario {
  data: string;
  dia_semana: number;
  total_horarios: number;
  horarios_ocupados: number;
  horarios_livres: number;
}

export interface DisponibilidadeHorarioResponse {
  data: DisponibilidadeHorario[];
  sucesso: boolean;
  mensagem: string;
}

export interface CancelarDistribuicaoRequest {
  id_ordem_producao: number;
  id_grupo_producao: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistribuirOPService extends BaseService {
  private apiUrl = `${environment.apiUrlv1}/distribuir_op.php`;

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Distribuir OP nos horários disponíveis
   */
  distribuirOP(request: DistribuirOPRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=distribuir`, request, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Verificar disponibilidade de horários
   */
  verificarDisponibilidade(id_grupo_producao: number, data_inicio: string, dias: number = 7): Observable<DisponibilidadeHorarioResponse> {
    const params = new URLSearchParams({
      action: 'verificar_disponibilidade',
      id_grupo_producao: id_grupo_producao.toString(),
      data_inicio: data_inicio,
      dias: dias.toString()
    });

    return this.http.get<DisponibilidadeHorarioResponse>(`${this.apiUrl}?${params}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Verificar se OP já foi distribuída
   */
  verificarDistribuicaoExistente(id_ordem_producao: number): Observable<any> {
    const params = new URLSearchParams({
      action: 'verificar_distribuicao_existente',
      id_ordem_producao: id_ordem_producao.toString()
    });

    return this.http.get<any>(`${this.apiUrl}?${params}`, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }

  /**
   * Cancelar distribuição de OP
   */
  cancelarDistribuicao(request: CancelarDistribuicaoRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}?action=cancelar_distribuicao`, request, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(
      catchError(this.errorHandler)
    );
  }
}
