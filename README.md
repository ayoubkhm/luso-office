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

Ouvrir `/espace.html` ou `/pt/espace.html`. Le sélecteur de vue permet de suivre les mêmes données fictives entre adhérent, équipe et partenaire. Le changement FR/PT conserve la session ; le rechargement la réinitialise. Le retour au site quitte cette session. Les documents sont des intitulés, sans sélection de fichier. Les brouillons de messages et les états de lecture sont également limités à cette session en mémoire. Aucun paiement, e-mail, invitation, facture ou compte réel n’est créé.

Validation de l’atelier : build et 54 tests réussis (7 contrôles du site, 40 scénarios métier et parcours, 3 contrôles de rendu des dossiers, 4 contrôles des tâches et échéances). Les six exemples guidés ont été déroulés jusqu’à leur dernière étape via les mêmes transitions que l’interface. Les contrôles Chrome antérieurs couvrent certains écrans desktop et un parcours de paiement, mais pas toutes les évolutions suivantes. La revue visuelle mobile et celle des nouveaux écrans restent à compléter : l’ouverture automatisée dans Chrome échoue encore. Ne pas considérer la démo comme visuellement validée sur tous les navigateurs.

Les écrans constituent une proposition de conception issue du brief, pas une validation des conditions commerciales par Hélèna. Les états, rôles et règles détaillés ci-dessous sont proposés. Le navigateur contient toutes les données démo : les filtres de rôle ne sont pas une sécurité. Ne jamais connecter de données personnelles à cette implémentation.

| Besoin | Parcours démontrable | Reste à connecter / concevoir en détail |
| --- | --- | --- |
| Compte | Profil, pays, langue, préférence newsletter, invitations Family avec acceptation/expiration/retrait simulés, partages explicites et aperçu bénéficiaire | Identité vérifiée, récupération d’accès, sessions, authentification renforcée, jetons et acceptation réelle, suppression/export |
| Biens et documents | Ajout/modification d’un bien, rattachement des demandes, pièces attendues, vérification/refus motivé, nouvelle version avec historique, partage explicite, réception/restitution d’original | Mandats, stockage privé, contrôle des fichiers réels, conservation, preuves de garde et restitution |
| Demandes et messages | Création, réception équipe, propositions versionnées avec périmètre et ajustements, accord sur une version précise, provision, mission, livrable et clôture ; recherche/filtres, tâches datées et attribuées, blocages, échanges, non-lus, brouillons par rôle/dossier et notes internes ; annulation examinée, correction, réouverture motivée et reprise indépendante | API, notifications et rappels, litiges, conditions commerciales et rapprochement financier |
| Paiements | Provision séparée de l’adhésion, confirmation/refus, nouvelle tentative, changement de formule, résiliation à échéance ; bilan versionné, correction, accord et simulation de solde/remboursement | Prestataire de paiement, devis contractuel, prorata, rapprochement bancaire, exécution des remboursements, émission fiscale et avoirs |
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

### Quatrième itération : messagerie et actions à suivre

L’accueil présente désormais des actions calculées selon les droits et l’état du dossier : proposition à examiner, provision, documents à fournir/vérifier/corriger, tâches, livrable, annulation, messages non lus et restitution d’originaux après clôture. Une pièce déposée en attente de vérification devient une action équipe, pas une relance à l’adhérent. La suspension d’un dossier masque les actions d’exécution ; un paiement déjà en attente reste à résoudre.

La messagerie dispose d’une recherche par dossier/service et de filtres « non lus » et « brouillons ». Chaque conversation montre son dernier échange, les messages non lus et un lien vers le dossier. Le fil est accessible au clavier et se place au dernier message quand la conversation change ou reçoit un nouvel ajout dans la démo.

