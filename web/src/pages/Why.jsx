/**
 * pages/Why.jsx - why monoforge exists: stamping a fleet repo by hand is how
 * a placeholder ships as a lie. Shell conventions kept (usePageMeta in the
 * component body, .code tokens shared with the docs Rouge output).
 */
import { Link } from 'react-router-dom'
import usePageMeta from '../hooks/usePageMeta.js'

const SITE_URL = 'https://monoforge.creadev.org'

export default function Why() {
  usePageMeta({
    siteUrl: SITE_URL,
    path: '/why',
    title: 'Why | monoforge',
    description:
      'Generated green is never shipped. Why a factory repo must refuse unfilled slots instead of warning, and why stamped blocks come only from instances already proven.',
  })
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">why</p>
          <h1>
            A shipped placeholder <span className="accent">is a shipped lie.</span>
          </h1>
          <p className="lede">
            Every new repo in a fleet starts the same way: copy the last one,
            rename what you remember, and hope you renamed the rest. The parts
            you forgot do not fail loudly. They ship as a placeholder that
            reads as truth.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/what">What monoforge is</Link>
            <a className="btn btn-ghost" href="https://docs.creadev.org/monoforge/">Read the docs</a>
            <a className="btn btn-ghost" href="https://github.com/dhaupin/monoforge">See the repo</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">The problem: copy-and-hope</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            A fleet repo carries a lot of truth: a docs system, workflows, a
            release ladder, gates. Copying one by hand carries the truth and
            the residue together. The residue is the unfilled slot, the stale
            name, the gate that was never wired, and none of it fails the build
            because it was never checked.
          </p>
          <p className="lede" style={{ marginTop: 8 }}>
            The fix is not a better checklist. A checklist is the thing that
            already failed. The fix is a stamp layer that carries only what two
            proven instances already validated, and a doctor that treats an
            unfilled slot as a failure rather than a warning.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">The thesis: generated green is never shipped</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            The stamp layer carries only what two proven instances already
            validated - the rule of three: a block lands when a second real
            instance needs it. Nothing speculative rides a fresh repo, so there
            is no unproven block to drift.
          </p>
          <p className="lede" style={{ marginTop: 8 }}>
            The doctor runs the same truth battery the fleet reads, and an
            unfilled <code>FORGE-TODO</code> slot is a failure, not a warning.
            A doctor that warns into green is politeness theater; monoforge
            refuses nameably so a placeholder can never ship as truth.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="section-title">Who it is for</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            Anyone growing a fleet of repos that must agree about themselves:
            the maintainer stamping the next member, the CI that has to prove
            every stamped repo carries the same gates, and the agent that has
            to stand up a new repo without hand-copying the last one.
          </p>
          <p style={{ marginTop: 22 }}>
            <Link to="/what" className="btn btn-ghost">Next: what monoforge is</Link>
          </p>
        </div>
      </section>
    </>
  )
}
