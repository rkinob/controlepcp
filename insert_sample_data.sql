-- ==========================================
-- INSERT SCRIPTS FOR SAMPLE DATA
-- ==========================================

-- ==========================================
-- TABELA: Grupo_Producao
-- ==========================================
INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo A - Montagem Principal', 1, 1),
('Grupo B - Soldagem', 1, 1),
('Grupo C - Pintura', 1, 1),
('Grupo D - Acabamento', 1, 1),
('Grupo E - Controle de Qualidade', 1, 1),
('Grupo F - Embalagem', 1, 1),
('Grupo G - Expedição', 1, 1),
('Grupo H - Manutenção', 1, 1),
('Grupo I - Usinagem', 1, 1),
('Grupo J - Corte', 1, 1);

-- ==========================================
-- TABELA: Modelo_Peca
-- ==========================================
INSERT INTO Modelo_Peca (cd_modelo, meta_por_hora, descricao, id_usuario, fl_ativo) VALUES
('MOD001', 25.50, 'Modelo de Peça Principal - Versão 1.0', 1, 1),
('MOD002', 18.75, 'Modelo de Peça Secundária - Versão 2.1', 1, 1),
('MOD003', 32.00, 'Modelo de Peça de Apoio - Versão 1.5', 1, 1),
('MOD004', 15.25, 'Modelo de Peça de Fixação - Versão 3.0', 1, 1),
('MOD005', 28.80, 'Modelo de Peça Estrutural - Versão 2.0', 1, 1),
('MOD006', 22.40, 'Modelo de Peça de Conexão - Versão 1.8', 1, 1),
('MOD007', 35.60, 'Modelo de Peça de Suporte - Versão 2.5', 1, 1),
('MOD008', 12.90, 'Modelo de Peça Pequena - Versão 1.2', 1, 1),
('MOD009', 40.15, 'Modelo de Peça Complexa - Versão 3.2', 1, 1),
('MOD010', 19.70, 'Modelo de Peça Padrão - Versão 2.3', 1, 1),
('MOD011', 26.85, 'Modelo de Peça Especial - Versão 1.7', 1, 1),
('MOD012', 31.20, 'Modelo de Peça de Montagem - Versão 2.8', 1, 1),
('MOD013', 14.50, 'Modelo de Peça Simples - Versão 1.1', 1, 1),
('MOD014', 37.45, 'Modelo de Peça Avançada - Versão 3.1', 1, 1),
('MOD015', 21.30, 'Modelo de Peça Intermediária - Versão 2.4', 1, 1);

-- ==========================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ==========================================
-- Para verificar se os dados foram inseridos corretamente, execute:

-- SELECT * FROM Grupo_Producao ORDER BY id_grupo_producao;
-- SELECT * FROM Modelo_Peca ORDER BY id_modelo;