- « Marquer cette conversation comme lue » ne concerne que le rôle actif, le dossier accessible et les messages jusqu’à celui affiché lors du clic. La lecture n’est pas déduite de l’ouverture de l’écran et aucun accusé de lecture réel n’est envoyé.
- Chaque rôle conserve un brouillon distinct par dossier. Changer de rubrique, de langue ou de rôle ne l’efface pas. Seul un envoi simulé réussi efface le brouillon correspondant ; les autres restent conservés. Le rechargement et la réinitialisation effacent toute la session.
- Les brouillons et lectures ne remplissent pas le journal opérationnel à chaque frappe. Les notes internes restent séparées des messages partagés.
- Les compteurs de non-lus et actions appliquent les mêmes restrictions que les dossiers. Un accès partenaire retiré/suspendu masque également ses alertes.

Validation : quatre nouveaux tests couvrent les lectures indépendantes et leur borne, les brouillons et échecs d’envoi, la répartition des actions entre adhérent/équipe et la révocation/restitution d’originaux. Build et 26 tests réussis. La connexion Chrome a de nouveau empêché l’ouverture de l’aperçu automatisé : revue visuelle de la nouvelle messagerie et contrôle mobile encore à réaliser.

### Cinquième itération : propositions et accords versionnés

La proposition de démonstration conserve désormais son périmètre, ses exclusions/points à confirmer, les trois montants et son numéro de version. L’adhérent relit le détail avant de simuler son accord ; l’action porte sur le numéro affiché. L’ancienne transition générique vers « accord » ne suffit plus.

- Avant accord, l’adhérent peut demander un ajustement motivé ; l’équipe peut également retirer sa version pour la réviser. Le dossier revient au cadrage et cette version n’est plus acceptable.
- L’équipe prépare la version suivante à partir du contenu précédent. Le périmètre est obligatoire ; les montants restent contrôlés. Les anciennes versions gardent leurs montants, leur contenu et le motif de révision. L’écart de provision est affiché.
- Seule la dernière version proposée peut être acceptée, dans la vue adhérent. L’accord fige cette version ; un paiement simulé n’est disponible qu’après cet accord. Un paiement refusé ne change pas la proposition acceptée.
- Une annulation en examen bloque aussi l’accord et la révision. La reprise dans un nouveau dossier ne transfère aucune proposition ni aucun accord.
- Le partenaire ne voit pas ces propositions commerciales. Après accord, un changement de périmètre nécessitera un parcours d’avenant séparé, non implémenté ici.

Ces propositions restent sans valeur contractuelle. TVA, conditions, frais réels et règles commerciales doivent être validés avant tout branchement réel ; aucun document contractuel n’est émis. Quatre nouveaux scénarios testent les versions obsolètes, l’immutabilité, les rôles, le gel et la reprise. Build et 30 tests réussis. La revue visuelle de cette étape reste à faire : le contrôle natif de Chrome n’a pas maintenu la fenêtre de démo sélectionnée.

### Sixième itération : Family et accès des bénéficiaires

Le titulaire peut désormais préparer jusqu’à trois invitations réservant des places, simuler leur acceptation/expiration et retirer une invitation ou un accès. Les adresses sont normalisées et les doublons empêchés. Une invitation renouvelée reçoit une nouvelle génération ; une ancienne acceptation n’est plus valide. La durée de validité réelle et les règles commerciales restent à définir.

- Accepter une invitation ne partage rien. Le titulaire autorise séparément chaque résumé de dossier puis chaque document. Retirer un dossier enlève également ses partages documentaires ; le repartager ne rétablit pas les pièces automatiquement.
- L’aperçu bénéficiaire est une projection en lecture seule : identifiant, service, étape, nom/commune du bien associé et intitulés/versions des pièces accordées. Il ne contient ni montants, ni propositions, ni notes internes, ni conversations. Ce n’est pas encore un espace connecté permettant au bénéficiaire de travailler sur ses propres dossiers.
- Remplacer une pièce retire son partage Family jusqu’à une nouvelle décision du titulaire. Ces partages sont distincts des autorisations partenaire.
- Les droits Family dépendent de la formule active, pas du résultat de la dernière tentative de changement. Une tentative échouée et une résiliation à échéance conservent donc les droits actuels dans la démo.
- Un changement confirmé vers Member retire les invitations en attente et accès actifs, en conservant leur historique. Le parcours de paiement l’explique avant simulation. Revenir à Family ne réactive rien automatiquement : nouvelle invitation, acceptation et partages explicites nécessaires. Il s’agit de la règle proposée pour cette démo ; les dates d’effet commerciales ne sont pas calculées.

