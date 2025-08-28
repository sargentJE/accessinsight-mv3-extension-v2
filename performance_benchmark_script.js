// Performance Benchmark Script for Engine Testing
// Run this in browser console on test pages to measure performance

class PerformanceBenchmark {
    constructor() {
        this.results = [];
        this.testPages = [
            'Simple page (<100 elements)',
            'Medium page (100-1000 elements)', 
            'Complex page (1000-5000 elements)',
            'Enterprise page (5000+ elements)'
        ];
    }
    
    async runBenchmark(iterations = 10) {
        console.log('🧪 Starting Performance Benchmark...');
        console.log(`Running ${iterations} iterations per test`);
        
        // Clear any existing results
        this.results = [];
        
        // Test current page
        const pageComplexity = this.analyzePageComplexity();
        console.log(`📊 Page Analysis: ${pageComplexity.totalElements} elements, ${pageComplexity.complexity} complexity`);
        
        // Run performance tests
        const performanceResults = await this.measurePerformance(iterations);
        
        // Memory usage test
        const memoryResults = this.measureMemoryUsage();
        
        // Generate report
        this.generateReport(pageComplexity, performanceResults, memoryResults);
        
        return {
            pageComplexity,
            performanceResults,
            memoryResults
        };
    }
    
    analyzePageComplexity() {
        const allElements = document.querySelectorAll('*');
        const totalElements = allElements.length;
        
        // Count specific element types
        const inputs = document.querySelectorAll('input, button, select, textarea').length;
        const images = document.querySelectorAll('img').length;
        const links = document.querySelectorAll('a[href]').length;
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        const forms = document.querySelectorAll('form').length;
        
        // Determine complexity category
        let complexity;
        if (totalElements < 100) complexity = 'Simple';
        else if (totalElements < 1000) complexity = 'Medium';
        else if (totalElements < 5000) complexity = 'Complex';
        else complexity = 'Enterprise';
        
        return {
            totalElements,
            inputs,
            images,
            links,
            headings,
            forms,
            complexity
        };
    }
    
