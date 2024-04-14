
function splitUsedWords(text) {
    return (text || '').toLowerCase()
    .replaceAll('\n', ' ')
    .replaceAll('[', ' ')
    .replaceAll(']', ' ')
    .replaceAll('{', ' ')
    .replaceAll('}', ' ')
    .replaceAll('...', ' ')
    .replaceAll('..', ' ')
    .replaceAll('.', ' ')
    .replaceAll('---', ' ')
    .replaceAll('--', ' ')
    .replaceAll('(', ' ')
    .replaceAll(')', ' ')
    .replaceAll('"', ' ')
    .replaceAll('<', ' ')
    .replaceAll('>', ' ')
    .replaceAll('!', ' ')
    .replaceAll('?', ' ')
    .replaceAll('#', ' ')
    .replaceAll('&', ' ')
    .replaceAll('$', ' ')
    .replaceAll(',', ' ')
    .replaceAll("'", ' ')
    .split(' ')
    .map(wrd => wrd[0] === "-" ? wrd.slice(1) : wrd) // case "-word"
    .map(wrd => wrd[wrd.length - 1] === "-" ? wrd.slice(0, wrd.length -1) : wrd) // case "word-"
    .map(wrd => wrd.trimEnd().trimStart())
    .filter(wrd => wrd)
} 

module.exports = splitUsedWords