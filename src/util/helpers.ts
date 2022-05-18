export const getRandomItem = <T>(list: T[]) =>
  list[Math.floor(Math.random() * list.length)];
