import { exampleText } from "../locales/examples";
import { Button, Field, Form, Panel, useWorkspace, value } from "./ui";
import type { Case, Role, State } from "./model";
export { viewsForActor } from "./permissions";
export function PeopleSelectors() {
  const { state, role, t, act, lang } = useWorkspace();
  return (
    <>
      {role !== "partner" &&
        (role === "member" ||
          state.people.find((p) => p.id === state.operatorId)?.kind !==
            "editor") && (
          <Field
            label={t("Client fictif exploré", "Cliente fictício explorado")}
          >
            <select
              value={state.activeClient}
              onChange={(e) =>
                act({ type: "client-select", id: e.target.value })
              }
            >
              <option value={state.activeClient}>
                {exampleText(state.profile.name, lang)}
              </option>
              {state.accounts
                .filter(
                  (a) =>
                    role !== "team" ||
                    state.people.find((p) => p.id === state.operatorId)
                      ?.kind === "admin" ||
                    state.cases.some(
                      (c) =>
                        c.owner === a.id && c.operatorId === state.operatorId,
                    ),
                )
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {exampleText(a.profile.name, lang)}
                  </option>
                ))}
            </select>
          </Field>
        )}
      {role !== "member" && (
        <Field
          label={t(
            "Intervenant de démonstration",
            "Interveniente de demonstração",
          )}
        >
          <select
            value={role === "team" ? state.operatorId : state.partnerId}
            onChange={(e) => act({ type: "actor-select", id: e.target.value })}
          >
            {state.people
              .filter(
                (p) =>
                  p.enabled &&
                  (role === "partner"
                    ? p.kind === "partner"
                    : p.kind !== "partner"),
              )
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.kind}
                </option>
              ))}
          </select>
        </Field>
      )}
    </>
  );
}
export function ClientForm() {
  const { role, t, act, lang } = useWorkspace();
  if (role === "partner") return null;
  return (
    <details className="ws-client-create">
      <summary>
        {t(
          "Explorer un nouveau client sans adhésion",
          "Explorar um novo cliente sem adesão",
        )}
      </summary>
      <p>
        {t(
          "Créez un profil fictif distinct : il pourra demander un service ponctuel ou préparer une adhésion. Les autres clients restent disponibles dans le sélecteur.",
          "Crie um perfil fictício distinto: pode pedir um serviço avulso ou preparar uma adesão. Os outros clientes ficam disponíveis no seletor.",
        )}
      </p>
      <Form
        onSave={(d) =>
          act({
            type: "client-create",
            name: value(d, "name"),
            country: value(d, "country"),
          })
        }
      >
        <Field label={t("Nom fictif", "Nome fictício")}>
          <input name="name" required maxLength={80} />
        </Field>
        <Field label={t("Pays", "País")}>
          <input name="country" required maxLength={80} />
        </Field>
        <Button type="submit">
          {t("Créer ce client fictif", "Criar este cliente fictício")}
        </Button>
      </Form>
    </details>
  );
}
export function StaffAssignment({ c }: { c: Case }) {
  const { state, role, t, act, lang } = useWorkspace();
  if (role !== "team") return null;
  return (
    <Form
      key={`${c.operatorId}-${c.partnerId}`}
      onSave={(d) =>
        act({
          type: "staff-assign",
          id: c.id,
          operatorId: value(d, "operator"),
          partnerId: value(d, "partner"),
        })
      }
    >
      <Field label={t("Responsable du dossier", "Responsável do pedido")}>
        <select name="operator" defaultValue={c.operatorId || "operator-1"}>
          {state.people
            .filter((p) => p.enabled && ["admin", "operator"].includes(p.kind))
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </Field>
      <Field label={t("Partenaire attribué", "Parceiro atribuído")}>
        <select
          name="partner"
          defaultValue={c.partner ? c.partnerId || "partner-1" : ""}
        >
          <option value="">{t("Aucun partenaire", "Sem parceiro")}</option>
          {state.people
            .filter((p) => p.enabled && p.kind === "partner")
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
        </select>
      </Field>
      <p className="ws-hint">
        {t(
          "Un changement de partenaire retire les partages documentaires existants. Partagez ensuite uniquement les pièces nécessaires.",
          "Mudar de parceiro retira as partilhas de documentos existentes. Partilhe depois apenas os documentos necessários.",
        )}
      </p>
      <Button type="submit">
        {t("Enregistrer les responsables", "Guardar responsáveis")}
      </Button>
    </Form>
  );
}
export function PeopleDesk() {
  const { state, role, t, act, lang } = useWorkspace();
  if (
    role !== "team" ||
    state.people.find((p) => p.id === state.operatorId)?.kind !== "admin"
  )
    return null;
  const clients = [
    ...state.accounts,
    {
      id: state.activeClient,
      profile: state.profile,
      subscription: state.subscription,
      invitations: state.invitations,
    },
  ];
  return (
    <>
      <Panel title={t("Clients et dossiers", "Clientes e pedidos")}>
        <div className="ws-people-list">
          {clients.map((a) => (
            <article key={a.id}>
              <h3>{exampleText(a.profile.name, lang)}</h3>
              <p>
                {a.profile.country} ·{" "}
                {t(
                  a.subscription.active
                    ? "Adhésion active"
                    : "Services sans adhésion",
                  a.subscription.active
                    ? "Adesão ativa"
                    : "Serviços sem adesão",
                )}
              </p>
              <p>
                {state.cases.filter((c) => c.owner === a.id).length}{" "}
                {t("dossier(s)", "pedido(s)")}
              </p>
              <Button
                secondary
                disabled={a.id === state.activeClient}
                onClick={() => act({ type: "client-select", id: a.id })}
              >
                {t("Explorer ce client", "Explorar este cliente")}
              </Button>
            </article>
          ))}
        </div>
        <ClientForm />
      </Panel>
      <Panel
        title={t(
          "Équipe, partenaires et charge de travail",
          "Equipa, parceiros e carga de trabalho",
        )}
      >
        <div className="ws-people-list">
          {state.people.map((p) => {
            const cases = state.cases.filter(
              (c) =>
                !["completed", "cancelled"].includes(c.stage) &&
                (p.kind === "partner"
                  ? c.partner && (c.partnerId || "partner-1") === p.id
                  : (c.operatorId || "operator-1") === p.id),
            );
            const tasks = state.tasks.filter(
              (task) =>
                task.status !== "done" &&
                cases.some((c) => c.id === task.caseId) &&
                task.assignee === (p.kind === "partner" ? "partner" : "team"),
            );
            return (
              <article key={p.id}>
                <h3>{p.name}</h3>
                <p>
                  {p.kind} ·{" "}
                  {t(
                    p.enabled ? "Actif" : "Suspendu",
                    p.enabled ? "Ativo" : "Suspenso",
                  )}
                </p>
                <p>
                  {cases.length}{" "}
                  {t("dossier(s) actif(s)", "pedido(s) ativo(s)")} ·{" "}
                  {tasks.length}{" "}
                  {t("tâche(s) ouverte(s)", "tarefa(s) aberta(s)")}
                </p>
                {p.id !== state.operatorId && (
                  <Button
                    secondary
                    onClick={() =>
                      act({
                        type: "person-access",
                        id: p.id,
                        enabled: !p.enabled,
                      })
                    }
                  >
                    {t(
                      p.enabled
                        ? "Suspendre cet accès démo"
                        : "Rétablir cet accès démo",
                      p.enabled
                        ? "Suspender este acesso demo"
                        : "Reativar este acesso demo",
                    )}
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      </Panel>
    </>
  );
}
