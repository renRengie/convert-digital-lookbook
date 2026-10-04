import { createRoot } from 'react-dom/client'
import { Lookbooks } from './components/Lookbooks'
import './lookbook.css'

// Guard against double execution if the script tag is rendered more than once
if (!window.__LOOKBOOK_INITIALISED__) {
  window.__LOOKBOOK_INITIALISED__ = true

  // Track React roots so we can unmount them when the Theme Customiser
  // removes or reloads a section (shopify:section:unload / shopify:section:load)
  const roots = new WeakMap()

  function mountSection(section) {
    const configEl = section.querySelector('[data-lookbook-config]')
    const rootEl = section.querySelector('[data-lookbook-root]')

    if (!configEl || !rootEl) return

    let config
    try {
      config = JSON.parse(configEl.textContent)
    } catch (e) {
      console.error('[Lookbook] Failed to parse config:', e)
      return
    }

    const root = createRoot(rootEl)
    roots.set(rootEl, root)

    root.render(
      <Lookbooks
        lookbooks={config.lookbooks}
        settings={config.settings}
        context={config.context}
        api={config.api}
      />
    )
  }

  function unmountSection(section) {
    const rootEl = section.querySelector('[data-lookbook-root]')
    if (!rootEl) return

    const root = roots.get(rootEl)
    if (root) {
      root.unmount()
      roots.delete(rootEl)
    }
  }

  // Mount all lookbook sections on initial page load
  document.querySelectorAll('[data-lookbook-section]').forEach(mountSection)

  // Handle Theme Customiser live editing — sections can be added,
  // removed, or reloaded without a full page refresh
  document.addEventListener('shopify:section:load', (event) => {
    const section = event.target.querySelector('[data-lookbook-section]')
    if (section) mountSection(section)
  })

  document.addEventListener('shopify:section:unload', (event) => {
    const section = event.target.querySelector('[data-lookbook-section]')
    if (section) unmountSection(section)
  })
}
