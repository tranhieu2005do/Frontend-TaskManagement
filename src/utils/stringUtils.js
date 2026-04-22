/**
 * Formats a sender name based on specific business rules:
 * 1. Max length of 7 characters.
 * 2. If first 2 words + space <= 7 chars, show both.
 * 3. Else if first word <= 7 chars, show only first word.
 * 4. Else truncate first word to 7 chars and add a dot.
 */
export const formatSenderName = (name) => {
    if (!name) return '';

    const trimmedName = name.trim();
    const words = trimmedName.split(/\s+/);

    // Rule: If 2 words exist, check if combined length (with space) <= 7
    if (words.length >= 2) {
        const combined = `${words[0]} ${words[1]}`;
        if (combined.length <= 7) {
            return combined;
        }
    }

    // Rule: Check if first word length <= 7
    const firstWord = words[0];
    if (firstWord.length <= 7) {
        return firstWord;
    }

    // Rule: Truncate to 7 chars + dot
    return firstWord.substring(0, 7) + '.';
};
