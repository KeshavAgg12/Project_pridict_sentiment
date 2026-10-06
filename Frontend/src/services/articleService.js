import { request } from './apiClient'

export async function getLatestArticles() {
  const d = await request('/articles/latest')
  return Array.isArray(d) ? d : d?.rows ?? d?.articles ?? []
}
