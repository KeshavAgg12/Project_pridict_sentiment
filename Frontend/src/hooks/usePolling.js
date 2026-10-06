import { useCallback, useEffect, useState } from 'react'

export default function usePolling(fetcher, intervalMs = 60000) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [updated, setUpdated] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setData(await fetcher())
      setError('')
      setUpdated(new Date())
    } catch (e) {
      setError(e.message)
    }
  }, [fetcher])

  useEffect(() => {
    refresh()
    const id = setInterval(refresh, intervalMs)
    return () => clearInterval(id)
  }, [refresh, intervalMs])

  return { data, error, updated, refresh }
}
