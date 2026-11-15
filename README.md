# Luso Office

Vitrine franco-portugaise d’accompagnement administratif au Portugal. L’identité visuelle reprend la maquette A : bleu cobalt, azulejos, typographie Manrope et bandeau bleu clair.

- Accueil : `index.html`
- Tarifs : `tarifs.html`
- Styles partagés : `styles.css`
- Styles de la page Tarifs : `pricing.css`
- Traductions et interactions : `app.js`

Les trois abonnements mensuels sont des propositions indicatives à valider avec Hélèna : Essentiel à 19 € (20 minutes d’aide), Accompagnement à 49 € (1 heure d’aide) et Sérénité à 99 € (2 heures d’aide). Le temps inclus couvre les échanges et les interventions, sans report au mois suivant. Les suppléments et les dossiers complexes restent sur devis ; les frais externes sont séparés. Les modalités sans engagement et les prestations sont également à valider avant lancement.

Le choix d’une formule prépare une demande avec l’abonnement envisagé ; il ne déclenche ni paiement ni souscription. Le formulaire crée un récapitulatif téléchargeable sans envoyer de données. L’espace client présente un exemple ; il ne propose pas encore d’accès personnel aux dossiers.

## Prévisualisation locale

Depuis ce dossier :

```sh
python3 -m http.server 4177 --bind 127.0.0.1
```

Puis ouvrir `http://127.0.0.1:4177/`.

## Identité et domaine

Luso Office remplace « Perto de Casa » : il s’agit du même projet. Le domaine `lusooffice.com` est réservé. Les métadonnées et les liens de langue sont préparés pour ce domaine ; cette configuration ne le connecte pas à un hébergement.

Le nom est harmonisé en français et en portugais, dans les marques de navigation, titres, fenêtres et récapitulatifs téléchargés. Le favicon utilise les initiales LO. L’aperçu reste en `noindex, nofollow` avec un `robots.txt` interdisant l’exploration, à revoir lors du lancement.

## Dépôt et publication

Le dépôt GitHub conserve provisoirement l’identifiant historique `ayoubkhm/perto-de-casa`, ainsi que le dossier local `perto-de-casa/`. Cela ne désigne pas une autre marque. La page `tarifs.html` conserve son URL historique.

GitHub Pages est désactivé. Un commit et un push ne réactivent pas le site. Aucun DNS ni hébergement n’est modifié par cette première harmonisation.

Le dossier `../helena-site/` est une copie historique distincte, et non la source active de Luso Office. Ses anciennes références ne doivent pas servir à publier une nouvelle version.

## État du travail local

La branche `codex/luso-office-branding` isole l’harmonisation du nom et du domaine à partir de la version Git existante. Les modifications antérieures du discours, des offres et de la présentation restent conservées dans la copie de travail principale ; elles ne sont pas incluses automatiquement dans ce commit. Les anciens contenus du dépôt ne constituent pas une validation commerciale des offres.

Cette étape conserve la base statique existante. La refonte de l’application utilisera React, TypeScript et Node.js conformément aux préférences du projet.
