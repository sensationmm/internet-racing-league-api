export const sortObjectValues = (obj: {[key:string]:number}) => {
  const sortedEntries = Object.entries(obj).sort(([, a], [, b]) => b-a);
  return Object.fromEntries(sortedEntries);
}