// import "module-alias/register";
// import "reflect-metadata";
// import SqlConnection from "@deep/database/SqlConnection";
// import ActivityAdderIngestor from "@root/service/activity/dataIngest/ActivityAdderIngestor";

// Il faut le remplir comme l’ancien fichier, avec uniquement les activités à rajouter.
// Il faut renseigner le scope (noté 1, 2, ou 3), et la catégorie, en recopiant exactement le nom de la catégorie sur le site
// Si la catégorie n’existe pas, il faut la créer (je le ferai à la main) au préalable
// On peut mettre autant de nouvelles activités en un coup que l’on veut
// Il ne doit pas exister d'activité du même nom déjà en BDD

// const start = async () => {
//   const connection = await SqlConnection.setInstance();
//   await connection.synchronize();

//   const ingestorAdder = ActivityAdderIngestor.buildFromCsv('files/temp/20210607_template_ajout_activite.csv');
//   ingestorAdder.ingest();
// }

// start();
