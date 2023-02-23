import { ActivityCategory } from "@entity/index";

const getHashNumber = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

export function generateActivityModelUniqueName(
  category: ActivityCategory,
  categoryName: string,
  modelName: string,
  toHash: string
): string {
  return (
    `${category.scope}_${categoryName}_${modelName}_${getHashNumber(toHash)}`
      // convert accentuated characters to their non-accentuated counterpart
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // convert whitespaces to underscores
      .replace(/ /g, "_")
      // convert non-alpha numeric characters to underscores
      .replace(/[^a-zA-Z0-9]/g, "_")
      // remove underscore duplicates
      .replace(/_+/g, "_")
      .replace(/_$/, "")
      .toUpperCase()
  );
}
