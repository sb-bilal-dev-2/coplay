
const API_KEY = "xai-gkjCbZFxp9XsEjlLu6tCfR8Q48HfcJIPHOQcsSOHV5iNedA4DEenwzOY0sLqLjid9Xmc484EjpFzvn2O"

const promptGrock = async (content) => {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + API_KEY
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: 'You are content generator for my educational DB'
                },
                {
                    role: 'user',
                    content: content || 'Testing. Just say hi and hello world and nothing else.'
                }
            ],
            model: 'grok-beta',
            stream: false,
            temperature: 0
        })
    });

    const data = await response.json();
    console.log(data);
    console.log(data?.choices[0]?.message?.content);

    return data?.choices[0]?.message?.content
}

promptGrock("can you get me 5 music videos on your that help me improve my beginner level vocabulary of Chinese?")

module.exports = {
    promptGrock
}