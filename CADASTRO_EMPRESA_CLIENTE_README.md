# Cadastro de Empresa e Cliente - Guia de Implementação

## ✅ Arquivos Criados

### Backend (100% Completo)
- ✅ `criar_tabelas_empresa_cliente.sql` - Script SQL para criar tabelas
- ✅ `models/Empresa.php` - Model PHP com CRUD completo
- ✅ `models/Cliente.php` - Model PHP com CRUD completo
- ✅ `api/empresa.php` - API REST completa
- ✅ `api/cliente.php` - API REST completa

### Frontend Angular
#### Models
- ✅ `src/app/model/empresa.ts`
- ✅ `src/app/model/cliente.ts`

#### Services
- ✅ `src/app/services/empresa.service.ts`
- ✅ `src/app/services/cliente.service.ts`

#### Componentes Empresa
- ✅ `src/app/components/empresa-list/empresa-list.component.ts`
- ✅ `src/app/components/empresa-list/empresa-list.component.html`
- ✅ `src/app/components/empresa-list/empresa-list.component.css`
- ⏳ `src/app/components/empresa-form` - **PRECISA SER CRIADO**

#### Componentes Cliente
- ⏳ `src/app/components/cliente-list` - **PRECISA SER CRIADO**
- ⏳ `src/app/components/cliente-form` - **PRECISA SER CRIADO**

## 📋 Arquivos Faltando

### 1. Empresa Form Component

Você pode copiar e adaptar de `modelo-peca-form` ou `ordem-producao-form`.

Campos necessários:
- cnpj (obrigatório, validação de 14 dígitos)
- nome (obrigatório)
- logradouro, numero, complemento, bairro, cidade, estado, cep (opcionais)
- celular, email (opcionais)
- fl_ativo (checkbox, apenas no modo edição)

### 2. Cliente List Component

É praticamente idêntico ao `empresa-list`, apenas:
- Trocar `empresa` por `cliente`
- Trocar `id_empresa` por `id_cliente`
- Ajustar títulos e mensagens

### 3. Cliente Form Component

É praticamente idêntico ao `empresa-form`, apenas:
- Trocar `empresa` por `cliente`
- Trocar `id_empresa` por `id_cliente`
- Ajustar títulos e mensagens

## 🚀 Próximos Passos

### 1. Executar Script SQL

```bash
mysql -u usuario -p controle_pcp < criar_tabelas_empresa_cliente.sql
```

### 2. Criar Componentes Faltando

Use o Angular CLI ou copie e adapte os componentes similares existentes:

```bash
# Para criar via CLI:
ng generate component components/empresa-form --standalone
ng generate component components/cliente-list --standalone
ng generate component components/cliente-form --standalone
```

### 3. Adicionar Rotas em `app.routes.ts`

```typescript
import { EmpresaListComponent } from './components/empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './components/empresa-form/empresa-form.component';
import { ClienteListComponent } from './components/cliente-list/cliente-list.component';
import { ClienteFormComponent } from './components/cliente-form/cliente-form.component';

// Adicionar nas rotas:
{
  path: 'empresa',
  component: EmpresaListComponent,
  canActivate: [AuthGuard]
},
{
  path: 'empresa/new',
  component: EmpresaFormComponent,
  canActivate: [AuthGuard]
},
{
  path: 'empresa/edit/:id',
  component: EmpresaFormComponent,
  canActivate: [AuthGuard]
},
{
  path: 'cliente',
  component: ClienteListComponent,
  canActivate: [AuthGuard]
},
{
  path: 'cliente/new',
  component: ClienteFormComponent,
  canActivate: [AuthGuard]
},
{
  path: 'cliente/edit/:id',
  component: ClienteFormComponent,
  canActivate: [AuthGuard]
}
```

### 4. Adicionar Links no Menu

Em seu componente de menu/navegação, adicione:

```html
<a routerLink="/empresa">Empresas</a>
<a routerLink="/cliente">Clientes</a>
```

## 📝 Estrutura das Tabelas

### Tabela: Empresa
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id_empresa | INT | PK Auto-increment |
| cnpj | VARCHAR(18) | Obrigatório, Único |
| nome | VARCHAR(255) | Obrigatório |
| logradouro | VARCHAR(255) | Opcional |
| numero | VARCHAR(20) | Opcional |
| complemento | VARCHAR(100) | Opcional |
| bairro | VARCHAR(100) | Opcional |
| cidade | VARCHAR(100) | Opcional |
| estado | VARCHAR(2) | Opcional |
| cep | VARCHAR(10) | Opcional |
| celular | VARCHAR(20) | Opcional |
| email | VARCHAR(150) | Opcional |
| dt_inclusao | TIMESTAMP | Auto |
| dt_alteracao | TIMESTAMP | Auto |
| id_usuario | INT | FK |
| fl_ativo | TINYINT(1) | Default 1 |

### Tabela: Cliente
Estrutura idêntica à tabela Empresa, apenas muda:
- `id_empresa` → `id_cliente`

## 🎨 Recursos Implementados

### Backend
✅ CRUD completo (Create, Read, Update, Delete/Inativar)
✅ Validação de CNPJ duplicado
✅ Paginação na listagem
✅ Busca por CNPJ ou nome
✅ Filtro por status (ativo/inativo)
✅ Logs de auditoria
✅ Formatação automática de CNPJ

### Frontend
✅ Listagem com paginação
✅ Busca e filtros
✅ Formatação de CNPJ e telefone
✅ Visualização desktop e mobile
✅ Integração com API
✅ Tratamento de erros

## 🔧 APIs Disponíveis

### Empresa
- `GET /api/empresa.php?action=list` - Listar
- `GET /api/empresa.php?action=get&id=1` - Buscar por ID
- `POST /api/empresa.php?action=create` - Criar
- `POST /api/empresa.php?action=update&id=1` - Atualizar
- `POST /api/empresa.php?action=delete&id=1` - Inativar
- `GET /api/empresa.php?action=check_cnpj&cnpj=12345678901234` - Verificar CNPJ

### Cliente
APIs idênticas, apenas troque `empresa` por `cliente`.

## 📦 Dependências

Nenhuma dependência adicional necessária. O projeto já possui:
- Angular (standalone components)
- HttpClient
- FormsModule
- CommonModule

## 🎯 Pronto para Usar

O backend está 100% funcional e pode ser testado via Postman/Insomnia.

Para completar o frontend, você só precisa:
1. Criar os 3 componentes faltando (copiando e adaptando os existentes)
2. Adicionar as rotas
3. Adicionar links no menu

Tempo estimado: 30-60 minutos copiando e adaptando código existente.

