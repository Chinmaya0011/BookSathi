/**
 * Escape special regex characters in user input to prevent ReDoS and regex syntax errors
 * @param {string} string
 * @returns {string}
 */
export const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
