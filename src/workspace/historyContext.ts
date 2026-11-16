import { transition, type Action, type Role, type State } from "./model";

// History remembers the explored identity, never an old copy of business data.
export function workspaceIdentity(state: State) {
  return {
    client: state.activeClient,
    operator: state.operatorId,
    partner: state.partnerId,
  };
}
export type WorkspaceIdentity = ReturnType<typeof workspaceIdentity>;

export function restoreHistoryIdentity(
  source: State,
  role: Role,
  raw: unknown,
) {
  let state = source;
  const events: { role: Role; action: Action }[] = [];
  if (!raw || typeof raw !== "object") return { state, events };
  const identity = raw as Partial<WorkspaceIdentity>;
  const apply = (action: Action) => {
    const result = transition(state, role, action);
    if (!result.ok) return false;
    state = result.state;
    events.push({ role, action });
    return true;
  };
  const actor = role === "team" ? identity.operator : identity.partner;
  const current = role === "team" ? state.operatorId : state.partnerId;
  if (role !== "member" && typeof actor === "string" && actor !== current) {
    // Disabled or removed identities cannot be revived by browser history.
    if (!apply({ type: "actor-select", id: actor })) return { state, events };
  }
  if (
    role !== "partner" &&
    typeof identity.client === "string" &&
    identity.client !== state.activeClient
  ) {
    apply({ type: "client-select", id: identity.client });
  }
  return { state, events };
}
