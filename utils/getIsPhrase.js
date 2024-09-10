const { cut, load } = require("@node-rs/jieba")

const SPACELESS_LANG_WORD_PARSE = {
    'zh-CN': (text) => {
        try {
            load()
        } catch { }
        // loadDict(fs.readFileSync(...))
        // loadTFIDFDict(fs.readFileSync(...))

        return cut(text, false)
        // ["我们", "中", "出", "了", "一个", "叛徒"]
    },
    // 'ko': () => { },
    'jp': () => { },
    'th': () => { },
    'default': (text) => { return text.trim().split(' ') }
}

function segmentTextPerWord(text, mediaLang) {
    customParseWords = SPACELESS_LANG_WORD_PARSE[mediaLang] || SPACELESS_LANG_WORD_PARSE['default']

    return customParseWords(text) || []
}

function getIsPhrase(text, mediaLang) {
    if (text.length === 1) return false
    return !!segmentTextPerWord(text, mediaLang).length
}

module.exports = { getIsPhrase, segmentTextPerWord }
