import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ShieldAlert, CheckCircle, HelpCircle, ArrowLeft, RefreshCw, Layers } from 'lucide-react'
import { apiService } from '../services/api'
import { UploadArea } from '../components/UploadArea'
import { ClaimCard } from '../components/ClaimCard'
import { ProgressTracker } from '../components/ProgressTracker'

export const Dashboard = () => {
  // App States
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [statusLog, setStatusLog] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Statistics
  const totalClaims = results.length
  const verifiedCount = results.filter(r => r.status === 'VERIFIED').length
  const inaccurateCount = results.filter(r => r.status === 'INACCURATE').length
  const falseCount = results.filter(r => r.status === 'FALSE').length
  
  // Calculate accuracy index
  const accuracyIndex = totalClaims > 0 
    ? Math.round(((verifiedCount + (inaccurateCount * 0.5)) / totalClaims) * 100) 
    : 0

  const handleFileSelected = async (selectedFile) => {
    setFile(selectedFile)
    setIsLoading(true)
    setError(null)
    setPipelineStep(0)
    setStatusLog("Uploading file to extraction layer...")

    try {
      // Step 1: Upload PDF and extract text
      const uploadRes = await apiService.uploadPdf(selectedFile, (progress) => {
        setUploadProgress(progress)
      })
      
      setPipelineStep(1)
      setStatusLog(`Parsing complete. Extracted ${uploadRes.char_count} characters. Querying claims parser...`)
      
      // Step 2: Extract claims from the text
      const claimsRes = await apiService.extractClaims(uploadRes.text)
      
      if (!claimsRes.claims || claimsRes.claims.length === 0) {
        throw new Error("No verifiable claims (stats, dates, financials) found in the document.")
      }
      
      setPipelineStep(2)
      setStatusLog(`Extracted ${claimsRes.claims.length} factual assertions. Initializing live search queries...`)
      
      // Step 3: Verify the extracted claims
      setPipelineStep(3)
      setStatusLog("Verifying claims against Tavily live search resources. This may take a few moments...")
      
      const verifyRes = await apiService.verifyClaims(claimsRes.claims)
      
      setPipelineStep(4)
      setStatusLog("Fact-check aligned. Preparing reports dashboard...")
      setResults(verifyRes.results || [])
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      
      // Safely serialize raw API validation error details as strings to prevent React child object rendering crashes
      const rawError = err.response?.data?.detail;
      let errorMsg = "";
      if (typeof rawError === 'string') {
        errorMsg = rawError;
      } else if (Array.isArray(rawError)) {
        // FastAPI returns validation errors as list objects
        errorMsg = rawError.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
      } else if (rawError && typeof rawError === 'object') {
        errorMsg = JSON.stringify(rawError);
      } else {
        errorMsg = err.response?.data?.message || err.message || "An unexpected error occurred during processing.";
      }
      
      setError(errorMsg)
      setIsLoading(false)
      setFile(null)
    }
  }

  const handleReset = () => {
    setFile(null)
    setResults([])
    setPipelineStep(0)
    setUploadProgress(0)
    setError(null)
    setSearchQuery('')
    setActiveFilter('ALL')
  }

  // Filters results based on badges and search box queries
  const filteredResults = results.filter(res => {
    const matchesFilter = activeFilter === 'ALL' || res.status === activeFilter
    const matchesSearch = res.claim.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.type.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen pb-20 pt-10 px-4 md:px-8 max-w-7xl mx-auto flex flex-col justify-between">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-900/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <header className="mb-12 text-center relative flex flex-col items-center">
        <div className="flex items-center space-x-2 text-brand-teal mb-3 bg-brand-teal/5 border border-brand-teal/15 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase select-none">
          <Layers size={14} className="animate-pulse" />
          <span>TruthLayer AI</span>
        </div>
        <h1 className="text-gradient text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
          Automated Fact-Checking
        </h1>
        <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
          Verify marketing and business PDFs against live web data in real-time. 
          Identify intentional lies, outdated figures, and hallucinated statistics.
        </p>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!file && !isLoading && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <UploadArea 
                onFileSelected={handleFileSelected} 
                isLoading={isLoading} 
                uploadProgress={uploadProgress}
                error={error}
              />
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10"
            >
              <ProgressTracker 
                currentStep={pipelineStep} 
                statusLog={statusLog} 
              />
            </motion.div>
          )}

          {results.length > 0 && !isLoading && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {/* Reset Navigation Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={handleReset}
                    className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-brand-teal transition-colors font-medium border border-slate-800 bg-navy-900/60 hover:border-brand-teal/40 px-3.5 py-2 rounded-xl"
                  >
                    <ArrowLeft size={14} />
                    <span>Upload New</span>
                  </button>
                  <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
                    File: {file?.name || 'document.pdf'}
                  </span>
                </div>

                <button 
                  onClick={() => handleFileSelected(file)}
                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-brand-teal transition-colors font-medium border border-slate-800 bg-navy-900/60 hover:border-brand-teal/40 px-3.5 py-2 rounded-xl"
                >
                  <RefreshCw size={12} />
                  <span>Re-Verify</span>
                </button>
              </div>

              {/* KPI metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {/* Accuracy Score */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border-brand-teal/20 shadow-[0_0_20px_rgba(20,184,166,0.02)]">
                  <span className="text-[10px] uppercase font-bold text-brand-teal tracking-wider">
                    Accuracy Index
                  </span>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-extrabold text-slate-100">{accuracyIndex}</span>
                    <span className="text-sm font-semibold text-slate-500">%</span>
                  </div>
                </div>

                {/* Total claims */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Claims
                  </span>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-extrabold text-slate-100">{totalClaims}</span>
                  </div>
                </div>

                {/* Verified */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider flex items-center space-x-1">
                    <CheckCircle size={10} />
                    <span>Verified</span>
                  </span>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-extrabold text-emerald-400">{verifiedCount}</span>
                  </div>
                </div>

                {/* Inaccurate */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center space-x-1">
                    <ShieldAlert size={10} />
                    <span>Inaccurate</span>
                  </span>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-extrabold text-amber-400">{inaccurateCount}</span>
                  </div>
                </div>

                {/* False */}
                <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider flex items-center space-x-1">
                    <ShieldAlert size={10} />
                    <span>False</span>
                  </span>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-extrabold text-rose-400">{falseCount}</span>
                  </div>
                </div>
              </div>

              {/* Filters and Search toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                {/* Filter pills */}
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'VERIFIED', 'INACCURATE', 'FALSE'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                        activeFilter === filter
                          ? 'bg-brand-teal text-navy-950 border-brand-teal shadow-[0_0_15px_rgba(20,184,166,0.25)]'
                          : 'bg-navy-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Search query input */}
                <input 
                  type="text"
                  placeholder="Search claims or parameters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-navy-900/60 border border-slate-800 hover:border-slate-700 focus:border-brand-teal/50 focus:outline-none focus:ring-1 focus:ring-brand-teal/30 px-4 py-1.5 rounded-xl text-sm text-slate-200 placeholder-slate-500 w-full sm:max-w-xs transition-all duration-200"
                />
              </div>

              {/* Claims List container */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredResults.map((result, idx) => (
                    <ClaimCard 
                      key={idx} 
                      result={result} 
                      index={idx} 
                    />
                  ))}

                  {filteredResults.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="glass-panel border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3"
                    >
                      <HelpCircle size={32} className="text-slate-500" />
                      <p className="text-slate-300 font-medium">No reports matched filters</p>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Try modifying search query filters or resetting parameters.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright */}
      <footer className="mt-12 text-center text-xs text-slate-600 font-mono">
        <p>TruthLayer AI © {new Date().getFullYear()} • Secure Fact Verification Agent</p>
      </footer>
    </div>
  )
}
