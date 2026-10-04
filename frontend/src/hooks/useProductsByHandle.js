import { useState, useEffect } from 'react'
import { fetchProductsByHandle } from '../api/storefront-client'

/**
 * Fetches multiple Shopify products by handle via the Storefront API.
 * Manages loading, success, and error states.
 * Cancels the fetch if the component unmounts before it completes.
 *
 * @param {object} params
 * @param {string[]} params.handles  - Product handles to fetch
 * @param {string}   params.country  - ISO country code (e.g. 'AU', 'JP')
 * @param {string}   params.language - ISO language code (e.g. 'EN', 'JA')
 * @param {string}   params.domain   - Shopify permanent domain
 * @param {string}   params.token    - Storefront API token
 * @param {string}   params.version  - Storefront API version
 *
 * @returns {{ products: object, loading: boolean, error: string | null }}
 */
export function useProductsByHandle({ handles, country, language, domain, token, version }) {
  const [products, setProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!handles.length) {
      setLoading(false)
      return
    }

    let cancelled = false

    setLoading(true)
    setError(null)

    fetchProductsByHandle({ handles, country, language, domain, token, version })
      .then((data) => {
        if (!cancelled) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[Lookbook] Failed to fetch products:', err)
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [handles.join(','), country, language, domain, token, version])

  return { products, loading, error }
}
