import { useMemo } from 'react'
import { useProductsByHandle } from '../hooks/useProductsByHandle'
import { Lookbook } from './Lookbook'

// Maximum number of lookbooks to render per section.
// On the PDP this caps auto-matched lookbooks at 2.
const MAX_VISIBLE_LOOKBOOKS = 2

/**
 * Top-level component for a lookbook section.
 * Reads the config injected by Liquid, fetches all required products
 * in a single Storefront API request, then renders each lookbook.
 *
 * @param {object}   props
 * @param {object[]} props.lookbooks - Array of lookbook metaobject data from Liquid
 * @param {object}   props.settings  - Section settings from Liquid
 * @param {object}   props.context   - { country, language, locale, rootUrl }
 * @param {object}   props.api       - { domain, token, version }
 */
export function Lookbooks({ lookbooks, settings, context, api }) {
  const { country, language, locale, rootUrl } = context
  const { domain, token, version } = api

  // Sort by priority descending. Stable sort preserves admin order as tiebreak.
  // Slice to cap the number of visible lookbooks.
  const visibleLookbooks = useMemo(() => {
    return [...lookbooks]
      .sort((a, b) => b.priority - a.priority)
      .slice(0, MAX_VISIBLE_LOOKBOOKS)
  }, [lookbooks])

  // De-dupe handles across all visible lookbooks so we make one fetch
  // with no duplicate requests, even if a product appears in multiple lookbooks.
  const allHandles = useMemo(() => {
    const seen = new Set()
    return visibleLookbooks
      .flatMap((lb) => lb.product_handles)
      .filter((handle) => {
        if (seen.has(handle)) return false
        seen.add(handle)
        return true
      })
  }, [visibleLookbooks])

  const { products, loading, error } = useProductsByHandle({
    handles: allHandles,
    country,
    language,
    domain,
    token,
    version,
  })

  // Hide the section silently on error — don't show broken UI to shoppers
  if (error) return null
  if (loading) return <div className="lookbook-section__loading" aria-busy="true" />

  return (
    <div className="lookbook-section">
      {visibleLookbooks.map((lookbook) => (
        <Lookbook
          key={lookbook.handle}
          lookbook={lookbook}
          products={products}
          settings={settings}
          locale={locale}
          rootUrl={rootUrl}
        />
      ))}
    </div>
  )
}
