export function containsBannedWords(slug: string): boolean {
  const bannedWords = [
    'error',
    'logout',
    'test',
    'home',
    'register',
    'site',
    'not-ready',
  ];

  return bannedWords.some((word) => slug.includes(word));
}