Validation : quatre scénarios couvrent capacité/générations, minimisation de l’aperçu, changements de formule et retrait des partages après remplacement/révocation. Build et 34 tests réussis. La revue visuelle des nouveaux écrans reste à réaliser, le pilotage navigateur étant resté instable lors des dernières tentatives.

### Parcours guidés dans l’interface

Le bouton « Parcours guidés » du bandeau et la rubrique du même nom proposent six exemples prêts à explorer :

| Exemple | Résultat à observer |
| --- | --- |
| Le bilan d’une mission | Bilan proposé et approuvé, puis remboursement simulé avec suivi des tentatives |
| Une proposition à ajuster | Nouvelle version proposée, accord lié à cette version et provision simulée |
| Une pièce à corriger | Dépôt, refus motivé, remplacement et validation de la nouvelle version |
| Une mission avec un partenaire | Partage sélectif, tâche terminée, remise et clôture par l’équipe |
| Un bénéficiaire Family | Invitation acceptée, dossier/pièce partagés, puis accès retiré |
| Une édition du journal | Relecture, publication démo et exclusion d’un désinscrit avant distribution simulée |

Le chargement nécessite une confirmation explicite dans l’interface : il remplace l’état de la session, y compris ses brouillons. Les exemples utilisent uniquement des données fictives et préparent leur état avec les transitions métier ordinaires. Le texte du journal fourni sert uniquement à tester l’interface.

Un encart indique la consigne et ouvre le bon rôle, la bonne rubrique et le dossier concerné. L’utilisateur effectue lui-même les actions ; le guide observe ensuite le résultat attendu pour avancer d’une étape. Les étapes déjà réalisées restent comptées même si une action ultérieure retire le partage testé. Si le visiteur sort de la séquence et rend une étape impossible, il peut recommencer l’exemple depuis la liste des parcours.

« Quitter le guide, garder la session » conserve les données et retire seulement les consignes. La réinitialisation remet le scénario initial et efface aussi la progression du guide. Un changement manuel de rôle conserve désormais la rubrique et le dossier quand ils sont accessibles ; sinon il revient à une vue autorisée. Les formulaires de chaque rôle sont remontés pour éviter de garder leurs états visuels d’une vue à l’autre. Les brouillons de messages enregistrés dans l’état de la démo restent conservés.

Validation : isolation des exemples, absence d’étape déjà validée au chargement, exécution complète des cinq suites et vérification qu’un retrait Family sans partage ne valide pas l’étape manquante. Contrôle visuel des guides encore à réaliser.

### Bilans des dossiers et rapprochement de la provision

La rubrique « Bilans des dossiers » distingue la provision d’origine du total final proposé, pour les dossiers clos/annulés dont la provision est confirmée dans la démo. L’équipe explique les montants de coordination, frais officiels et tiers. Le calcul au centime donne soit un solde à payer, soit un remboursement, soit une différence nulle.

