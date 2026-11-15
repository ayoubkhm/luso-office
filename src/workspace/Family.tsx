import { useEffect, useRef, useState } from "react";
import {
  familyActive,
  familySlots,
  familyPreview,
  visibleCases,
  visibleDocuments,
  stageLabels,
  type FamilyInvitation,
} from "./model";
import {
  useWorkspace,
  Panel,
  Badge,
  Button,
  Form,
  Field,
  value,
  serviceName,
} from "./ui";
const statuses: Record<FamilyInvitation["status"], [string, string]> = {
  pending: ["Invitation préparée", "Convite preparado"],
  active: ["Acceptation simulée", "Aceitação simulada"],
  expired: ["Invitation expirée", "Convite expirado"],
  revoked: ["Accès retiré", "Acesso retirado"],
};
const events: Record<FamilyInvitation["history"][number], [string, string]> = {
  prepared: ["Invitation préparée, sans envoi", "Convite preparado, sem envio"],
  accepted: [
    "Acceptation simulée, sans création de compte",
    "Aceitação simulada, sem criação de conta",
  ],
  expired: ["Expiration simulée", "Expiração simulada"],
  revoked: ["Invitation ou accès retiré", "Convite ou acesso retirado"],
  renewed: ["Nouvelle invitation préparée", "Novo convite preparado"],
  "plan-change": [
    "Accès retiré après passage à Member",
    "Acesso retirado após mudança para Member",
  ],
};
export function Family() {
  const { state, t, act, go } = useWorkspace();
  const [preview, setPreview] = useState("");
  const opener = useRef<HTMLElement | null>(null);
  const active = familyActive(state);
  const slots = familySlots(state);
  return (
    <Panel title={t("Votre foyer Family", "O seu agregado Family")}>
      <p>
        {t(
          "Jusqu’à quatre utilisateurs prévus, titulaire inclus. Accepter une invitation ne donne accès à aucun dossier : le titulaire choisit ensuite les informations partagées.",
          "Até quatro utilizadores previstos, incluindo o titular. Aceitar um convite não dá acesso a pedidos: o titular escolhe depois as informações partilhadas.",
        )}
      </p>
      <p className="ws-hint">
        {t(
          "Parcours de démonstration : aucune invitation envoyée, aucun compte créé. Utilisez des adresses fictives. La durée de validité des invitations reste à définir.",
          "Percurso de demonstração: nenhum convite enviado, nenhuma conta criada. Utilize endereços fictícios. O prazo de validade dos convites está por definir.",
        )}
      </p>
      {active ? (
        <>
          <Badge>
            {slots + 1}/4{" "}
            {t(
              "places réservées, titulaire inclus",
              "lugares reservados, incluindo titular",
            )}
          </Badge>
          <p className="ws-hint">
            {t(
              "Les invitations en attente réservent une place. Les invitations expirées ou retirées la libèrent.",
              "Os convites pendentes reservam um lugar. Os convites expirados ou retirados libertam-no.",
            )}
          </p>
          {slots < 3 ? (
            <Form
              onSave={(d) => act({ type: "invite", email: value(d, "email") })}
            >
              <Field
                label={t(
                  "E-mail fictif du bénéficiaire",
                  "E-mail fictício do beneficiário",
                )}
              >
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  placeholder="exemple@example.test"
                />
              </Field>
              <p className="ws-hint">
                {t(
                  "Pour une adresse déjà présente ci-dessous, utilisez « Préparer une nouvelle invitation » sur sa fiche.",
                  "Para um endereço já presente abaixo, utilize « Preparar novo convite » na respetiva ficha.",
                )}
              </p>
              <Button type="submit">
                {t("Préparer l’invitation démo", "Preparar convite demo")}
              </Button>
            </Form>
          ) : (
            <p>
              {t(
                "Toutes les places sont réservées. Retirez une invitation ou un accès avant d’en préparer un autre.",
                "Todos os lugares estão reservados. Retire um convite ou acesso antes de preparar outro.",
              )}
            </p>
          )}
        </>
      ) : (
        <>
          <p>
            {t(
              "Les accès Family sont disponibles avec une adhésion Family active. Les historiques restent consultables.",
              "Os acessos Family estão disponíveis com adesão Family ativa. Os históricos continuam disponíveis.",
            )}
          </p>
          <Button secondary onClick={() => go("billing")}>
            {t("Voir l’adhésion", "Ver adesão")}
          </Button>
        </>
      )}
      <div className="ws-family-list">
        {state.invitations.map((i) => (
          <FamilyMember
            key={`${i.id}-${i.status}-${i.generation}`}
            invitation={i}
            preview={() => {
              opener.current =
                document.activeElement instanceof HTMLElement
                  ? document.activeElement
                  : null;
              setPreview(i.id);
            }}
          />
        ))}
      </div>
      {!state.invitations.length && (
        <p className="ws-empty">
          {t(
            "Aucun bénéficiaire ajouté à cette session.",
            "Nenhum beneficiário adicionado nesta sessão.",
          )}
        </p>
      )}
      {preview && (
        <BeneficiaryPreview
          id={preview}
          close={() => {
            setPreview("");
            requestAnimationFrame(() => opener.current?.focus());
          }}
        />
      )}
    </Panel>
  );
}
function FamilyMember({
  invitation: i,
  preview,
}: {
  invitation: FamilyInvitation;
  preview: () => void;
}) {
  const { state, lang, t, act } = useWorkspace();
  const [confirm, setConfirm] = useState(false);
  const active = familyActive(state);
  return (
    <article className="ws-family-member">
      <h3>{i.email}</h3>
      <div className="ws-detail-heading">
        <Badge good={i.status === "active" && active}>
          {t(...statuses[i.status])}
        </Badge>
        <small>
          {t("Invitation", "Convite")} {i.generation}
        </small>
      </div>
      <div className="ws-actions">
        {i.status === "pending" && (
          <>
            <Button
              disabled={!active}
              onClick={() =>
                act({
                  type: "invite-state",
                  id: i.id,
                  generation: i.generation,
                  status: "active",
                })
              }
            >
              {t(
                "Simuler l’acceptation du bénéficiaire",
                "Simular aceitação do beneficiário",
              )}
            </Button>
            <Button
              secondary
              onClick={() =>
                act({
                  type: "invite-state",
                  id: i.id,
                  generation: i.generation,
                  status: "expired",
                })
              }
            >
              {t("Simuler l’expiration", "Simular expiração")}
            </Button>
          </>
        )}
        {["pending", "active"].includes(i.status) && (
          <Button secondary onClick={() => setConfirm(!confirm)}>
            {t(
              i.status === "active"
                ? "Retirer cet accès"
                : "Retirer l’invitation",
              i.status === "active" ? "Retirar este acesso" : "Retirar convite",
            )}
          </Button>
        )}
        {["expired", "revoked"].includes(i.status) && (
          <Button
            secondary
            disabled={!active || familySlots(state) >= 3}
            onClick={() => act({ type: "invite-renew", id: i.id })}
          >
            {t("Préparer une nouvelle invitation", "Preparar novo convite")}
          </Button>
        )}
        <Button secondary onClick={preview}>
          {t(
            "Voir l’aperçu bénéficiaire",
            "Ver pré-visualização do beneficiário",
          )}
        </Button>
      </div>
      {confirm && (
        <div className="ws-confirm">
          <p>
            {t(
              "Le bénéficiaire perdra ses accès aux dossiers et aux pièces dans la démo. Une nouvelle invitation ne rétablira aucun partage automatiquement.",
              "O beneficiário perderá o acesso aos pedidos e documentos na demo. Um novo convite não restabelecerá partilhas automaticamente.",
            )}
          </p>
          <div className="ws-actions">
            <Button
              onClick={() =>
                act({
                  type: "invite-state",
                  id: i.id,
                  generation: i.generation,
                  status: "revoked",
                })
              }
            >
              {t("Confirmer le retrait démo", "Confirmar retirada demo")}
            </Button>
            <Button secondary onClick={() => setConfirm(false)}>
              {t("Conserver", "Manter")}
            </Button>
          </div>
        </div>
      )}
      {i.status === "active" && active && (
        <details className="ws-family-sharing">
          <summary>
            {t(
              "Choisir les dossiers et documents partagés",
              "Escolher pedidos e documentos partilhados",
            )}
          </summary>
          <p className="ws-hint">
            {t(
              "Un dossier donne accès à son résumé et au bien associé. Les pièces se partagent une par une. Les messages, propositions, factures et notes internes restent masqués dans cet aperçu.",
              "Um pedido dá acesso ao resumo e ao imóvel associado. Os documentos são partilhados individualmente. Mensagens, propostas, faturas e notas internas ficam ocultas nesta pré-visualização.",
            )}
          </p>
          {visibleCases(state, "member").map((c) => (
            <fieldset key={c.id} className="ws-family-grant">
              <legend>{c.id}</legend>
              <label className="ws-check">
                <input
                  type="checkbox"
                  checked={i.cases.includes(c.id)}
                  onChange={(e) =>
                    act({
                      type: "family-case",
                      id: i.id,
                      caseId: c.id,
                      granted: e.target.checked,
                    })
                  }
                />
                <span>{serviceName(c.service, lang)}</span>
              </label>
              {i.cases.includes(c.id) && (
                <div className="ws-family-documents">
                  {visibleDocuments(state, "member")
                    .filter((d) => d.caseId === c.id)
                    .map((d) => (
                      <label key={d.id} className="ws-check">
                        <input
                          type="checkbox"
                          checked={i.documents.includes(d.id)}
                          onChange={(e) =>
                            act({
                              type: "family-document",
                              id: i.id,
                              documentId: d.id,
                              granted: e.target.checked,
                            })
                          }
                        />
                        <span>
                          {d.name} · v{d.version}
                        </span>
                      </label>
                    ))}
                  <p className="ws-hint">
                    {t(
                      "Une pièce remplacée devra être partagée de nouveau.",
                      "Um documento substituído deverá ser novamente partilhado.",
                    )}
                  </p>
                </div>
              )}
            </fieldset>
          ))}
        </details>
      )}
      <details className="ws-family-history">
        <summary>
          {t("Historique de l’invitation", "Histórico do convite")}
        </summary>
        <ol>
          {i.history.map((e, n) => (
            <li key={n}>{t(...events[e])}</li>
          ))}
        </ol>
      </details>
    </article>
  );
}
function BeneficiaryPreview({ id, close }: { id: string; close: () => void }) {
  const { state, lang, t } = useWorkspace();
  const i = state.invitations.find((i) => i.id === id)!;
  const view = familyPreview(state, id);
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    section.current?.focus();
  }, [id]);
  return (
    <section
      className="ws-family-preview"
      ref={section}
      tabIndex={-1}
      aria-label={t("Aperçu bénéficiaire", "Pré-visualização do beneficiário")}
    >
      <div className="ws-detail-heading">
        <h3>{t("Aperçu bénéficiaire", "Pré-visualização do beneficiário")}</h3>
        <Button secondary onClick={close}>
          {t("Fermer l’aperçu", "Fechar pré-visualização")}
        </Button>
      </div>
      <p>{i.email}</p>
      <p className="ws-hint">
        {t(
          "Lecture seule dans la démo. Cet aperçu ne remplace pas une connexion ni des autorisations serveur.",
          "Só leitura na demo. Esta pré-visualização não substitui uma sessão nem permissões no servidor.",
        )}
      </p>
      {view.cases.length ? (
        view.cases.map((c) => (
          <article key={c.id}>
            <small>{c.id}</small>
            <h4>{serviceName(c.service, lang)}</h4>
            <Badge>{t(...stageLabels[c.stage])}</Badge>
            {c.property && (
              <p>
                {c.property.name} · {c.property.town}
              </p>
            )}
            <ul>
              {view.documents
                .filter((d) => d.caseId === c.id)
                .map((d) => (
                  <li key={d.id}>
                    {d.name} · v{d.version}
                  </li>
                ))}
            </ul>
            {!view.documents.some((d) => d.caseId === c.id) && (
              <p>
                {t(
                  "Aucune pièce partagée pour ce dossier.",
                  "Nenhum documento partilhado para este pedido.",
                )}
              </p>
            )}
          </article>
        ))
      ) : (
        <p className="ws-empty">
          {t(
            "Aucun dossier accessible. Le bénéficiaire doit avoir accepté l’invitation, disposer des droits Family et recevoir un partage explicite.",
            "Nenhum pedido acessível. O beneficiário deve aceitar o convite, ter direitos Family e receber uma partilha explícita.",
          )}
        </p>
      )}
    </section>
  );
}
