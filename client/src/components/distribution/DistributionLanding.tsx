import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  siApplemusic,
  siAudiomack,
  siBeatport,
  siDeezer,
  siFacebook,
  siIheartradio,
  siInstagram,
  siMixcloud,
  siNapster,
  siPandora,
  siSoundcloud,
  siSpotify,
  siTidal,
  siTiktok,
  siYoutubemusic,
} from "simple-icons";
import "./DistributionLanding.css";

const SignalOrbit = lazy(() => import("./SignalOrbit"));

const platforms = [
  { name: "Spotify", icon: siSpotify },
  { name: "Apple Music", icon: siApplemusic },
  { name: "YouTube Music", icon: siYoutubemusic },
  { name: "Amazon Music", wordmark: "amazon music" },
  { name: "Anghami", wordmark: "Anghami" },
  { name: "Boomplay", wordmark: "Boomplay" },
  { name: "JioSaavn", wordmark: "JioSaavn" },
  { name: "Deezer", icon: siDeezer },
  { name: "TIDAL", icon: siTidal },
  { name: "SoundCloud", icon: siSoundcloud },
  { name: "Audiomack", icon: siAudiomack },
  { name: "Pandora", icon: siPandora },
  { name: "iHeartRadio", icon: siIheartradio },
  { name: "TikTok", icon: siTiktok },
  { name: "Instagram", icon: siInstagram },
  { name: "Facebook", icon: siFacebook },
  { name: "Beatport", icon: siBeatport },
  { name: "Mixcloud", icon: siMixcloud },
  { name: "Napster", icon: siNapster },
] as const;

const questions = [
  {
    question: "Which services can receive a release?",
    answer:
      "The marks are illustrative examples of popular streaming and social destinations, not a guarantee that every service accepts every release. Ask MONTYX to confirm whether a specific destination, territory and release are currently supported.",
  },
  {
    question: "Do artists keep ownership of their masters?",
    answer:
      "Artists retain master ownership unless a separate written agreement says otherwise. A distribution request or label credit does not, by itself, transfer ownership.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Release schedules and platform review times can vary. Contact MONTYX before setting a date so the specific release plan can be discussed; this site does not promise a delivery time.",
  },
  {
    question: "What does distribution cost?",
    answer:
      "This page does not publish prices or payout terms. Ask MONTYX directly for current terms before proceeding.",
  },
  {
    question: "How do I begin?",
    answer:
      "Use the contact form to start a conversation. It saves the message and sends a support email when automatic delivery is available; otherwise, use the prefilled email draft. Please do not attach unreleased audio or private contracts.",
  },
  {
    question: "Are the platform marks endorsements?",
    answer:
      "No. The service names and marks identify destinations only. They are owned by their respective companies and do not imply sponsorship or endorsement.",
  },
];

function DeferredSignal() {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion !== false) return;
    const connection = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
      deviceMemory?: number;
    }).connection;
    const device = navigator as Navigator & { deviceMemory?: number };
    const smallOrTouch = window.matchMedia(
      "(max-width: 650px), (pointer: coarse)"
    ).matches;
    const constrained =
      smallOrTouch ||
      connection?.saveData === true ||
      ["slow-2g", "2g", "3g"].includes(connection?.effectiveType ?? "") ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
      (navigator.hardwareConcurrency !== undefined &&
        navigator.hardwareConcurrency <= 4);
    if (constrained) return;
    const timer = window.setTimeout(() => setReady(true), 500);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (!ready || prefersReducedMotion) return null;
  return (
    <Suspense fallback={null}>
      <SignalOrbit />
    </Suspense>
  );
}

