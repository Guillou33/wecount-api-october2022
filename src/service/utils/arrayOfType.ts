export default function arrayOfType(type: string, values: any): boolean {
  return Array.isArray(values) && values.every(value => typeof value === type);
}
