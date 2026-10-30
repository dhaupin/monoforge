/**
 * ssr.config.js - site identity + route map.
 * Fills the prestruct engine (inject-brand + prerender, via `prestruct build`)
 * with the site's SEO tags and route list. Fill the identity block once; add
 * one entry per Route in AppLayout.jsx.
 */
export default {
  siteUrl:  'https://monoforge.creadev.org',
  siteName: 'monoforge',
  author:   'dhaupin',
  tagline:  'The struct-family factory: stamp fleet repos from proven template blocks, doctor them for truth, lock them verifiably.',
  ogImage:  'https://monoforge.creadev.org/og-image.png',
  keywords: 'monoforge, factory, scaffold, generator, ci, stamp, doctor, lock, struct-family, creadev, prerender, prestruct, cloudflare-pages',

  routes: [
    {
      path: '/',
      priority: '1.0',
      changefreq: 'monthly',
      meta: {
        title: 'monoforge - the fleet factory',
        description: 'Stamp a repo from proven template blocks, doctor it for truth, lock it verifiably. Generated green is never shipped: the doctor refuses unfilled FORGE-TODO slots.',
      },
    },
    {
      path: '/why',
      priority: '0.6',
      changefreq: 'monthly',
      meta: {
        title: 'Why | monoforge',
        description: 'Generated green is never shipped. Why a factory repo must refuse unfilled slots instead of warning, and why stamped blocks come only from instances already proven.',
      },
    },
    {
      path: '/what',
      priority: '0.6',
      changefreq: 'monthly',
      meta: {
        title: 'What | monoforge',
        description: 'One zero-dependency factory: stamp a repo from proven blocks, doctor it against the truth battery, cut a component family, and lock the green tree with a checksum.',
      },
    },
    {
      path: '/about',
      priority: '0.5',
      changefreq: 'monthly',
      meta: {
        title: 'About | monoforge',
        description: 'Who builds monoforge, the struct family it stamps for, and the MIT license and provenance terms.',
      },
    },
    {
      path: '/terms',
      priority: '0.3',
      changefreq: 'yearly',
      meta: {
        title: 'Terms | monoforge',
        description: 'Terms of use for monoforge and this site.'
      },
    },
    {
      path: '/privacy',
      priority: '0.3',
      changefreq: 'yearly',
      meta: {
        title: 'Privacy | monoforge',
        description: 'What this site collects: nothing. No server, no accounts, no hidden states to find.'
      },
    },
    // add more routes per AppLayout.jsx
  ],

  // The static 404 the host serves every miss; the shape + copy match
  // pages/NotFound.jsx so the host-not-found and the hydrate-not-found read
  // as one page, not two.
  notFound: {
    heading: '404',
    body: 'That page does not exist here.',
    primaryCta: { label: 'Back home', href: '/' },
  },
}
