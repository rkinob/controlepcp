import { Routes } from '@angular/router';
import { AuthGuard, LoginGuard } from './guards/auth.guard';
import { PermissaoGuard } from './guards/permissao.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [LoginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'modelo-peca',
    loadComponent: () => import('./components/modelo-peca-list/modelo-peca-list.component').then(m => m.ModeloPecaListComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'EDITAR_MODELO' }
  },
  {
    path: 'modelo-peca/new',
    loadComponent: () => import('./components/modelo-peca-form/modelo-peca-form.component').then(m => m.ModeloPecaFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'EDITAR_MODELO' }
  },
  {
    path: 'modelo-peca/edit/:id',
    loadComponent: () => import('./components/modelo-peca-form/modelo-peca-form.component').then(m => m.ModeloPecaFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'EDITAR_MODELO' }
  },
  {
    path: 'grupo-producao',
    loadComponent: () => import('./components/grupo-producao-list/grupo-producao-list.component').then(m => m.GrupoProducaoListComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_GRUPOS' }
  },
  {
    path: 'grupo-producao/new',
    loadComponent: () => import('./components/grupo-producao-form/grupo-producao-form.component').then(m => m.GrupoProducaoFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_GRUPOS' }
  },
  {
    path: 'grupo-producao/edit/:id',
    loadComponent: () => import('./components/grupo-producao-form/grupo-producao-form.component').then(m => m.GrupoProducaoFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_GRUPOS' }
  },
  {
    path: 'distribuir-op',
    loadComponent: () => import('./components/distribuir-op/distribuir-op.component').then(m => m.DistribuirOPComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'distribuir-op-calendario',
    loadComponent: () => import('./components/distribuir-op-calendario/distribuir-op-calendario').then(m => m.DistribuirOpCalendarioComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'distribuicao-op-view',
    loadComponent: () => import('./components/distribuicao-op-view/distribuicao-op-view.component').then(m => m.DistribuicaoOpViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ordem-producao',
    loadComponent: () => import('./components/ordem-producao-list/ordem-producao-list.component').then(m => m.OrdemProducaoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ordem-producao/new',
    loadComponent: () => import('./components/ordem-producao-form/ordem-producao-form.component').then(m => m.OrdemProducaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ordem-producao/edit/:id',
    loadComponent: () => import('./components/ordem-producao-form/ordem-producao-form.component').then(m => m.OrdemProducaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario',
    loadComponent: () => import('./components/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'usuario/new',
    loadComponent: () => import('./components/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'usuario/edit/:id',
    loadComponent: () => import('./components/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'relatorio-calendario',
    loadComponent: () => import('./components/relatorio-calendario/relatorio-calendario').then(m => m.RelatorioCalendarioComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'config-aprovadores',
    loadComponent: () => import('./components/config-aprovadores/config-aprovadores.component').then(m => m.ConfigAprovadoresComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'aprovacao-hora-extra',
    loadComponent: () => import('./components/aprovacao-hora-extra/aprovacao-hora-extra.component').then(m => m.AprovacaoHoraExtraComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'empresa',
    loadComponent: () => import('./components/empresa-list/empresa-list.component').then(m => m.EmpresaListComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'empresa/new',
    loadComponent: () => import('./components/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'empresa/edit/:id',
    loadComponent: () => import('./components/empresa-form/empresa-form.component').then(m => m.EmpresaFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'cliente',
    loadComponent: () => import('./components/cliente-list/cliente-list.component').then(m => m.ClienteListComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'cliente/new',
    loadComponent: () => import('./components/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'cliente/edit/:id',
    loadComponent: () => import('./components/cliente-form/cliente-form.component').then(m => m.ClienteFormComponent),
    canActivate: [AuthGuard, PermissaoGuard],
    data: { permissao: 'GERENCIAR_USUARIOS' }
  },
  {
    path: 'op-programada',
    loadComponent: () => import('./components/op-programada-list/op-programada-list.component').then(m => m.OPProgramadaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
