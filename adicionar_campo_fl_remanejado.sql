-- ==========================================
-- Script para adicionar campo fl_remanejado na tabela Ordem_Producao_Datas
-- Para controlar se o saldo já foi remanejado
-- ==========================================

-- Adicionar coluna fl_remanejado
ALTER TABLE Ordem_Producao_Datas
ADD COLUMN fl_remanejado TINYINT(1) DEFAULT 0 AFTER aprovado;

-- Criar índice para facilitar buscas
ALTER TABLE Ordem_Producao_Datas
ADD INDEX idx_fl_remanejado (fl_remanejado);

-- Verificar a alteração
DESCRIBE Ordem_Producao_Datas;

-- ==========================================
-- Fim do script
-- ==========================================

