import { Link } from "wouter";
import { PageIntro, usePageMeta } from "@/components/SiteLayout";

export default function About() {
  usePageMeta(
    "About MONTYX RECORDS — Independent Electronic Music",
    "The mission and independent approach of MONTYX RECORDS, a developing electronic music label based in Nepal."
  );
  return (
    <main>
      <PageIntro
        kicker="THE LABEL"
        title="Built independently.\nDriven by sound."
        intro="MONTYX RECORDS is an independent label from Nepal focused on original electronic music and a clear, lasting identity."
      />
      <section className="about-story content-width">
        <div className="story-index">
          <span className="eyebrow red">01 / OUR APPROACH</span>
          <span className="story-rule" />
        </div>
        <div className="story-copy">
          <h2>Start with the sound. Build with intention.</h2>
          <p>
            We’re developing a home for original music that moves between
            Brazilian Funk, Phonk and electronic forms. Each release adds a new
            piece to the label’s identity—without chasing numbers or borrowed
            aesthetics.
          </p>
          <p>
            MONTYX RECORDS is independent by design. We keep a professional
            presence across digital platforms and make space for artists to
            define their own work.
          </p>
          <p className="founder-credit"><span className="eyebrow">FOUNDER</span><br />Prabesh</p>
        </div>
      </section>
      <section className="about-values content-width">
        <article>
          <span>01</span>
          <h3>Independent</h3>
          <p>Built with a long view and a distinct point of view.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Electronic</h3>
          <p>Rhythm-forward sounds across scenes and influences.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Artist-first</h3>
          <p>
            Master ownership stays with artists unless a separate written
            agreement says otherwise.
          </p>
        </article>
      </section>
      <section className="about-close content-width">
        <span className="eyebrow">MONTYX RECORDS · NEPAL</span>
        <h2>A label in motion.</h2>
        <Link href="/releases" className="button button-primary">
          Explore releases ↗
        </Link>
      </section>
    </main>
  );
}
