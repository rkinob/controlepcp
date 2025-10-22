-- ==========================================
-- Script para adicionar campos id_empresa e id_cliente na tabela Ordem_Producao
-- ==========================================

-- Adicionar os novos campos
ALTER TABLE Ordem_Producao
ADD COLUMN id_empresa INT NULL AFTER id_grupo_principal,
ADD COLUMN id_cliente INT NULL AFTER id_empresa;

-- Criar índices
ALTER TABLE Ordem_Producao
ADD INDEX idx_id_empresa (id_empresa),
ADD INDEX idx_id_cliente (id_cliente);

-- Adicionar chaves estrangeiras
ALTER TABLE Ordem_Producao
ADD CONSTRAINT fk_ordem_producao_empresa
FOREIGN KEY (id_empresa) REFERENCES Empresa(id_empresa);

ALTER TABLE Ordem_Producao
ADD CONSTRAINT fk_ordem_producao_cliente
FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente);

-- Verificar a alteração
DESCRIBE Ordem_Producao;

-- ==========================================
-- Fim do script
-- ==========================================

