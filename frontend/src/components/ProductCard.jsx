import { Price } from './Price'

/**
 * Renders a single product card within a lookbook.
 * Product URLs use rootUrl so they respect the active market subfolder
 * (e.g. /en-au/products/my-product vs /en-jp/products/my-product).
 *
 * @param {object} props
 * @param {object} props.product        - Product data from Storefront API
 * @param {boolean} props.showCompareAt - Controlled by section setting
 * @param {string}  props.locale        - BCP 47 locale string (e.g. 'en-AU', 'ja-JP')
 * @param {string}  props.rootUrl       - From routes.root_url, preserves market subfolder
 */
export function ProductCard({ product, showCompareAt, locale, rootUrl }) {
  const { handle, title, featuredImage, selectedOrFirstAvailableVariant } = product
  const variant = selectedOrFirstAvailableVariant

  return (
    <a
      href={`${rootUrl}products/${handle}`}
      className="lookbook-product-card"
    >
      <div className="lookbook-product-card__image-wrapper">
        {featuredImage ? (
          <img
            src={featuredImage.url}
            alt={featuredImage.altText ?? title}
            className="lookbook-product-card__image"
            loading="lazy"
          />
        ) : (
          <div className="lookbook-product-card__image-placeholder" />
        )}
      </div>

      <div className="lookbook-product-card__info">
        <p className="lookbook-product-card__title">{title}</p>

        {variant && (
          <Price
            price={variant.price}
            compareAtPrice={variant.compareAtPrice}
            showCompareAt={showCompareAt}
            locale={locale}
          />
        )}

        {variant && !variant.availableForSale && (
          <p className="lookbook-product-card__sold-out">Sold out</p>
        )}
      </div>
    </a>
  )
}
