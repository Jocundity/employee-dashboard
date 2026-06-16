import { marked } from 'marked'

export async function sendPrompt(messages) {
  const CHATBOT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const CHATBOT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${CHATBOT_API_KEY}`

  const geminiMessages = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [
      {
        text: message.text,
      },
    ],
  }))

  const response = await fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: geminiMessages,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get response')
  }

  const data = await response.json()

  let aiResponse = data.candidates[0].content.parts[0].text

  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  aiResponse = marked.parse(aiResponse) // Convert Markdown in response to HTML

  return aiResponse
}
