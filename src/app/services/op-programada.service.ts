import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { environment } from '../environment/environment';
import { OPProgramadaListResponse } from '../model/op-programada';

@Injectable({
  providedIn: 'root'
})
export class OPProgramadaService extends BaseService {
  private apiUrl = environment.apiUrlv1 + '/op_programada.php';

  constructor(private http: HttpClient) {
    super();
  }

  list(
    page: number = 1,
    limit: number = 50,
    search: string = '',
    id_grupo_producao: number = 0,
    data_inicio: string = '',
    data_fim: string = '',
    situacao: string = ''
  ): Observable<OPProgramadaListResponse> {
    let params = `?action=list&page=${page}&limit=${limit}`;
    if (search) params += `&search=${search}`;
    if (id_grupo_producao > 0) params += `&id_grupo_producao=${id_grupo_producao}`;
    if (data_inicio) params += `&data_inicio=${data_inicio}`;
    if (data_fim) params += `&data_fim=${data_fim}`;
    if (situacao) params += `&situacao=${situacao}`;

    return this.http.get<OPProgramadaListResponse>(this.apiUrl + params, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(catchError(this.errorHandler));
  }

  updateQtdRealizada(id_ordem_producao_data: number, qtd_realizada: number): Observable<any> {
    const params = `?action=update_qtd_realizada`;
    return this.http.post<any>(this.apiUrl + params, {
      id_ordem_producao_data,
      qtd_realizada
    }, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(catchError(this.errorHandler));
  }

  remanejarSaldo(
    id_ordem_producao_data: number,
    data_remanejamento: string,
    id_grupo_producao: number,
    quantidade_horas_extras: number
  ): Observable<any> {
    const params = `?action=remanejar_saldo`;
    return this.http.post<any>(this.apiUrl + params, {
      id_ordem_producao_data,
      data_remanejamento,
      id_grupo_producao,
      quantidade_horas_extras
    }, {
      headers: this.ObterAuthHeaderJson()
    }).pipe(catchError(this.errorHandler));
  }
}

