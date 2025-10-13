/**
 * CONFIGURAÇÃO DOS TESTES DE INTEGRAÇÃO
 *
 * Este arquivo contém configurações específicas para os testes de integração
 */

module.exports = {
    // Configurações gerais
    general: {
        timeout: 30000, // 30 segundos
        retries: 3,
        parallel: false
    },

    // Configurações do banco de dados para testes
    database: {
        testPrefix: 'TEST_',
        cleanupAfterTests: true,
        isolationLevel: 'READ_COMMITTED'
    },

    // Dados de teste
    testData: {
        grupos: [
            {
                descricao: 'GRUPO-TESTE-INTEGRACAO-001',
                id_usuario: 1
            }
        ],

        modelos: [
            {
                cd_modelo: 'MODELO-TEST-A',
                descricao: 'Modelo A para Teste de Integração',
                meta_por_hora: 10
            },
            {
                cd_modelo: 'MODELO-TEST-B',
                descricao: 'Modelo B para Teste de Integração',
                meta_por_hora: 15
            }
        ],

        ops: [
            {
                codigo_op: 'OP-TEST-INT-001',
                qtd_total: 100,
                data_inicio: '2024-01-15'
            },
            {
                codigo_op: 'OP-TEST-INT-002',
                qtd_total: 150,
                data_inicio: '2024-01-15'
            }
        ]
    },

    // Configurações de distribuição
    distribuicao: {
        quantidade_horas_extras: 2,
        data_inicio_padrao: '2024-01-15',
        validacoes: {
            total_previsto_deve_ser_igual_qtd_op: true,
            verificar_conflitos_horarios: true,
            validar_meta_por_hora: true,
            verificar_status_inicial: true
        }
    },

    // URLs das APIs
    api: {
        baseUrl: 'http://localhost/controle_pcp/api',
        endpoints: {
            grupo_producao: '/grupo_producao.php',
            ordem_producao: '/ordem_producao.php',
            distribuir_op: '/distribuir_op.php',
            distribuicao_op_view: '/distribuicao_op_view.php',
            modelo_peca: '/modelo_peca.php'
        }
    },

    // Configurações de ambiente
    environment: {
        development: {
            apiUrl: 'http://localhost/controle_pcp/api',
            timeout: 30000
        },
        testing: {
            apiUrl: 'http://localhost/controle_pcp/api',
            timeout: 60000
        },
        production: {
            apiUrl: 'https://seu-dominio.com/api',
            timeout: 30000
        }
    },

    // Configurações de relatórios
    reports: {
        generateJson: true,
        generateHtml: false,
        generateXml: false,
        outputDir: './test-reports',
        filename: 'integration-test-report'
    },

    // Configurações de limpeza
    cleanup: {
        removeTestData: true,
        removeTestFiles: true,
        removeTestReports: false
    }
};
