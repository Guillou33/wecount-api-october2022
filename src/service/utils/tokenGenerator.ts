import { uid } from 'rand-token';

export const testString = (nbCharacters: number = 10): string => {
  return 'test_' + uid(nbCharacters);
};

export const randomUpperToken = (nbCharacters: number = 5): string => {
  const chars = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  
  let token = '';
  for (let i = 0; i < nbCharacters; i++) {
    const randomIndex = Math.floor(Math.random() * 36);
    token += chars[randomIndex];
  }

  return token;
};
