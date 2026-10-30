/**
 * pages/What.jsx - the concrete surface: the four factory verbs and the
 * truth battery. Deep reference lives in docs/verbs.md.
 */
import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta.js'

const SITE_URL = 'https://monoforge.creadev.org'

export default function What() {
  usePageMeta({
    siteUrl: SITE_URL,
    path: '/what',
    title: 'What | monoforge',
    description:
      'One zero-dependency factory: stamp a repo from proven blocks, doctor it against the truth battery, cut a component family, and lock the green tree with a checksum.',
  })
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">what</p>
          <h1>
            Four verbs, <span className="accent">one truth battery.</span>
          </h1>
          <p className="lede">
            monoforge is a zero-dependency CLI. You describe the repo in
            <code> factory.json</code>, and the factory stamps the blocks,
            doctors the result, and locks the green tree.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/packs">The pack surface</Link>
            <a className="btn btn-ghost" href="https://docs.creadev.org/monoforge/verbs/">Verb reference</a>
            <a className="btn btn-ghost" href="https://github.com/dhaupin/monoforge">See the repo</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">The verbs</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            Stamp, doctor, lock, cut.
          </p>
          <pre className="code"><span className="cm"># stamp template blocks + fill tokens, never the truth</span>{'\n'}<span className="k">monoforge</span> <span className="k">new</span> ./my-tool{'\n'}{'\n'}<span className="cm"># the truth battery: refuses FORGE-TODO, broken gates, dash law</span>{'\n'}<span className="k">monoforge</span> <span className="k">doctor</span> ./my-tool{'\n'}{'\n'}<span className="cm"># doctor must pass, then archive + checksum</span>{'\n'}<span className="k">monoforge</span> <span className="k">lock</span> ./my-tool{'\n'}{'\n'}<span className="cm"># release cuts: components/&lt;name&gt;/ from a living lib</span>{'\n'}<span className="k">monoforge</span> <span className="k">cut</span> ./family</pre>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">What the doctor checks</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            The doctor runs the same battery the fleet reads: the test lane, the
            docs gates, the release ladder, and the dash law. An unfilled{' '}
            <code>FORGE-TODO</code> slot fails by name, and a broken gate fails
            rather than warns.
          </p>
          <p className="lede" style={{ marginTop: 8 }}>
            The <code>cut</code> verb stamps a component-family workspace from a
            living lib per <code>cutlist.json</code>: intra-graph requires are
            rewritten to scoped deps, and an unmapped internal dependency
            refuses. Shortfall lazies must be declared and ship as documented
            call-site degrades.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Where it sits</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            monoforge is the factory the struct family stamps from: the blocks
            carry the docs system, the workflows, and the release ladder every
            member shares, so a new repo inherits the gates from birth instead
            of re-deriving them. The blocks come from proven instances -{' '}
            <a href="https://github.com/dhaupin/poststruct">poststruct</a> and{' '}
            <a href="https://github.com/dhaupin/packstruct">packstruct</a> - never
            from aspiration.
          </p>
          <p style={{ marginTop: 22 }}>
            <Link to="/about" className="btn btn-ghost">Next: about the project</Link>
          </p>
        </div>
      </section>
    </>
  )
}
