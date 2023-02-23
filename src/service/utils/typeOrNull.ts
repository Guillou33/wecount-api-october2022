export default (type: string, value: any): boolean => {
  return value === null || typeof value === type;
};
