export const caesarCipher = (text, shift, mode = 'encrypt') => {
  const normalizedShift = ((shift % 26) + 26) % 26;
  const direction = mode === 'decrypt' ? -1 : 1;
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + direction * normalizedShift + 26) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + direction * normalizedShift + 26) % 26) + 97);
      }
      return char;
    })
    .join('');
};

export const caesarShiftText = (plainText, shift = 7) => plainText.replace(/[a-z]/gi, (char) => {
  const base = char.toLowerCase() === char ? 'a'.charCodeAt(0) : 'A'.charCodeAt(0);
  const code = char.charCodeAt(0);
  return String.fromCharCode(base + ((code - base + shift) % 26));
});