- L’adhérent peut demander une correction motivée. L’équipe soumet alors une nouvelle version ; les montants, explications et motif de correction antérieurs sont conservés. Seule la dernière version proposée est acceptable.
- Après accord simulé, les montants sont figés. Une différence nulle solde le bilan sans tentative de paiement. Un complément se simule dans la vue adhérent ; un remboursement se simule dans la vue équipe.
- La simulation distingue préparation, résultat en attente, échec, nouvel essai et confirmation. Les tentatives restent visibles. Une confirmation ne peut pas être appliquée une seconde fois et la provision d’origine n’est jamais réécrite.
- L’accueil signale les bilans à préparer, ceux à examiner et les opérations à suivre, selon le rôle. Les vues partenaire et bénéficiaire Family n’incluent pas ces bilans.
- Rouvrir une mission avant accord financier rend son bilan précédent obsolète. Après accord financier, la démo garde le dossier clos et demande un nouveau dossier pour un nouveau besoin. Cette limitation de conception reste à valider avec Hélèna ; les avenants/rectifications après règlement ne sont pas couverts.

Un sixième parcours guidé charge une mission close avec une provision fictive de 39 € et propose de tester un bilan fictif de 25 €, uniquement pour illustrer un remboursement de 14 €. Ce ne sont pas des tarifs ni des conditions d’annulation. Aucun prélèvement, virement, remboursement, facture ou avoir réel n’est exécuté ; TVA, justificatifs et règles commerciales restent à valider.

Validation : six nouveaux tests couvrent éligibilité, montants, corrections/version obsolète, double confirmation, échecs/reprise, différence nulle, réouverture et dossier repris sans historique financier. Les six parcours guidés passent également jusqu’à leur dernière étape. Build et 43 tests réussis. La validation visuelle reste à compléter compte tenu de l’indisponibilité persistante du pilotage Chrome lors des dernières tentatives.

### Lisibilité du suivi et des confirmations

- Les actions réussies affichent une confirmation précise FR/PT avec le numéro du dossier lorsqu’il existe. Les décisions opposées (accord/refus, partage/retrait, activation/suspension) et les résultats de paiement simulés sont distingués.
- Administration → Activité de la session : journal lisible, du plus récent au plus ancien, filtrable par texte, rubrique, rôle et dossier. Les actions ouvrent la rubrique concernée ; les tâches ouvrent leur dossier, dont la section Tâches permet de retrouver aussi les éléments terminés.
- Chaque dossier dispose d’un historique repliable réservé à l’équipe. Les événements liés aux documents et tâches sont rattachés au bon dossier ; une reprise renvoie au nouveau dossier.
- Le journal contient uniquement le libellé d’action, le rôle, la rubrique, un numéro de séquence et éventuellement le dossier. Les textes des messages, notes, motifs et coordonnées ne sont pas recopiés. Aucune date serveur, identité vérifiée ou conservation durable n’est simulée comme acquise.
- Les recherches de dossiers et d’activité sans résultat permettent d’effacer les filtres.

Validation : quatre tests supplémentaires couvrent rattachement des événements, absence de contenu privé recopié, filtres combinés FR/PT, restriction aux vues équipe et libellés des décisions/paiements. Build et 47 tests réussis. Contrôle visuel des nouveaux éléments à compléter : le pilotage Chrome échoue encore lors de l’accès à l’onglet local.

### Navigation dans les dossiers

La fiche est organisée en rubriques FR/PT : « Suivi de la mission », « Proposition et provision », « Décisions et suites » et, pour l’équipe seule, « Travail de l’équipe » (attribution, notes et activité). Le partenaire ne reçoit que la rubrique de suivi ; les panneaux financiers et internes ne sont pas rendus dans sa vue.

L’ouverture privilégie la prochaine étape : proposition pendant le cadrage et l’accord, provision pour l’adhérent après accord, suivi pour l’exécution, décisions pour l’annulation et la revue du livrable côté adhérent. Un paiement déjà en attente reste accessible pendant l’examen d’une annulation. Après clôture, un message explique la situation et permet d’ouvrir le bilan. Les boutons de documents et de messages restent au-dessus des rubriques.

Les onglets ont des liens ARIA vers leurs panneaux, un seul point d’entrée au clavier, et les commandes flèches gauche/droite, Début/Fin. Les panneaux inactifs restent montés mais masqués : changer de rubrique dans le même dossier conserve les champs non soumis. Quitter le dossier, changer de rôle ou recharger conserve les limites de session existantes.

