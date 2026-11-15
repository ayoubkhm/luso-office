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

Le build génère 14 pages HTML en français et portugais dans `dist/`, avec leurs ressources optimisées, et deux redirections historiques. Le contenu public est pré-rendu ; React gère les filtres, les modalités d’adhésion et le récapitulatif local. Le serveur de développement utilise le repli Vite pour les routes ; le serveur de prévisualisation permet de vérifier les fichiers générés.

## Pages

- `index.html` : cinq domaines, adhésion ou service ponctuel, histoire et newsletter.
- `services.html` : 28 fiches bilingues, recherche, filtre par domaine, contenu, livrable, limites, unité et prix indicatifs.
- `adhesion.html` : propositions Member / Family / Premium, paiement mensuel ou annuel, avantages et FAQ. Premium reste à l’étude.
- `business.html` : coordination LusoOffice et interventions distinctes du comptable et du consultant, sept axes à développer.
- `a-propos.html` : histoire de la fondatrice, diaspora, présence internationale projetée, partenariat et contact TBD.
- `journal.html` : format de la newsletter « Portugal — Tão longe e tão perto » et projet Coffret da Lis, sans édition ni produit fictif.
- `espace.html` : atelier interactif « O meu Portugal », vues adhérent, équipe et partenaire, entièrement en mémoire.
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
- Aucun stockage persistant, endpoint, envoi, paiement, compte, newsletter active, suivi de dossier ou backoffice. « O meu Portugal » dispose désormais d’une maquette interactive, sans authentification ni persistance.
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

Build TypeScript/Vite et tests automatisés du site et des transitions métier (voir `npm test`). Contrôle manuel dans Chrome : accueil et catalogue en français, catalogue et adhésions en portugais à 320 px, filtre conservé au changement de langue, détail de prestation, sujet présélectionné, création et modification du récapitulatif sans envoi, bascule des tarifs mensuels/annuels. Ces contrôles ciblés ne constituent pas une validation exhaustive sur tous les navigateurs.

## Conception des espaces et des opérations

### Périmètre de l’atelier

Ouvrir `/espace.html` ou `/pt/espace.html`. Le sélecteur de vue permet de suivre les mêmes données fictives entre adhérent, équipe et partenaire. Le changement FR/PT conserve la session ; le rechargement la réinitialise. Le retour au site quitte cette session. Les documents sont des intitulés, sans sélection de fichier. Aucun paiement, e-mail, invitation, facture ou compte réel n’est créé.

Validation de l’atelier : build et 22 tests réussis (7 contrôles du site, 15 scénarios métier). Chrome a permis de vérifier la composition desktop et le parcours accord → paiement en attente → refus → nouvel essai → confirmation. La revue visuelle à 320 px est partielle : captures recadrées puis erreur ScreenCaptureKit ; ne pas considérer tous les écrans mobiles comme visuellement validés. Cette deuxième itération ajoute un sélecteur de section sur mobile. La nouvelle vue d’ensemble et le dossier avec pièce manquante ont été contrôlés dans Chrome ; les bascules de fenêtre pendant le pilotage ont limité la suite de la revue. Le contrôle visuel complet des nouveaux parcours, notamment sur mobile, reste à compléter. Pour la troisième itération, l’onglet local a été retrouvé mais sa lecture via la connexion Chrome échoue ; les nouveaux écrans d’annulation/reprise ne sont pas déclarés visuellement validés.

Les écrans constituent une proposition de conception issue du brief, pas une validation des conditions commerciales par Hélèna. Les états, rôles et règles détaillés ci-dessous sont proposés. Le navigateur contient toutes les données démo : les filtres de rôle ne sont pas une sécurité. Ne jamais connecter de données personnelles à cette implémentation.

