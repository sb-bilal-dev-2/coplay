
async function freegpt(userInput) {
    const GEMINI_API_KEY = "AIzaSyBz8qidXm7iqQW6hdStEDhsFBxN3yWW64k"
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                // {
                //     role: "user",
                //     parts: [
                //         { text: `you are a chatbot that gives me definition and explanation` }
                //     ]
                // },
                {
                    role: "user",
                    parts: [{ text: userInput }]
                }
            ],
        });
        console.log(response.candidates[0]);
        const res = response.candidates[0]?.content?.parts[0]?.text || "No response";
        console.log('res', res)
        return res;
    } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        return "Error in fetching response.";
    }
}


module.exports = {
    freegpt
}