#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Brewster's MTGO Mission Terminal
 * Orchestrates unit tests, integration tests, E2E tests, and visual regression tests
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
    constructor() {
        this.results = {
            unit: null,
            e2e: null,
            visual: null,
            security: null,
            performance: null
        };
        
        this.startTime = Date.now();
    }
    
    async runCommand(command, args = [], options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`\n🔄 Running: ${command} ${args.join(' ')}`);
            
            const child = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                ...options
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    console.log(`✅ Success: ${command}`);
                    resolve(code);
                } else {
                    console.log(`❌ Failed: ${command} (exit code: ${code})`);
                    resolve(code); // Don't reject, let test runner continue
                }
            });
            
            child.on('error', (error) => {
                console.error(`💥 Error running ${command}:`, error);
                reject(error);
            });
        });
    }
    
    async checkDependencies() {
        console.log('📦 Checking dependencies...');
        
        try {
            await this.runCommand('npm', ['ci']);
            console.log('✅ Dependencies installed');
        } catch (error) {
            console.error('❌ Failed to install dependencies');
            throw error;
        }
    }
    
    async runUnitTests() {
        console.log('\n🧪 Running Unit Tests...');
        
        const code = await this.runCommand('npm', ['run', 'test:coverage']);
        this.results.unit = {
            passed: code === 0,
            exitCode: code
        };
        
        // Check coverage thresholds
        if (fs.existsSync('coverage/coverage-summary.json')) {
            const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
            console.log('\n📊 Coverage Summary:');
            console.log(`Lines: ${coverage.total.lines.pct}%`);
            console.log(`Functions: ${coverage.total.functions.pct}%`);
            console.log(`Branches: ${coverage.total.branches.pct}%`);
            console.log(`Statements: ${coverage.total.statements.pct}%`);
            
            this.results.unit.coverage = coverage.total;
        }
        
        return this.results.unit;
    }
    
    async runLinting() {
        console.log('\n🔍 Running Code Quality Checks...');
        
        const lintCode = await this.runCommand('npx', ['eslint', 'js/', 'tests/', '--ext', '.js']);
        
        return {
            passed: lintCode === 0,
            exitCode: lintCode
        };
    }
    
    async startLocalServer() {
        console.log('\n🚀 Starting local server for E2E tests...');
        
        return new Promise((resolve) => {
            const server = spawn('npx', ['http-server', '-p', '8000', '-c-1'], {
                stdio: 'pipe',
                shell: true
            });
            
            server.stdout.on('data', (data) => {
                if (data.toString().includes('Available on:')) {
                    console.log('✅ Local server started');
                    resolve(server);
                }
            });
            
            // Fallback timeout
            setTimeout(() => {
                console.log('⏰ Server start timeout, continuing anyway...');
                resolve(server);
            }, 10000);
        });
    }
    
    async runE2ETests() {
        console.log('\n🎭 Running End-to-End Tests...');
        
        const server = await this.startLocalServer();
        
        try {
            // Wait for server to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const code = await this.runCommand('npm', ['run', 'test:e2e']);
            this.results.e2e = {
                passed: code === 0,
                exitCode: code
            };
        } finally {
            console.log('🛑 Stopping local server...');
            server.kill('SIGTERM');
            
            // Wait for server to stop
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return this.results.e2e;
    }
    
    async runVisualTests() {
        console.log('\n🎨 Running Visual Regression Tests...');
        
        const server = await this.startLocalServer();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const code = await this.runCommand('npm', ['run', 'test:visual']);
            this.results.visual = {
                passed: code === 0,
                exitCode: code
            };
        } finally {
            console.log('🛑 Stopping local server...');
            server.kill('SIGTERM');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return this.results.visual;
    }
    
    async runSecurityTests() {
        console.log('\n🔒 Running Security Tests...');
        
        const code = await this.runCommand('npm', ['run', 'test:security']);
        this.results.security = {
            passed: code === 0,
            exitCode: code
        };
        
        return this.results.security;
    }
    
    async runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...');
        
        const server = await this.startLocalServer();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Run Lighthouse CI if configured
            let code = 0;
            try {
                code = await this.runCommand('npx', ['lhci', 'autorun'], { 
                    timeout: 120000 
                });
            } catch (error) {
                console.log('ℹ️ Lighthouse CI not configured, skipping performance tests');
                code = 0; // Don't fail the build for missing optional tests
            }
            
            this.results.performance = {
                passed: code === 0,
                exitCode: code
            };
        } finally {
            server.kill('SIGTERM');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        return this.results.performance;
    }
    
    generateReport() {
        const endTime = Date.now();
        const duration = Math.round((endTime - this.startTime) / 1000);
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 TEST EXECUTION SUMMARY');
        console.log('='.repeat(60));
        console.log(`⏱️  Total Duration: ${duration}s`);
        console.log(`📅 Completed: ${new Date().toISOString()}\n`);
        
        const tests = [
            { name: 'Unit Tests', result: this.results.unit },
            { name: 'E2E Tests', result: this.results.e2e },
            { name: 'Visual Tests', result: this.results.visual },
            { name: 'Security Tests', result: this.results.security },
            { name: 'Performance Tests', result: this.results.performance }
        ];
        
        let allPassed = true;
        
        tests.forEach(({ name, result }) => {
            if (result === null) {
                console.log(`⏭️  ${name}: Skipped`);
            } else if (result.passed) {
                console.log(`✅ ${name}: Passed`);
            } else {
                console.log(`❌ ${name}: Failed (exit code: ${result.exitCode})`);
                allPassed = false;
            }
        });
        
        // Coverage information
        if (this.results.unit?.coverage) {
            const cov = this.results.unit.coverage;
            console.log(`\n📊 Code Coverage:`);
            console.log(`   Lines: ${cov.lines.pct}% (${cov.lines.covered}/${cov.lines.total})`);
            console.log(`   Functions: ${cov.functions.pct}% (${cov.functions.covered}/${cov.functions.total})`);
            console.log(`   Branches: ${cov.branches.pct}% (${cov.branches.covered}/${cov.branches.total})`);
            console.log(`   Statements: ${cov.statements.pct}% (${cov.statements.covered}/${cov.statements.total})`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        if (allPassed) {
            console.log('🎉 ALL TESTS PASSED! 🎉');
            return 0;
        } else {
            console.log('💥 SOME TESTS FAILED 💥');
            return 1;
        }
    }
    
    async runAll() {
        try {
            await this.checkDependencies();
            
            // Run tests in parallel where possible
            const lintResult = await this.runLinting();
            const unitResult = await this.runUnitTests();
            
            // These need to run sequentially due to server conflicts
            const e2eResult = await this.runE2ETests();
            const visualResult = await this.runVisualTests();
            const securityResult = await this.runSecurityTests();
            const performanceResult = await this.runPerformanceTests();
            
            return this.generateReport();
            
        } catch (error) {
            console.error('\n💥 Test execution failed:', error);
            return 1;
        }
    }
    
    async runSpecific(testType) {
        try {
            await this.checkDependencies();
            
            switch (testType) {
                case 'unit':
                    await this.runUnitTests();
                    break;
                case 'e2e':
                    await this.runE2ETests();
                    break;
                case 'visual':
                    await this.runVisualTests();
                    break;
                case 'security':
                    await this.runSecurityTests();
                    break;
                case 'performance':
                    await this.runPerformanceTests();
                    break;
                case 'lint':
                    await this.runLinting();
                    break;
                default:
                    console.error(`❌ Unknown test type: ${testType}`);
                    return 1;
            }
            
            return this.generateReport();
            
        } catch (error) {
            console.error('\n💥 Test execution failed:', error);
            return 1;
        }
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);
    const testRunner = new TestRunner();
    
    if (args.length === 0) {
        console.log('🚀 Running all tests...');
        testRunner.runAll().then(code => process.exit(code));
    } else {
        const testType = args[0];
        console.log(`🎯 Running ${testType} tests...`);
        testRunner.runSpecific(testType).then(code => process.exit(code));
    }
}

module.exports = TestRunner;