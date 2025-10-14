SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- REMOÇÃO DAS TABELAS (em ordem reversa de dependência)
-- ==========================================

-- Tabelas de histórico e controle
DROP TABLE IF EXISTS Ordem_Producao_Horas_Data_Historico;
DROP TABLE IF EXISTS Ordem_Producao_Horas_Data;
DROP TABLE IF EXISTS Controle_Aprovacao;
DROP TABLE IF EXISTS Ordem_Producao_Datas;
DROP TABLE IF EXISTS Ordem_Producao;
DROP TABLE IF EXISTS Modelo_Peca;
DROP TABLE IF EXISTS Grupo_Producao;

-- Tabelas de sistema
DROP TABLE IF EXISTS log_sistema;
DROP TABLE IF EXISTS usuario;

DROP TABLE IF EXISTS tipo_usuario;


-- ==========================================
-- REABILITAR VERIFICAÇÕES DE CHAVE ESTRANGEIRA
-- ==========================================
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - SISTEMA CONTROLE PCP
-- ==========================================

-- ==========================================
-- TABELA: tipo_usuario
-- ==========================================
CREATE TABLE tipo_usuario (
    id_tipo_usuario INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_descricao (descricao),
    INDEX idx_fl_ativo (fl_ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: usuario (já existente - mantida para referência)
-- ==========================================
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    id_tipo_usuario INT,
    nome_usuario VARCHAR(150) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tipo_usuario INT NOT NULL,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_login (login),
    INDEX idx_nome_usuario (nome_usuario),
    INDEX idx_id_tipo_usuario (id_tipo_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: log_sistema (já existente - mantida para referência)
-- ==========================================
CREATE TABLE log_sistema (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    id_alterado INT NULL,
    ocorrencia VARCHAR(5000) NOT NULL,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id_usuario (id_usuario),
    INDEX idx_id_alterado (id_alterado),
    INDEX idx_data_cadastro (data_cadastro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Grupo_Producao
-- ==========================================
CREATE TABLE Grupo_Producao (
    id_grupo_producao INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_descricao (descricao),
    INDEX idx_fl_ativo (fl_ativo),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Modelo_Peca
-- ==========================================
CREATE TABLE Modelo_Peca (
    id_modelo INT AUTO_INCREMENT PRIMARY KEY,
    cd_modelo VARCHAR(100) NOT NULL UNIQUE,
    meta_por_hora DECIMAL(10,2) NOT NULL,
    descricao VARCHAR(500) NOT NULL ,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_cd_modelo (cd_modelo),
    INDEX idx_fl_ativo (fl_ativo),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Ordem_Producao
-- ==========================================
CREATE TABLE Ordem_Producao (
    id_ordem_producao INT AUTO_INCREMENT PRIMARY KEY,
    id_modelo INT NOT NULL,
    codigo_op VARCHAR(100) NOT NULL,
    data_inicio DATE NOT NULL,
    qtd_total INT NOT NULL,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    fl_ativo TINYINT(1) DEFAULT 1,
    INDEX idx_id_modelo (id_modelo),
    INDEX idx_codigo_op (codigo_op),
    INDEX idx_data_inicio (data_inicio),
    INDEX idx_fl_ativo (fl_ativo),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Ordem_Producao_Datas
-- ==========================================
CREATE TABLE Ordem_Producao_Datas (
    id_ordem_producao_data INT AUTO_INCREMENT PRIMARY KEY,
    id_grupo_producao INT NOT NULL,
    id_ordem_producao INT NOT NULL,
    dt_ordem_producao DATE NOT NULL,
    qtd_prevista INT NOT NULL DEFAULT 0,
    qtd_realizada INT NOT NULL DEFAULT 0,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    status ENUM('Previsto', 'Andamento', 'Concluido', 'Cancelada','ag_aprovacao') DEFAULT 'Previsto',
    INDEX idx_id_grupo_producao (id_grupo_producao),
    INDEX idx_id_ordem_producao (id_ordem_producao),
    INDEX idx_dt_ordem_producao (dt_ordem_producao),
    INDEX idx_status (status),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Controle_Aprovacao
-- ==========================================
CREATE TABLE Controle_Aprovacao (
    id_controle_aprovacao INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_producao_data INT NOT NULL,
    status ENUM('ag. aprovação', 'aprovado', 'reprovado') DEFAULT 'ag. aprovação',
    id_usuario_aprovador INT,
    id_usuario_solicitante INT NOT NULL,
    dt_aprovacao TIMESTAMP NULL,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_id_ordem_producao_data (id_ordem_producao_data),
    INDEX idx_status (status),
    INDEX idx_id_usuario_aprovador (id_usuario_aprovador),
    INDEX idx_id_usuario_solicitante (id_usuario_solicitante),
    INDEX idx_dt_aprovacao (dt_aprovacao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Ordem_Producao_Horas_Data
-- ==========================================
CREATE TABLE Ordem_Producao_Horas_Data (
    id_ordem_producao_horas_data INT AUTO_INCREMENT PRIMARY KEY,
    id_ordem_producao_data INT NOT NULL,
    hora_ini TIME NOT NULL,
    hora_fim TIME NOT NULL,
    qtd_prevista INT NOT NULL DEFAULT 0,
    qtd_realizada INT NOT NULL DEFAULT 0,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    status ENUM('Previsto', 'Andamento', 'Concluido', 'Cancelada') DEFAULT 'Previsto',
    INDEX idx_id_ordem_producao_data (id_ordem_producao_data),
    INDEX idx_hora_ini (hora_ini),
    INDEX idx_hora_fim (hora_fim),
    INDEX idx_status (status),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- TABELA: Ordem_Producao_Horas_Data_Historico
-- ==========================================
CREATE TABLE Ordem_Producao_Horas_Data_Historico (
    id_ordem_producao_data_historico INT AUTO_INCREMENT PRIMARY KEY,
    dt_historico TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_ordem_producao_data INT NOT NULL,
    hora_ini TIME NOT NULL,
    hora_fim TIME NOT NULL,
    qtd_prevista INT NOT NULL DEFAULT 0,
    qtd_realizada INT NOT NULL DEFAULT 0,
    dt_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario INT,
    status ENUM('Previsto', 'Andamento', 'Concluido', 'Cancelada') DEFAULT 'Previsto',
    INDEX idx_dt_historico (dt_historico),
    INDEX idx_id_ordem_producao_data (id_ordem_producao_data),
    INDEX idx_id_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- CHAVES ESTRANGEIRAS
-- ==========================================

-- Chaves estrangeiras para tabela usuario
ALTER TABLE usuario
ADD CONSTRAINT fk_usuario_tipo_usuario
FOREIGN KEY (id_tipo_usuario) REFERENCES tipo_usuario(id_tipo_usuario);

-- Chaves estrangeiras para tabela Grupo_Producao
ALTER TABLE Grupo_Producao
ADD CONSTRAINT fk_grupo_producao_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Modelo_Peca
ALTER TABLE Modelo_Peca
ADD CONSTRAINT fk_modelo_peca_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Ordem_Producao
ALTER TABLE Ordem_Producao
ADD CONSTRAINT fk_ordem_producao_modelo
FOREIGN KEY (id_modelo) REFERENCES Modelo_Peca(id_modelo);

ALTER TABLE Ordem_Producao
ADD CONSTRAINT fk_ordem_producao_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Ordem_Producao_Datas
ALTER TABLE Ordem_Producao_Datas
ADD CONSTRAINT fk_ordem_producao_datas_grupo
FOREIGN KEY (id_grupo_producao) REFERENCES Grupo_Producao(id_grupo_producao);

ALTER TABLE Ordem_Producao_Datas
ADD CONSTRAINT fk_ordem_producao_datas_ordem
FOREIGN KEY (id_ordem_producao) REFERENCES Ordem_Producao(id_ordem_producao);

ALTER TABLE Ordem_Producao_Datas
ADD CONSTRAINT fk_ordem_producao_datas_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Controle_Aprovacao
ALTER TABLE Controle_Aprovacao
ADD CONSTRAINT fk_controle_aprovacao_ordem_data
FOREIGN KEY (id_ordem_producao_data) REFERENCES Ordem_Producao_Datas(id_ordem_producao_data);

ALTER TABLE Controle_Aprovacao
ADD CONSTRAINT fk_controle_aprovacao_usuario_aprovador
FOREIGN KEY (id_usuario_aprovador) REFERENCES usuario(id_usuario);

ALTER TABLE Controle_Aprovacao
ADD CONSTRAINT fk_controle_aprovacao_usuario_solicitante
FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Ordem_Producao_Horas_Data
ALTER TABLE Ordem_Producao_Horas_Data
ADD CONSTRAINT fk_ordem_producao_horas_data_ordem_data
FOREIGN KEY (id_ordem_producao_data) REFERENCES Ordem_Producao_Datas(id_ordem_producao_data);

ALTER TABLE Ordem_Producao_Horas_Data
ADD CONSTRAINT fk_ordem_producao_horas_data_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- Chaves estrangeiras para tabela Ordem_Producao_Horas_Data_Historico
ALTER TABLE Ordem_Producao_Horas_Data_Historico
ADD CONSTRAINT fk_ordem_producao_horas_data_historico_ordem_data
FOREIGN KEY (id_ordem_producao_data) REFERENCES Ordem_Producao_Datas(id_ordem_producao_data);

ALTER TABLE Ordem_Producao_Horas_Data_Historico
ADD CONSTRAINT fk_ordem_producao_horas_data_historico_usuario
FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario);

-- ==========================================
-- INSERÇÃO DE DADOS INICIAIS
-- ==========================================

-- Inserir tipos de usuário padrão
INSERT INTO tipo_usuario (descricao, id_usuario) VALUES
('Gestor', 1),
('Usuário Comum', 1);

-- ==========================================
-- COMENTÁRIOS DAS TABELAS
-- ==========================================

ALTER TABLE tipo_usuario COMMENT = 'Tabela de tipos de usuário do sistema';
ALTER TABLE usuario COMMENT = 'Tabela de usuários do sistema';
ALTER TABLE log_sistema COMMENT = 'Tabela de log de operações do sistema';
ALTER TABLE Grupo_Producao COMMENT = 'Tabela de grupos de produção (linhas de produção)';
ALTER TABLE Modelo_Peca COMMENT = 'Tabela de modelos de peças';
ALTER TABLE Ordem_Producao COMMENT = 'Tabela de ordens de produção';
ALTER TABLE Ordem_Producao_Datas COMMENT = 'Tabela de datas das ordens de produção';
ALTER TABLE Controle_Aprovacao COMMENT = 'Tabela de controle de aprovação das ordens';
ALTER TABLE Ordem_Producao_Horas_Data COMMENT = 'Tabela de controle de horas das ordens de produção';
ALTER TABLE Ordem_Producao_Horas_Data_Historico COMMENT = 'Tabela de histórico de alterações das horas das ordens';

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================



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
    tipo_usuario,
    fl_ativo
) VALUES
-- Usuário Administrador/Gestor
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 'Administrador do Sistema', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 1 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 2 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 3 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 4 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 5 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 6 ', 1, 1);

INSERT INTO Grupo_Producao (descricao, id_usuario, fl_ativo) VALUES
('Grupo 7 ', 1, 1);

INSERT INTO Modelo_Peca (cd_modelo, meta_por_hora, descricao, id_usuario, fl_ativo) VALUES
('MOD001', 100, 'Modelo de Peça Principal - Versão 1.0', 1, 1);

commit;


