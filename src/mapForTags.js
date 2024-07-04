
const mapForTags = (subtitleItem) => {
    const regex = /^<\w+>/;
    let text = subtitleItem.text;
    text = text.replaceAll('...<i>', '<i>...')
    text = text.replaceAll('- <i>', '<i> -')

    const match = text.match(regex);
    const subtitleLines = subtitleItem.text.split('\n')

    if (match) { // tag match e.g. <i>Cool\n let me check</i> add tag, taglessText
        subtitleItem.tag = match[0].slice(0, match[0].length - 1).slice(1); // extract element name e.g. <i> -> i
        const tagRemovedFromTheEnd = text.slice(0, text.length - match[0].length - 1);
        subtitleItem.taglessText = tagRemovedFromTheEnd.replaceAll(match[0], "").replaceAll('</' + subtitleItem.tag + '>', "");
        subtitleItem.subtitleLines = subtitleItem.taglessText.split('\n');
    }
    console.log('subtitleItem', subtitleItem)

    return { ...subtitleItem, subtitleLines };
    /**
     * for the text: <i>Cool\n let me check </i>
     * {
     *  tag: 'i',
     *  taglessText: 'Cool\n let me check'
     *  subtitleLines: ['Cool', 'let me check']
     * }
     */
};

module.exports = {
    mapForTags
}
