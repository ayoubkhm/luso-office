# LusoOffice

Vitrine React / TypeScript pour les Portugais et lusodescendants vivant à l’étranger. LusoOffice remplace Perto de Casa ; le dépôt GitHub conserve son identifiant historique.

## Lancer et vérifier

```sh
npm ci
npm run dev
# http://127.0.0.1:4177/
npm run build
npm test
npm run preview
```

Le build génère 12 pages HTML en français et portugais dans `dist/`, avec leurs ressources optimisées, et deux redirections historiques. Le contenu public est pré-rendu ; React gère les filtres, les modalités d’adhésion et le récapitulatif local. Le serveur de développement utilise le repli Vite pour les routes ; le serveur de prévisualisation permet de vérifier les fichiers générés.

## Pages

- `index.html` : cinq domaines, adhésion ou service ponctuel, histoire et newsletter.
- `services.html` : 28 fiches bilingues, recherche, filtre par domaine, contenu, livrable, limites, unité et prix indicatifs.
- `adhesion.html` : propositions Member / Family / Premium, paiement mensuel ou annuel, avantages et FAQ. Premium reste à l’étude.
- `business.html` : coordination LusoOffice et interventions distinctes du comptable et du consultant, sept axes à développer.
- `a-propos.html` : histoire de la fondatrice, diaspora, présence internationale projetée, partenariat et contact TBD.
- `journal.html` : format de la newsletter « Portugal — Tão longe e tão perto » et projet Coffret da Lis, sans édition ni produit fictif.
- `/pt/` : mêmes pages en portugais. Le choix de langue conserve le domaine et les termes recherchés.
- `tarifs.html` : ancienne URL redirigée vers l’adhésion.

## Sources et statut commercial

La structure et les données sont tirées des deux fichiers fournis par Hélèna, conservés hors du dépôt public dans `../documents/luso-office/2026-11-15-recaps-chatgpt/` : compilation du 8 novembre 2026 et conversation du 22 octobre 2026. Les fichiers privés et leurs liens de bibliothèque ne sont pas inclus dans l’application.

Catalogue de base : Maison 8, Documents 6, Famille 5, Retour 5, Business 4. Chaque fiche distingue résultat, limites et tarification. La définition des interventions, des unités, du temps, du volume, des déplacements, de la TVA et des frais de tiers reste à valider. Les chevauchements relevés dans les sources sont signalés dans les limites concernées. Les thèmes supplémentaires (nationalité, NIF, pensions, etc.) sont présentés comme à l’étude, pas comme des services déjà commercialisés.

Les montants affichés sont uniquement les propositions en euros des documents : Member 29,90 €/mois ou 299 €/an ; Family 49,90 €/mois ou 499 €/an ; Premium 99,90 €/mois ou 999 €/an. Leur statut indicatif est visible. Aucune conversion de devise ou offre de marché non confirmée n’est inventée. L’adhésion et les services sont facturés séparément dans le modèle prévu ; l’accès aux prestations sans adhésion est explicite. Aucun quota ou délai garanti n’a été ajouté.

L’histoire de la fondatrice fille d’émigrants en France est issue de la compilation. Sa présentation personnelle, les coordonnées, les zones portugaises et l’identité juridique restent TBD conformément à l’instruction de l’utilisateur. Paris/Londres sont en recherche, Francfort/Genève proposées, Fall River retenue pour la recherche aux États-Unis ; aucun bureau n’est présenté comme ouvert. Les partenaires ne sont pas présentés comme contractualisés. Aucune donnée commerciale d’une autre marque n’est réutilisée.

## Parcours et limites

- Le visiteur consulte une fiche, un plan ou le partenariat et prépare un document texte local avec le sujet présélectionné.
- Nom et situation obligatoires ; e-mail et pays facultatifs. Aucun document sensible demandé.
- Le résultat précise qu’aucune demande n’a été envoyée ; il permet téléchargement et modification.
- Aucun stockage persistant, endpoint, envoi, paiement, compte, newsletter active, suivi de dossier ou backoffice. « O meu Portugal » est explicitement un espace prévu.
- Les prochaines phases fonctionnelles demandent un cadrage dédié : identification juridique, contrats, paiement, accès, sécurité documentaire, rôles des opérateurs et partenaires.

## Design et architecture

Palette conservée et affinée : bleu cobalt `#164bcb`, marine `#092245`, blanc `#f8fbff`, bleu clair `#e9f2fc`, accent azulejo jaune `#e7c65c`. Manrope, titres lisibles et lignes de texte courtes. L’image d’azulejos porte l’identité ; le catalogue utilise des fiches développables et les plans une comparaison lisible. Pas de portrait, témoignage, statistique de clientèle ni implantation inventés.

- `src/catalogue.ts` : catalogue typé, traductions, plans, recherche et formatage des prix.
- `src/App.tsx` : pages et composants partagés, navigation, dialogues et formulaire.
- `src/routes.ts` : routes, métadonnées et sérialisation du récapitulatif.
- `scripts/prerender.mjs` : génération des pages FR/PT et anciennes routes.
- `scripts/site.test.mjs` : contrôles de données, recherche, prix, routes, récapitulatif et sortie statique.
- `public/assets/` : images WebP et polices WOFF2. Les sources historiques restent dans `assets/` mais ne sont pas publiées par le build.

## Hébergement

Le domaine `lusooffice.com` est réservé. Les métadonnées ne le connectent pas à un hébergement. `noindex, nofollow` et `robots.txt` bloquent volontairement l’indexation de cette version de travail. GitHub Pages reste désactivé. Le commit/push sauvegarde le travail, sans déploiement ni modification DNS. La copie historique `../helena-site/` n’est pas la source active.

## Vérifications de cette version

Build TypeScript/Vite et sept tests automatisés réussis. Contrôle manuel dans Chrome : accueil et catalogue en français, catalogue et adhésions en portugais à 320 px, filtre conservé au changement de langue, détail de prestation, sujet présélectionné, création et modification du récapitulatif sans envoi, bascule des tarifs mensuels/annuels. Ces contrôles ciblés ne constituent pas une validation exhaustive sur tous les navigateurs.
