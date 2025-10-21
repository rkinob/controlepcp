-- ==========================================
-- SCRIPT PARA ADICIONAR CAMPO DE QUANTIDADE DE PERDA
-- ==========================================
-- Data: 2025-10-16
-- Descrição: Adiciona o campo qtd_perda (quantidade de perda)
--            nas tabelas Ordem_Producao_Datas,
--            Ordem_Producao_Horas_Data e
--            Ordem_Producao_Horas_Data_Historico
-- ==========================================

-- Adicionar campo qtd_perda na tabela Ordem_Producao_Datas
ALTER TABLE Ordem_Producao_Datas
ADD COLUMN qtd_perda INT NOT NULL DEFAULT 0 AFTER qtd_realizada;

-- Adicionar índice para melhorar performance de consultas
ALTER TABLE Ordem_Producao_Datas
ADD INDEX idx_qtd_perda (qtd_perda);

-- Adicionar campo qtd_perda na tabela Ordem_Producao_Horas_Data
ALTER TABLE Ordem_Producao_Horas_Data
ADD COLUMN qtd_perda INT NOT NULL DEFAULT 0 AFTER qtd_realizada;

-- Adicionar índice para melhorar performance de consultas
ALTER TABLE Ordem_Producao_Horas_Data
ADD INDEX idx_qtd_perda (qtd_perda);

-- Adicionar campo qtd_perda na tabela de histórico para manter consistência
ALTER TABLE Ordem_Producao_Horas_Data_Historico
ADD COLUMN qtd_perda INT NOT NULL DEFAULT 0 AFTER qtd_realizada;

-- Adicionar índice na tabela de histórico
ALTER TABLE Ordem_Producao_Horas_Data_Historico
ADD INDEX idx_qtd_perda (qtd_perda);

-- Adicionar comentário nas colunas para documentação
ALTER TABLE Ordem_Producao_Datas
MODIFY COLUMN qtd_perda INT NOT NULL DEFAULT 0 COMMENT 'Quantidade total de perda/refugo do dia';

ALTER TABLE Ordem_Producao_Horas_Data
MODIFY COLUMN qtd_perda INT NOT NULL DEFAULT 0 COMMENT 'Quantidade de perda/refugo no período';

ALTER TABLE Ordem_Producao_Horas_Data_Historico
MODIFY COLUMN qtd_perda INT NOT NULL DEFAULT 0 COMMENT 'Quantidade de perda/refugo no período (histórico)';

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================

-- Para reverter as alterações (caso necessário), execute:
/*
ALTER TABLE Ordem_Producao_Datas DROP INDEX idx_qtd_perda;
ALTER TABLE Ordem_Producao_Datas DROP COLUMN qtd_perda;

ALTER TABLE Ordem_Producao_Horas_Data DROP INDEX idx_qtd_perda;
ALTER TABLE Ordem_Producao_Horas_Data DROP COLUMN qtd_perda;

ALTER TABLE Ordem_Producao_Horas_Data_Historico DROP INDEX idx_qtd_perda;
ALTER TABLE Ordem_Producao_Horas_Data_Historico DROP COLUMN qtd_perda;
*/

