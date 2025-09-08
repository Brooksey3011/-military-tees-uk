/**
 * 🎯 AUTOMATED BUNDLE SIZE MONITORING
 * Tracks bundle size regressions and optimization opportunities
 */
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class BundleAnalyzer {
  constructor() {
    this.thresholds = {
      // Bundle size limits (bytes)
      main: 350000,      // 350KB main bundle
      vendor: 500000,    // 500KB vendor bundle  
      admin: 180000,     // 180KB admin bundle (down from 323KB)
      total: 1200000,    // 1.2MB total bundle size
      
      // Performance impact thresholds  
      frameworkOverhead: 200000,  // 200KB framework
      unusedCode: 50000,          // 50KB unused code
      duplicateCode: 30000        // 30KB duplicate code
    }
    
    this.buildDir = '.next'
    this.reportPath = 'tests/performance/bundle-report.json'
  }

  /**
   * 🔍 Analyze current build output
   */
  analyzeBundles() {
    console.log('🔍 Analyzing bundle sizes...')
    
    // Get all chunk files
    const chunksDir = path.join(this.buildDir, 'static', 'chunks')
    if (!fs.existsSync(chunksDir)) {
      throw new Error('Build directory not found. Run `npm run build` first.')
    }
    
    const chunks = this.getChunkSizes(chunksDir)
    const pages = this.getPageSizes()
    
    const analysis = {
      timestamp: new Date().toISOString(),
      chunks,
      pages,
      totals: this.calculateTotals(chunks, pages),
      violations: this.checkViolations(chunks, pages),
      recommendations: this.generateRecommendations(chunks, pages)
    }
    
    this.saveReport(analysis)
    this.printSummary(analysis)
    
    return analysis
  }

  /**
   * 📊 Get individual chunk sizes
   */
  getChunkSizes(chunksDir) {
    const chunks = {}
    const files = fs.readdirSync(chunksDir)
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = path.join(chunksDir, file)
        const stats = fs.statSync(filePath)
        
        // Categorize chunks
        let category = 'misc'
        if (file.includes('framework')) category = 'framework'
        else if (file.includes('vendor') || file.includes('node_modules')) category = 'vendor'
        else if (file.includes('pages')) category = 'pages'
        else if (file.includes('app')) category = 'app'
        
        chunks[file] = {
          size: stats.size,
          category,
          gzipSize: this.getGzipSize(filePath)
        }
      }
    }
    
    return chunks
  }

  /**
   * 📄 Get page-specific bundle sizes  
   */
  getPageSizes() {
    try {
      // Parse Next.js build output
      const buildManifest = JSON.parse(
        fs.readFileSync(path.join(this.buildDir, 'build-manifest.json'), 'utf8')
      )
      
      const pages = {}
      for (const [route, files] of Object.entries(buildManifest.pages)) {
        let totalSize = 0
        
        for (const file of files) {
          const filePath = path.join(this.buildDir, file)
          if (fs.existsSync(filePath)) {
            totalSize += fs.statSync(filePath).size
          }
        }
        
        pages[route] = {
          files: files.length,
          totalSize,
          firstLoadJS: totalSize // Approximate first load JS
        }
      }
      
      return pages
    } catch (error) {
      console.warn('Could not analyze page sizes:', error.message)
      return {}
    }
  }

  /**
   * 🗜️ Calculate gzip size
   */
  getGzipSize(filePath) {
    try {
      const result = execSync(`gzip -c "${filePath}" | wc -c`, { encoding: 'utf8' })
      return parseInt(result.trim())
    } catch {
      return null
    }
  }

  /**
   * 📈 Calculate totals and metrics
   */
  calculateTotals(chunks, pages) {
    const chunkSizes = Object.values(chunks)
    const totalSize = chunkSizes.reduce((sum, chunk) => sum + chunk.size, 0)
    const totalGzipSize = chunkSizes.reduce((sum, chunk) => sum + (chunk.gzipSize || 0), 0)
    
    // Group by category
    const byCategory = {}
    for (const chunk of chunkSizes) {
      if (!byCategory[chunk.category]) byCategory[chunk.category] = 0
      byCategory[chunk.category] += chunk.size
    }
    
    return {
      totalSize,
      totalGzipSize,
      chunkCount: chunkSizes.length,
      byCategory,
      compressionRatio: totalGzipSize / totalSize
    }
  }

  /**
   * ⚠️ Check for threshold violations
   */
  checkViolations(chunks, pages) {
    const violations = []
    
    // Check individual chunks
    for (const [filename, chunk] of Object.entries(chunks)) {
      if (filename.includes('admin') && chunk.size > this.thresholds.admin) {
        violations.push({
          type: 'bundle-size',
          severity: 'error',
          message: `Admin bundle too large: ${this.formatBytes(chunk.size)} > ${this.formatBytes(this.thresholds.admin)}`,
          file: filename
        })
      }
      
      if (chunk.category === 'vendor' && chunk.size > this.thresholds.vendor) {
        violations.push({
          type: 'vendor-size', 
          severity: 'warning',
          message: `Large vendor chunk: ${filename} (${this.formatBytes(chunk.size)})`,
          file: filename
        })
      }
    }
    
    // Check page sizes
    for (const [route, page] of Object.entries(pages)) {
      if (route === '/admin' && page.totalSize > this.thresholds.admin) {
        violations.push({
          type: 'page-size',
          severity: 'error', 
          message: `Admin page too heavy: ${this.formatBytes(page.totalSize)}`,
          route
        })
      }
    }
    
    return violations
  }

  /**
   * 💡 Generate optimization recommendations
   */
  generateRecommendations(chunks, pages) {
    const recommendations = []
    
    // Check for Framer Motion impact
    const motionChunks = Object.entries(chunks).filter(([name]) => 
      name.includes('framer') || name.includes('motion')
    )
    
    if (motionChunks.length > 0) {
      const motionSize = motionChunks.reduce((sum, [, chunk]) => sum + chunk.size, 0)
      recommendations.push({
        type: 'dependency-optimization',
        priority: 'high',
        impact: this.formatBytes(motionSize),
        message: 'Consider replacing Framer Motion with CSS animations',
        action: 'Remove unnecessary animation library usage'
      })
    }
    
    // Check for large vendor chunks
    const largeVendorChunks = Object.entries(chunks).filter(([name, chunk]) => 
      chunk.category === 'vendor' && chunk.size > 100000
    )
    
    for (const [name, chunk] of largeVendorChunks) {
      recommendations.push({
        type: 'code-splitting',
        priority: 'medium', 
        impact: this.formatBytes(chunk.size),
        message: `Consider lazy loading: ${name}`,
        action: 'Implement dynamic imports'
      })
    }
    
    // Check compression ratio
    const compressionRatio = chunks.totalGzipSize / chunks.totalSize
    if (compressionRatio > 0.7) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        message: 'Poor compression ratio suggests optimization opportunities',
        action: 'Review code for compression-friendly patterns'
      })
    }
    
    return recommendations
  }

  /**
   * 💾 Save analysis report
   */
  saveReport(analysis) {
    const reportDir = path.dirname(this.reportPath)
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true })
    }
    
    // Save current report
    fs.writeFileSync(this.reportPath, JSON.stringify(analysis, null, 2))
    
    // Save historical data
    const historyPath = this.reportPath.replace('.json', `-${Date.now()}.json`)
    fs.writeFileSync(historyPath, JSON.stringify(analysis, null, 2))
  }

  /**
   * 📝 Print summary to console
   */
  printSummary(analysis) {
    console.log('\n🎯 Bundle Analysis Summary')
    console.log('=' .repeat(50))
    
    console.log(`📊 Total Bundle Size: ${this.formatBytes(analysis.totals.totalSize)}`)
    console.log(`🗜️  Gzipped Size: ${this.formatBytes(analysis.totals.totalGzipSize)}`)
    console.log(`📦 Chunks: ${analysis.totals.chunkCount}`)
    
    console.log('\n📂 By Category:')
    for (const [category, size] of Object.entries(analysis.totals.byCategory)) {
      console.log(`   ${category}: ${this.formatBytes(size)}`)
    }
    
    if (analysis.violations.length > 0) {
      console.log('\n⚠️  Violations:')
      for (const violation of analysis.violations) {
        console.log(`   ${violation.severity.toUpperCase()}: ${violation.message}`)
      }
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      for (const rec of analysis.recommendations) {
        console.log(`   ${rec.priority.toUpperCase()}: ${rec.message}`)
        if (rec.impact) console.log(`      Impact: ${rec.impact}`)
      }
    }
  }

  /**
   * 🔧 Format bytes for display
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 📊 Compare with previous build
   */
  compareWithPrevious() {
    const currentReport = JSON.parse(fs.readFileSync(this.reportPath, 'utf8'))
    
    // Find most recent historical report
    const historyFiles = fs.readdirSync(path.dirname(this.reportPath))
      .filter(file => file.includes('bundle-report-') && file.endsWith('.json'))
      .sort()
      .reverse()
    
    if (historyFiles.length === 0) {
      console.log('📈 No previous build to compare against')
      return
    }
    
    const previousPath = path.join(path.dirname(this.reportPath), historyFiles[0])
    const previousReport = JSON.parse(fs.readFileSync(previousPath, 'utf8'))
    
    const sizeDiff = currentReport.totals.totalSize - previousReport.totals.totalSize
    const percentChange = (sizeDiff / previousReport.totals.totalSize) * 100
    
    console.log('\n📈 Size Comparison:')
    console.log(`   Previous: ${this.formatBytes(previousReport.totals.totalSize)}`)
    console.log(`   Current:  ${this.formatBytes(currentReport.totals.totalSize)}`)
    console.log(`   Change:   ${sizeDiff > 0 ? '+' : ''}${this.formatBytes(sizeDiff)} (${percentChange.toFixed(1)}%)`)
    
    if (Math.abs(percentChange) > 5) {
      console.log(`   ⚠️  Significant size change detected!`)
    }
  }
}

// CLI usage
if (require.main === module) {
  const analyzer = new BundleAnalyzer()
  
  try {
    analyzer.analyzeBundles()
    analyzer.compareWithPrevious()
    
    // Exit with error code if critical violations found
    const report = JSON.parse(fs.readFileSync(analyzer.reportPath, 'utf8'))
    const criticalViolations = report.violations.filter(v => v.severity === 'error')
    
    if (criticalViolations.length > 0) {
      console.log(`\n❌ ${criticalViolations.length} critical violation(s) found`)
      process.exit(1)
    } else {
      console.log('\n✅ Bundle analysis passed')
    }
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message)
    process.exit(1)
  }
}

module.exports = BundleAnalyzer