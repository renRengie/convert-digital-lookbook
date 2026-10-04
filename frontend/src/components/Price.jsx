/**
 * Renders a product price, and optionally a compare-at price.
 * Uses Intl.NumberFormat to handle currency formatting per locale —
 * this correctly renders JPY with no decimal places and AUD with two.
 *
 * @param {object} props
 * @param {{ amount: string, currencyCode: string }} props.price
 * @param {{ amount: string, currencyCode: string } | null} props.compareAtPrice
 * @param {boolean} props.showCompareAt - controlled by section setting
 * @param {string}  props.locale        - e.g. 'en-AU', 'ja-JP'
 */
export function Price({ price, compareAtPrice, showCompareAt, locale }) {
  const hasDiscount =
    showCompareAt &&
    compareAtPrice &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount)

  return (
    <div className="lookbook-price">
      <span className={`lookbook-price__current${hasDiscount ? ' lookbook-price__current--sale' : ''}`}>
        {formatMoney(price.amount, price.currencyCode, locale)}
      </span>

      {hasDiscount && (
        <span className="lookbook-price__compare">
          {formatMoney(compareAtPrice.amount, compareAtPrice.currencyCode, locale)}
        </span>
      )}
    </div>
  )
}

/**
 * Formats a money amount using the browser's Intl.NumberFormat API.
 * Automatically handles currency-specific decimal rules (e.g. JPY = 0 decimals).
 *
 * @param {string} amount       - Raw amount string from Storefront API (e.g. '29.99')
 * @param {string} currencyCode - ISO 4217 currency code (e.g. 'AUD', 'JPY')
 * @param {string} locale       - BCP 47 locale string (e.g. 'en-AU', 'ja-JP')
 * @returns {string}
 */
function formatMoney(amount, currencyCode, locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount))
}
