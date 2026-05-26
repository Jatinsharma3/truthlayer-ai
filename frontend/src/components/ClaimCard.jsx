import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Link as LinkIcon, Compass } from 'lucide-react'

export const ClaimCard = ({ result, index }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { claim, type, status, confidence, explanation, evidence, source } = result

  // Status-specific configuration
  const statusConfig = {
    VERIFIED: {
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: <CheckCircle2 size={16} className="text-emerald-400" />,
      dot: 'bg-emerald-400',
      bgGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.05)] border-emerald-950/20'
    },
    INACCURATE: {
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: <AlertTriangle size={16} className="text-amber-400" />,
      dot: 'bg-amber-400',
      bgGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.05)] border-amber-950/20'
    },
    FALSE: {
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: <XCircle size={16} className="text-rose-400" />,
      dot: 'bg-rose-400',
      bgGlow: 'shadow-[0_0_20px_rgba(239,68,68,0.05)] border-rose-950/20'
    }
  }

  const currentStatus = statusConfig[status] || statusConfig.FALSE

  // SVG Circular progress configurations
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (confidence / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`glass-panel rounded-2xl border ${currentStatus.bgGlow} transition-all duration-300 relative overflow-hidden`}
    >
      <div 
        className="p-5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-4 flex-1">
          {/* Status Icon */}
          <div className="shrink-0">
            {currentStatus.icon}
          </div>

          {/* Claim Text and Type */}
          <div className="space-y-1 pr-4">
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
              {type}
            </span>
            <h4 className="text-slate-200 font-medium text-[15px] leading-relaxed">
              {claim}
            </h4>
          </div>
        </div>

        {/* Right side: Score, Badge & Toggle */}
        <div className="flex items-center space-x-4 shrink-0">
          {/* Confidence Score SVG Meter */}
          <div className="relative flex items-center justify-center w-12 h-12">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                className="stroke-navy-700"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                className={`stroke-brand-teal`}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-[11px] font-bold text-slate-300">
              {confidence}%
            </span>
          </div>

          {/* Status Badge */}
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${currentStatus.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${currentStatus.dot}`} />
            <span>{status}</span>
          </span>

          {/* Toggle Accordion */}
          <button className="text-slate-500 hover:text-slate-300 transition-colors">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expandable Evidence Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden bg-navy-900/40 border-t border-slate-800/80"
          >
            <div className="p-5 space-y-4 text-sm leading-relaxed text-slate-300">
              {/* Fact check explanation */}
              <div className="space-y-1">
                <span className="text-xs text-brand-teal font-semibold uppercase tracking-wider block">
                  Verifier Analysis
                </span>
                <p className="text-slate-300 text-[14px]">
                  {explanation}
                </p>
              </div>

              {/* Verified Web Evidence Quotation */}
              {evidence && (
                <div className="bg-navy-950/80 border border-slate-800 rounded-xl p-3.5 space-y-1 relative">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
                    Extracted Live Search Evidence
                  </span>
                  <p className="text-slate-400 italic font-mono text-xs leading-normal">
                    "{evidence}"
                  </p>
                </div>
              )}

              {/* Evidence Source Link */}
              {source && (
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Compass size={14} className="text-brand-teal shrink-0" />
                    <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      Verified Source Link
                    </span>
                  </div>
                  <a
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-brand-teal hover:text-brand-accent transition-colors font-medium border-b border-brand-teal/20 hover:border-brand-accent"
                  >
                    <span>Visit Reference</span>
                    <LinkIcon size={12} />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
