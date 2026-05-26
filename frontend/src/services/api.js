import axios from 'axios'

// In development, the proxy configured in vite.config.js routes '/api' to 'http://localhost:8000'.
// In production, we default to the environment variable or absolute URL where the backend is hosted.
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const apiService = {
  /**
   * Uploads a PDF file to the backend for text extraction.
   */
  uploadPdf: async (file, onUploadProgress) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percentCompleted)
        }
      }
    })
    return response.data
  },

  /**
   * Triggers claim extraction on a block of raw text.
   */
  extractClaims: async (text) => {
    const response = await apiClient.post('/extract-claims', { text })
    return response.data
  },

  /**
   * Verifies claims using search engines and LLM evaluation.
   */
  verifyClaims: async (claims) => {
    const response = await apiClient.post('/verify', { claims })
    return response.data
  }
}
