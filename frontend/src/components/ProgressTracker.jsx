import React from 'react'
import { motion } from 'framer-motion'
import { Check, Loader2 } from 'lucide-react'

export const ProgressTracker = ({ currentStep, totalSteps = 4, statusLog = "" }) => {
  const steps = [
    { title: 'PDF Extraction', desc: 'Parsing structure & isolating raw text blocks' },
    { title: 'Claim Isolation', desc: 'Isolating factual figures and statistics' },
    { title: 'Live Search Sync', desc: 'Querying Tavily engines across web resources' },
    { title: 'Fact-Check Alignment', desc: 'Comparing LLM records with live search citations' }
  ]

  return (
    <div className="w-full max-w-xl mx-auto glass-panel rounded-2xl p-6 border border-slate-800/80">
      <h3 className="text-slate-200 font-medium mb-5 flex items-center space-x-2 text-sm uppercase tracking-wider text-brand-teal">
        <span>Verification Pipeline</span>
      </h3>

      <div className="space-y-6">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isActive = index === currentStep

          return (
            <div key={index} className="flex items-start space-x-4 relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div 
                  className={`absolute left-[15px] top-[32px] bottom-[-24px] w-0.5 transition-all duration-500 ${
                    index < currentStep - 1 ? 'bg-brand-teal' : 'bg-slate-800'
                  }`}
                />
              )}

              {/* Indicator Dot */}
              <div className="shrink-0 z-10">
                {isCompleted ? (
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-brand-teal flex items-center justify-center text-navy-950 font-bold"
                  >
                    <Check size={16} strokeWidth={3} />
                  </motion.div>
                ) : isActive ? (
                  <div className="w-8 h-8 rounded-full bg-navy-900 border-2 border-brand-teal flex items-center justify-center relative shadow-[0_0_15px_rgba(20,184,166,0.3)]">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="text-brand-teal"
                    >
                      <Loader2 size={16} />
                    </motion.div>
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-navy-900 border-2 border-slate-800 flex items-center justify-center text-slate-500 font-bold">
                    <span>{index + 1}</span>
                  </div>
                )}
              </div>

              {/* Step info */}
              <div className="space-y-1">
                <p 
                  className={`font-semibold text-sm transition-colors duration-300 ${
                    isActive ? 'text-brand-teal' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-400 font-normal leading-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {statusLog && (
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <p className="text-left font-mono text-[11px] text-slate-400 bg-navy-950/60 p-2.5 rounded-xl border border-slate-800/60 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-brand-teal font-semibold mr-1">$</span>
            {statusLog}
          </p>
        </div>
      )}
    </div>
  )
}
