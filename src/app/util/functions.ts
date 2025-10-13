import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  formatarData(data: string): string {
    // formatar data para dd/mm/YYYY
    //data = this.functionsService.formatDateTime(data);
    data = new Date(data).toISOString().split('T')[0].replace(/-/g, '/');
    data = data.split('/').reverse().join('/');
    return data;
    //return new Date(data).toISOString().split('T')[0].replace(/-/g, '/');
  }

  formatDateTime(dateString: string): string {
    let dataFormatada = '';
    if (dateString) {
      try {
        const data = new Date(dateString);
        if (!isNaN(data.getTime())) {
          dataFormatada = data.toISOString().split('T')[0];
        } else {
          // Tentar outros formatos de data
            const partes = dateString.split('-');
          if (partes.length === 3) {
            dataFormatada = dateString;
          }
        }
      } catch (error) {
        console.error('Erro ao formatar data:', error);
      }
    }

    // Se não conseguiu formatar, usar data atual
    if (!dataFormatada) {
      const hoje = new Date();
      dataFormatada = hoje.toISOString().split('T')[0];
    }
    return dataFormatada;
  }
}