| Besoin | Parcours démontrable | Reste à connecter / concevoir en détail |
| --- | --- | --- |
| Compte | Profil, pays, langue, préférence newsletter, invitations Family limitées à trois bénéficiaires | Identité vérifiée, récupération d’accès, sessions, authentification renforcée, acceptation d’invitation, suppression/export |
| Biens et documents | Ajout/modification d’un bien, rattachement des demandes, pièces attendues, vérification/refus motivé, nouvelle version avec historique, partage explicite, réception/restitution d’original | Mandats, stockage privé, contrôle des fichiers réels, conservation, preuves de garde et restitution |
| Demandes et messages | Création, réception équipe, proposition détaillée, accord, provision, mission, livrable et clôture ; recherche/filtres, tâches datées et attribuées, blocages, échanges et notes internes ; annulation examinée, correction, réouverture motivée et reprise indépendante | API, notifications et rappels, litiges, conditions commerciales et rapprochement financier |
| Paiements | Provision séparée de l’adhésion, confirmation/refus, nouvelle tentative, changement de formule, résiliation à échéance | Prestataire de paiement, devis contractuel, prorata, réconciliation, remboursements, émission fiscale et avoirs |
| Administration et partenaires | Attribution/révocation par dossier, partage/retrait de pièces, vue partenaire restreinte, suspension globale et réattribution des tâches, journal d’actions démo | Rôles serveur séparés, invitations nominatives, gestion des clients, éditeur du catalogue et journal d’audit durable |
| Newsletter | Brouillon de quatre rubriques, extrait, relecture, publication démo, audience, file de distribution annulable, désinscription, édition suivante et archives en session | Calendrier, éditeur/publieur distincts, moteur d’envoi, suivi des erreurs, rebonds/plaintes et archives publiques |

### Deuxième itération de la démo

- Les tâches ont un responsable équipe/partenaire, une date facultative, quatre états et un motif de blocage. Leur liste se filtre et se trie par échéance. Les dossiers clos ne sont plus modifiables via ces opérations.
- Une pièce déposée reste en attente de vérification. Un refus exige un motif ; son remplacement conserve la version précédente. Les pièces requises non acceptées bloquent le démarrage, la remise et la clôture ; les tâches ouvertes bloquent la remise et la clôture.
- Suspendre le partenaire retire ses dossiers, pièces, tâches et conversations de sa vue démo. L’équipe conserve les attributions et peut reprendre ses tâches. Le rétablissement réactive les attributions conservées après confirmation explicite dans la maquette.
- Une édition publiée peut être archivée pour commencer le brouillon suivant. Une campagne encore en attente doit d’abord être annulée. L’archive conserve le contenu et le bilan simulé ; aucune diffusion réelle.
- La recherche de dossiers accepte accents et numéros, les fiches de biens sont modifiables, et la navigation mobile expose toutes les sections dans un sélecteur.

Les cinq nouveaux scénarios automatisés couvrent les corrections documentaires, les restrictions et échéances des tâches, la suspension/reprise partenaire, les archives éditoriales et la recherche liée aux biens.

### Troisième itération : exceptions et reprise des dossiers

L’annulation est une proposition de fonctionnement à valider avec Hélèna, sans valeur contractuelle :

- Adhérent ou équipe demande l’annulation avec un motif. L’exécution, les nouveaux paiements, les dépôts et les nouveaux partages sont suspendus. Les échanges, le retrait des accès et la restitution d’originaux restent possibles.
- L’auteur peut retirer sa demande. L’équipe peut refuser avec un motif ou confirmer. Une tentative de paiement déjà en attente doit d’abord aboutir à une confirmation ou un échec simulé. Le refus et le retrait reprennent le dossier à son étape précédente.
- La confirmation conserve le dossier, ses tâches et ses pièces ; elle ne marque pas artificiellement les tâches abandonnées comme terminées. Elle retire l’attribution partenaire. Une provision réglée reste inscrite, avec un bilan à préparer : aucun remboursement/avoir ni règle de frais n’est inventé.
- Après annulation, l’adhérent peut reprendre le besoin dans un nouveau dossier relié au précédent. Seuls service, bien et description sont repris. Le nouveau dossier attend un cadrage et une proposition ; paiement, documents, notes et accès ne sont pas transférés.
- Un livrable remis peut être renvoyé pour correction par l’adhérent ou l’équipe. Après clôture, seule l’équipe peut rouvrir avec un motif. Les deux actions créent une tâche obligatoire à traiter et conservent la provision et les accès existants sans rétablir ceux qui ont été retirés.
- Un historique de décisions conserve motifs et rôles dans la session. La liste des demandes permet de filtrer les annulations à examiner. Les tâches des dossiers suspendus/clos restent dans « Toutes », en lecture seule.

Validation automatisée : quatre nouveaux scénarios couvrent le gel/retrait/refus, le paiement en attente, l’annulation avec révocation et reprise indépendante, puis les corrections/réouvertures avec tâche obligatoire. La connexion navigateur n’a pas permis la revue visuelle de cette itération.

