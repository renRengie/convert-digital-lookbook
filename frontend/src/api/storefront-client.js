/**
 * Sends a GraphQL request to Shopify's Storefront API.
 *
 * @param {object} params
 * @param {string} params.domain   - The store's permanent domain (shop.permanent_domain)
 * @param {string} params.token    - Storefront API public access token
 * @param {string} params.version  - API version (e.g. '2025-01')
 * @param {string} params.query    - GraphQL query string
 * @param {object} params.variables - GraphQL variables
 * @returns {Promise<object>} Parsed JSON response data
 */
async function storefrontFetch({ domain, token, version, query, variables }) {
  const url = `https://${domain}/api/${version}/graphql.json`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Storefront API request failed: ${response.status} ${response.statusText}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Storefront API errors: ${json.errors.map((e) => e.message).join(', ')}`)
  }

  return json.data
}

/**
 * Fetches multiple products by handle in a single aliased GraphQL query.
 * The Storefront API has no batch-by-handle endpoint, so we alias each product
 * lookup as product0, product1, etc. and resolve them in one request.
 *
 * @param {object} params
 * @param {string[]} params.handles  - Array of product handles to fetch
 * @param {string}   params.country  - ISO country code for market-specific pricing (e.g. 'AU', 'JP')
 * @param {string}   params.language - ISO language code (e.g. 'EN', 'JA')
 * @param {string}   params.domain
 * @param {string}   params.token
 * @param {string}   params.version
 * @returns {Promise<{ [handle: string]: object | null }>} Map of handle to product data
 */
export async function fetchProductsByHandle({ handles, country, language, domain, token, version }) {
  if (!handles.length) return {}

  const { query, variables } = buildAliasedQuery({ handles, country, language })

  const data = await storefrontFetch({ domain, token, version, query, variables })

  // Remap aliased keys (product0, product1, ...) back to their original handles
  return handles.reduce((acc, handle, index) => {
    acc[handle] = data[`product${index}`] ?? null
    return acc
  }, {})
}

/**
 * Builds a single GraphQL query that fetches multiple products by handle
 * using field aliases, since the Storefront API only supports one product
 * lookup per field name.
 */
function buildAliasedQuery({ handles, country, language }) {
  const aliases = handles
    .map(
      (_handle, index) => `
      product${index}: product(handle: $handle${index}) {
        ...LookbookProductCard
      }`
    )
    .join('\n')

  const variableDefinitions = handles
    .map((_, index) => `$handle${index}: String!`)
    .join(', ')

  const query = `
    query LookbookProducts(${variableDefinitions}, $country: CountryCode!, $language: LanguageCode!)
    @inContext(country: $country, language: $language) {
      ${aliases}
    }

    fragment LookbookProductCard on Product {
      handle
      title
      featuredImage {
        url
        altText
      }
      selectedOrFirstAvailableVariant {
        availableForSale
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  `

  const variables = handles.reduce(
    (acc, handle, index) => {
      acc[`handle${index}`] = handle
      return acc
    },
    { country, language }
  )

  return { query, variables }
}
