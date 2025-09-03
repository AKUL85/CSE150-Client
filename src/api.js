import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export const submitReport = (payload) => axios.post(`${API_BASE}/api/submit`, payload)
export const getReports = () => axios.get(`${API_BASE}/api/reports`)
export const getStats = () => axios.get(`${API_BASE}/api/stats`)
export const health = () => axios.get(`${API_BASE}/api/health`)
