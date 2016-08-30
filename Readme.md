#Activation des liens ISTEX dans Google Scholar 

##Principe

Google Scholar permet l'intégration de liens OpenURL vers des ressources pleins textes en fonction des souscriptions électroniques associées à une affiliation. 

Pour intégrer ces liens vers les ressources ISTEX, le processus suit les étapes suivantes :

1) __Description du holding ISTEX__ via les fichiers Kbart disponibles par le service BACON de l'ABES au format JSON and XML. Exemple :

* pour obtenir la liste complète des packages disponibles sur BACON en JSON : 

https://bacon.abes.fr/list.json

* pour obtenir la description d'un package donné en XML :

https://bacon.abes.fr/package2kbart/NPG_FRANCE_ISTEXJOURNALS.xml 

2) __Conversion de la descriptions du holding ISTEX__ au format Kbart XML dans le format Google Scholar défini au lien suivant :
https://scholar.google.com/intl/en/scholar/institutional_holdings.xml 

Ceci est réalisé par une feuille de style dédiée appliquée aux fichiers Kbart précédemment obtenus via BACON pour chaque package ISTEX.

3) __Création du formulaire Google Scholar__ de demande d'activation de liens, également en XML :
https://scholar.google.com/intl/en/scholar/institutional_links.xml 

Ce formulaire référencera les documents XML créés à l'étape 2.

Les fichiers ```institutional_links.xml``` et ```institutional_holdings.xml``` pour ISTEX peuvent être validés par des DTD dédiés fournis par Google. 

4) __Soumission du formulaire___. Les documents XML de description du holding au format XML de Google Scholar sont mis à disposition sur un serveur web, et l’adresse html du fichier formulaire principal complété (institutional_links.xml) est envoyé par mail à Google Scholar via leur adresse de support :
https://support.google.com/scholar/contact/general 

Google Scholar indique que l'activation/mise a jour prend une à deux semaines. 

5) __Activation__ : 

Après la paramétrisation par l'utilisateur de son affiliation ISTEX dans les "settings" de Google Scholar, les liens vers les plein textes ISTEX apparaitront alors à la droite des résultats, par exemple : 

![Exemple de liens vers le plein texte contextualisé par l'affiliation sur Google Scolar](doc/gs.png)

6) __Mise à jour__ : les fichiers de descriptions du holding ISTEX peuvent être regénés en suivant les étapes précédentes. Il suffit alors de remplacer les fichiers XML exposés sur internet et le moissoneur de Google Scholar prendra en compte la nouvelles version. 

7) Possibles éléments complémentaires réalisables par le __Browser Addon ISTEX__ :

* Paramétrisation automatique de l'affiliation dans Google Scholar. 

* Bouton standard d'accès au plein texte ISTEX à la place du lien purement textuel (en pratique le "bouton" standard ISTEX de l'addon est également purement textuel, pour un rendu rapide, mais le styling permet d'être plus facilement distinguable/ergonomique pour l'utilisateur) et cohérent indépendemment du site visité. 


## Build and run

L'objectif du présent module node.js est d'automatiser l'ensemble des étapes décrites ci-dessus en une simple commande. Chaque exécution du module permettra de mettre à jour les liens vers ISTEX et les différents paramétrages. 

Installation :

> npm install

Nécessite: node_xslt, https

Exécuter le module : 

> node main

Les fichiers de description du holding dans le format XML de Google Scholar sont générés sous le sous répertoire ```results/```

## Test de liens OpenURL de Google Scholar

Des liens OpenURL générés par Google Scholar tests sont disponibles sous ```test/google-scholar-openurls.txt``` afin de tester le service OpenURL de l'API ISTEX.

## Changement des données descriptives de l'affiliation dans le formulaire d'affiliation

Le fichier "racine" de description du holding ISTEX dans le format XML de Google Scholar doit renseigner les informations suivantes : nom de l'institution, mots clefs de l'institution, contacts et label pour le lien vers le plein texte. Ceci peut être modifié directement dans le fichier ```resources/institutional_links_istex.xml``` sous les balises respectivement ```<institution>```, ```<keywords>```, ```<contact>``` et ```<electronic_link_label>```. Les fichiers finaux de descriptions générés reprendront alors ces nouvelles données. 

L'adresse du service OpenURL utilisé pour les liens est également renseigné dans le fichier ```resources/institutional_links_istex.xml``` sous la balise ```<openurl_base>```. À noter que l'URL de base du service OpenURL peut inclure des options par défaut, exemple :

```xml
	<openurl_base>https://api.istex.fr/document/openurl?mode=auth&</openurl_base>
``` 

Note : ```<other_link_label>``` n'est pas utilisé car l'ensemble des ressources ISTEX sont des ressources électroniques. 


## Autres informations

Les liens générés par Google Scholar suivent __OpenURL 0.1__ et non OpenURL 1.0! Il est donc nécessaire qu'un service OpenURL 1.0 devant gérer les liens OpenURL de Google Scholar inclus un "fallback" dans la version 0.1 (par exemple en cas de paramétre ```sid=google&``` présent dans le lien OpenURL).

__Annuler la description de holding__ / retirer les liens générés par Google Scholar. Deux solutions :

* soit simplement retirer les fichiers de descriptions de holding exposés sur internet ("Once the information is no longer available to us, we will stop using it within 30 days.")

* soit envoyer une demande manuelle https://support.google.com/scholar/contact/general

