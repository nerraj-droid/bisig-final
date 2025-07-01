#!/usr/bin/env ts-node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

interface TestResult {
    suite: string
    passed: number
    failed: number
    total: number
    duration: number
    coverage?: number
}

class BisigTestRunner {
    private results: TestResult[] = []
    private startTime: number = 0

    constructor() {
        console.log('🧪 BISIG Production Test Suite Runner')
        console.log('=====================================')
    }

    async runAllTests(): Promise<void> {
        this.startTime = Date.now()

        try {
            // 1. Run Unit Tests
            await this.runTestSuite('Unit Tests', [
                'src/__tests__/helpers.test.ts',
                'src/__tests__/auth.test.ts'
            ])

            // 2. Run API Tests
            await this.runTestSuite('API Tests', [
                'src/__tests__/residents.test.ts',
                'src/__tests__/certificates.test.ts',
                'src/__tests__/households.test.ts',
                'src/__tests__/blotter.test.ts'
            ])

            // 3. Run Integration Tests
            await this.runTestSuite('Integration Tests', [
                'src/__tests__/integration.test.ts'
            ])

            // 4. Generate Coverage Report
            await this.generateCoverageReport()

            // 5. Generate Final Report
            this.generateFinalReport()

        } catch (error) {
            console.error('❌ Test suite failed:', error)
            process.exit(1)
        }
    }

    private async runTestSuite(suiteName: string, testFiles: string[]): Promise<void> {
        console.log(`\n🔍 Running ${suiteName}...`)

        const startTime = Date.now()
        let totalPassed = 0
        let totalFailed = 0
        let totalTests = 0

        for (const testFile of testFiles) {
            if (fs.existsSync(testFile)) {
                try {
                    console.log(`  📄 ${testFile}`)
                    const result = execSync(`npx jest ${testFile} --verbose --no-coverage`, {
                        encoding: 'utf8',
                        stdio: 'pipe'
                    })

                    // Parse Jest output for test results
                    const testResult = this.parseJestOutput(result)
                    totalPassed += testResult.passed
                    totalFailed += testResult.failed
                    totalTests += testResult.total

                } catch (error) {
                    console.log(`  ❌ ${testFile} - FAILED`)
                    totalFailed++
                    totalTests++
                }
            } else {
                console.log(`  ⚠️  ${testFile} - FILE NOT FOUND`)
            }
        }

        const duration = Date.now() - startTime
        const result: TestResult = {
            suite: suiteName,
            passed: totalPassed,
            failed: totalFailed,
            total: totalTests,
            duration
        }

        this.results.push(result)
        this.printSuiteResult(result)
    }

    private parseJestOutput(output: string): { passed: number; failed: number; total: number } {
        // Simple parser for Jest output
        const lines = output.split('\n')
        let passed = 0
        let failed = 0
        let total = 0

        for (const line of lines) {
            if (line.includes('✓') || line.includes('PASS')) {
                passed++
            } else if (line.includes('✗') || line.includes('FAIL')) {
                failed++
            }
        }

        total = passed + failed
        return { passed, failed, total }
    }

    private async generateCoverageReport(): Promise<void> {
        console.log('\n📊 Generating Coverage Report...')

        try {
            const coverageResult = execSync('npx jest --coverage --coverageReporters=text-summary', {
                encoding: 'utf8',
                stdio: 'pipe'
            })

            console.log(coverageResult)

            // Extract coverage percentage
            const coverageMatch = coverageResult.match(/All files\s+\|\s+([\d.]+)/)
            const coveragePercentage = coverageMatch ? parseFloat(coverageMatch[1]) : 0

            // Add coverage to the last result
            if (this.results.length > 0) {
                this.results[this.results.length - 1].coverage = coveragePercentage
            }

        } catch (error) {
            console.log('⚠️  Coverage report generation failed')
        }
    }

    private printSuiteResult(result: TestResult): void {
        const status = result.failed === 0 ? '✅' : '❌'
        const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0'

        console.log(`  ${status} ${result.suite}:`)
        console.log(`     Passed: ${result.passed}`)
        console.log(`     Failed: ${result.failed}`)
        console.log(`     Total:  ${result.total}`)
        console.log(`     Success Rate: ${percentage}%`)
        console.log(`     Duration: ${result.duration}ms`)
    }

