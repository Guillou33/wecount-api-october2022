
## Séquençage des campagnes

  

### Types de campagnes et années

Il existe deux types de campagnes :

- Les campagnes *Bilan Carbone*

- Les campagnes *Simulation*

Chaque campagne doit correspondre à une année, et il ne peut pas y avoir deux campagnes du même type la même année.

Dans plusieurs endroits de l'app, il est possible de consulter l'historique des données, lorsque l'on a des campagnes sur plusieurs années. Dans tous les cas, les campagnes de **Simulation** ne sont jamais visibles dans l'historique.

### Statuts des campagnes

Les campagnes peuvent avoir plusieurs statuts :

- *En préparation*
- *En cours*
- *Clôturée*
- *Archivée*

Les changements de statuts possibles sont les suivants : 

- *En préparation* => *En cours*
- *En cours* => *En préparation* / *Clôturée*
- *Clôturée* => *En cours* / *Archivée*
- *Archivée* => *Clôturée* / *En cours*

Comportements des statuts : 

- *Clôturée* : Dans ce statut, il est impossible de modifier les *sites*, *produits*, *writer*, *owner*, *facteur d'émission*, et *inputs*. Cas particulier, il est possible de passer `related_ef_are_editable_even_if_has_history` à true en DB pour que le facteur d'émission d'une méthode de calcul soit modifiable même en cas de campagne clôturée
- *Archivée* : Dans ce statut, les campagnes sont uniquement visible dans la partie "Paramètre"

### Contrôle d'accès

- Les campagnes *En préparation* ne sont accessibles que par les *Admins* et Managers des périmètres
- Les campagnes *Clôturées* ne sont pas accessibles aux *Contributeurs* d'un périmètre

### Création d'une campagne

Lorsque l'on crée une campagne, il est possible de choisir une campagne en tant que template (obligatoire dans les cas d'une campagne *Bilan Carbone*). Il est également possible de choisir si l'on souhaite garder les valeurs de la campagne. Dans tous les cas, la campagne template sert à alimenter la nouvelle campagne, en créant les mêmes entrées que la campagne template

### ActivityEntryReference

Les entrées d'activités créées lors de la création de campagne via un template sont liées aux entrées d'activités de la campagne template via l'entité *ActivityEntryReference*. 
Concrètement, *ActivityEntry* est lié en ManyToOne à *ActivityEntryReference*, et *ActivityEntryReference* contient un *referenceId* unique dans la DB, permettant d'identifier le groupe d'*ActivityEntry*.
Ce système permet de consulter l'historique d'une *ActivityEntry* au parmi plusieurs campagnes.


### Suppression des campagnes

Les campagnes peuvent être archivées, ou supprimées (softDelete en DB), sauf s'il ne reste plus qu'une campagne dans le périmètre.