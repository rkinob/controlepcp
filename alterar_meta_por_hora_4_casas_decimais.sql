-- ==========================================
-- Script para alterar campo meta_por_hora para suportar 4 casas decimais
-- ==========================================

-- Alterar a coluna meta_por_hora na tabela Modelo_Peca
ALTER TABLE Modelo_Peca
MODIFY COLUMN meta_por_hora DECIMAL(10,4) NOT NULL;

-- Verificar a alteração
DESCRIBE Modelo_Peca;

-- ==========================================
-- Fim do script
-- ==========================================