Validation : trois tests de rendu exercent les transitions proposition/paiement/mission/clôture, l’annulation avec paiement en attente, les panneaux autorisés par rôle et les associations ARIA dans les deux langues. Build et 50 tests réussis. Le comportement clavier interactif, la conservation des champs à l’écran et la mise en page mobile restent à vérifier dans un navigateur ; l’accès automatisé à Chrome est toujours indisponible.

### Tâches et échéances

La vue Tâches et la rubrique de suivi d’un dossier proposent une recherche sans distinction d’accents (intitulé, dossier, service localisé, bien), des filtres par responsable, état et échéance, et un filtre par dossier dans la vue globale. Les dates sont triées de la plus proche à la plus lointaine, puis viennent les tâches sans date.

Les repères « Date dépassée », « Aujourd’hui » et « Sans date » concernent les tâches actives correspondant à la recherche, au responsable et au dossier sélectionnés. Un clic filtre la liste ; le filtre d’échéance propose aussi les sept prochains jours et les dates plus lointaines. Le jour de référence est celui du navigateur, affiché à l’écran ; il est recalculé à chaque rendu. Les dates restent des objectifs fictifs sans délai garanti, sans calendrier partagé ni notification réelle.

Les tâches terminées et celles des dossiers suspendus/clos sont conservées dans des vues distinctes et exclues des compteurs d’échéance. La vue partenaire reste limitée aux tâches qui lui sont attribuées et aux dossiers auxquels il a accès. Les filtres n’élargissent pas ces droits de démonstration.

Correction de parcours : lorsqu’un dossier précis est affiché ou filtré, la création de tâche lui est strictement rattachée. Le formulaire disparaît s’il est suspendu ou clos, au lieu de proposer silencieusement un autre dossier. Une création réussie retire les filtres de recherche/échéance pour rendre la nouvelle tâche visible. Les échecs de modification du responsable ou de la date remontent maintenant dans le formulaire.

Validation : quatre tests supplémentaires couvrent les frontières calendaires (dont année, année bissextile et changement d’heure), les filtres combinés FR/PT, les compteurs après clôture d’une tâche ou suspension/reprise d’un dossier, l’isolation partenaire et le rendu du formulaire de création. Build et 54 tests réussis. La revue visuelle et interactive reste à compléter : l’accès automatisé à l’onglet Chrome local échoue encore.

### Scénario de revue avec Hélèna

1. Adhérent → Demandes : créer une demande fictive. Équipe → Demandes : ouvrir le même identifiant, commencer le cadrage et proposer les montants de coordination, frais officiels et tiers.
2. Adhérent : simuler l’accord puis le paiement. Un refus laisse la mission bloquée ; une nouvelle tentative confirmée autorise son démarrage par l’équipe.
3. Équipe → Demandes → Travail de l’équipe : attribuer au partenaire. Dans Documents, autoriser uniquement les pièces nécessaires. Partenaire : consulter la mission, échanger, ajouter un livrable fictif et le remettre pour vérification. Partenaire → Tâches : terminer les actions attribuées. Équipe : vérifier les pièces demandées, puis clôturer après contrôle.
4. Adhérent → Adhésion : simuler le passage à Family. Un échec conserve Member ; une confirmation applique Family. Mon compte : préparer trois invitations au maximum. Résilier à échéance conserve les droits de la période courante.
5. Équipe → Journal : compléter titre, extrait et quatre rubriques, soumettre à relecture, relire la version enregistrée et simuler sa publication. Préparer la campagne. Adhérent → Journal : se désinscrire. Équipe : simuler la distribution ; le destinataire retiré est exclu. Aucun e-mail n’est envoyé. Préparer l’édition suivante et retrouver le contenu publié dans les archives.
6. Adhérent → DEMO-002 : fournir la pièce attendue. Équipe → Documents : demander une correction avec un motif. Adhérent : déposer une nouvelle version. Équipe : vérifier la version corrigée ; la précédente reste consultable.
7. Équipe → Tâches : créer une action avec une date, l’attribuer au partenaire du dossier. Partenaire : la bloquer avec un motif. Équipe → Administration : suspendre son accès, puis reprendre la tâche pour la terminer. Vérifier la disparition des dossiers dans la vue partenaire.

