/**
 * pages/Status.jsx - the family status page. Same honest-data rule as the
 * family dialect: the island fetches the siblings' served /status.json at
 * load, no server, no guessed numbers. monoforge's own row is served from its
 * own generated /status.json, which this page also links. Refresh to re-read.
 */
import usePageMeta from '../hooks/usePageMeta.js'

const SITE_URL = 'https://monoforge.creadev.org'
const RAW = 'https://github.com/dhaupin/monoforge/blob/main'

export default function Status() {
  usePageMeta({
    siteUrl: SITE_URL,
    path: '/status',
    title: 'Family status | monoforge',
    description:
      'The family-status@1 dialect: every struct-family member serves its verdicts at /status.json, generated on every web build, and reads the others with the same schema.',
  })
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">one dialect, every member</p>
          <h1>
            The family, <span className="accent">one status.</span>
          </h1>
          <p className="lede">
            monoforge serves its own verdicts at <code>/status.json</code>,
            generated from its truth battery (the doctor) and its template
            blocks on every web build. This page reads its own file and the
            family's the way a fresh agent session would - no server, no
            numbers fresher than the commits. Refresh to re-read.
          </p>
          <div className="cta-row">
            <a className="btn btn-ghost" href="/status.json">/status.json</a>
            <a className="btn btn-ghost" href={`${RAW}/templates`}>templates/</a>
            <a className="btn btn-ghost" href="https://github.com/dhaupin/monoforge">See the repo</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>The family, one dialect</h2>
          <p className="sub">
            Every member serves the same status contract: one schema, one fixed
            path, source-derived numbers only.
          </p>
          <pre-island data-pre-island="family-status" data-pre-load="idle">
            <span className="island-loading">Reading the family's served status files...</span>
          </pre-island>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2>What you are looking at</h2>
          <p className="sub">
            Each number is a receipt from a CI leg, not a marketing claim.
          </p>
          <div className="grid">
            <div className="card">
              <h3><span className="glyph">◉</span> the doctor's battery</h3>
              <p>The truth battery (<code>src/doctor.mjs</code>) - the same one
              <code>monoforge doctor</code> runs. A clean battery is PASS; any
              fail turns the leg RED. Generated green is never shipped.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">⇄</span> template blocks</h3>
              <p>The blocks the factory stamps from (<code>templates/*</code>),
              each with its committed file count read from the tree itself. A
              factory that ships no blocks is refused, never served as zero.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">✗</span> one bad sibling</h3>
              <p>A member not serving the dialect yet renders its own honest
              "not serving" row - never a guessed number, never a default PASS.
              One bad sibling degrades only its own row.</p>
            </div>
            <div className="card">
              <h3><span className="glyph">✓</span> fails, ever</h3>
              <p>The only number that should always read 0. If it does not, the
              next CI run is red and the fix comes before any release post cites
              this battery again.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
