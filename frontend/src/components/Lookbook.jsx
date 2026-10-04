import { ProductCard } from './ProductCard'

/**
 * Renders a single lookbook — its heading, optional description,
 * and a grid of product cards.
 * Skips any product handles that returned null (unpublished, deleted, or typo).
 *
 * @param {object}   props
 * @param {object}   props.lookbook       - Lookbook metaobject data from Liquid
 * @param {object}   props.products       - Map of { handle: productData | null }
 * @param {object}   props.settings       - Section settings from Liquid
 * @param {string}   props.locale         - BCP 47 locale string (e.g. 'en-AU', 'ja-JP')
 * @param {string}   props.rootUrl        - From routes.root_url
 */
export function Lookbook({ lookbook, products, settings, locale, rootUrl }) {
  const { title, description, product_handles } = lookbook
  const {
    show_description,
    layout,
    columns_desktop,
    columns_mobile,
    show_compare_at,
  } = settings

  // Filter out handles that didn't resolve to a product
  const resolvedProducts = product_handles
    .filter((handle) => products[handle] != null)
    .map((handle) => products[handle])

  if (resolvedProducts.length === 0) return null

  return (
    <div className="lookbook">
      <div className="lookbook__header">
        <h2 className="lookbook__title">{title}</h2>
        {show_description && description && (
          <p className="lookbook__description">{description}</p>
        )}
      </div>

      <ul
        className={`lookbook__grid lookbook__grid--${layout}`}
        style={{
          '--columns-desktop': columns_desktop,
          '--columns-mobile': columns_mobile,
        }}
      >
        {resolvedProducts.map((product) => (
          <li key={product.handle} className="lookbook__item">
            <ProductCard
              product={product}
              showCompareAt={show_compare_at}
              locale={locale}
              rootUrl={rootUrl}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