### Scénario de revue avec Hélèna

1. Adhérent → Demandes : créer une demande fictive. Équipe → Demandes : ouvrir le même identifiant, commencer le cadrage et proposer les montants de coordination, frais officiels et tiers.
2. Adhérent : simuler l’accord puis le paiement. Un refus laisse la mission bloquée ; une nouvelle tentative confirmée autorise son démarrage par l’équipe.
3. Équipe : attribuer au partenaire. Dans Documents, autoriser uniquement les pièces nécessaires. Partenaire : consulter la mission, échanger, ajouter un livrable fictif et le remettre pour vérification. Partenaire → Tâches : terminer les actions attribuées. Équipe : vérifier les pièces demandées, puis clôturer après contrôle.
4. Adhérent → Adhésion : simuler le passage à Family. Un échec conserve Member ; une confirmation applique Family. Mon compte : préparer trois invitations au maximum. Résilier à échéance conserve les droits de la période courante.
5. Équipe → Journal : compléter titre, extrait et quatre rubriques, soumettre à relecture, relire la version enregistrée et simuler sa publication. Préparer la campagne. Adhérent → Journal : se désinscrire. Équipe : simuler la distribution ; le destinataire retiré est exclu. Aucun e-mail n’est envoyé. Préparer l’édition suivante et retrouver le contenu publié dans les archives.
6. Adhérent → DEMO-002 : fournir la pièce attendue. Équipe → Documents : demander une correction avec un motif. Adhérent : déposer une nouvelle version. Équipe : vérifier la version corrigée ; la précédente reste consultable.
7. Équipe → Tâches : créer une action avec une date, l’attribuer au partenaire du dossier. Partenaire : la bloquer avec un motif. Équipe → Administration : suspendre son accès, puis reprendre la tâche pour la terminer. Vérifier la disparition des dossiers dans la vue partenaire.

8. Adhérent → DEMO-001 : demander l’annulation avec un motif. Équipe : retrouver la demande via « Annulation à examiner », la refuser avec un motif puis examiner une nouvelle demande. Confirmer : le dossier est conservé, son partenaire perd l’accès et la provision reste à rapprocher.
9. Adhérent : reprendre le besoin annulé ; vérifier le nouvel identifiant, le lien au dossier source et l’absence de paiement/pièces transférés. Sur un autre dossier remis, demander une correction puis terminer la tâche créée avant une nouvelle remise.

### Modèle serveur proposé

Application React/TypeScript existante, API Node/TypeScript, base relationnelle, stockage privé pour fichiers, traitements asynchrones pour notifications et paiements. Les fournisseurs et l’hébergement restent à sélectionner ; aucun abonnement technique n’a été souscrit. Les fichiers statiques GitHub Pages ne suffisent pas pour héberger ces fonctions serveur.

| Ensemble | Objets principaux et liens |
| --- | --- |
| Identité | `User`, `Session`, `Household`, `HouseholdMember`, `Invitation`, `RoleGrant` ; invitations expirables, propriétaire et bénéficiaires distincts |
| Opérations | `Property`, `Mandate`, `ServiceRequest`, `Task`, `Assignment`, `RequestEvent` ; propriétaire/mandat, commune, service et intervenants identifiés |
| Documents | `Document`, `DocumentVersion`, `DocumentGrant`, `CustodyEvent` ; rattachement dossier, taille/type/empreinte, validation, déposant, détenteur, réception et restitution avec preuve |
| Échanges | `Thread`, `Message`, `InternalNote` ; participants explicitement dérivés des accès au dossier, notes internes séparées |
| Commerce | `PlanVersion`, `Subscription`, `QuoteVersion`, `QuoteLine`, `PaymentAttempt`, `Invoice`, `CreditNote` ; montants en unités monétaires entières, devise et traitement fiscal explicites |
| Éditorial | `Edition`, `EditionRevision`, `Publication`, `ConsentEvent`, `Campaign`, `Delivery` ; version publiée immuable et livraison unique par destinataire/édition |
| Traçabilité | `AuditEvent`, `OutboxEvent`, `ProviderEvent` ; auteur, date serveur, objet, version, résultat et identifiant d’événement externe |

