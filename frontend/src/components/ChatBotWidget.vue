<script setup>
import { ref } from 'vue'
import { sendPrompt } from '../services/chatbotService.js'

const prompt = ref('')
const messages = ref([
  {
    role: 'assistant',
    text: `Hello! I am your AI assistant. I'm here to help you be more productive at work. You can ask me questions, have me draft an email, summarise meeting notes, create a task list, explain a difficult concept, or help you brainstorm ideas.  How can I help you today?`,
  },
])
const loading = ref(false)
const error = ref('')

function clearMessages() {
  messages.value = [
    {
      role: 'assistant',
      text: `Hello! I am your AI assistant. I'm here to help you be more productive at work. You can ask me questions, have me draft an email, summarise meeting notes, create a task list, explain a difficult concept, or help you brainstorm ideas.  How can I help you today?`,
    },
  ]
  prompt.value = ''
  error.value = ''
}

async function sendMessage() {
  if (!prompt.value.trim()) return // Return early if input is empty

  messages.value.push({ role: 'user', text: prompt.value.trim() })
  prompt.value = ''

  loading.value = true
  error.value = ''

  try {
    const aiResponse = await sendPrompt(messages.value)
    messages.value.push({ role: 'assistant', text: aiResponse })
  } catch (err) {
    error.value = err.message || 'Unable to get a response from the AI assistant'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="widget">
    <h3>AI Assistant</h3>

    <div class="chatbot-messages">
      <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
        <strong>{{ message.role === 'assistant' ? 'AI Assistant' : 'You' }}</strong>
        <p v-if="message.role === 'assistant'" v-html="message.text"></p>
        <p v-else>{{ message.text }}</p>
      </div>

      <p v-if="loading">Loading...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
    </div>

    <div class="chatbot-input">
      <textarea
        v-model="prompt"
        placeholder="Ask the assistant for help..."
        @keydown.enter.exact.prevent="sendMessage"
        :disabled="loading"
      ></textarea>
      <button @click="sendMessage" :disabled="loading">Send</button>
      <button @click="clearMessages">Clear History</button>
    </div>
  </div>
</template>

<style scoped>
.widget {
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h3 {
  border-bottom: 5px dotted #fcd34d;
  padding-bottom: 0.5rem;
}

.error {
  color: #ef4444;
  font-weight: bold;
}

.chatbot-messages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message {
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #fffbeb;
}

.message.user {
  border-left: 4px solid #42b883;
}

.message.assistant {
  border-right: 4px solid #0284c7;
}

.message.assistant > strong {
  display: block;
  text-align: right;
}

textarea {
  width: 100%;
  min-height: 80px;
  margin-bottom: 0.5rem;
}
</style>
