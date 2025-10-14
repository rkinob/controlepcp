import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AprovadoresHoraExtraService, ConfigAprovador } from '../../services/aprovadores-hora-extra.service';
import { UsuarioService } from '../../services/usuario.service';
import { NotificationService } from '../../services/notification.service';
import { Usuario, UsuarioListResponse } from '../../model/usuario';

@Component({
  selector: 'app-config-aprovadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './config-aprovadores.component.html',
  styleUrl: './config-aprovadores.component.css'
})
export class ConfigAprovadoresComponent implements OnInit {
  aprovadores: any[] = [];
  usuarios: Usuario[] = [];
  loading = false;
  showModal = false;

  novoAprovador: ConfigAprovador = {
    id_usuario: 0,
    tipo_aprovacao: 'E',
    ativo: 1
  };

  constructor(
    private aprovadoresService: AprovadoresHoraExtraService,
    private usuarioService: UsuarioService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.carregarAprovadores();
    this.carregarUsuarios();
  }

  carregarAprovadores(): void {
    this.loading = true;
    this.aprovadoresService.listarAprovadores().subscribe({
      next: (response) => {
        if (response.success) {
          this.aprovadores = Array.isArray(response.data) ? response.data : [];
        } else {
          this.aprovadores = [];
        }
        this.loading = false;
      },
      error: (error) => {
        this.aprovadores = [];
        this.notification.error('Erro', 'Erro ao carregar aprovadores');
        this.loading = false;
      }
    });
  }

  carregarUsuarios(): void {
    this.usuarioService.listUsuarios(1, 1000).subscribe({
      next: (response: UsuarioListResponse) => {
        console.log(response);
        if (response.success && response.data) {
          this.usuarios = Array.isArray(response.data.usuarios) ? response.data.usuarios : [];
        } else {
          this.usuarios = [];
        }
      },
      error: (error: any) => {
        this.usuarios = [];
        this.notification.error('Erro', 'Erro ao carregar usuários');
      }
    });
  }

  abrirModal(): void {
    this.novoAprovador = {
      id_usuario: 0,
      tipo_aprovacao: 'E',
      ativo: 1
    };
    this.showModal = true;
  }

  fecharModal(): void {
    this.showModal = false;
  }

  salvarAprovador(): void {
    if (this.novoAprovador.id_usuario === 0) {
      this.notification.error('Validação', 'Selecione um usuário');
      return;
    }

    this.loading = true;
    this.aprovadoresService.criarAprovador(this.novoAprovador).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success('Sucesso', 'Aprovador cadastrado com sucesso');
          this.fecharModal();
          this.carregarAprovadores();
        }
        this.loading = false;
      },
      error: (error) => {
        this.notification.error('Erro', error.error?.message || 'Erro ao cadastrar aprovador');
        this.loading = false;
      }
    });
  }

  alterarStatus(aprovador: any): void {
    const novoStatus = aprovador.ativo === 1 ? 0 : 1;

    this.aprovadoresService.atualizarAprovador({
      id_config_aprovador: aprovador.id_config_aprovador,
      id_usuario: aprovador.id_usuario,
      tipo_aprovacao: aprovador.tipo_aprovacao,
      ativo: novoStatus
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success('Sucesso', novoStatus === 1 ? 'Aprovador ativado' : 'Aprovador desativado');
          this.carregarAprovadores();
        }
      },
      error: (error) => {
        this.notification.error('Erro', 'Erro ao alterar status');
      }
    });
  }

  alterarTipoAprovacao(aprovador: any): void {
    const novoTipo = aprovador.tipo_aprovacao === 'E' ? 'OU' : 'E';

    this.aprovadoresService.atualizarAprovador({
      id_config_aprovador: aprovador.id_config_aprovador,
      id_usuario: aprovador.id_usuario,
      tipo_aprovacao: novoTipo,
      ativo: aprovador.ativo
    }).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success('Sucesso', 'Tipo de aprovação alterado');
          this.carregarAprovadores();
        }
      },
      error: (error) => {
        this.notification.error('Erro', 'Erro ao alterar tipo de aprovação');
      }
    });
  }

  removerAprovador(id: number): void {
    if (!confirm('Deseja realmente remover este aprovador?')) {
      return;
    }

    this.aprovadoresService.removerAprovador(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success('Sucesso', 'Aprovador removido com sucesso');
          this.carregarAprovadores();
        }
      },
      error: (error) => {
        this.notification.error('Erro', 'Erro ao remover aprovador');
      }
    });
  }

  getTipoAprovacaoTexto(tipo: string): string {
    return tipo === 'E' ? 'Todos devem aprovar (E)' : 'Pelo menos um deve aprovar (OU)';
  }
}

