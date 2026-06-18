import { marked } from 'marked'

export async function sendPrompt(messages) {
  const CHATBOT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const CHATBOT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${CHATBOT_API_KEY}`

  const formattedHistory = messages
    .map((msg) => `${msg.role === 'assistant' ? 'AI' : 'User'}: ${msg.text}`)
    .join('\n')

  const promptText = `
You are a helpful productivity assistant. Below is the chat history. Respond to the latest message from the User naturally.

${formattedHistory}
AI:`

  const response = await fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: promptText,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Chat Error Payload:', errorData)
    throw new Error(errorData.error?.message || 'Failed to get response')
  }

  const data = await response.json()

  const parts = data.candidates[0].content.parts
  const textPart = parts.find((part) => !part.thought) || parts[parts.length - 1]

  let aiResponse = textPart ? textPart.text : ''

  if (!aiResponse) {
    throw new Error('No response from AI')
  }

  aiResponse = marked.parse(aiResponse)
  return aiResponse
}

export async function generateTaskBreakdown(taskTitle, taskDueDate) {
  const CHATBOT_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const CHATBOT_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${CHATBOT_API_KEY}`

  // Get today's date to give the AI context for scheduling
  const today = new Date()
  const todayString = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`

  const deadlineContext = taskDueDate
    ? `The main parent task final deadline is ${taskDueDate}.`
    : `The main parent task has no deadline, so schedule them in the near future.`

  const response = await fetch(CHATBOT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Today's date is ${todayString}. ${deadlineContext}
              Break down the task "${taskTitle}" into 5 practical subtasks.
              Distribute the subtask due dates sequentially so they start after today (${todayString}) and finish on or shortly before the deadline year.
              Return ONLY a valid raw JSON array of objects. Do not include conversational filler text.
              Follow this format exactly: [{"title": "Subtask name", "priority": "medium", "due_date": "DD/MM/YYYY"}]`,
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    console.error('Subtask Error Payload:', errorData)
    throw new Error(errorData.error?.message || 'Failed to get response')
  }

  const data = await response.json()

  const parts = data.candidates[0].content.parts
  const textPart = parts.find((part) => !part.thought) || parts[parts.length - 1]

  let aiResponse = textPart ? textPart.text : ''

  if (!aiResponse) {
    throw new Error('Failed to generate subtasks.')
  }

  // Clean up any markdown formatting
  aiResponse = aiResponse
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .trim()

  return JSON.parse(aiResponse)
}
