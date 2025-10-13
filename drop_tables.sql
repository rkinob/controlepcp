-- ==========================================
-- SCRIPT DE REMOÇÃO DAS TABELAS - SISTEMA CONTROLE PCP
-- ==========================================
-- ATENÇÃO: Este script irá REMOVER TODAS as tabelas e dados do sistema!
-- Execute apenas se tiver certeza de que deseja apagar todos os dados.

-- ==========================================
-- DESABILITAR VERIFICAÇÕES DE CHAVE ESTRANGEIRA
-- ==========================================
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
-- VERIFICAÇÃO DE REMOÇÃO
-- ==========================================

-- Listar tabelas restantes (deve estar vazio se tudo foi removido)
SHOW TABLES;

-- ==========================================
-- COMENTÁRIOS IMPORTANTES
-- ==========================================

/*
ATENÇÃO:
- Este script remove TODAS as tabelas do banco de dados
- Todos os dados serão PERDIDOS permanentemente
- Execute apenas em ambiente de desenvolvimento ou quando necessário
- Faça backup antes de executar em produção
- Para recriar as tabelas, execute o script database_script.sql
- Para inserir dados iniciais, execute o script insert_usuarios.sql
*/

-- ==========================================
-- SCRIPT ALTERNATIVO - REMOÇÃO SELETIVA
-- ==========================================

/*
-- Se desejar remover apenas dados específicos, use os comandos abaixo:

-- Limpar dados mas manter estrutura das tabelas
TRUNCATE TABLE Ordem_Producao_Horas_Data_Historico;
TRUNCATE TABLE Ordem_Producao_Horas_Data;
TRUNCATE TABLE Controle_Aprovacao;
TRUNCATE TABLE Ordem_Producao_Datas;
TRUNCATE TABLE Ordem_Producao;
TRUNCATE TABLE Modelo_Peca;
TRUNCATE TABLE Grupo_Producao;
TRUNCATE TABLE log_sistema;
TRUNCATE TABLE usuario;
TRUNCATE TABLE tipo_usuario;

-- Resetar AUTO_INCREMENT
ALTER TABLE tipo_usuario AUTO_INCREMENT = 1;
ALTER TABLE usuario AUTO_INCREMENT = 1;
ALTER TABLE log_sistema AUTO_INCREMENT = 1;
ALTER TABLE Grupo_Producao AUTO_INCREMENT = 1;
ALTER TABLE Modelo_Peca AUTO_INCREMENT = 1;
ALTER TABLE Ordem_Producao AUTO_INCREMENT = 1;
ALTER TABLE Ordem_Producao_Datas AUTO_INCREMENT = 1;
ALTER TABLE Controle_Aprovacao AUTO_INCREMENT = 1;
ALTER TABLE Ordem_Producao_Horas_Data AUTO_INCREMENT = 1;
ALTER TABLE Ordem_Producao_Horas_Data_Historico AUTO_INCREMENT = 1;
*/

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