    async measurePerformance(iterations) {
        const times = [];
        const findingsCounts = [];
        
        console.log(`⚡ Running ${iterations} performance iterations...`);
        
        for (let i = 0; i < iterations; i++) {
            // Clear any caches if possible
            if (window.__a11yEngine && window.__a11yEngine.clearCaches) {
                window.__a11yEngine.clearCaches();
            }
            
            // Measure execution time
            const startTime = performance.now();
            const findings = window.__a11yEngine.run();
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            times.push(executionTime);
            findingsCounts.push(findings.length);
            
            // Small delay between iterations
            if (i < iterations - 1) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        // Calculate statistics
        const avgTime = times.reduce((a, b) => a + b) / times.length;
        const minTime = Math.min(...times);
        const maxTime = Math.max(...times);
        const medianTime = times.sort((a, b) => a - b)[Math.floor(times.length / 2)];
        const avgFindings = findingsCounts.reduce((a, b) => a + b) / findingsCounts.length;
        
        // Calculate performance per rule
        const totalRules = Object.keys(window.__a11yEngine.ruleMeta || {}).length;
        const avgTimePerRule = avgTime / totalRules;
        
        return {
            iterations,
            times,
            avgTime: Number(avgTime.toFixed(2)),
            minTime: Number(minTime.toFixed(2)),
            maxTime: Number(maxTime.toFixed(2)),
            medianTime: Number(medianTime.toFixed(2)),
            avgFindings: Number(avgFindings.toFixed(1)),
            totalRules,
            avgTimePerRule: Number(avgTimePerRule.toFixed(2))
        };
    }
    
    measureMemoryUsage() {
        const memoryInfo = performance.memory || {};
        
        // Baseline memory measurement
        const baselineMemory = {
            used: memoryInfo.usedJSHeapSize || 0,
            total: memoryInfo.totalJSHeapSize || 0,
            limit: memoryInfo.jsHeapSizeLimit || 0
        };
        
        // Run engine and measure memory after
        window.__a11yEngine.run();
        
        const afterMemory = {
            used: (performance.memory && performance.memory.usedJSHeapSize) || 0,
            total: (performance.memory && performance.memory.totalJSHeapSize) || 0,
            limit: (performance.memory && performance.memory.jsHeapSizeLimit) || 0
        };
        
        return {
            baseline: baselineMemory,
            after: afterMemory,
            increase: {
                used: afterMemory.used - baselineMemory.used,
                total: afterMemory.total - baselineMemory.total
            }
        };
    }
    
    generateReport(pageComplexity, performanceResults, memoryResults) {
        console.log('\n🎯 PERFORMANCE BENCHMARK REPORT');
        console.log('=====================================');
        
        // Page complexity report
        console.log(`\n📊 Page Complexity: ${pageComplexity.complexity}`);
        console.log(`   Total Elements: ${pageComplexity.totalElements}`);
        console.log(`   Interactive: ${pageComplexity.inputs} inputs, ${pageComplexity.links} links`);
        console.log(`   Media: ${pageComplexity.images} images`);
        console.log(`   Structure: ${pageComplexity.headings} headings, ${pageComplexity.forms} forms`);
        
        // Performance report
        console.log(`\n⚡ Performance Results (${performanceResults.iterations} iterations):`);
        console.log(`   Average Time: ${performanceResults.avgTime}ms`);
        console.log(`   Fastest Time: ${performanceResults.minTime}ms`);
        console.log(`   Slowest Time: ${performanceResults.maxTime}ms`);
        console.log(`   Median Time: ${performanceResults.medianTime}ms`);
        console.log(`   Rules Tested: ${performanceResults.totalRules}`);
        console.log(`   Time per Rule: ${performanceResults.avgTimePerRule}ms`);
        console.log(`   Avg Findings: ${performanceResults.avgFindings}`);
        
        // Performance rating
        const rating = this.getPerformanceRating(performanceResults.avgTime, pageComplexity.complexity);
        console.log(`   Performance Rating: ${rating.grade} (${rating.description})`);
        
        // Memory usage report
        if (memoryResults.baseline.used > 0) {
            console.log(`\n💾 Memory Usage:`);
            console.log(`   Baseline: ${(memoryResults.baseline.used / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   After Scan: ${(memoryResults.after.used / 1024 / 1024).toFixed(2)}MB`);
            console.log(`   Increase: ${(memoryResults.increase.used / 1024 / 1024).toFixed(2)}MB`);
        }
        
        // Recommendations
        console.log('\n💡 Recommendations:');
        if (performanceResults.avgTime > 1000) {
            console.log('   ⚠️  Scan time exceeds 1000ms - consider optimization');
        } else if (performanceResults.avgTime > 500) {
            console.log('   ✓  Good performance, monitor for regression');
        } else {
            console.log('   ✅ Excellent performance!');
        }
        
        if (performanceResults.avgTimePerRule > 25) {
            console.log('   ⚠️  Average time per rule >25ms - some rules may need optimization');
        } else {
            console.log('   ✅ Rule performance is excellent');
        }
        
        console.log('\n=====================================');
        
        return {
            pageComplexity,
            performanceResults,
            memoryResults,
            rating
        };
    }
    
    getPerformanceRating(avgTime, complexity) {
        const thresholds = {
            'Simple': { excellent: 200, good: 500, poor: 1000 },
            'Medium': { excellent: 500, good: 1000, poor: 2000 },
            'Complex': { excellent: 1000, good: 2000, poor: 5000 },
            'Enterprise': { excellent: 2000, good: 5000, poor: 10000 }
        };
        
        const threshold = thresholds[complexity] || thresholds['Medium'];
        
        if (avgTime <= threshold.excellent) {
            return { grade: 'A+', description: 'Excellent' };
        } else if (avgTime <= threshold.good) {
            return { grade: 'A', description: 'Good' };
        } else if (avgTime <= threshold.poor) {
            return { grade: 'B', description: 'Acceptable' };
        } else {
            return { grade: 'C', description: 'Needs Optimization' };
        }
    }
    
    // Utility method to test WCAG 2.2 specific rules
    testWCAG22Rules() {
        console.log('\n🎯 WCAG 2.2 Rule Testing');
        console.log('==========================');
        
        const wcag22Rules = [
            'focus-appearance',
            'dragging-movements', 
            'consistent-help',
            'focus-not-obscured-minimum',
            'redundant-entry',
            'accessible-authentication-minimum',
            'focus-not-obscured-enhanced',
            'accessible-authentication-enhanced'
        ];
        
        const findings = window.__a11yEngine.run();
        
        wcag22Rules.forEach(ruleId => {
            const ruleFindings = findings.filter(f => f.ruleId === ruleId);
            const meta = window.__a11yEngine.ruleMeta[ruleId];
            
            console.log(`\n${ruleId}:`);
            console.log(`   Findings: ${ruleFindings.length}`);
            console.log(`   Has Research: ${meta && meta.research ? '✅' : '❌'}`);
            console.log(`   Priority Range: ${ruleFindings.length > 0 ? `${Math.min(...ruleFindings.map(f => f.priorityScore || 0))}-${Math.max(...ruleFindings.map(f => f.priorityScore || 0))}` : 'N/A'}`);
        });
        
        const wcag22Findings = findings.filter(f => wcag22Rules.includes(f.ruleId));
        console.log(`\nTotal WCAG 2.2 Findings: ${wcag22Findings.length}/${findings.length}`);
        console.log(`WCAG 2.2 Coverage: ${wcag22Rules.filter(ruleId => findings.some(f => f.ruleId === ruleId)).length}/${wcag22Rules.length} rules triggered`);
    }
    
    // Utility method to test research integration
    testResearchIntegration() {
        console.log('\n📚 Research Integration Testing');
        console.log('================================');
        
        const findings = window.__a11yEngine.run();
        const rulesWithResearch = Object.entries(window.__a11yEngine.ruleMeta)
            .filter(([ruleId, meta]) => meta.research)
            .map(([ruleId]) => ruleId);
        
        console.log(`Rules with Research: ${rulesWithResearch.length}/${Object.keys(window.__a11yEngine.ruleMeta).length}`);
        console.log(`Research Coverage: ${(rulesWithResearch.length / Object.keys(window.__a11yEngine.ruleMeta).length * 100).toFixed(1)}%`);
        
        const findingsWithResearch = findings.filter(f => {
            const meta = window.__a11yEngine.ruleMeta[f.ruleId];
            return meta && meta.research;
        });
        
        console.log(`Findings with Research: ${findingsWithResearch.length}/${findings.length}`);
        console.log(`Research-backed Findings: ${(findingsWithResearch.length / findings.length * 100).toFixed(1)}%`);
        
        // Sample research citations
        if (findingsWithResearch.length > 0) {
            console.log('\nSample Research Citations:');
            findingsWithResearch.slice(0, 3).forEach(finding => {
                const meta = window.__a11yEngine.ruleMeta[finding.ruleId];
                console.log(`   ${finding.ruleId}: ${meta.research.substring(0, 80)}...`);
            });
        }
    }
}

// Global instance for easy access
window.performanceBenchmark = new PerformanceBenchmark();

// Auto-run if engine is available
if (typeof window.__a11yEngine !== 'undefined') {
    console.log('🚀 Performance Benchmark Ready!');
    console.log('Usage:');
    console.log('  window.performanceBenchmark.runBenchmark(10)  // Run 10 iterations');
    console.log('  window.performanceBenchmark.testWCAG22Rules()  // Test WCAG 2.2 rules');
    console.log('  window.performanceBenchmark.testResearchIntegration()  // Test research');
} else {
    console.warn('❌ Engine not found. Load engine.js first.');
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceBenchmark;
}
