-- ==========================================
-- Script para mover campo id_empresa de Ordem_Producao para Modelo_Peca
-- ==========================================

-- 1. Adicionar id_empresa na tabela Modelo_Peca
ALTER TABLE Modelo_Peca
ADD COLUMN id_empresa INT NULL AFTER descricao;

-- 2. Criar índice
ALTER TABLE Modelo_Peca
ADD INDEX idx_id_empresa (id_empresa);

-- 3. Adicionar chave estrangeira
ALTER TABLE Modelo_Peca
ADD CONSTRAINT fk_modelo_peca_empresa
FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa);

-- 4. Remover chave estrangeira da Ordem_Producao
ALTER TABLE Ordem_Producao
DROP FOREIGN KEY fk_ordem_producao_empresa;

-- 5. Remover coluna id_empresa da Ordem_Producao
ALTER TABLE Ordem_Producao
DROP COLUMN id_empresa;

-- Verificar as alterações
DESCRIBE Modelo_Peca;
DESCRIBE Ordem_Producao;

-- ==========================================
-- Fim do script
-- ==========================================