    private generateFinalReport(): void {
        const totalDuration = Date.now() - this.startTime
        const totalPassed = this.results.reduce((sum, r) => sum + r.passed, 0)
        const totalFailed = this.results.reduce((sum, r) => sum + r.failed, 0)
        const totalTests = this.results.reduce((sum, r) => sum + r.total, 0)
        const overallSuccess = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0'

        console.log('\n' + '='.repeat(50))
        console.log('📋 BISIG TEST SUITE FINAL REPORT')
        console.log('='.repeat(50))

        // Suite breakdown
        this.results.forEach(result => {
            const status = result.failed === 0 ? '✅' : '❌'
            const percentage = result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : '0'
            console.log(`${status} ${result.suite.padEnd(20)} ${result.passed}/${result.total} (${percentage}%)`)
        })

        console.log('-'.repeat(50))
        console.log(`📊 OVERALL RESULTS:`)
        console.log(`   Total Tests: ${totalTests}`)
        console.log(`   Passed: ${totalPassed}`)
        console.log(`   Failed: ${totalFailed}`)
        console.log(`   Success Rate: ${overallSuccess}%`)
        console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(2)}s`)

        // Coverage information
        const coverageResults = this.results.filter(r => r.coverage !== undefined)
        if (coverageResults.length > 0) {
            const avgCoverage = coverageResults.reduce((sum, r) => sum + (r.coverage || 0), 0) / coverageResults.length
            console.log(`   Code Coverage: ${avgCoverage.toFixed(1)}%`)
        }

        // Production readiness assessment
        console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:')
        const isProductionReady = totalFailed === 0 && parseFloat(overallSuccess) >= 95

        if (isProductionReady) {
            console.log('✅ SYSTEM IS PRODUCTION READY!')
            console.log('   - All tests passing')
            console.log('   - High success rate (≥95%)')
            console.log('   - Core functionality verified')
        } else {
            console.log('❌ SYSTEM NEEDS ATTENTION BEFORE PRODUCTION:')
            if (totalFailed > 0) {
                console.log(`   - ${totalFailed} tests failing`)
            }
            if (parseFloat(overallSuccess) < 95) {
                console.log(`   - Success rate below 95% (${overallSuccess}%)`)
            }
        }

        // Save report to file
        this.saveReportToFile({
            timestamp: new Date().toISOString(),
            totalTests,
            totalPassed,
            totalFailed,
            overallSuccess: parseFloat(overallSuccess),
            totalDuration,
            suites: this.results,
            isProductionReady
        })

        console.log('\n📄 Detailed report saved to: test-report.json')
        console.log('='.repeat(50))

        // Exit with appropriate code
        process.exit(totalFailed === 0 ? 0 : 1)
    }

    private saveReportToFile(report: any): void {
        const reportPath = path.join(process.cwd(), 'test-report.json')
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    }

    // Static method to run specific test categories
    static async runCategory(category: 'unit' | 'api' | 'integration' | 'all'): Promise<void> {
        const runner = new BisigTestRunner()

        switch (category) {
            case 'unit':
                await runner.runTestSuite('Unit Tests', [
                    'src/__tests__/helpers.test.ts',
                    'src/__tests__/auth.test.ts'
                ])
                break
            case 'api':
                await runner.runTestSuite('API Tests', [
                    'src/__tests__/residents.test.ts',
                    'src/__tests__/certificates.test.ts',
                    'src/__tests__/households.test.ts',
                    'src/__tests__/blotter.test.ts'
                ])
                break
            case 'integration':
                await runner.runTestSuite('Integration Tests', [
                    'src/__tests__/integration.test.ts'
                ])
                break
            case 'all':
            default:
                await runner.runAllTests()
                break
        }
    }
}

// CLI interface
if (require.main === module) {
    const category = process.argv[2] as 'unit' | 'api' | 'integration' | 'all' || 'all'
    BisigTestRunner.runCategory(category)
}

export default BisigTestRunner 