8. Adhérent → DEMO-001 : demander l’annulation avec un motif. Équipe : retrouver la demande via « Annulation à examiner », la refuser avec un motif puis examiner une nouvelle demande. Confirmer : le dossier est conservé, son partenaire perd l’accès et la provision reste à rapprocher.
9. Adhérent : reprendre le besoin annulé ; vérifier le nouvel identifiant, le lien au dossier source et l’absence de paiement/pièces transférés. Sur un autre dossier remis, demander une correction puis terminer la tâche créée avant une nouvelle remise.

10. Adhérent → Messages : saisir un brouillon, changer de rubrique puis revenir. Vérifier sa conservation. Basculer en équipe : le brouillon n’apparaît pas dans cette vue. Ajouter un message équipe, revenir en adhérent et vérifier le compteur non lu, puis marquer la conversation comme lue.
11. Depuis l’accueil, ouvrir l’action « Fournir les pièces attendues » de DEMO-002. Déposer une pièce : cette action disparaît pour l’adhérent et devient « Vérifier les pièces déposées » pour l’équipe.

12. Adhérent → DEMO-002 : ouvrir « Demander un ajustement » et préciser un changement fictif. Équipe : préparer la version 2 avec un périmètre modifié et de nouveaux montants. Adhérent : comparer les versions, consulter le détail puis simuler l’accord sur la version 2. Vérifier que seule cette version accompagne le paiement.

13. Adhérent → Adhésion : simuler le passage à Family. Mon compte : préparer une invitation fictive et simuler son acceptation. Ouvrir l’aperçu bénéficiaire (vide), puis partager un dossier et une seule pièce. Vérifier que l’aperçu ne montre que ces éléments.
14. Retirer le dossier puis le repartager : la pièce reste masquée. Retirer le bénéficiaire et renouveler son invitation : aucun accès n’est rétabli automatiquement. Tester une tentative échouée de passage à Member (accès conservés), puis une confirmation (accès retirés).

15. Parcours guidés → Le bilan d’une mission : charger l’exemple, proposer un bilan fictif inférieur à la provision, puis basculer en adhérent pour le relire et l’approuver. Équipe : préparer le remboursement, simuler un échec, réessayer et confirmer. Vérifier l’historique et le classement dans les bilans soldés.

16. Équipe → Administration : après quelques actions, filtrer l’activité par rôle, dossier et rubrique. Essayer une recherche sans résultat puis effacer les filtres. Ouvrir un événement et retrouver son dossier ou sa rubrique. Dans un dossier, ouvrir « Travail de l’équipe » puis déplier « Consulter l’activité du dossier ». Vérifier l’absence de cette section dans les vues adhérent et partenaire.

17. Dans un dossier en cadrage, saisir une proposition sans la soumettre, passer au suivi puis revenir : les champs doivent être conservés. Parcourir les onglets au clavier (flèches, Début/Fin). Après l’accord, vérifier l’accès à la provision. Demander une annulation pendant un paiement en attente et vérifier les boutons d’accès à la décision et au paiement. Après clôture, ouvrir le bilan depuis « Décisions et suites ».

18. Équipe → Tâches : créer trois tâches fictives avec une date passée, la date du jour et aucune date. Tester les repères et les filtres dossier/responsable/recherche, puis terminer la tâche en retard : elle quitte le compteur. Demander l’annulation du dossier et vérifier la vue « Dossiers suspendus ou clos ». Depuis ce dossier, vérifier qu’aucun formulaire ne propose une création pour un autre dossier ; retirer l’annulation et retrouver les tâches à traiter.

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
