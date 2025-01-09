import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreferences } from './actions';
import { fetchNewsFromNewsAPI, fetchNewsFromGuardian, fetchNewsFromBBC } from './newsApi';
import './App.css';

const NewsAggregator = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences);

  const [query, setQuery] = useState(''); // Default query set to empty
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);

  useEffect(() => {
    console.log('Updated Preferences:', preferences);
    fetchArticles(); // Fetch articles on mount without waiting for query
  }, [preferences, currentPage]);

  const fetchArticles = async () => {
    const filters = {
      date: preferences.date || '',
      sources: preferences.sources || '',
      author: preferences.author || '',
      category: preferences.category || '',
    };

    console.log('Filters:', filters);

    const newsAPIArticles = await fetchNewsFromNewsAPI(query, filters);
    const guardianArticles = await fetchNewsFromGuardian(query, filters);
    const bbcArticles = await fetchNewsFromBBC(query, filters);

    const allArticles = [...newsAPIArticles, ...guardianArticles, ...bbcArticles];

    const filteredArticles = allArticles.filter((article) => {
      // Date filter
      if (filters.date && article.publishedAt) {
        const articleDate = article.publishedAt.split('T')[0];
        if (articleDate !== filters.date) return false;
      }

      // Author filter
      if (filters.author && article.author) {
        if (!article.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
      }

      // Category filter
      if (filters.category && article.category) {
        if (!article.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
      }

      return true;
    });

    const indexOfLastArticle = currentPage * articlesPerPage;
    const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
    const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

    setArticles(currentArticles);
  };

  const handlePreferencesChange = (newPreferences) => {
    if (newPreferences.date) {
      const date = newPreferences.date;
      newPreferences.date = date ? new Date(date).toISOString().split('T')[0] : '';
    }
    dispatch(setPreferences(newPreferences));
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleReset = () => {
    setQuery('');
    setCurrentPage(1);
    dispatch(setPreferences({
      date: '',
      sources: '',
      author: '',
      category: '', // Reset category
    }));
    localStorage.removeItem('userPreferences');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleRemoveFilter = (filterType) => {
    const updatedPreferences = { ...preferences };
    updatedPreferences[filterType] = '';
    dispatch(setPreferences(updatedPreferences));
    localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
  };

  return (
    <div>
      <h1>News Aggregator - Personalized News Feed</h1>
      <div className="marquee-container">
        <p className="marquee">
          The News Aggregator allows users to search for and filter articles based on their preferences, 
          such as category, source, and date, for a tailored news experience.
        </p>
      </div>

      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for articles"
        />

        {/* Filters Section */}
        <div className="filters-container">
          <div className="filter-item">
            <input 
              type="date"
              value={preferences.date || ''}
              onChange={(e) => handlePreferencesChange({ ...preferences, date: e.target.value })}
            />
          </div>

          <div className="filter-item">
            <select 
              value={preferences.sources || ''}
              onChange={(e) => handlePreferencesChange({ ...preferences, sources: e.target.value })}
            >
              <option value="">Filter by Source</option>
              <option value="newsapi">NewsAPI</option>
              <option value="the-guardian">The Guardian</option>
              <option value="bbc-news">BBC News</option> 
              <option value="cnn">CNN</option>
            </select>
          </div>

          <div className="filter-item">
            <select 
              value={preferences.category || ''}
              onChange={(e) => handlePreferencesChange({ ...preferences, category: e.target.value })}
            >
              <option value="">Filter by Category</option>
              <option value="entertainment">Entertainment</option>
              <option value="sports">Sports</option>
              <option value="technology">Technology</option>
              <option value="business">Business</option>
              <option value="health">Health</option>
              <option value="science">Science</option>
            </select>
          </div>

          <div className="filter-item">
            <input
              type="text"
              value={preferences.author || ''}
              onChange={(e) => handlePreferencesChange({ ...preferences, author: e.target.value })}
              placeholder="Filter by Author"
            />
          </div>
        </div>
      </div>

      <div className="active-filters">
        <h3>Active Filters:</h3>
        <ul>
          {preferences.date && (
            <li>
              Date: {preferences.date} 
              <button onClick={() => handleRemoveFilter('date')}>X</button>
            </li>
          )}
          {preferences.sources && (
            <li>
              Source: {preferences.sources} 
              <button onClick={() => handleRemoveFilter('sources')}>X</button>
            </li>
          )}
          {preferences.category && (
            <li>
              Category: {preferences.category} 
              <button onClick={() => handleRemoveFilter('category')}>X</button>
            </li>
          )}
          {preferences.author && (
            <li>
              Author: {preferences.author} 
              <button onClick={() => handleRemoveFilter('author')}>X</button>
            </li>
          )}
        </ul>
      </div>

      {/* Articles Section */}
      <div>
        {articles.length > 0 ? (
          articles.map((article, index) => (
            <div key={index} className="article">
              <h2>{article.title}</h2>
              <p>{article.description}</p>
              <p><strong>Author:</strong> {article.author || "Unknown"}</p>
              <p><strong>Published on:</strong> {article.publishedAt ? formatDate(article.publishedAt) : "Unknown Date"}</p>
              <a href={article.url} target="_blank" rel="noopener noreferrer">Read more</a>
            </div>
          ))
        ) : (
          <p>No articles found.</p>
        )}
      </div>

      {/* Pagination Section */}
      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => paginate(currentPage + 1)} disabled={articles.length < articlesPerPage}>
          Next
        </button>
      </div>

      <div>
        <button onClick={handleReset} className="reset-button">
          Reset All 
        </button>
      </div>
    </div>
  );
};

export default NewsAggregator;
