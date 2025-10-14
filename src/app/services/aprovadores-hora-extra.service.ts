import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

export interface ConfigAprovador {
  id_config_aprovador?: number;
  id_usuario: number;
  tipo_aprovacao: 'E' | 'OU';
  ativo?: number;
  dt_inclusao?: string;
  nome_usuario?: string;
  login?: string;
}

export interface AprovacaoPendente {
  id_ordem_producao_data: number;
  data: string;
  hora_ini: string;
  hora_fim: string;
  qtd_prevista: number;
  aprovado: number;
  codigo_op: string;
  cd_modelo: string;
  modelo_descricao: string;
  grupo_descricao: string;
  id_aprovacao: number;
  tipo_aprovacao: string;
  dt_solicitacao: string;
}

export interface HistoricoAprovacao {
  id_aprovacao: number;
  id_ordem_producao_data: number;
  dt_aprovacao: string;
  operacao: number;
  observacao?: string;
  nome_usuario: string;
  data: string;
  hora_ini: string;
  hora_fim: string;
  codigo_op: string;
  cd_modelo: string;
}

@Injectable({
  providedIn: 'root'
})
export class AprovadoresHoraExtraService {
  private apiUrl = `${environment.apiUrlv1}/aprovadores_hora_extra.php`;
  private apiAprovacoes = `${environment.apiUrlv1}/aprovacoes_hora_extra.php`;

  constructor(private http: HttpClient) {}

  // Configuração de Aprovadores
  listarAprovadores(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getAprovadorById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}?id=${id}`);
  }

  criarAprovador(aprovador: ConfigAprovador): Observable<any> {
    return this.http.post(this.apiUrl, aprovador);
  }

  atualizarAprovador(aprovador: ConfigAprovador): Observable<any> {
    return this.http.put(this.apiUrl, aprovador);
  }

  removerAprovador(id: number): Observable<any> {
    return this.http.delete(this.apiUrl, { body: { id_config_aprovador: id } });
  }

  // Aprovações
  getAprovacoesPendentes(): Observable<any> {
    return this.http.get(`${this.apiAprovacoes}?pendentes=true`);
  }

  getHistoricoAprovacoes(): Observable<any> {
    return this.http.get(`${this.apiAprovacoes}?historico=true`);
  }

  aprovarReprovar(idOrdemProducaoData: number, operacao: number, observacao?: string): Observable<any> {
    return this.http.post(`${this.apiAprovacoes}?aprovar=true`, {
      id_ordem_producao_data: idOrdemProducaoData,
      operacao,
      observacao
    });
  }

  criarSolicitacaoAprovacao(idOrdemProducaoData: number): Observable<any> {
    return this.http.post(this.apiAprovacoes, {
      id_ordem_producao_data: idOrdemProducaoData
    });
  }
}

