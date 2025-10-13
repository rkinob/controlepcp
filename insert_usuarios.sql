-- ==========================================
-- SCRIPT DE INSERÇÃO DE USUÁRIOS - SISTEMA CONTROLE PCP
-- ==========================================

-- ==========================================
-- INSERÇÃO DE TIPOS DE USUÁRIO
-- ==========================================

-- Inserir tipos de usuário (se não existirem)
INSERT IGNORE INTO tipo_usuario (id_tipo_usuario, descricao, id_usuario, fl_ativo) VALUES
(1, 'Gestor', 1, 1),
(2, 'Usuário Comum', 1, 1);

-- ==========================================
-- INSERÇÃO DE USUÁRIOS
-- ==========================================

-- Inserir usuários do sistema
-- Senhas são hash SHA-256 (em produção, use bcrypt ou similar)
-- Senha padrão: "123456" (hash: e10adc3949ba59abbe56e057f20f883e)

INSERT INTO usuario (
    id_usuario,
    login,
    senha,
    id_tipo_usuario,
    nome_usuario,
    tipo_usuario
) VALUES
-- Usuário Administrador/Gestor
(1, 'admin', 'e10adc3949ba59abbe56e057f20f883e', 1, 'Administrador do Sistema', 1),

-- Usuários Gestores
(2, 'gestor1', 'e10adc3949ba59abbe56e057f20f883e', 1, 'João Silva - Gestor', 1),
(3, 'gestor2', 'e10adc3949ba59abbe56e057f20f883e', 1, 'Maria Santos - Gestora', 1),

-- Usuários Comuns
(4, 'usuario1', 'e10adc3949ba59abbe56e057f20f883e', 2, 'Pedro Oliveira - Operador', 2),
(5, 'usuario2', 'e10adc3949ba59abbe56e057f20f883e', 2, 'Ana Costa - Operadora', 2),
(6, 'usuario3', 'e10adc3949ba59abbe56e057f20f883e', 2, 'Carlos Lima - Operador', 2),
(7, 'usuario4', 'e10adc3949ba59abbe56e057f20f883e', 2, 'Fernanda Rocha - Operadora', 2),
(8, 'usuario5', 'e10adc3949ba59abbe56e057f20f883e', 2, 'Roberto Alves - Operador', 2);

-- ==========================================
-- ATUALIZAR SEQUÊNCIA DO AUTO_INCREMENT
-- ==========================================

-- Ajustar o próximo ID para evitar conflitos
ALTER TABLE usuario AUTO_INCREMENT = 9;

-- ==========================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ==========================================

-- Verificar usuários inseridos
SELECT
    id_usuario,
    login,
    nome_usuario,
    CASE
        WHEN tipo_usuario = 1 THEN 'Gestor'
        WHEN tipo_usuario = 2 THEN 'Usuário Comum'
        ELSE 'Desconhecido'
    END as tipo_usuario_desc,
    data_cadastro
FROM usuario
ORDER BY id_usuario;

-- Verificar tipos de usuário
SELECT * FROM tipo_usuario ORDER BY id_tipo_usuario;

-- ==========================================
-- COMENTÁRIOS IMPORTANTES
-- ==========================================

/*
IMPORTANTE:
- A senha padrão para todos os usuários é "123456"
- Em produção, substitua por senhas seguras e use bcrypt para hash
- Os usuários gestores têm acesso total ao sistema
- Os usuários comuns têm acesso limitado conforme regras de negócio
- Considere implementar política de troca de senha obrigatória no primeiro login
*/

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
