// controllers/scholarController.js
const axios=require('axios');

 async function googlesearch(topic) {
  try {
    const API_KEY = process.env.GOOGLE_KEY;
    const url = `https://serpapi.com/search.json?engine=google_scholar&q=${encodeURIComponent(topic)}&api_key=${API_KEY}`;
    const response = await axios.get(url);
    return response.data.organic_results || [];
  } catch (error) {
    console.error('Error fetching Google Scholar results:', error.message);
    throw new Error('Failed to fetch data from SerpAPI');
  }
}
