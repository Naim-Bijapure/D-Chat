export const Sleep = (time: number): Promise<boolean> =>
  new Promise((resolve, _reject) =>
    setTimeout(() => {
      resolve(true);
    }, time)
  );
