import type { Lang } from "./locales";
import { href } from "./routes";
import { aboutCopy } from "./aboutCopy";

export function About({
  lang,
  onContact,
}: {
  lang: Lang;
  onContact: (subject?: string) => void;
}) {
  const copy = aboutCopy[lang];
  return (
    <div className="about-page">
      <section className="wrap about-intro" aria-labelledby="about-title">
        <h1 id="about-title">{copy.title}</h1>
        <div className="about-intro-copy">
          <p>{copy.mission}</p>
          <div className="about-actions">
            <a className="button primary" href={href("services", lang)}>
              {copy.services}
            </a>
            <a className="text-link" href="#notre-histoire">
              {copy.storyLink}
            </a>
          </div>
        </div>
      </section>
      <section
        id="notre-histoire"
        className="wrap about-origin"
        aria-labelledby="about-story-title"
      >
        <div className="about-narrative">
          <h2 id="about-story-title">{copy.storyTitle}</h2>
          {copy.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <figure className="about-signature">
          <img
            src="/assets/azulejos-640.webp"
            srcSet="/assets/azulejos-640.webp 640w, /assets/azulejos-960.webp 960w"
            sizes="(max-width: 760px) 100vw, 40vw"
            width="960"
            height="640"
            alt=""
            loading="lazy"
          />
          <figcaption>
            <p lang="pt">Ligamos Portugal aos Portugueses no Mundo</p>
            <span>LusoOffice</span>
          </figcaption>
        </figure>
      </section>
      <section className="about-method" aria-labelledby="about-method-title">
        <div className="wrap about-method-layout">
          <div>
            <h2 id="about-method-title">{copy.methodTitle}</h2>
            <p className="about-method-intro">{copy.methodIntro}</p>
          </div>
          <div>
            <ol className="about-steps">
              {copy.steps.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="about-specialist">{copy.specialist}</p>
          </div>
        </div>
      </section>
      <section
        className="wrap about-community"
        aria-labelledby="about-community-title"
      >
        <h2 id="about-community-title">{copy.diasporaTitle}</h2>
        <div>
          <p>{copy.diaspora}</p>
          <a className="text-link" href={href("journal", lang)}>
            {copy.journal}
          </a>
          <details className="about-outlook">
            <summary>{copy.outlookTitle}</summary>
            <p>{copy.outlook}</p>
            <p>{copy.partnership}</p>
            <button
              className="button secondary"
              onClick={() => onContact("partnership")}
            >
              {copy.partnerAction}
            </button>
          </details>
        </div>
      </section>
      <section
        id="contact"
        className="contact-band about-contact"
        aria-labelledby="about-contact-title"
      >
        <div className="wrap">
          <div>
            <h2 id="about-contact-title">{copy.contactTitle}</h2>
            <p>{copy.contact}</p>
          </div>
          <div>
            <button className="button primary" onClick={() => onContact()}>
              {copy.contactAction}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
