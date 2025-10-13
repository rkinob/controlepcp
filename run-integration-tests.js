/**
 * SCRIPT PARA EXECUTAR TESTES DE INTEGRAÇÃO ANGULAR
 *
 * Este script executa os testes de integração e gera relatórios
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AngularTestRunner {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    /**
     * Executar todos os testes de integração
     */
    async runAllTests() {
        console.log('🚀 === EXECUTANDO TESTES DE INTEGRAÇÃO ANGULAR ===\n');

        try {
            // 1. Executar testes unitários relacionados
            await this.runUnitTests();

            // 2. Executar testes de integração
            await this.runIntegrationTests();

            // 3. Executar testes E2E (se configurados)
            await this.runE2ETests();

            // 4. Gerar relatório final
            this.generateFinalReport();

            return this.calculateOverallResult();

        } catch (error) {
            console.error('💥 Erro durante execução dos testes:', error.message);
            return false;
        }
    }

    /**
     * Executar testes unitários
     */
    async runUnitTests() {
        console.log('📋 === EXECUTANDO TESTES UNITÁRIOS ===\n');

        try {
            const command = 'ng test --watch=false --browsers=ChromeHeadless --code-coverage';
            console.log(`Executando: ${command}`);

            const output = execSync(command, {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe'
            });

            this.results.push({
                name: 'Testes Unitários',
                success: true,
                executionTime: Date.now() - this.startTime,
                details: 'Todos os testes unitários passaram',
                output: output
            });

            console.log('✅ Testes unitários executados com sucesso\n');

        } catch (error) {
            this.results.push({
                name: 'Testes Unitários',
                success: false,
                executionTime: Date.now() - this.startTime,
                details: `Erro: ${error.message}`,
                output: error.stdout || error.message
            });

            console.log('❌ Falha nos testes unitários\n');
        }
    }

    /**
     * Executar testes de integração específicos
     */
    async runIntegrationTests() {
        console.log('📋 === EXECUTANDO TESTES DE INTEGRAÇÃO ===\n');

        try {
            // Executar apenas os testes de integração
            const command = 'ng test --include="**/integration/**/*.spec.ts" --watch=false --browsers=ChromeHeadless';
            console.log(`Executando: ${command}`);

            const output = execSync(command, {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe'
            });

            this.results.push({
                name: 'Testes de Integração - OPs',
                success: true,
                executionTime: Date.now() - this.startTime,
                details: 'Testes de integração de OPs passaram',
                output: output
            });

            console.log('✅ Testes de integração executados com sucesso\n');

        } catch (error) {
            this.results.push({
                name: 'Testes de Integração - OPs',
                success: false,
                executionTime: Date.now() - this.startTime,
                details: `Erro: ${error.message}`,
                output: error.stdout || error.message
            });

            console.log('❌ Falha nos testes de integração\n');
        }
    }

    /**
     * Executar testes E2E (se disponíveis)
     */
    async runE2ETests() {
        console.log('📋 === VERIFICANDO TESTES E2E ===\n');

        try {
            // Verificar se existe configuração de E2E
            const e2eConfigPath = path.join(process.cwd(), 'e2e');

            if (fs.existsSync(e2eConfigPath)) {
                const command = 'ng e2e --headless';
                console.log(`Executando: ${command}`);

                const output = execSync(command, {
                    encoding: 'utf8',
                    cwd: process.cwd(),
                    stdio: 'pipe'
                });

                this.results.push({
                    name: 'Testes E2E',
                    success: true,
                    executionTime: Date.now() - this.startTime,
                    details: 'Testes E2E passaram',
                    output: output
                });

                console.log('✅ Testes E2E executados com sucesso\n');
            } else {
                this.results.push({
                    name: 'Testes E2E',
                    success: true,
                    executionTime: Date.now() - this.startTime,
                    details: 'Testes E2E não configurados (ignorado)',
                    output: 'N/A'
                });

                console.log('ℹ️  Testes E2E não configurados (ignorado)\n');
            }

        } catch (error) {
            this.results.push({
                name: 'Testes E2E',
                success: false,
                executionTime: Date.now() - this.startTime,
                details: `Erro: ${error.message}`,
                output: error.stdout || error.message
            });

            console.log('❌ Falha nos testes E2E\n');
        }
    }

    /**
     * Gerar relatório final
     */
    generateFinalReport() {
        const totalTime = Date.now() - this.startTime;

        console.log('\n' + '='.repeat(80));
        console.log('📊 === RELATÓRIO FINAL DOS TESTES ANGULAR ===');
        console.log('='.repeat(80) + '\n');

        const totalTests = this.results.length;
        let successfulTests = 0;

        this.results.forEach(result => {
            const status = result.success ? "✅ PASSOU" : "❌ FALHOU";
            console.log(`🔸 ${result.name}: ${status}`);
            console.log(`   ⏱️  Tempo: ${(result.executionTime / 1000).toFixed(3)}s`);
            console.log(`   📝 Detalhes: ${result.details}\n`);

            if (result.success) successfulTests++;
        });

        console.log('-'.repeat(80));
        console.log('📈 RESUMO GERAL:');
        console.log(`   - Total de testes: ${totalTests}`);
        console.log(`   - Testes que passaram: ${successfulTests}`);
        console.log(`   - Testes que falharam: ${totalTests - successfulTests}`);
        console.log(`   - Taxa de sucesso: ${((successfulTests / totalTests) * 100).toFixed(2)}%`);
        console.log(`   - Tempo total de execução: ${(totalTime / 1000).toFixed(3)}s\n`);

        if (successfulTests === totalTests) {
            console.log('🎉 TODOS OS TESTES PASSARAM! Aplicação funcionando corretamente.\n');
        } else {
            console.log('⚠️  ALGUNS TESTES FALHARAM! Verifique os detalhes acima.\n');
        }

        console.log('='.repeat(80));
    }

    /**
     * Calcular resultado geral
     */
    calculateOverallResult() {
        const totalTests = this.results.length;
        const successfulTests = this.results.filter(r => r.success).length;
        return successfulTests === totalTests;
    }

    /**
     * Gerar relatório em JSON
     */
    generateJSONReport(filename = 'angular-test-report.json') {
        const report = {
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - this.startTime,
            results: this.results,
            summary: {
                totalTests: this.results.length,
                successfulTests: this.results.filter(r => r.success).length,
                successRate: ((this.results.filter(r => r.success).length / this.results.length) * 100).toFixed(2)
            }
        };

        fs.writeFileSync(filename, JSON.stringify(report, null, 2), 'utf8');
        console.log(`📄 Relatório JSON salvo em: ${filename}`);
    }

    /**
     * Executar teste específico de integração
     */
    async runSpecificIntegrationTest(testName) {
        console.log(`📋 === EXECUTANDO TESTE ESPECÍFICO: ${testName} ===\n`);

        try {
            const command = `ng test --include="**/integration/${testName}.spec.ts" --watch=false --browsers=ChromeHeadless`;
            console.log(`Executando: ${command}`);

            const output = execSync(command, {
                encoding: 'utf8',
                cwd: process.cwd(),
                stdio: 'pipe'
            });

            console.log('✅ Teste específico executado com sucesso\n');
            return { success: true, output };

        } catch (error) {
            console.log('❌ Falha no teste específico\n');
            return { success: false, error: error.message };
        }
    }
}

// Executar os testes se o script for chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    const testRunner = new AngularTestRunner();

    if (args.length > 0 && args[0] === '--specific') {
        // Executar teste específico
        const testName = args[1] || 'op-distribution-integration';
        testRunner.runSpecificIntegrationTest(testName)
            .then(result => {
                console.log('Resultado:', result);
                process.exit(result.success ? 0 : 1);
            });
    } else {
        // Executar todos os testes
        testRunner.runAllTests()
            .then(success => {
                // Gerar relatório JSON
                testRunner.generateJSONReport();

                process.exit(success ? 0 : 1);
            })
            .catch(error => {
                console.error('💥 Erro fatal:', error.message);
                process.exit(1);
            });
    }
}

module.exports = AngularTestRunner;
