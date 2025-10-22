# 📋 Programação em Lote de OPs

## 🎯 Visão Geral

Sistema completo para selecionar múltiplas Ordens de Produção (OPs) e programá-las sequencialmente em um único processo, otimizando o fluxo de distribuição no calendário de produção.

---

## ✨ Funcionalidades Implementadas

### 1. **Seleção Múltipla de OPs**
- ✅ Checkboxes em cada linha da tabela
- ✅ Checkbox master no header para selecionar/desselecionar todas
- ✅ Visual feedback: linhas selecionadas ficam com fundo azul claro
- ✅ Contador de OPs selecionadas no header
- ✅ Botões dinâmicos aparecem quando há seleções

### 2. **Modal de Configuração**
- ✅ Exibe todas as OPs selecionadas
- ✅ Campo **Data de Início** para programação
- ✅ Campo **Ordem** para cada OP (define sequência de programação)
- ✅ Validação: todas OPs devem ter Grupo Principal
- ✅ Informações claras sobre o processo

### 3. **Distribuição Sequencial**
- ✅ OPs são distribuídas na ordem especificada
- ✅ Cada OP começa após a conclusão da anterior
- ✅ Cálculo automático de dias necessários
- ✅ Respeita horários de trabalho (8.8h/dia útil, 4h/sábado)
- ✅ Transação atômica: ou todas são distribuídas ou nenhuma

### 4. **Backend Robusto**
- ✅ Nova action `distribuir_lote` em `distribuir_op.php`
- ✅ Validações completas de dados
- ✅ Logs detalhados de cada distribuição
- ✅ Tratamento de erros com rollback
- ✅ Busca automática de `id_grupo_producao` via `id_grupo_principal`

---

## 🚀 Como Usar

### **Passo 1: Selecionar OPs**
```
┌─────────────────────────────────────────────────┐
│ ☑ Código OP │ Modelo │ Cliente │ Grupo │ ...  │
├─────────────────────────────────────────────────┤
│ ☑ OP-001    │ MOD001 │ ABC     │ Grupo 1 │ ... │
│ ☑ OP-002    │ MOD002 │ XYZ     │ Grupo 2 │ ... │
│ ☐ OP-003    │ MOD003 │ 123     │ Grupo 1 │ ... │
└─────────────────────────────────────────────────┘

[📋 Programar 2 OP(s)] [✕ Limpar Seleção]
```

### **Passo 2: Configurar Modal**
```
┌─────────────────────────────────────────────────┐
│         Programação em Lote                     │
├─────────────────────────────────────────────────┤
│ Data de Início: [2025-10-22]                    │
│                                                  │
│ ╔═══════════════════════════════════════════╗  │
│ ║ Ordem │ Código │ Modelo │ Grupo │ Qtd    ║  │
│ ╠═══════════════════════════════════════════╣  │
│ ║ [1]   │ OP-001 │ MOD001 │ G1    │ 1000   ║  │
│ ║ [2]   │ OP-002 │ MOD002 │ G2    │ 500    ║  │
│ ╚═══════════════════════════════════════════╝  │
│                                                  │
│ ⚠️ As OPs serão programadas na ordem indicada   │
│    Cada OP começará após o término da anterior  │
│                                                  │
│         [Cancelar] [✓ Confirmar Programação]    │
└─────────────────────────────────────────────────┘
```

### **Passo 3: Resultado**
```
✅ Programação em Lote Concluída

2 OP(s) foram programadas com sucesso!

- OP-001: 5 dias (22/10 a 26/10)
- OP-002: 3 dias (27/10 a 29/10)
```

---

## 📊 Estrutura de Dados

### **Payload Enviado ao Backend**
```json
{
  "data_inicio": "2025-10-22",
  "ops": [
    {
      "id_ordem_producao": 1,
      "id_grupo_principal": 2,
      "qtd_total": 1000,
      "ordem": 1
    },
    {
      "id_ordem_producao": 2,
      "id_grupo_principal": 3,
      "qtd_total": 500,
      "ordem": 2
    }
  ]
}
```

### **Resposta do Backend**
```json
{
  "success": true,
  "message": "OPs distribuídas em lote com sucesso",
  "data": {
    "total_ops": 2,
    "resultados": [
      {
        "id_ordem_producao": 1,
        "codigo_op": "OP-001",
        "dias_utilizados": 5,
        "sucesso": true
      },
      {
        "id_ordem_producao": 2,
        "codigo_op": "OP-002",
        "dias_utilizados": 3,
        "sucesso": true
      }
    ]
  }
}
```

---

## 🔧 Arquivos Modificados

### **Frontend (Angular)**

1. **`ordem-producao-list.component.ts`**
   - Propriedades: `opsSelecionadas`, `showModalProgramacaoLote`, `opsParaProgramar`, `dataInicioLote`, `ordenacaoOPs`
   - Métodos: `toggleOPSelecionada()`, `isOPSelecionada()`, `selecionarTodas()`, `deselecionarTodas()`, `abrirModalProgramacaoLote()`, `fecharModalProgramacaoLote()`, `alterarOrdemOP()`, `confirmarProgramacaoLote()`

2. **`ordem-producao-list.component.html`**
   - Checkboxes na tabela
   - Botões de programação em lote no header
   - Modal completo com tabela de ordenação

