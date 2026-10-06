import { request } from './apiClient'

// { rows, correlation, n, totalScored }
export const getDaily = () => request('/daily')
