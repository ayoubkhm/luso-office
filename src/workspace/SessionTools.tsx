import { Button } from "./ui";
export function SessionTools({
  t,
  saved,
  enabled,
  error,
  resume,
  discard,
  enable,
}: {
  t: (fr: string, pt: string) => string;
  saved: boolean;
  enabled: boolean;
  error: string;
  resume: () => void;
  discard: () => void;
  enable: () => void;
}) {
  return (
    <details className="ws-session" open={saved && !enabled ? true : undefined}>
      <summary>
        {t("Session de démonstration", "Sessão de demonstração")} ·{" "}
        {t(
          enabled ? "sauvegarde locale active" : "en mémoire",
          enabled ? "gravação local ativa" : "em memória",
        )}
      </summary>
      <p>
        {t(
          "Utilisez uniquement des exemples. La sauvegarde facultative reste dans ce navigateur, sur cet appareil. Elle contient vos saisies fictives ; aucune donnée n’est envoyée.",
          "Use apenas exemplos. A gravação facultativa fica neste navegador e neste dispositivo. Contém os seus dados fictícios; nada é enviado.",
        )}
      </p>
      {error && <p role="alert">{error}</p>}
      {saved && !enabled ? (
        <div className="ws-actions">
          <Button onClick={resume}>
            {t("Reprendre la session sauvegardée", "Retomar sessão guardada")}
          </Button>
          <Button secondary onClick={discard}>
            {t("Effacer la sauvegarde", "Apagar gravação")}
          </Button>
        </div>
      ) : (
        <div className="ws-actions">
          <Button secondary onClick={enabled ? discard : enable}>
            {t(
              enabled
                ? "Désactiver et effacer la sauvegarde"
                : "Sauvegarder mes exemples sur cet appareil",
              enabled
                ? "Desativar e apagar gravação"
                : "Guardar os exemplos neste dispositivo",
            )}
          </Button>
        </div>
      )}
    </details>
  );
}
