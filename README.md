# Luso Office

Vitrine franco-portugaise destinée aux Portugais et lusodescendants vivant à l’étranger, avec la France comme premier marché. Luso Office remplace « Perto de Casa » ; le dépôt et le dossier conservent provisoirement leur identifiant historique.

L’identité conserve le bleu cobalt, les azulejos et Manrope. Cette correction de la vitrine existante reste en HTML/CSS/JavaScript ; une future refonte applicative suivra la préférence React, TypeScript et Node.js.

## Prévisualisation locale

```sh
python3 -m http.server 4177 --bind 127.0.0.1
```

Ouvrir `http://127.0.0.1:4177/`.

- `index.html` : accueil, services détaillés, étapes, présentation et contact.
- `tarifs.html` : Accompagnement ; URL historique conservée.
- `styles.css` et `pricing.css` : grille responsive, navigation et composants.
- `app.js` : traductions FR/PT, menu, dialogues et récapitulatif local.
- `scripts/check-site.py` : contrôle des liens, ressources, traductions et structure.

## Corrections de l’audit

- Grille texte/image sans superposition ; menu replié à 1 250 px et cibles tactiles agrandies.
- Trois services à développer avant d’ouvrir un récapitulatif présélectionné : situation, rôle de coordination et limites à définir.
- Page Accompagnement distinguant besoin ponctuel et suivi dans la durée, préparation de l’échange, responsabilités, coûts et questions fréquentes.
- Section À propos et contact avec champs **TBD**, conformément à la demande du 15 novembre 2026 : présentation personnelle, e-mail, téléphone, zones couvertes. Aucun portrait, numéro ou adresse inventé.
- Formulaire sans catégorie arbitraire par défaut. Nom et situation obligatoires ; e-mail, pays et sujet facultatifs. Les catégories correspondent aux trois services présentés.
- Résultat explicite : aucun envoi, aucun rendez-vous réservé, aucun dossier en cours de traitement ; téléchargement local pour préparer le futur échange.
- Images WebP de 640, 960 et 1 536 px et polices WOFF2 latines couvrant les textes français et portugais. Les sources PNG/TTF restent disponibles mais ne sont plus chargées par les pages.

## Contenu et limites de cette version

Les grands domaines et le rôle d’intermédiaire proviennent du rendez-vous du 21 octobre 2026. Les situations illustrent les besoins à discuter, sans constituer un catalogue de prestations acceptées automatiquement. Le catalogue exact, les déplacements, les autorisations et les conditions commerciales doivent encore être validés avec Hélèna.

Les anciennes formules à 19, 49 et 99 € et les quotas non validés sont retirés. Une éventuelle cotisation n’est pas une offre disponible. Les actes et conseils spécialisés sont distingués du rôle de coordination de Luso Office.

Le formulaire ne possède aucun endpoint, envoi, stockage persistant, connexion ou suivi. Le fichier téléchargé reste sur l’appareil de l’utilisateur. Les informations de contact sont volontairement **TBD** ; aucun lien `mailto:` ou `tel:` fictif n’est généré. Les langues FR/PT désignent celles du site, sans affirmer les langues parlées par l’interlocuteur.

Les comptes rendus et autres documents privés restent hors du répertoire du site.

## Vérifications

```sh
node --check app.js
python3 scripts/check-site.py
```

Compléter par une vérification visuelle des deux langues, de la grille ordinateur/mobile, des détails de service, du menu et du parcours formulaire → résultat → téléchargement/modification.

## Dépôt et publication

GitHub Pages reste désactivé. Le domaine `lusooffice.com` est réservé ; les métadonnées ne le connectent pas à un hébergement. L’aperçu conserve `noindex, nofollow` et un `robots.txt` interdisant l’exploration jusqu’au lancement.

La branche `codex/luso-office-audit` consolide la version locale auditée, son harmonisation Luso Office et les corrections demandées. La branche précédente `codex/luso-office-branding` ne contient que l’ancienne étape d’harmonisation. La copie `../helena-site/` est une archive distincte et ne doit pas être publiée.

Un commit et un push sauvegardent le travail sur GitHub sans réactiver Pages ni modifier le DNS.
