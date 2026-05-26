import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { UploadCloud, FileText, AlertCircle, RefreshCw } from 'lucide-react'

export const UploadArea = ({ onFileSelected, isLoading, uploadProgress, error }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0])
    }
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isLoading
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        {...getRootProps()}
        className={`glass-panel rounded-2xl p-10 cursor-pointer border-2 border-dashed text-center flex flex-col items-center justify-center min-h-[300px] transition-all duration-300 relative overflow-hidden ${
          isDragActive 
            ? 'border-brand-teal bg-navy-900/60 shadow-[0_0_30px_rgba(20,184,166,0.15)]' 
            : 'border-slate-800 hover:border-brand-teal/40'
        }`}
        whileHover={{ scale: isLoading ? 1 : 1.01 }}
        whileTap={{ scale: isLoading ? 1 : 0.99 }}
      >
        <input {...getInputProps()} />

        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand-teal/5 blur-[80px] rounded-full pointer-events-none" />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-4 w-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="text-brand-teal"
            >
              <RefreshCw size={48} />
            </motion.div>
            
            <div className="space-y-2 w-full max-w-xs">
              <p className="text-slate-300 font-medium text-lg">Parsing trap matrices...</p>
              <div className="h-1.5 w-full bg-navy-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-brand-teal rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-brand-teal font-semibold text-right">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={isDragActive ? { y: -10 } : { y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className={`p-4 rounded-full bg-navy-800/80 border ${
                isDragActive ? 'border-brand-teal text-brand-teal shadow-[0_0_20px_rgba(20,184,166,0.1)]' : 'border-slate-800 text-slate-400'
              }`}
            >
              <UploadCloud size={40} />
            </motion.div>

            <div className="space-y-1">
              <p className="text-slate-200 font-medium text-lg">
                {isDragActive ? "Drop the PDF here" : "Upload marketing or business PDF"}
              </p>
              <p className="text-sm text-slate-400 max-w-md">
                Drag and drop your document here, or click to browse files. Supports PDF formats up to 20MB.
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-navy-900/60 px-3 py-1.5 rounded-full border border-slate-800/80">
              <FileText size={12} />
              <span>Only PDF documents are verified</span>
            </div>
          </div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center space-x-2 text-red-400 text-sm bg-red-950/40 border border-red-900/50 px-4 py-2.5 rounded-xl max-w-md"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-left font-medium">{error}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