L’accès sans adhésion doit rester possible dans la version connectée : un client peut avoir un compte et commander un service au tarif non-adhérent. L’adhésion active est un droit commercial distinct de l’authentification. Pour Family, appartenir au foyer ne donne pas automatiquement accès à tous les dossiers ; les droits sur les biens et pièces doivent être explicites.

### Contrats d’opérations à implémenter

API conceptuelle, non exposée dans la maquette :

- `POST /requests` : identité/mandat vérifiés, service et périmètre validés, clé d’idempotence. Transaction unique pour demande, événement et notification à traiter ; le numéro de dossier est renvoyé après persistance. Un échec d’e-mail ne doit pas perdre le dossier ni annoncer un envoi réussi.
- `POST /requests/:id/quotes` puis `POST /quotes/:id/accept` : proposition versionnée, durée de validité, montants et pièces contractuelles. Un accord porte sur une version précise, pas sur un tarif modifiable après coup.
- `POST /payments/checkout` : montant et devise recalculés depuis la proposition côté serveur. Retour navigateur ≠ confirmation de paiement. L’événement signé du prestataire est vérifié, dédoublonné et rapproché ; aucun champ `paid=true` envoyé par le client ne fait foi.
- `POST /subscriptions/:id/change` et `/cancel-at-period-end` : date d’effet et règles commerciales visibles avant confirmation. L’ancien droit reste actif pendant une tentative de changement ; impayé, reprise, expiration et remboursement demandent des transitions dédiées.
- `POST /requests/:id/assignments` et `POST /documents/:id/grants` : vérification indépendante de l’attribution et du partage. Chaque lecture/téléchargement vérifie propriétaire, rôle, mandat et révocation. URL de téléchargement temporaire, absence d’index public et analyse des fichiers avant disponibilité.
- `POST /requests/:id/messages` : participants autorisés ; stockage avant notification, identifiant stable contre le double envoi. Historique de garde des originaux append-only, distinct des copies numériques.
- `POST /editions/:id/review`, `/publish`, puis `POST /campaigns` : version figée approuvée, calendrier et fuseau explicites. Le job recontrôle préférences, suppression et éligibilité avant chaque livraison ; identifiant unique, tentatives bornées et reprise des échecs sans double diffusion. Désinscription depuis chaque e-mail, prise en compte des rebonds et plaintes.

Les rôles opérateur, éditeur, publieur, facturation et administrateur seront séparés côté serveur. Le partenaire n’accède pas aux notes internes, aux coordonnées non nécessaires, aux autres clients, au catalogue d’administration ou à la facturation globale. La révocation annule immédiatement les lectures futures ; elle ne peut pas rappeler un document déjà téléchargé.

### Décisions nécessaires avant branchement réel

- Entité émettrice, coordonnées, périmètres/mandats, zones couvertes, catalogue final et partenaires habilités.
- Tarifs, TVA, devises/marchés, modalités de renouvellement, prorata, bénéficiaires, remboursements et rapprochement des provisions. Premium reste à l’étude ; les tarifs de marché DE/UK/CH/US évoqués ne deviennent pas des conversions automatiques.
- Politique documentaire : données collectées, personnes habilitées, conservation, originaux, restitution, export et suppression. Conditions et modèles contractuels à faire valider à partir des documents complets.
- Responsables de validation, séparation des rôles, calendrier et rubriques définitives du journal. Les quatre intitulés de la maquette sont des propositions, pas des rubriques approuvées extraites mot pour mot.
- Fournisseurs d’identité, paiement, stockage, facturation et e-mail ; domaine d’envoi authentifié, environnement de test puis production. FR/PT sont conçus ici ; DE/EN restent à produire et relire.

### Ordre d’implémentation proposé

1. Identité, droits, schéma de données et dossiers/messages persistants en environnement de test. Vérifier l’isolation entre deux foyers et la révocation partenaire.
2. Documents privés, contrôle des fichiers, accès temporaires, tâches et traçabilité des originaux. Tester les téléchargements après révocation.
3. Paiements et abonnements en bac à sable, facturation et rapprochement. Tester événements dupliqués/désordonnés, échec, annulation, remboursement et absence de double débit.
4. Journal éditorial, envois de test, consentements, planification et reprise des erreurs. Tester la désinscription après préparation d’une campagne.
5. Traductions complémentaires, accessibilité, sauvegarde/restauration, exploitation et revue de lancement. Activer les services réels seulement après validation et configuration des comptes de la société.
