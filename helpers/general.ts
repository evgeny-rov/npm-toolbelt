export const exclude = (excluded: any[]) => (source: any[]) =>
  source.filter(
    (sourceVal) => !excluded.some((excludedVal) => sourceVal.indexOf(excludedVal) !== -1)
  );

export const limit = (amount: number) => (data: any[]) => data.slice(0, amount);

export const countDuplicates = (coll: any[]) => {
  const result: Record<string, number> = {};

  coll.forEach((val) => {
    if (result[val]) {
      result[val] += 1;
    } else {
      result[val] = 1;
    }
  });

  return result;
};

export const createPipeline =
  <T>(...fns: Function[]) =>
  (x: any): T =>
    fns.reduce((y, f) => f(y), x);
