export default function flatten<T>(array: T[][]): T[] {
  const flattenArray: T[] = [];
  array.forEach(subArray => flattenArray.push(...subArray));
  return flattenArray;
}
