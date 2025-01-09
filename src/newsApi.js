import axios from 'axios';
import { format } from 'date-fns';

const NEWS_API_KEY = 'b613668a5ed04d9184d5d55c3835ead3';
const GUARDIAN_API_KEY = 'acff0ee4-9c34-4987-b504-a9cd9d0b34e0';
const NYT_API_KEY = 'A5fNy0rNuLSteWKCuJtI2gADWf6aMZ6g';

const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  return date ? format(new Date(date), formatString) : null;
};

const handleApiError = (error, source) => {
  console.error(`Error fetching news from ${source}:`, error);
  if (error.response && error.response.status === 429) {
    console.warn('Rate limit exceeded. Consider waiting or upgrading your API plan.');
  }
  return [];
};

export const fetchNewsFromNewsAPI = async (query, filters) => {
  try {
    const formattedDate = formatDate(filters.date);
    const params = {
      q: query,
      from: formattedDate,
      sortBy: filters.sortBy || 'publishedAt',
      apiKey: NEWS_API_KEY,
    };

    // Use category filter only if it's defined
    if (filters.category) {
      params.category = filters.category;  // Ensure the category matches the accepted list of categories in NewsAPI
    }

    // Include sources only if category is not specified
    if (filters.sources && !filters.category) {
      params.sources = filters.sources;
    }

    const response = await axios.get('https://newsapi.org/v2/top-headlines', { params });

    return response.data.articles.filter((article) => {
      const matchesKeyword = query
        ? article.title.toLowerCase().includes(query.toLowerCase()) ||
          article.description.toLowerCase().includes(query.toLowerCase())
        : true;
      return matchesKeyword;
    });
  } catch (error) {
    return handleApiError(error, 'NewsAPI');
  }
};


// Fetch articles from The Guardian API
export const fetchNewsFromGuardian = async (query, filters) => {
  try {
    const formattedDate = formatDate(filters.date);

    // Map categories to Guardian's section identifiers
    const sectionMapping = {
      technology: 'technology',
      business: 'business',
      entertainment: 'culture',
      sports: 'sport',
      // Add more categories if needed
    };

    const section = filters.category ? sectionMapping[filters.category.toLowerCase()] : '';

    // Make sure the section is not undefined or an empty string
    if (section === undefined || section === '') {
      console.warn('Invalid or missing category filter for The Guardian');
    }

    const response = await axios.get('https://content.guardianapis.com/search', {
      params: {
        q: query,
        fromDate: formattedDate,
        'show-fields': 'all',
        apiKey: GUARDIAN_API_KEY,
        section: section || '',  // Ensure it falls back to an empty string if section is undefined
        orderBy: 'newest',  // Optional: You can also sort by newest articles
      },
    });

    return response.data.response.results.filter((article) => {
      const matchesKeyword = query
        ? article.webTitle.toLowerCase().includes(query.toLowerCase()) ||
          (article.fields?.trailText || '').toLowerCase().includes(query.toLowerCase())
        : true;

      const matchesCategory = filters.category
        ? section === article.sectionId
        : true;

      return matchesKeyword && matchesCategory;
    });
  } catch (error) {
    return handleApiError(error, 'Guardian');
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



