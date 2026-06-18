<script setup>
import { ref, computed, onMounted } from 'vue'
import { getNews } from '../services/newsService.js'

const articles = ref([])
const searchTerm = ref('')

const currentPage = ref(1)
const articlesPerPage = ref(2)

const displayedArticles = computed(() => {
  const startIndex = (currentPage.value - 1) * articlesPerPage.value
  const endIndex = startIndex + articlesPerPage.value
  return articles.value.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  return Math.ceil(articles.value.length / articlesPerPage.value)
})

const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''

  try {
    articles.value = await getNews(searchTerm.value)
  } catch (err) {
    error.value = 'Unable to load news articles'
  } finally {
    loading.value = false
  }
})

async function searchNews() {
  loading.value = true
  error.value = ''
  currentPage.value = 1

  try {
    articles.value = await getNews(searchTerm.value)
  } catch (err) {
    error.value = 'Unable to load news articles'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB')
}
</script>

<template>
  <div class="widget">
    <h3>News</h3>
    <div class="search-bar">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Search news..."
        @keyup.enter="searchNews"
      />
      <button @click="searchNews">Search</button>
    </div>

    <!-- Display loading, error, or news data -->
    <p v-if="loading">Loading news widget...</p>
    <p v-else-if="error" class="error">{{ error }}</p>
    <p v-if="articles.length === 0 && !loading && !error">No articles found.</p>

    <div v-if="articles.length > 0">
      <ul>
        <li v-for="article in displayedArticles" :key="article.url">
          <div class="article-header">
            <img v-if="article.image" :src="article.image" :alt="article.title" />
            <div>
              <a :href="article.url" target="_blank"> {{ article.title }}</a>

              <div class="article-byline">
                <p>{{ article.source }}</p>
                <p>{{ formatDate(article.publishedAt) }}</p>
              </div>
            </div>
          </div>
          <p>{{ article.description }}</p>
        </li>
      </ul>
      <p class="pages">Page {{ currentPage }} of {{ totalPages }}</p>
      <div class="page-buttons">
        <button @click="currentPage--" :disabled="currentPage === 1">Back</button>
        <button @click="currentPage++" :disabled="currentPage == totalPages">Next</button>
      </div>
    </div>

    <!-- End news data-->
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

.search-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.search-bar input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: #fcd34d;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #fbbf24;
}

ul {
  list-style-type: none;
}

li {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: #fffbeb;
  border-radius: 4px;
}

a {
  color: #334155;
  font-weight: bold;
  transition: color 0.3s;
}

a:hover {
  color: #020617;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.article-byline {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #334155;
}

img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.pages {
  margin-top: 1rem;
  font-weight: bold;
  text-align: center;
}

.page-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 0.5rem;
}
</style>
