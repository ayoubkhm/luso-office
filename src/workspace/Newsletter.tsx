import { useState } from "react";
import { editionDirty, eligibleRecipients, type EditionContent } from "./model";
import { useWorkspace, Panel, Badge, Button, Field } from "./ui";
import { EditionArchives } from "./Operations";

export function Newsletter() {
  const { state, role, t, act } = useWorkspace();
  const [preview, setPreview] = useState<"saved" | "draft" | null>(null);
  const [discard, setDiscard] = useState(false);
  const edition = state.edition;
  const headings = [
    "Portugal de hoje",
    "Cultura e raízes",
    "Vida prática",
    "A nossa comunidade",
  ];
  const draft = state.editionDraft;
  const dirty = editionDirty(state);
  const setDraft = (content: EditionContent) =>
    act({ type: "edition-draft", content });
  if (role === "partner") return null;
  return (
    <>
      <div className="ws-journal-title">
        <span>
          {t(
            "Le rendez-vous mensuel en portugais",
            "O encontro mensal em português",
          )}
        </span>
        <h2>
          Portugal —<br />
          Tão longe e tão perto
        </h2>
        <p>
          {t(
            "Édition de travail, jamais diffusée. Rubriques proposées pour la maquette, à valider éditorialement.",
            "Edição de trabalho, nunca distribuída. Rubricas propostas para o protótipo, sujeitas a validação editorial.",
          )}
        </p>
      </div>
      {role === "team" ? (
        <>
          <div className="ws-two">
            <Panel title={t("Préparer l’édition", "Preparar edição")}>
              <Badge>
                {t(
                  edition.status === "draft"
                    ? "Brouillon"
                    : edition.status === "review"
                      ? "En relecture"
                      : "Publication simulée",
                  edition.status === "draft"
                    ? "Rascunho"
                    : edition.status === "review"
                      ? "Em revisão"
                      : "Publicação simulada",
                )}
              </Badge>
              <p className="ws-hint">
                {t(
                  dirty
                    ? "Votre saisie est conservée pendant la session, mais diffère de la version enregistrée. Enregistrez-la ou soumettez-la à relecture avant publication."
                    : "La saisie correspond à la version enregistrée. Le rechargement du navigateur réinitialise cette démonstration.",
                  dirty
                    ? "O texto é conservado durante a sessão, mas difere da versão guardada. Guarde-o ou submeta-o a revisão antes da publicação."
                    : "O texto corresponde à versão guardada. Recarregar o navegador reinicia esta demonstração.",
                )}
              </p>
              <form
                className="ws-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    act({
                      type: "edition",
                      edition: { ...draft, status: "review" },
                    })
                  )
                    setPreview("saved");
                }}
              >
                <Field label={t("Titre", "Título")}>
                  <input
                    required
                    maxLength={150}
                    disabled={edition.status === "published"}
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </Field>
                <Field
                  label={t(
                    "Extrait public proposé",
                    "Excerto público proposto",
                  )}
                >
                  <textarea
                    required
                    rows={2}
                    maxLength={600}
                    disabled={edition.status === "published"}
                    value={draft.excerpt}
                    onChange={(e) =>
                      setDraft({ ...draft, excerpt: e.target.value })
                    }
                  />
                </Field>
                {headings.map((h, i) => (
                  <Field label={h} key={h}>
                    <textarea
                      required
                      maxLength={5000}
                      rows={3}
                      disabled={edition.status === "published"}
                      value={draft.sections[i]}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          sections: draft.sections.map((s, n) =>
                            n === i ? e.target.value : s,
                          ),
                        })
                      }
                    />
                  </Field>
                ))}
                <div className="ws-actions">
                  <Button
                    secondary
                    disabled={edition.status === "published"}
                    onClick={() =>
                      act({
                        type: "edition",
                        edition: { ...draft, status: "draft" },
                      })
                    }
                  >
                    {t("Conserver le brouillon", "Guardar rascunho")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={edition.status === "published"}
                  >
                    {t("Soumettre à relecture", "Submeter a revisão")}
                  </Button>
                </div>
              </form>
              {dirty && (
                <div className="ws-actions">
                  <Button secondary onClick={() => setDiscard(true)}>
                    {t(
                      "Reprendre la version enregistrée",
                      "Retomar versão guardada",
                    )}
                  </Button>
                </div>
              )}
              {dirty && discard && (
                <div className="ws-confirm">
                  <p>
                    {t(
                      "Remplacer la saisie actuelle par la dernière version enregistrée ? La saisie non enregistrée sera perdue.",
                      "Substituir o texto atual pela última versão guardada? O texto não guardado será perdido.",
                    )}
                  </p>
                  <Button
                    onClick={() => {
                      if (setDraft(edition)) {
                        setDiscard(false);
                        setPreview("saved");
                      }
                    }}
                  >
                    {t("Remplacer ma saisie", "Substituir o meu texto")}
                  </Button>
                  <Button secondary onClick={() => setDiscard(false)}>
                    {t("Continuer à écrire", "Continuar a escrever")}
                  </Button>
                </div>
              )}
            </Panel>
            <div>
              <Panel title={t("Relire et publier", "Rever e publicar")}>
                <p>
                  {t(
                    "Vérifiez les sources, les droits des visuels et la version portugaise avant publication. La version publiée est figée dans ce scénario.",
                    "Verifique as fontes, os direitos das imagens e a versão portuguesa antes da publicação. A versão publicada fica fixa neste cenário.",
                  )}
                </p>
                <Button
                  secondary
                  onClick={() =>
                    setPreview(preview === "saved" ? null : "saved")
                  }
                >
                  {t(
                    preview === "saved"
                      ? "Fermer l’aperçu"
                      : "Relire la version enregistrée",
                    preview === "saved"
                      ? "Fechar pré-visualização"
                      : "Rever versão guardada",
                  )}
                </Button>
                <Button
                  secondary
                  onClick={() =>
                    setPreview(preview === "draft" ? null : "draft")
                  }
                >
                  {t(
                    preview === "draft"
                      ? "Fermer l’aperçu de saisie"
                      : "Voir l’aperçu de ma saisie",
                    preview === "draft"
                      ? "Fechar pré-visualização do texto"
                      : "Pré-visualizar o meu texto",
                  )}
                </Button>
                {preview && (
                  <div className="ws-editor-preview">
                    <h3>
                      {preview === "saved"
                        ? t("Version enregistrée", "Versão guardada") +
                          ` #${state.editionRevision}`
                        : t(
                            "Saisie en cours · non publiée",
                            "Texto em curso · não publicado",
                          )}
                    </h3>
                    <EditionPreview
                      edition={preview === "saved" ? edition : draft}
                    />
                  </div>
                )}
                {edition.status === "review" && preview === "saved" && (
                  <label className="ws-check">
                    <input
                      type="checkbox"
                      disabled={dirty}
                      checked={
                        state.reviewedEditionRevision === state.editionRevision
                      }
                      onChange={(e) =>
                        act({
                          type: "edition-review",
                          revision: state.editionRevision,
                          confirmed: e.target.checked,
                        })
                      }
                    />
                    <span>
                      {t(
                        "J’ai relu cette version enregistrée et je la valide pour la publication simulée.",
                        "Revi esta versão guardada e valido-a para a publicação simulada.",
                      )}
                    </span>
                  </label>
                )}
                {dirty && (
                  <p className="ws-blocker">
                    {t(
                      "La publication est bloquée : la saisie contient des modifications non soumises. Toute modification demande une nouvelle relecture.",
                      "A publicação está bloqueada: o texto contém alterações não submetidas. Qualquer alteração exige nova revisão.",
                    )}
                  </p>
                )}
                <Button
                  disabled={
                    edition.status !== "review" ||
                    dirty ||
                    state.reviewedEditionRevision !== state.editionRevision
                  }
                  onClick={() => act({ type: "publish" })}
                >
                  {t("Simuler la publication", "Simular publicação")}
                </Button>
              </Panel>
              <Panel
                title={t("Préparer la distribution", "Preparar distribuição")}
              >
                <p>
                  {t(
                    "Audience proposée : adhérents actifs ayant choisi de recevoir le journal. La préférence est revérifiée au moment de la simulation d’envoi.",
                    "Público proposto: aderentes ativos que optaram por receber o jornal. A preferência é verificada novamente na simulação de envio.",
                  )}
                </p>
                <p className="ws-audience">
                  <strong>{eligibleRecipients(state).length}</strong>{" "}
                  {t(
                    "destinataire éligible dans la démo",
                    "destinatário elegível na demo",
                  )}
                </p>
                <Badge>
                  {t(
                    state.campaign.status === "idle"
                      ? "Non préparée"
                      : state.campaign.status === "queued"
                        ? "En attente de simulation"
                        : "Simulation terminée",
                    state.campaign.status === "idle"
                      ? "Não preparada"
                      : state.campaign.status === "queued"
                        ? "A aguardar simulação"
                        : "Simulação concluída",
                  )}
                </Badge>
                <div className="ws-actions">
                  <Button
                    disabled={
                      edition.status !== "published" ||
                      state.campaign.status !== "idle" ||
                      !eligibleRecipients(state).length
                    }
                    onClick={() => act({ type: "queue" })}
                  >
                    {t("Préparer la campagne démo", "Preparar campanha demo")}
                  </Button>
                  <Button
                    disabled={state.campaign.status !== "queued"}
                    onClick={() => act({ type: "dispatch" })}
                  >
                    {t("Simuler la distribution", "Simular distribuição")}
                  </Button>
                </div>
                {state.campaign.status === "sent" && (
                  <p>
                    {state.campaign.delivered.length}{" "}
                    {t(
                      "destinataire retenu, aucun e-mail envoyé.",
                      "destinatário selecionado, nenhum e-mail enviado.",
                    )}{" "}
                    {state.campaign.recipients.length -
                      state.campaign.delivered.length}{" "}
                    {t(
                      "exclu après vérification.",
                      "excluído após verificação.",
                    )}
                  </p>
                )}
                <p className="ws-hint">
                  {t(
                    "Planification mensuelle, rebonds, plaintes et reprise des erreurs : à connecter au service d’envoi.",
                    "Agendamento mensal, devoluções, reclamações e repetição de erros: a ligar ao serviço de envio.",
                  )}
                </p>
              </Panel>
            </div>
          </div>
        </>
      ) : (
        <>
          <Panel title={t("Votre édition", "A sua edição")}>
            {edition.status === "published" && state.subscription.active ? (
              <EditionPreview edition={edition} />
            ) : (
              <p className="ws-empty">
                {t(
                  state.edition.status === "published"
                    ? "Une adhésion active est nécessaire pour lire l’édition complète."
                    : "Aucune édition publiée dans cette démonstration. La vue équipe permet d’en préparer une, puis de la rendre visible ici.",
                  state.edition.status === "published"
                    ? "É necessária uma adesão ativa para ler a edição completa."
                    : "Nenhuma edição publicada nesta demonstração. A vista da equipa permite preparar uma e torná-la visível aqui.",
                )}
              </p>
            )}
          </Panel>
          <Panel title={t("Recevoir le journal", "Receber o jornal")}>
            <p>
              {t(
                state.profile.consent
                  ? "Réception activée dans le scénario. Le journal prévu est en portugais."
                  : "Vous avez désactivé la réception. La lecture reste accessible avec une adhésion active.",
                state.profile.consent
                  ? "Receção ativada no cenário. O jornal previsto é em português."
                  : "Desativou a receção. A leitura continua acessível com uma adesão ativa.",
              )}
            </p>
            <Button
              secondary
              onClick={() =>
                act({
                  type: "profile",
                  profile: {
                    ...state.profile,
                    consent: !state.profile.consent,
                  },
                })
              }
            >
              {t(
                state.profile.consent
                  ? "Simuler ma désinscription"
                  : "Simuler mon inscription",
                state.profile.consent
                  ? "Simular cancelamento"
                  : "Simular inscrição",
              )}
            </Button>
          </Panel>
        </>
      )}
      <EditionArchives />
    </>
  );
}
function EditionPreview({ edition }: { edition: EditionContent }) {
  const { t } = useWorkspace();
  return (
    <article className="ws-edition" lang="pt">
      <small>DEMO · {t("Sans diffusion", "Sem distribuição")}</small>
      <h3>{edition.title}</h3>
      <p>
        {edition.excerpt ||
          t("Extrait non renseigné.", "Excerto por preencher.")}
      </p>
      {edition.sections.map((s, i) => (
        <section key={i}>
          <h4>
            {
              [
                "Portugal de hoje",
                "Cultura e raízes",
                "Vida prática",
                "A nossa comunidade",
              ][i]
            }
          </h4>
          <p>{s || "Texto por preparar."}</p>
        </section>
      ))}
    </article>
  );
}
