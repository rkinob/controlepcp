# HTML para Adicionar Permissões no Formulário de Usuário

## 📝 Instruções

Adicione o seguinte bloco de código no arquivo:
`usuario-form.component.html`

**Onde adicionar:** Logo após o campo de "Tipo de Usuário" e antes dos botões de ação.

---

## 🎨 Código HTML

```html
<!-- Seção de Permissões -->
<div class="form-section">
  <div class="section-header" (click)="toggleMostrarPermissoes()" style="cursor: pointer;">
    <h3>
      <span>{{ showPermissoes ? '▼' : '▶' }}</span>
      Permissões do Usuário
      @if (getTotalPermissoesSelecionadas() > 0) {
        <span class="badge badge-info" style="margin-left: 10px;">
          {{ getTotalPermissoesSelecionadas() }} selecionada(s)
        </span>
      }
    </h3>
    <p class="text-secondary" style="margin: 5px 0 0 25px;">
      {{ getDescricaoTipoUsuario(usuarioForm.get('id_tipo_usuario')?.value) }}
    </p>
  </div>

  @if (showPermissoes) {
    <div class="permissoes-container">
      @if (loadingPermissoes) {
        <div class="loading-state">
          <span class="spinner-border spinner-border-sm"></span>
          Carregando permissões...
        </div>
      } @else {
        <!-- Controles de Seleção Rápida -->
        <div class="permissoes-actions" style="margin-bottom: 15px; display: flex; gap: 10px;">
          <button 
            type="button" 
            class="btn btn-sm btn-outline-primary"
            (click)="selecionarTodasPermissoes()"
          >
            ✓ Selecionar Todas
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-secondary"
            (click)="deselecionarTodasPermissoes()"
          >
            ✕ Desmarcar Todas
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-outline-info"
            (click)="aplicarPermissoesPadrao(usuarioForm.get('id_tipo_usuario')?.value)"
            [disabled]="!usuarioForm.get('id_tipo_usuario')?.value"
          >
            ↻ Aplicar Padrão
          </button>
        </div>

        <!-- Alert Informativo -->
        <div class="alert alert-info" style="margin-bottom: 15px; font-size: 13px;">
          <strong>ℹ️ Informação:</strong><br>
          <ul style="margin: 10px 0 0 20px;">
            <li><strong>Gestor (Tipo 1):</strong> Tem todas as permissões por padrão</li>
            <li><strong>Usuário Comum (Tipo 2):</strong> Acesso limitado a OPs, OPs Programadas e Relatórios</li>
            <li>Você pode personalizar as permissões individualmente marcando/desmarcando abaixo</li>
          </ul>
        </div>

        <!-- Lista de Permissões -->
        <div class="permissoes-grid">
          @for (permissao of todasPermissoes; track permissao.id_permissao) {
            <div class="permissao-item" [class.selecionada]="permissao.selecionada">
              <label class="permissao-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="permissao.selecionada"
                  [ngModelOptions]="{standalone: true}"
                  [disabled]="permissao.desabilitada"
                />
                <div class="permissao-info">
                  <div class="permissao-nome">{{ formatPermissaoNome(permissao.ds_permissao) }}</div>
                  @if (permissao.descricao_completa) {
                    <div class="permissao-descricao">{{ permissao.descricao_completa }}</div>
                  }
                </div>
              </label>
            </div>
          }
        </div>

        @if (todasPermissoes.length === 0) {
          <div class="alert alert-warning">
            Nenhuma permissão disponível no sistema.
          </div>
        }
      }
    </div>
  }
</div>
```

---

## 🎨 CSS Adicional

Adicione ao arquivo `usuario-form.component.css`:

```css
/* Seção de Permissões */
.form-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.permissoes-container {
  padding: 15px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.loading-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

.permissoes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  margin-top: 15px;
}

.permissao-item {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  transition: all 0.2s;
  background-color: #fff;
}

.permissao-item:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.permissao-item.selecionada {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.permissao-label {
  display: flex;
  align-items: start;
  cursor: pointer;
  margin: 0;
}

.permissao-label input[type="checkbox"] {
  margin-right: 12px;
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.permissao-info {
  flex: 1;
}

.permissao-nome {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  font-size: 14px;
}

.permissao-descricao {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

/* Badge */
.badge-info {
  background-color: #17a2b8;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: normal;
}

/* Responsivo */
@media (max-width: 768px) {
  .permissoes-grid {
    grid-template-columns: 1fr;
  }
  
  .permissoes-actions {
    flex-direction: column;
  }
  
  .permissoes-actions button {
    width: 100%;
  }
}
```

---

## 🔧 Método Adicional no TypeScript

Adicione este método helper no arquivo `.ts`:

```typescript
formatPermissaoNome(dsPermissao: string): string {
  return dsPermissao
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase());
}
```

---

## 📍 Localização Exata

No arquivo `usuario-form.component.html`, localize a seção do campo "Tipo de Usuário":

```html
<!-- Campo Tipo de Usuário -->
<div class="form-group">
  <label for="id_tipo_usuario" class="form-label required">Tipo de Usuário</label>
  <select ...>
    ...
  </select>
</div>

<!-- ADICIONAR AQUI O CÓDIGO DE PERMISSÕES -->

<!-- Botões de Ação (Salvar/Cancelar) -->
<div class="form-actions">
  ...
</div>
```

---

## ✅ Resultado Visual Esperado

```
┌─────────────────────────────────────────────┐
│ ▶ Permissões do Usuário [3 selecionada(s)] │
│   Gestor - Acesso total por padrão          │
└─────────────────────────────────────────────┘

(Ao clicar, expande:)

┌──────────────────────────────────────────────────┐
│ ▼ Permissões do Usuário [3 selecionada(s)]      │
│   Gestor - Acesso total por padrão               │
├──────────────────────────────────────────────────┤
│ [✓ Selecionar Todas] [✕ Desmarcar] [↻ Padrão]  │
│                                                   │
│ ℹ️ Gestor tem todas as permissões por padrão    │
│                                                   │
│ ┌──────────────┬──────────────┬──────────────┐  │
│ │☑ Remanejar   │☑ Editar OP   │☑ Deletar OP  │  │
│ │  Saldo       │              │              │  │
│ ├──────────────┼──────────────┼──────────────┤  │
│ │☑ Programar   │☑ Editar      │☑ Deletar     │  │
│ │  OP          │  Modelo      │  Modelo      │  │
│ └──────────────┴──────────────┴──────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Lógica de Funcionamento

1. **Ao Criar Novo Usuário:**
   - Selecione o Tipo de Usuário
   - As permissões padrão são aplicadas automaticamente
   - Você pode personalizar marcando/desmarcando

2. **Ao Editar Usuário:**
   - As permissões atuais do usuário são carregadas
   - Marque/desmarque conforme necessário
   - Clique em "Aplicar Padrão" para resetar

3. **Tipo Gestor (1):**
   - Todas as 10 permissões marcadas por padrão

4. **Tipo Usuário Comum (2):**
   - Apenas: EDITAR_OP, PROGRAMAR_OP, VISUALIZAR_RELATORIOS

---

**Documentação Completa Criada!**
Agora você pode copiar e colar o código HTML e CSS nos respectivos arquivos.

