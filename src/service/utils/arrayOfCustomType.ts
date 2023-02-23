export default function arrayOfCustomType(elements: string, values: any): boolean {
    return Array.isArray(values) && values.every(value => Object.keys(elements).includes(value));
  }
  