const BASE = '/api'

export async function request(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`${path} returned ${res.status}`)
  return res.json()
}
