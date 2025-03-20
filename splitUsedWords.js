
const IGNORED_CHARS_MAP = [
    '\n',
    '[',
    ']',
    '{',
    '}',
    '(',
    ')',
    '"',
    '!',
    '?',
    '#',
    '&',
    '$',
    ',',
    "'",
    "𝅘𝅥𝅮",
    '¿',
    '¡',
    '–',
    '—',
    '♪'
].reduce((acc, item) => (acc[item] = true, acc), {})

function splitUsedWords(text = '') {
    return ignoreChars(text.toLowerCase())
    .split(' ')
    .filter(wrd => wrd)
}

function ignoreChars(text = '') {
    let newText = ''
    for (let index = 0; index < text.length; index++) {
        const char = text.charAt(index)
        const nextChar = text.charAt(index + 1)
        // case "-word"
        const DASH_PREFIX_CASE = char === '-' && newText.charAt(index - 1) === ' '
        // case "word-"
        const DASH_SUFFIX_CASE = char === '-' && (IGNORED_CHARS_MAP[nextChar] || ' ' || nextChar === '-')
        // case "...word"
        const DOT_PREFIX_CASE = char === '.' && newText.charAt(index - 1) === ' '
        // case "word..."
        const DOT_SUFFIX_CASE = char === '.' && (IGNORED_CHARS_MAP[nextChar] || ' ' || nextChar === '.')


        if (IGNORED_CHARS_MAP[char] || DASH_PREFIX_CASE || DASH_SUFFIX_CASE || DOT_PREFIX_CASE || DOT_SUFFIX_CASE) {
            newText = newText + ' '
        } else {
            newText = char ? newText + char : newText
        }
    }
    return newText
}

module.exports = splitUsedWords