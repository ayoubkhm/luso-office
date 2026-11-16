import type { Lang } from "./locales";
import { publicCopy } from "./publicCopy";
import { services } from "./catalogue";
import { href } from "./routes";

export function ServiceChoice({ lang }: { lang: Lang }) {
  const copy = publicCopy[lang];
  return (
    <details className="service-choice">
      <summary>{copy.whichVisit}</summary>
      <dl>
        {[
          ["visite-rapport", copy.visitReport],
          ["maison-inoccupee", copy.visitRoutine],
          ["visite-bien-herite", copy.visitInherited],
        ].map(([id, explanation]) => {
          const service = services.find((s) => s.id === id)!;
          return (
            <div key={id}>
              <dt>
                <a href={href("services", lang, `?area=${service.area}#${id}`)}>
                  {service.name[lang]}
                </a>
              </dt>
              <dd>{explanation}</dd>
            </div>
          );
        })}
      </dl>
    </details>
  );
}

export function BusinessTopics({ lang }: { lang: Lang }) {
  const copy = publicCopy[lang];
  const titles = {
    fr: [
      "Créer une entreprise",
      "Comptabilité et fiscalité",
      "Plan d’affaires et viabilité",
      "Préparer un dossier de financement",
      "Organiser un projet d’investissement",
      "S’installer et trouver des fournisseurs",
      "Suivre l’activité depuis l’étranger",
      copy.businessIncentivesTitle,
      copy.businessInternationalTitle,
    ],
    pt: [
      "Criar empresa",
      "Contabilidade e fiscalidade",
      "Plano de negócio e viabilidade",
      "Preparar um dossier de financiamento",
      "Organizar um projeto de investimento",
      "Instalar-se e encontrar fornecedores",
      "Acompanhar a atividade a partir do estrangeiro",
      copy.businessIncentivesTitle,
      copy.businessInternationalTitle,
    ],
    en: [
      "Start a business",
      "Accounting and tax",
      "Business plan and feasibility",
      "Prepare a funding application",
      "Organise an investment project",
      "Set up and find suppliers",
      "Follow the business from abroad",
      copy.businessIncentivesTitle,
      copy.businessInternationalTitle,
    ],
    de: [
      "Ein Unternehmen gründen",
      "Buchhaltung und Steuern",
      "Geschäftsplan und Machbarkeit",
      "Einen Finanzierungsantrag vorbereiten",
      "Ein Investitionsvorhaben organisieren",
      "Sich etablieren und Anbieter finden",
      "Die Tätigkeit aus dem Ausland begleiten",
      copy.businessIncentivesTitle,
      copy.businessInternationalTitle,
    ],
  }[lang];
  const topics = [
    [copy.businessCreate, "business-entretien"],
    [copy.businessAccounts, "business-entretien"],
    [copy.businessPlan, "business-entretien"],
    [copy.businessFunding, "business-entretien"],
    [copy.businessInvestment, "suivi-projet"],
    [copy.businessSuppliers, "recherche-fournisseurs"],
    [copy.businessFollowup, "suivi-projet"],
    [copy.businessIncentives, "business-entretien"],
    [copy.businessInternational, "business-entretien"],
  ];
  return (
    <div className="business-paths">
      {topics.map(([body, id], index) => (
        <article key={id + index}>
          <h3>{titles[index]}</h3>
          <p>{body}</p>
          <a className="text-link" href={`#${id}`}>
            {copy.seeSupport}
          </a>
        </article>
      ))}
    </div>
  );
}

export function BusinessPreparation({ lang }: { lang: Lang }) {
  const copy = publicCopy[lang];
  return (
    <section
      className="wrap business-preparation"
      aria-labelledby="business-preparation-title"
    >
      <h2 id="business-preparation-title">{copy.businessPrepareTitle}</h2>
      <div>
        <p>{copy.businessPrepare}</p>
        <p>{copy.businessOutcome}</p>
      </div>
    </section>
  );
}

export function JournalSample({ lang }: { lang: Lang }) {
  const copy = publicCopy[lang];
  return (
    <section
      className="wrap journal-sample"
      aria-labelledby="journal-sample-title"
    >
      <div>
        <h2 id="journal-sample-title">{copy.journalReadTitle}</h2>
        <p>{copy.journalPreviewIntro}</p>
      </div>
      <article aria-labelledby="sample-headline">
        <p className="sample-label">{copy.journalPreviewLabel}</p>
        <div lang="pt">
          <h3 id="sample-headline">Uma casa fechada, uma chegada a preparar</h3>
          <p>
            O regresso começa muitas vezes antes da viagem. Quem terá as chaves?
            Há uma hora prevista para chegar? Que tarefas precisam de estar
            organizadas antes de abrir a porta?
          </p>
          <p>
            Uma lista curta ajuda a distinguir o que pode preparar à distância
            do que exige alguém no local. Abrir a casa, receber um técnico e
            organizar uma limpeza são necessidades diferentes, que vale a pena
            identificar separadamente.
          </p>
          <p>
            Uma pergunta para começar: o que gostaria de encontrar já preparado
            no dia da chegada?
          </p>
        </div>
        <a
          className="text-link"
          href={href("services", lang, "?area=maison#ouverture-maison")}
        >
          {copy.journalService}
        </a>
      </article>
    </section>
  );
}

export function JournalAccess({ lang }: { lang: Lang }) {
  const copy = publicCopy[lang];
  return (
    <section className="contact-band">
      <div className="wrap">
        <div>
          <h2>{copy.journalAccess}</h2>
          <p>{copy.journalAccessText}</p>
        </div>
        <a className="button primary" href={href("membership", lang)}>
          {copy.journalMembership}
        </a>
      </div>
    </section>
  );
}
