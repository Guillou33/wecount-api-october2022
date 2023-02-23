# Documentation Fonctionnelle :

[Documentation Fonctionnelle](/DocumentationFonctionnelle.md)

## Generate jwt keys : 
$ mkdir -p config/jwt
$ openssl genpkey -out config/jwt/private.pem -aes256 -algorithm rsa -pkeyopt rsa_keygen_bits:4096
$ openssl pkey -in config/jwt/private.pem -out config/jwt/public.pem -pubout

## DB Backups :
- Les backups de DB sont exécutés via un script localisé sur le serveur de prod, au chemin suivant : `/etc/cron-wecount/backupbdd.sh`
- Une tache cron (utilisateur root) exécute ce script chaque heure
- Les dumps de DB sont ensuite enregistrés sur AWS, service S3, dans le bucket wecount-db-backups-prod (https://s3.console.aws.amazon.com/s3/buckets/wecount-db-backups-prod)
- Les dumps sont conservés une semaine, puis supprimés **définitivement**. Attention donc, en cas d'incident, à récupérer rapidement le dump.

    #### Procédure de restitution d'un dump de DB : 
    - Télécharger le dump sur https://s3.console.aws.amazon.com/s3/buckets/wecount-db-backups-prod
    - En local, importer le dump dans une base MySQL, et vérifier visuellement l'intégrité des data


## To run in dev local :
$ yarn dev