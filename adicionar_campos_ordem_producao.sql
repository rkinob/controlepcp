-- ==========================================
-- Script para adicionar campos na tabela Ordem_Producao
-- id_grupo_principal, observacao, prazo_final
-- ==========================================

-- Adicionar os novos campos
ALTER TABLE Ordem_Producao
ADD COLUMN id_grupo_principal INT NULL AFTER id_modelo,
ADD COLUMN observacao TEXT NULL AFTER qtd_total,
ADD COLUMN prazo_final DATE NULL AFTER data_inicio;

-- Criar índice para id_grupo_principal
ALTER TABLE Ordem_Producao
ADD INDEX idx_id_grupo_principal (id_grupo_principal);

-- Adicionar chave estrangeira para id_grupo_principal
ALTER TABLE Ordem_Producao
ADD CONSTRAINT fk_ordem_producao_grupo_principal
FOREIGN KEY (id_grupo_principal) REFERENCES Grupo_Producao(id_grupo_producao);

-- Verificar a alteração
DESCRIBE Ordem_Producao;

-- ==========================================
-- Fim do script
-- ==========================================