export default function DistributionLanding() {
  const reducedMotion = useReducedMotion();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <main className="distribution-landing">
      <section
        className="distribution-hero"
        aria-labelledby="distribution-title"
      >
        <div className="distribution-hero__art" aria-hidden="true">
          <img
            src="/images/montyx-distribution-hero.webp"
            alt=""
            fetchPriority="high"
          />
          <div className="distribution-hero__shade" />
          <DeferredSignal />
        </div>
        <div className="distribution-hero__content content-width">
          <motion.div
            className="distribution-hero__copy"
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease: [0.2, 0.7, 0.25, 1] }}
          >
            <span className="dist-eyebrow">
              <span className="dist-live-dot" /> MUSIC DISTRIBUTION · NEPAL
            </span>
            <h1 id="distribution-title">
              Your music.
              <br />
              <span>Going further.</span>
            </h1>
            <p className="distribution-hero__lede">
              An independent route from Nepal to the streaming destinations
              listeners use every day.
            </p>
            <div className="distribution-hero__actions">
              <Link
                href="/contact"
                className="dist-button dist-button--primary"
              >
                Talk distribution <span aria-hidden="true">↗</span>
              </Link>
              <a href="#platforms" className="dist-button dist-button--quiet">
                Explore destinations <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="distribution-hero__meta">
              <span>Independent by design</span>
              <span>From Nepal, outward</span>
            </div>
          </motion.div>
          <div className="distribution-hero__visual-label" aria-hidden="true">
            <span>RELEASE SIGNAL / 01</span>
            <span>INDEPENDENT SOUND · NEPAL</span>
          </div>
        </div>
        <a className="distribution-hero__scroll" href="#platforms">
          <span>Scroll to explore</span>
          <span className="distribution-hero__scroll-line" aria-hidden="true" />
        </a>
      </section>

      <section
        className="distribution-network content-width"
        id="platforms"
        aria-labelledby="platforms-title"
      >
        <div className="distribution-section-heading">
          <div>
            <span className="dist-eyebrow dist-eyebrow--red">
              THE DESTINATION NETWORK
            </span>
            <h2 id="platforms-title">More places for your sound.</h2>
          </div>
          <p>
            Selected streaming and social destinations. The list is
            illustrative; availability depends on territory, release
            requirements and each service.
          </p>
        </div>
        <div className="distribution-platform-grid">
          {platforms.map(platform => (
            <div className="distribution-platform" key={platform.name}>
              <span className="distribution-platform__mark" aria-hidden="true">
                {"icon" in platform ? (
                  <svg viewBox="0 0 24 24" focusable="false">
                    <path
                      d={platform.icon.path}
                      fill={`#${platform.icon.hex}`}
                    />
                  </svg>
                ) : (
                  <span className="distribution-platform__wordmark">
                    {platform.wordmark}
                  </span>
                )}
              </span>
              <span className="distribution-platform__name">
                {platform.name}
              </span>
            </div>
          ))}
        </div>
        <p className="distribution-network__fineprint">
          Third-party names and marks are the property of their respective
          owners. Their appearance identifies destinations only and does not
          indicate sponsorship or endorsement.
        </p>
      </section>

      <section className="distribution-process" id="process">
        <div className="content-width">
          <div className="distribution-section-heading distribution-section-heading--process">
            <div>
              <span className="dist-eyebrow dist-eyebrow--red">
                A CLEAR RELEASE PATH
              </span>
              <h2>From finished track to first play.</h2>
            </div>
            <p>
              Start with a conversation. We’ll confirm what your release needs
              before anything is scheduled.
            </p>
          </div>
          <div className="distribution-steps">
            <article className="distribution-step">
              <span className="distribution-step__index">01</span>
              <div className="distribution-step__rule" aria-hidden="true" />
              <h3>Prepare the release</h3>
              <p>
                Have your final audio, approved artwork and release details
                ready to discuss.
              </p>
            </article>
            <article className="distribution-step">
              <span className="distribution-step__index">02</span>
              <div className="distribution-step__rule" aria-hidden="true" />
              <h3>Talk with MONTYX</h3>
              <p>
                Share your plans through the inquiry form. The team can confirm
                the current requirements and terms.
              </p>
            </article>
            <article className="distribution-step">
              <span className="distribution-step__index">03</span>
              <div className="distribution-step__rule" aria-hidden="true" />
              <h3>Deliver to destinations</h3>
              <p>
                Once details are confirmed, your release can be prepared for
                supported services, subject to their rules and schedules.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section
        className="distribution-artist content-width"
        id="about"
        aria-labelledby="artist-first-title"
      >
        <div className="distribution-artist__index" aria-hidden="true">
          <span>MX</span>
          <span>NEPAL · INDEPENDENT</span>
        </div>
        <div className="distribution-artist__copy">
          <span className="dist-eyebrow dist-eyebrow--red">
            ARTIST-FIRST, ALWAYS
          </span>
          <h2 id="artist-first-title">Keep your masters yours.</h2>
          <p>
            Artists retain master ownership unless a separate written agreement
            says otherwise. A distribution request or label credit does not, by
            itself, transfer the rights to your recording.
          </p>
          <Link href="/rights" className="dist-text-link">
            Read the rights approach <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="distribution-artist__stamp" aria-hidden="true">
          <span>INDEPENDENT</span>
          <span>BY DESIGN</span>
          <i />
        </div>
      </section>

      <section className="distribution-faq content-width" id="faq">
        <div className="distribution-faq__intro">
          <span className="dist-eyebrow dist-eyebrow--red">
            BEFORE THE RELEASE
          </span>
          <h2>
            Good questions.
            <br />
            Clear answers.
          </h2>
          <p>
            Distribution details can differ between services. If your release
            needs a specific answer, ask before choosing a date.
          </p>
          <Link href="/contact" className="dist-text-link">
            Ask MONTYX <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="distribution-faq__list">
          {questions.map((item, index) => (
            <details
              className="distribution-faq__item"
              key={item.question}
              open={openFaq === index}
              onToggle={event => {
                const isOpen = (event.currentTarget as HTMLDetailsElement).open;
                if (isOpen) setOpenFaq(index);
                else if (openFaq === index) setOpenFaq(null);
              }}
            >
              <summary>
                <span>{item.question}</span>
                <span className="distribution-faq__toggle" aria-hidden="true">
                  {openFaq === index ? "−" : "+"}
                </span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="distribution-contact" id="contact-cta">
        <div className="content-width distribution-contact__inner">
          <div>
            <span className="dist-eyebrow">MONTYX RECORDS DISTRIBUTION</span>
            <h2>Ready to move your next release?</h2>
            <p>
              Tell us what you’re building. Start with a conversation and
              confirm the terms and destinations before you commit.
            </p>
          </div>
          <Link href="/contact" className="dist-button dist-button--primary">
            Start a conversation <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>

      <p className="distribution-trademark-note content-width">
        Streaming and social platform names and logos are trademarks of their
        respective owners. MONTYX RECORDS is not affiliated with or endorsed by
        those services. Actual availability is subject to territory, eligibility
        and each service’s policies.
      </p>
    </main>
  );
}
