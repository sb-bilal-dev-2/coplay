// BUG/ERROR: "...<i>was lost.</i>" is not getting parsed

const mapForTags = (subtitleItem) => {
    const regex = /^<\w+>/;
    const text = subtitleItem.text;
    const match = text.match(regex);
    const newSubtitleItem = {
        ...subtitleItem,
    };
    newSubtitleItem.subtitleLines = newSubtitleItem.text.split('\n');
    if (match) { // tag match e.g. <i>Cool </i> add tag, taglessText
        newSubtitleItem.tag = match[0].slice(0, match[0].length - 1).slice(1); // extract element name e.g. <i> -> i
        const tagRemovedFromTheEnd = text.slice(0, text.length - match[0].length - 1);
        newSubtitleItem.taglessText = tagRemovedFromTheEnd.replaceAll(match[0], "").replaceAll('</' + newSubtitleItem.tag + '>', "");
        newSubtitleItem.subtitleLines = newSubtitleItem.taglessText.split('\n');
    }


    return newSubtitleItem;
};

module.exports = {
    mapForTags
}
