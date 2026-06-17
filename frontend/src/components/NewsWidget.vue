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
    <h4>News</h4>
    <input
      type="text"
      v-model="searchTerm"
      placeholder="Search news..."
      @keyup.enter="searchNews"
    />
    <button @click="searchNews">Search</button>

    <!-- Display loading, error, or news data -->
    <p v-if="loading">Loading news widget...</p>
    <p v-else-if="error">{{ error }}</p>
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
      <p>Page {{ currentPage }} of {{ totalPages }}</p>
      <button @click="currentPage--" :disabled="currentPage === 1">Back</button>
      <button @click="currentPage++" :disabled="currentPage == totalPages">Next</button>
    </div>

    <!-- End news data-->
  </div>
</template>

<style scoped>
.widget {
  border: 5px solid #fcd34d;
  padding: 1rem;
  border-radius: 8px;
  background: #fff;
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
</style>
