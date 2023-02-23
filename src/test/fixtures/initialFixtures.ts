import fs from "fs";
import { Connection } from "typeorm";

const orderedInserts = [
  'insert-content',
  'insert-ac',
  'insert-am',
  'insert-cm',
  'insert-efi',
  'insert-ef',
  'insert-ef-tag-label',
  'insert-ef-tag-label-relation',
  'insert-ef-tag',
  'insert-ef-tag-label-mapping',
  'insert-efm',
  'insert-company',
  'insert-perimeter',
  'insert-profile',
  'insert-user',
  'insert-user-role-within-perimeter',
  'insert-campaign',
  'insert-site',
  'insert-product',
  'insert-activity',
  'insert-activity-entry-reference',
  'insert-activity-entry',
  'insert-entry-tag',
];

export const insertFixtures = async (connection: Connection) => {
  for (let i = 0; i < orderedInserts.length; i++) {
    const currentQueryFilePath = `src/test/fixtures/${orderedInserts[i]}.sql`;
    const currentQuery = fs.readFileSync(currentQueryFilePath, "utf8");
    await connection.query(currentQuery);
  }
};