3. **`ordem-producao-list.component.css`**
   - Estilos para `.selected-row`
   - Ajustes no `.page-header`

4. **`ordem-producao.service.ts`**
   - Método: `distribuirOPsEmLote()`

### **Backend (PHP)**

1. **`api/distribuir_op.php`**
   - Nova action: `distribuir_lote`
   - Nova função: `distribuirOPsEmLote()`
   - Integração com `distribuirNosDias()` existente

---

## 🎯 Lógica de Distribuição Sequencial

### **Algoritmo**

```
Para cada OP na lista ordenada:
  1. Buscar id_grupo_producao via id_grupo_principal
  2. Validar OP e modelo
  3. Calcular horas necessárias (qtd_total / meta_por_hora)
  4. Distribuir nos dias a partir de data_atual
  5. data_atual += dias_utilizados
  6. Registrar log
  7. Próxima OP
```

### **Exemplo Prático**

```
Data Início: 22/10/2025

OP-001 (1000 peças, 100/h):
├─ Necessário: 10 horas
├─ Distribuição: 22/10 (8.8h) + 23/10 (1.2h)
└─ Próxima data: 24/10

OP-002 (500 peças, 50/h):
├─ Necessário: 10 horas
├─ Distribuição: 24/10 (8.8h) + 25/10 (1.2h)
└─ Próxima data: 26/10

OP-003 (200 peças, 25/h):
├─ Necessário: 8 horas
├─ Distribuição: 26/10 (8h)
└─ Fim
```

---

## ✅ Validações Implementadas

### **Frontend**
- ✅ Pelo menos 1 OP selecionada
- ✅ Data de início obrigatória
- ✅ Todas OPs com Grupo Principal definido
- ✅ Ordem numérica válida (mínimo 1)

### **Backend**
- ✅ Data de início não vazia
- ✅ Array de OPs não vazio
- ✅ Grupo de produção existe e está ativo
- ✅ OP existe e está ativa
- ✅ Meta por hora válida (> 0)
- ✅ Distribuição bem-sucedida para cada OP

---

## 🎨 Interface do Usuário

### **Estados Visuais**

1. **Nenhuma OP selecionada:**
   - Checkboxes vazios
   - Sem botões de ação

2. **OPs selecionadas:**
   - Linhas com fundo azul claro
   - Botão "Programar X OP(s)" visível
   - Botão "Limpar Seleção" visível

3. **Modal aberto:**
   - Overlay escuro
   - Modal centralizado
   - Tabela com ordenação editável
   - Avisos e instruções claras

4. **Processando:**
   - Botão desabilitado
   - Texto "⏳ Programando..."
   - Loading state

5. **Sucesso:**
   - Modal fecha automaticamente
   - Notificação de sucesso
   - Seleções limpas
   - Lista recarregada

---

## 🔐 Segurança

- ✅ Autenticação via JWT (verificarAuth)
- ✅ Transações de banco de dados
- ✅ Rollback automático em caso de erro
- ✅ Logs completos de auditoria
- ✅ Validação de permissões de usuário

---

## 📈 Logs do Sistema

### **Entrada no Log:**
```
Tabela: DISTRIBUICAO_OP_LOTE
Descrição: OP OP-001 distribuída em lote: 1000 peças em 5 dias
Usuário: João Silva (ID: 1)
Dados JSON: {
  "id_ordem_producao": 1,
  "id_grupo_producao": 2,
  "qtd_total": 1000,
  "dias_utilizados": 5,
  "ordem": 1
}
```

---

## 🚦 Fluxo de Execução

```
┌──────────────────┐
│  Usuário          │
│  Seleciona OPs    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Clica "Programar"│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Modal Abre       │
│  - Data Início    │
│  - Ordenação      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Validações       │
│  Frontend         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  POST /api        │
│  distribuir_lote  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Backend          │
│  - Ordena OPs     │
│  - Valida dados   │
│  - Inicia transação│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Para cada OP:    │
│  - Distribui      │
│  - Atualiza data  │
│  - Loga operação  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Commit           │
│  Retorna sucesso  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Frontend         │
│  - Fecha modal    │
│  - Notifica       │
│  - Recarrega lista│
└──────────────────┘
```

---

## 🎉 Benefícios

✅ **Economia de Tempo** - Programar 10 OPs em 1 ação ao invés de 10  
✅ **Redução de Erros** - Sequenciamento automático  
✅ **Visibilidade** - Ordem clara de execução  
✅ **Flexibilidade** - Reordenar OPs antes de confirmar  
✅ **Rastreabilidade** - Logs detalhados de cada operação  
✅ **Consistência** - Transação atômica garante integridade  

---

## 🔮 Melhorias Futuras (Opcionais)

- [ ] Permitir definir horas extras por OP
- [ ] Visualização prévia do calendário antes de confirmar
- [ ] Exportar relatório de programação em PDF
- [ ] Drag & drop para reordenar OPs
- [ ] Filtro de OPs elegíveis para programação em lote
- [ ] Salvar "templates" de ordenação

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do sistema
2. Consultar console do navegador
3. Revisar logs do Apache/PHP
4. Testar com uma única OP primeiro

---

**Desenvolvido com ❤️ para otimizar o fluxo de produção!**

