import { HttpHeaders, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { sessionStorageUtils } from "../util/sessionStorage";
import { environment } from "../environment/environment";
import { throwError } from "rxjs";

@Injectable({
    providedIn: "root"
})

export abstract class BaseService {
    protected urlServiceV1: string = this.buildApiUrl();
    protected sessionStorageUtils = new sessionStorageUtils();

    private buildApiUrl(): string {
        const protocol = window.location.protocol;
        let endPoint = environment.apiUrlv1;
        const host = window.location.hostname;


        if(host != 'localhost') {
            if(protocol == 'http:') {
                endPoint = endPoint.replace('https:','http:');
            }
            else {
                endPoint = endPoint.replace('http:','https:');
            }
        }


        return endPoint;
      }
    protected ObterHeaderJson() {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json;charset=utf-8',
                'Accept':'application/json;charset=utf-8',
            })
        };
    }

    protected ObterAuthHeaderJson() {
      var headers: HttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json;charset=utf-8',
         'Accept':'application/json;charset=utf-8',
        'AccessToken': `Bearer ${this.sessionStorageUtils.obterTokenUsuario()}`,
        //'Accept':'application/json;charset=utf-8',
        //'TKP': '0',
        'Authorization': `Bearer ${this.sessionStorageUtils.obterTokenUsuario()}`
    })

      return headers        ;
    }


    protected errorHandler(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.log('Um erro ocorreu:', error.error.message);
        } else {
            if (error.status === 401) {
                location.href = '/login';
                return throwError('Acesso não autorizado ou sessão expirou. Por favor faça o login novamente!')
            } else if (error.status === 403) {
                location.href = '/';
                return throwError('Não tem acesso a funcionalidade!')
            } else if (error.status === 400) {
                if (error.error) {
                    const validationSummary = error.error?.ValidationSummary;
                    if (validationSummary && validationSummary.Erros.length > 0) {
                        const errorMessage = validationSummary.Erros[0]?.ErrorMessage;
                        return throwError(errorMessage || 'Erro inesperado. Por favor, tente novamente.');
                    }else if (error.error[Object.keys(error.error)[0]].value){
                        return throwError(error.error[Object.keys(error.error)[0]].value);
                    }
                    return throwError('Algo de errado aconteceu. Por favor tente novamente!');
                } else {
                    return throwError(error);
                }
            }
        }
        // return an observable with a user-facing error message
        return throwError('Algo de errado aconteceu. Por favor tente novamente!');
    }
}
