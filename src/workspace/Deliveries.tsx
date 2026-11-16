import { exampleText } from "../locales/examples";
import { useState } from "react";
import {
  canWork,
  missingRequirements,
  openTasks,
  visibleDocuments,
  visibleDeliveryDocuments,
  type Case,
} from "./model";
import { Button, Field, Form, useWorkspace, value } from "./ui";
export function Deliveries({
  c,
  readOnly = false,
}: {
  c: Case;
  readOnly?: boolean;
}) {
  const { state, role, t, act, lang } = useWorkspace();
  const [reviewed, setReviewed] = useState(false);
  const latest = c.deliveries?.at(-1);
  const blocked =
    missingRequirements(state, c.id).length > 0 ||
    openTasks(state, c.id).length > 0;
  return (
    <section className="ws-delivery">
      <h3>{t("Livrable de la mission", "Entrega da missão")}</h3>
      {latest ? (
        <>
          <p>
            <strong>
              {t("Version", "Versão")} {latest.version} ·{" "}
              {t(
                latest.status === "accepted"
                  ? "Validée par le client"
                  : latest.status === "correction"
                    ? "À corriger"
                    : "À vérifier",
                latest.status === "accepted"
                  ? "Validada pelo cliente"
                  : latest.status === "correction"
                    ? "A corrigir"
                    : "Por verificar",
              )}
            </strong>
          </p>
          <p className="ws-proposal-copy">{latest.summary}</p>
          <ul>
            {visibleDeliveryDocuments(state, role, c.id, latest).map((d) => (
              <li key={d.id}>
                {exampleText(d.name, lang)} · v{d.version}
              </li>
            ))}
          </ul>
          {!visibleDeliveryDocuments(state, role, c.id, latest).length && (
            <p className="ws-hint">
              {t(
                "Aucune pièce jointe accessible dans cette vue.",
                "Nenhum documento anexo acessível nesta vista.",
              )}
            </p>
          )}
          {latest.correction && (
            <p>
              {t("Correction demandée : ", "Correção pedida: ")}
              {latest.correction}
            </p>
          )}
          {role === "member" &&
            c.stage === "delivered" &&
            canWork(c) &&
            latest.status === "submitted" && (
              <div key={latest.version}>
                <label className="ws-check">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                  />
                  {t(
                    "J’ai examiné ce compte rendu et ses pièces.",
                    "Examinei este relatório e os documentos.",
                  )}
                </label>
                <Button
                  disabled={!reviewed}
                  onClick={() => {
                    if (
                      act({
                        type: "delivery-accept",
                        id: c.id,
                        version: latest.version,
                      })
                    )
                      setReviewed(false);
                  }}
                >
                  {t(
                    "Valider cette version dans la démo",
                    "Validar esta versão na demo",
                  )}
                </Button>
                <p className="ws-hint">
                  {t(
                    "Pour une correction, utilisez le formulaire ci-dessous. La clôture reste une action de l’équipe.",
                    "Para uma correção, use o formulário abaixo. A conclusão cabe à equipa.",
                  )}
                </p>
              </div>
            )}
        </>
      ) : (
        <p>
          {t(
            "Aucun livrable remis. Le compte rendu apparaîtra ici.",
            "Ainda não há entrega. O relatório aparecerá aqui.",
          )}
        </p>
      )}
      {!readOnly &&
        role !== "member" &&
        c.stage === "inprogress" &&
        canWork(c) && (
          <Form
            onSave={(data) =>
              act({
                type: "stage",
                id: c.id,
                stage: "delivered",
                summary: value(data, "summary"),
                documents: data.getAll("documents").map(String),
              })
            }
          >
            <Field
              label={t(
                "Compte rendu de démonstration",
                "Relatório de demonstração",
              )}
            >
              <textarea name="summary" required maxLength={3000} rows={4} />
            </Field>
            <fieldset>
              <legend>
                {t(
                  "Pièces validées à joindre (facultatif)",
                  "Documentos validados a anexar (facultativo)",
                )}
              </legend>
              {visibleDocuments(state, role)
                .filter((d) => d.caseId === c.id && d.review === "accepted")
                .map((d) => (
                  <label className="ws-check" key={d.id}>
                    <input type="checkbox" name="documents" value={d.id} />
                    {exampleText(d.name, lang)} · v{d.version}
                  </label>
                ))}
            </fieldset>
            {blocked && (
              <p className="ws-blocker">
                {t(
                  "Terminez les tâches et faites valider les pièces obligatoires avant la remise.",
                  "Conclua as tarefas e valide os documentos obrigatórios antes da entrega.",
                )}
              </p>
            )}
            <Button type="submit" disabled={blocked}>
              {t(
                "Remettre cette version pour vérification",
                "Entregar esta versão para verificação",
              )}
            </Button>
          </Form>
        )}
      {(c.deliveries?.length || 0) > 1 && (
        <details>
          <summary>{t("Versions précédentes", "Versões anteriores")}</summary>
          {c.deliveries!.slice(0, -1).map((d) => (
            <article key={d.version}>
              <h4>v{d.version}</h4>
              <p>{d.summary}</p>
              <p>{d.correction}</p>
              <ul>
                {visibleDeliveryDocuments(state, role, c.id, d).map((doc) => (
                  <li key={doc.id}>
                    {exampleText(doc.name, lang)} · v{doc.version}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
