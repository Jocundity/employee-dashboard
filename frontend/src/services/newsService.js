export async function getNews(searchTerm='') {
    const NEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
    let NEWS_API_URL = ``;
    
    if (searchTerm.trim() === '') {
        // top headlines
        NEWS_API_URL = `https://gnews.io/api/v4/top-headlines?category=general&apikey=${NEWS_API_KEY}&lang=en`;
    } else {
        // search for news articles
        NEWS_API_URL = `https://gnews.io/api/v4/search?q=${searchTerm}&apikey=${NEWS_API_KEY}&lang=en`;
    }

    const response = await fetch(NEWS_API_URL);
    const data = await response.json();
    
    return data.articles.map((article) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        image: article.image
    }));
    
}