import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';

export interface HorarioDistribuicao {
  id_ordem_producao_horas_data?: number;
  hora_ini: string;
  hora_fim: string;
  qtd_prevista: number;
  qtd_realizada: number;
  status: string;
}

export interface DiaDistribuicao {
  data: string;
  dia_semana: number;
  total_previsto: number;
  total_realizado: number;
  saldo: number;
  status: string;
  horarios: HorarioDistribuicao[];
}

export interface OrdemProducaoInfo {
  id_ordem_producao: number;
  codigo_op: string;
  cd_modelo: string;
  meta_por_hora: number;
  grupo_descricao: string;
  qtd_total: number;
  qtd_alocada_grupo: number;
}

export interface DistribuicaoResponse {
  success: boolean;
  message: string;
  data: {
    ordem_producao: OrdemProducaoInfo;
    qtd_alocada_grupo: number;
    distribuicao: DiaDistribuicao[];
  };
}

export interface UpdateQuantidadeRequest {
  id_ordem_producao_horas_data: number;
  qtd_realizada: number;
}

export interface FecharProducaoRequest {
  distribuicao: DiaDistribuicao[];
  id_ordem_producao: number;
  id_grupo_producao: number;
  meta_por_hora: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistribuicaoOpViewService extends BaseService {
  private apiUrl = environment.apiUrlv1 + '/distribuicao_op_view.php';

  constructor(private http: HttpClient) {
    super();
  }

  /**
   * Buscar distribuição de OP
   */
  getDistribuicao(id_ordem_producao: number, id_grupo_producao: number, data_inicio: string, dias: number = 7): Observable<DistribuicaoResponse> {

    const params = `?action=get_distribuicao&id_ordem_producao=${id_ordem_producao}&id_grupo_producao=${id_grupo_producao}&data_inicio=${data_inicio}&dias=${dias}`;

    return this.http.get<DistribuicaoResponse>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Buscar quantidades totais de uma OP
   */
  getQuantidadesOP(id_ordem_producao: number): Observable<any> {
    const params = `?action=get_quantidades_op&id_ordem_producao=${id_ordem_producao}`;
    return this.http.get<any>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Atualizar quantidade realizada
   */
  updateQuantidadeRealizada(request: UpdateQuantidadeRequest): Observable<any> {
    const params = `?action=update_quantidade_realizada`;
    return this.http.post<any>(this.apiUrl + params, request, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Salvar distribuição completa
   */
  salvarDistribuicao(distribuicao: DiaDistribuicao[]): Observable<any> {
    const params = `?action=salvar_distribuicao`;
    return this.http.post<any>(this.apiUrl + params, { distribuicao })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Fechar produção
   */
  fecharProducao(request: FecharProducaoRequest): Observable<any> {
    const params = `?action=fechar_producao`;
    return this.http.post<any>(this.apiUrl + params, request, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }

  /**
   * Buscar relatório de calendário com filtros
   */
  getRelatorioCalendario(
    dataInicioDe: string,
    dataInicioAte: string,
    filtroOP: string = '',
    filtroModelo: string = '',
    filtroGrupo: string = ''
  ): Observable<any> {
    let params = `?action=relatorio_calendario&data_inicio_de=${dataInicioDe}&data_inicio_ate=${dataInicioAte}`;

    if (filtroOP) params += `&codigo_op=${encodeURIComponent(filtroOP)}`;
    if (filtroModelo) params += `&cd_modelo=${encodeURIComponent(filtroModelo)}`;
    if (filtroGrupo) params += `&grupo=${encodeURIComponent(filtroGrupo)}`;

    return this.http.get<any>(this.apiUrl + params, { headers: this.ObterAuthHeaderJson() })
      .pipe(catchError(this.errorHandler));
  }
}
