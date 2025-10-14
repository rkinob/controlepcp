import { Routes } from '@angular/router';
import { AuthGuard, LoginGuard } from './guards/auth.guard';

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
    canActivate: [AuthGuard]
  },
  {
    path: 'modelo-peca/new',
    loadComponent: () => import('./components/modelo-peca-form/modelo-peca-form.component').then(m => m.ModeloPecaFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'modelo-peca/edit/:id',
    loadComponent: () => import('./components/modelo-peca-form/modelo-peca-form.component').then(m => m.ModeloPecaFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'grupo-producao',
    loadComponent: () => import('./components/grupo-producao-list/grupo-producao-list.component').then(m => m.GrupoProducaoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'grupo-producao/new',
    loadComponent: () => import('./components/grupo-producao-form/grupo-producao-form.component').then(m => m.GrupoProducaoFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'grupo-producao/edit/:id',
    loadComponent: () => import('./components/grupo-producao-form/grupo-producao-form.component').then(m => m.GrupoProducaoFormComponent),
    canActivate: [AuthGuard]
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
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario/new',
    loadComponent: () => import('./components/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario/edit/:id',
    loadComponent: () => import('./components/usuario-form/usuario-form.component').then(m => m.UsuarioFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'relatorio-calendario',
    loadComponent: () => import('./components/relatorio-calendario/relatorio-calendario').then(m => m.RelatorioCalendarioComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'config-aprovadores',
    loadComponent: () => import('./components/config-aprovadores/config-aprovadores.component').then(m => m.ConfigAprovadoresComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'aprovacao-hora-extra',
    loadComponent: () => import('./components/aprovacao-hora-extra/aprovacao-hora-extra.component').then(m => m.AprovacaoHoraExtraComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
