function isString(value: unknown): value is string {
  return typeof value === "string";
}

export default function validateActivityModelUniqueNames(tovalidate: unknown[]): string[] {
  return tovalidate.filter(isString);
}