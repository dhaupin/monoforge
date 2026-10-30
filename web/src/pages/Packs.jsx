/**
 * pages/Packs.jsx - the extension surface. monoforge carries no packs of its
 * own yet (the factory PRD's rule of three), so this page states the contract
 * the family already agreed on and where packs run today, the way eyestruct's
 * packs page does. The deep grammar lives in the docs packs page and the
 * family SPEC at dhaupin/packstruct.
 */
import usePageMeta from '../hooks/usePageMeta.js'

const SITE_URL = 'https://monoforge.creadev.org'
const DOCS = 'https://docs.creadev.org/monoforge'
const RAW = 'https://github.com/dhaupin/monoforge/blob/main'

export default function Packs() {
  usePageMeta({
    siteUrl: SITE_URL,
    path: '/packs',
    title: 'Packs | monoforge',
    description:
      'monoforge carries no packs of its own yet, deliberately: a pack lands when a failure class does. This page states the family pack contract and where packs run today.',
  })
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">packs</p>
          <h1>
            Opt-in by construction, <span className="accent">refused when it does not fit.</span>
          </h1>
          <p className="lede">
            A pack is a self-contained bundle that loads into a host's runner,
            uses the host's real surface as its vocabulary, and proves the
            contract it claims to enforce. monoforge carries no packs of its
            own yet, deliberately - the factory's rule of three holds until a
            second real provider appears. This page states the contract the
            family already agreed on.
          </p>
          <div className="cta-row">
            <a className="btn btn-primary" href={`${DOCS}/packs/`}>Full pack contract</a>
            <a className="btn btn-ghost" href="#family">Where packs run today</a>
            <a className="btn btn-ghost" href="https://github.com/dhaupin/packstruct">packstruct</a>
          </div>
        </div>
      </section>

      <section className="section" id="shapes">
        <div className="wrap">
          <h2>The two pack shapes</h2>
          <p className="sub">
            The same SPEC v1 manifest grammar (kebab name, schemaVersion 1,
            relative entry) the whole family loads, in two roles.
          </p>
          <div className="section-split">
            <div className="split-card">
              <h3>Check-profile packs</h3>
              <p>The audits. The doctor's truth battery stays in monoforge;
              organization- or client-voice checks load from
              <code> packs/public/&lt;name&gt;/</code> entries exporting
              <code>{'{checks: [...]}'}</code> - the same <code>run(ctx)</code>
              contract the family legs already run through
              <code> packstruct lint --deep</code> and
              <code> audit-conformance</code>.</p>
            </div>
            <div className="split-card">
              <h3>Scenario-profile packs</h3>
              <p>The adversarial tests. A stamp's or a cut's acceptance
              surface gets its own crashtest lane - attacking generated output
              the way <code>packstruct-lint-shapes</code> attacks the linter:
              in-process, verdict records, refuse-never-fail. Stub manifests,
              fake entries, and falsely green truth slots are the threat class
              the doctor's stamp-manifest scoping exists to catch.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="family">
        <div className="wrap">
          <h2>Where packs run today</h2>
          <p className="sub">
            The struct siblings carry working pack batteries and the factory's
            mount inherits the same SPEC. Every row is a real, committed lane,
            not a plan.
          </p>
          <div className="table-wrap">
            <table className="attacks">
              <thead>
                <tr><th>member</th><th>packs</th><th>status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td className="mod">packstruct</td>
                  <td><span className="what">packstruct-lint-shapes</span>
                  <div className="why">the lint contract under a hostile
                  manifest corpus, via an in-process double</div></td>
                  <td><span className="shipped">carried</span></td>
                </tr>
                <tr>
                  <td className="mod">poststruct</td>
                  <td><span className="what">eyes-reference</span> + eleven
                  ecosystem shape packs<div className="why">baked-site checks
                  per build shape (prestruct, freestruct, Jekyll, WordPress,
                  Astro, Eleventy, Gatsby, Hugo, Liquid, eyestruct)</div></td>
                  <td><span className="shipped">carried</span></td>
                </tr>
                <tr>
                  <td className="mod">eyestruct</td>
                  <td><span className="what">eye-shapes, eye-text-leg,
                  eye-ci-gate</span><div className="why">the capture and
                  canon lanes, linted and conformance-checked through
                  packstruct 1.0.0, exact-pinned in its own lock</div></td>
                  <td><span className="shipped">carried</span></td>
                </tr>
                <tr>
                  <td className="mod">govstruct</td>
                  <td><span className="what">ten check-profile packs + the
                  govstruct-manifest-shapes lane</span><div className="why">the
                  source-consistency profile over its own tree, plus hostile
                  member blocks over <code>govstruct lint</code></div></td>
                  <td><span className="shipped">carried</span></td>
                </tr>
                <tr>
                  <td className="mod">crashtest</td>
                  <td><span className="what">the dogfood lanes</span>
                  <div className="why">each member's <code>crashtest.config.js</code>
                  drives an in-process double over the host's own lint
                  contract</div></td>
                  <td><span className="shipped">carried</span></td>
                </tr>
                <tr>
                  <td className="mod">monoforge</td>
                  <td><span className="what">none yet</span>
                  <div className="why">the rule of three: a pack lands when a
                  second real provider or a first real client pack appears,
                  not before</div></td>
                  <td><span className="verdict-mid">queued</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="sub">
            Each member's manifests are linted once, at load, by the same rules
            <code> packstruct lint --deep</code> reports, so a pack that fails
            lint cannot quietly run. See
            <a href={`${DOCS}/packs/`}> the docs packs page</a> for the fitting
            law and the authoring contract.
          </p>
        </div>
      </section>

      <section className="section" id="fitting">
        <div className="wrap">
          <h2>The fitting law</h2>
          <p className="sub">
            Packs are opt-in by construction. A pack applies when the host's
            own config enumerates it - monoforge never reads a pack because it
            exists on disk, and a pack that does not fit the stamped shape is
            refused, never silently bent.
          </p>
          <pre className="code"><span className="cm"># lint a packdir's manifest grammar (packstruct)</span>{'\n'}<span className="k">npx</span> packstruct lint packs/ <span className="k">--deep</span>{'\n\n'}<span className="cm"># audit a pack battery against the family runner shape</span>{'\n'}<span className="k">npx</span> packstruct audit-conformance .</pre>
          <div className="cta-row">
            <a className="btn btn-primary" href={`${DOCS}/packs/`}>Read the contract</a>
            <a className="btn btn-ghost" href="https://github.com/dhaupin/packstruct">packstruct</a>
            <a className="btn btn-ghost" href={`${RAW}/docs/packs.md`}>docs/packs.md</a>
          </div>
        </div>
      </section>
    </>
  )
}
