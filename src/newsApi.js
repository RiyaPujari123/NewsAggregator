import axios from 'axios';
import { format } from 'date-fns';

const NEWS_API_KEY = 'fadec82612fe4879b8788e7e93c062e4';
const GUARDIAN_API_KEY = 'c3125e6a-cd0b-4821-8b7e-e00cf55d75a9';
const apiKey = 'A5fNy0rNuLSteWKCuJtI2gADWf6aMZ6g';  // Replace with your actual API key


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

export const fetchNewsFromNewsAPI = async (query = '', sources = '', category = '') => {
  const API_KEY = NEWS_API_KEY; // Replace with your valid NewsAPI key
  const baseURL = 'https://newsapi.org/v2/everything';

  const url = new URL(baseURL);
  if (query) url.searchParams.append('q', query);
  if (sources) url.searchParams.append('sources', sources); // Ensure sources are valid
  if (category) url.searchParams.append('category', category);
  url.searchParams.append('apiKey', API_KEY);

  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.articles;
  } catch (error) {
      console.error('Error fetching news from NewsAPI:', error);
      return [];
  }
};


// Fetch articles from The Guardian API
export const fetchNewsFromGuardian = async (query = '', filters = {}) => {
  const API_KEYGuardian = GUARDIAN_API_KEY; // Ensure Guardian API key is used
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
    return data.response.results;  // Return articles from Guardian
  } catch (error) {
    console.error('Error fetching data from Guardian API:', error);
    return [];  // Return empty array on error
  }
};











export const fetchNewsFromBBC = async (query, filters) => {
  try {
    const formattedDate = formatDate(filters.date);

    // Ensure the category is included only if it's valid
    const category = filters.category || ''; // Ensure an empty string if no category is provided

    // Special handling for CNN - since CNN doesn't have a sectionName like BBC, we can skip category filter
    if (filters.sources === 'cnn') {
      // Return all articles without category filtering for CNN
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          from: formattedDate,
          sources: 'cnn',  // Explicitly fetch articles from CNN
          apiKey: NEWS_API_KEY,
          category: category, // Include category only if it's valid
        },
      });

      return response.data.articles.filter((article) => {
        const matchesKeyword = query
          ? article.title.toLowerCase().includes(query.toLowerCase()) ||
            article.description.toLowerCase().includes(query.toLowerCase())
          : true;
        return matchesKeyword;  // No category filter for CNN
      });
    }

    // Default behavior for other sources (BBC, etc.)
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        from: formattedDate,
        sources: filters.sources || 'bbc-news', // Default to 'bbc-news' if no sources filter is provided
        apiKey: NEWS_API_KEY,
        category: category, // Include category only if it's valid
      },
    });

    return response.data.articles.filter((article) => {
      const matchesCategory = category
        ? article.sectionName?.toLowerCase() === category.toLowerCase()
        : true;
      const matchesKeyword = query
        ? article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        : true;
      return matchesCategory && matchesKeyword;
    });
  } catch (error) {
    return handleApiError(error, 'BBC');
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




