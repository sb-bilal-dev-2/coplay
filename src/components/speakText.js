
/**
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance 
 * @param {*} lang 
 */
// window.speechSynthesis.getVoices() - availible voices (176)

export const speakText = (text, lang = "en-US", speed) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.pitch = 1.3;
    utterance.rate = speed || 0.5 // 0.5 slow
    console.log('lang', lang, text)
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
