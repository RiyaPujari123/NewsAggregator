import axios from 'axios';
import { format } from 'date-fns';

const NEWS_API_KEY = 'cf274503748f44bc8fbc65d467c7517b';
const GUARDIAN_API_KEY = 'c3125e6a-cd0b-4821-8b7e-e00cf55d75a9';
const apiKey = 'A5fNy0rNuLSteWKCuJtI2gADWf6aMZ6g';  


const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  return date ? format(new Date(date), formatString) : null;
};

const handleApiError = (error, source) => {
  console.error(`Error fetching news from ${source}:`, error);
  if (error.response && error.response.status === 429) {
    console.warn('Rate limit excezeded. Consider waiting or upgrading your API plan.');
  }
  return [];
};
export const fetchNewsFromNewsAPI = async (query, sources) => {
  try {
  
    const sourcesString = Array.isArray(sources) ? sources.join(',') : sources;

    const url = `https://newsapi.org/v2/everything?q=${query}&sources=${sourcesString}&apiKey=cf274503748f44bc8fbc65d467c7517b`;

    const response = await axios.get(url);
    return response.data.articles;
  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error);
    return [];
  }
};



export const fetchNewsFromGuardian = async (query = '', filters = {}) => {
  const API_KEYGuardian = GUARDIAN_API_KEY; 
  const baseUrl = 'https://content.guardianapis.com/search';

  const url = new URL(baseUrl);
  if (query) {
    url.searchParams.append('q', query);  
  }
  url.searchParams.append('show-fields', 'all');  
  url.searchParams.append('api-key', API_KEYGuardian);  
  url.searchParams.append('order-by', filters.orderBy || 'newest');  

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Guardian API Response:', data.response.results);
    
    return data.response.results; 
  } catch (error) {
    console.error('Error fetching data from Guardian API:', error);
    return [];  // Return empty array on error
  }
};











export const fetchNewsFromBBC = async (query, filters) => {
  try {
    const url = `https://newsapi.org/v2/everything?q=${query}&sources=bbc-news&apiKey=cf274503748f44bc8fbc65d467c7517b`;

    // Fetch articles from BBC without the category parameter if it's not supported
    const response = await axios.get(url);

    // Apply the category filter client-side after fetching articles
    let articles = response.data.articles;
    
    if (filters.category) {
      articles = articles.filter(article => 
        article.category && article.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    return articles;
  } catch (error) {
    console.error('Error fetching news from BBC:', error);
    return [];
  }
};


export const fetchNewsFromNYT = async (query, filters) => {
  
  const url = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=${query}&api-key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Log the response to inspect its structure
    console.log('NYT API Response:', data);

    if (data.response && data.response.docs) {
      return data.response.docs.map(doc => ({
        headline: doc.headline.main,
        author: doc.byline?.original || "Unknown",
        published_date: doc.pub_date,
        webUrl: doc.web_url,
        standfirst: doc.lead_paragraph || "No description available",
        category: doc.section_name,
      }));
    } else {
      console.error('Invalid response structure', data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching NYT news:", error);
    return [];
  }
};




