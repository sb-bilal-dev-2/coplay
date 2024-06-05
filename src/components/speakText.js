
/**
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance 
 * @param {*} lang 
 */
// window.speechSynthesis.getVoices() - availible voices (176)

export const speakText = (text, lang = "en-US") => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterThis.pitch = 1.5;

    window.speechSynthesis.speak(utterance);
}

// const cancelSpeach = () => {
//     window.speechSynthesis.cancel();
// }

// const resumeSpeach = () => {
//     window.speechSynthesis.resume()
// }

// const pauseSpeach = () => {
//     window.speechSynthesis.pause()    
// }
