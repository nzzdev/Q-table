import type { Source } from '@src/interfaces';

export function createSourceFixture(override: Partial<Source> = {}): Source {
  return {
    link: {
      url: 'https://google.com',
      isValid: true,
    },
    text: 'google',
    ...override,
  };
}
