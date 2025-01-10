import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPreferences } from './actions';
import { IoIosRefresh } from 'react-icons/io'; // Import the reset icon
import { fetchNewsFromNewsAPI, fetchNewsFromGuardian, fetchNewsFromBBC, fetchNewsFromNYT } from './newsApi';
import './App.css';

const NewsAggregator = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences);

  const [query, setQuery] = useState(''); // Default query set to empty
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);

  useEffect(() => {
    fetchArticles();
  }, [preferences, currentPage, query]);
  

  const fetchArticles = async () => {
    const filters = {
      date: preferences.date || '',
      sources: preferences.sources || '',
      author: preferences.author || '',
      category: preferences.category || '',
    };
  
    console.log('Filters:', filters);
  
    let allArticles = [];
  
    // Fetch articles from all sources if no specific source is selected
    const sourcesToFetch = preferences.sources ? [preferences.sources] : ['newsapi', 'guardian', 'bbc-news', 'nyt'];
  
    for (const source of sourcesToFetch) {
      switch (source) {
        case 'newsapi':
          allArticles = [
            ...allArticles,
            ...await fetchNewsFromNewsAPI(query, filters),
          ];
          break;
        case 'guardian':
          allArticles = [
            ...allArticles,
            ...await fetchNewsFromGuardian(query, filters),
          ];
          break;
        case 'bbc-news':
          allArticles = [
            ...allArticles,
            ...await fetchNewsFromBBC(query, filters),
          ];
          break;
        case 'nyt':
          allArticles = [
            ...allArticles,
            ...await fetchNewsFromNYT(query, filters),
          ];
          break;
        default:
          break;
      }
    }
  
    // Normalize articles and apply filters
    // const normalizedArticles = allArticles.map(article => ({
    //   ...article,
    //   author: article.author || "Unknown",
    //   publishedAt: article.publishedAt || "Unknown",
    //   headline: article.headline || article.webTitle || "No headline available",
    // }));
    // const normalizedArticles = allArticles.map(article => {
    //   let author = "Unknown Author";
    
    //   // Check for NYT's specific `byline.original` field
    //   if (article.byline?.original) {
    //     author = article.byline.original.replace(/^By\s+/i, ""); // Remove "By" if present
    //   } else if (article.fields?.byline) {
    //     author = article.fields.byline;
    //   } else if (article.author) {
    //     author = article.author;
    //   }
    
    //   const publishedAt = article.publishedAt || article.webPublicationDate
    //     ? new Date(article.publishedAt || article.webPublicationDate).toISOString()
    //     : "Unknown Date";
    
    //   return {
    //     ...article,
    //     author,
    //     publishedAt,
    //     headline: article.headline || article.webTitle || article.title || "No headline available",
    //   };
    // });
    const normalizedArticles = allArticles.map((article) => {
      let category = article.category || article.sectionName || article.section || article.section_name || "Unknown Category";
      let author = "Unknown Author";
      
      if (article.byline?.original) {
        author = article.byline.original.replace(/^By\s+/i, ""); // Remove "By" if present
      } else if (article.fields?.byline) {
        author = article.fields.byline;
      } else if (article.author) {
        author = article.author;
      }
    
      const publishedAt = article.publishedAt || article.webPublicationDate
        ? new Date(article.publishedAt || article.webPublicationDate).toISOString()
        : "Unknown Date";
    
      return {
        ...article,
        category,
        author,
        publishedAt,
        headline: article.headline || article.webTitle || article.title || "No headline available",
      };
    });
    
    
    
    
    const filteredArticles = normalizedArticles.filter((article) => {
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
    
    console.log('Normalized Articles:', normalizedArticles);

    // Pagination
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
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for articles..."
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
              {/* <option value="newsapi">NewsAPI</option> */}
              <option value="guardian">The Guardian</option>
              <option value="bbc-news">BBC News</option>
              <option value="nyt">The New York Times</option>
              
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
    {/* Add other categories as needed */}
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
          <div className="reset-icon" onClick={handleReset}>
            <IoIosRefresh size={30} />
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
              <h2>{article.headline || article.title}</h2>
              <p>{article.standfirst || article.description}</p>
              <p><strong>Author:</strong> {article.author || "Unknown"}</p>
              <p><strong>Published on:</strong> 
                {article.publishedAt ? formatDate(article.publishedAt) : "Unknown Date"}
              </p>
              <a href={article.webUrl || article.url} target="_blank" rel="noopener noreferrer">
  Read more
</a>

            </div>
          ))
        ) : (
          <p>No articles found.</p>
        )}
      </div>

      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => paginate(currentPage + 1)} disabled={articles.length < articlesPerPage}>
          Next
        </button>
      </div>

  
      <footer className="footer">      
          <p>&copy; {new Date().getFullYear()} News Aggregator. All rights reserved.</p>
     </footer>
    </div>
  );
};

// export default NewsAggregator;

// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPreferences } from './actions';
// import { fetchNewsFromNewsAPI, fetchNewsFromGuardian, fetchNewsFromBBC, fetchNewsFromNYT } from './newsApi';
// import './App.css';

// const NewsAggregator = () => {
//   const dispatch = useDispatch();
//   const preferences = useSelector((state) => state.preferences);

//   const [query, setQuery] = useState(''); // Default query set to empty
//   const [articles, setArticles] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [articlesPerPage] = useState(5);

//   useEffect(() => {
//     console.log('Updated Preferences:', preferences);
//     fetchArticles(); // Fetch articles on mount without waiting for query
//   }, [preferences, currentPage]);

//   const fetchArticles = async () => {
//     const filters = {
//       date: preferences.date || '',
//       sources: preferences.sources || '',
//       author: preferences.author || '',
//       category: preferences.category || '',
//     };

//     console.log('Filters:', filters);

//     let newsAPIArticles = [];
//     let guardianArticles = [];
//     let bbcArticles = [];
//     let nytArticles = [];

//     // Fetch articles based on the source preference
//     if (preferences.sources === 'newsapi') {
//       newsAPIArticles = await fetchNewsFromNewsAPI(query, filters);
//     }
//     if (preferences.sources === 'guardian') {
//       guardianArticles = await fetchNewsFromGuardian(query, filters);
//       console.log('Guardian Articles:', guardianArticles);
//     }
//     if (preferences.sources === 'bbc-news') {
//       bbcArticles = await fetchNewsFromBBC(query, filters);
//     }
//     if (preferences.sources === 'nyt') {
//       nytArticles = await fetchNewsFromNYT(query, filters);
//     }

//     // Normalize articles from all sources
//     const allArticles = [
//       ...newsAPIArticles.map(article => ({
//         ...article,
//         author: article.author || "Unknown",
//         publishedAt: article.publishedAt || "Unknown"
//       })),
//       ...guardianArticles.map(article => ({
//         ...article,
//         headline: article.webTitle || "No headline available",
//           author: article.author || "Unknown",
//         //author: article.byline ? article.byline : article.webTitle || "Unknown",  // Check for byline, otherwise use webTitle (title)
//         publishedAt: article.webPublicationDate || "Unknown"
//       })),
//       ...bbcArticles.map(article => ({
//         ...article,
//         author: article.author || "Unknown",
//         publishedAt: article.publishedAt || "Unknown"
//       })),
//       ...nytArticles.map(article => ({
//         ...article,
//         author: article.byline ? article.byline : article.headline || "Unknown", // Use headline if byline is missing
//         publishedAt: article.published_date || "Unknown"
//       })),
//     ];

//     const filteredArticles = allArticles.filter((article) => {
//       // Date filter
//       if (filters.date && article.publishedAt) {
//         const articleDate = article.publishedAt.split('T')[0];
//         if (articleDate !== filters.date) return false;
//       }

//       // Author filter
//       if (filters.author && article.author) {
//         if (!article.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
//       }

//       // Category filter
//       if (filters.category && article.category) {
//         if (!article.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
//       }

//       return true;
//     });

//     const indexOfLastArticle = currentPage * articlesPerPage;
//     const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
//     const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

//     setArticles(currentArticles);
//   };

//   const handlePreferencesChange = (newPreferences) => {
//     if (newPreferences.date) {
//       const date = newPreferences.date;
//       newPreferences.date = date ? new Date(date).toISOString().split('T')[0] : '';
//     }
//     dispatch(setPreferences(newPreferences));
//     localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handleReset = () => {
//     setQuery('');
//     setCurrentPage(1);
//     dispatch(setPreferences({
//       date: '',
//       sources: '',
//       author: '',
//       category: '', // Reset category
//     }));
//     localStorage.removeItem('userPreferences');
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//   };

//   const handleRemoveFilter = (filterType) => {
//     const updatedPreferences = { ...preferences };
//     updatedPreferences[filterType] = '';
//     dispatch(setPreferences(updatedPreferences));
//     localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
//   };

//   return (
//     <div>
//       <h1>News Aggregator - Personalized News Feed</h1>
//       <div className="marquee-container">
//         <p className="marquee">
//           The News Aggregator allows users to search for and filter articles based on their preferences, 
//           such as category, source, and date, for a tailored news experience.
//         </p>
//       </div>

//       <div>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search for articles"
//         />

//         {/* Filters Section */}
//         <div className="filters-container">
//           <div className="filter-item">
//             <input 
//               type="date"
//               value={preferences.date || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, date: e.target.value })}
//             />
//           </div>

//           <div className="filter-item">
//             <select 
//               value={preferences.sources || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, sources: e.target.value })}
//             >
//               <option value="">Filter by Source</option>
//               <option value="newsapi">NewsAPI</option>
//               <option value="guardian">The Guardian</option>
//               <option value="bbc-news">BBC News</option>
//               <option value="nyt">The New York Times</option>
//             </select>
//           </div>

//           <div className="filter-item">
//             <select 
//               value={preferences.category || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, category: e.target.value })}
//             >
//               <option value="">Filter by Category</option>
//               <option value="entertainment">Entertainment</option>
//               <option value="sports">Sports</option>
//               <option value="technology">Technology</option>
//               <option value="business">Business</option>
//               <option value="health">Health</option>
//               <option value="science">Science</option>
//             </select>
//           </div>

//           <div className="filter-item">
//             <input
//               type="text"
//               value={preferences.author || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, author: e.target.value })}
//               placeholder="Filter by Author"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="active-filters">
//         <h3>Active Filters:</h3>
//         <ul>
//           {preferences.date && (
//             <li>
//               Date: {preferences.date} 
//               <button onClick={() => handleRemoveFilter('date')}>X</button>
//             </li>
//           )}
//           {preferences.sources && (
//             <li>
//               Source: {preferences.sources} 
//               <button onClick={() => handleRemoveFilter('sources')}>X</button>
//             </li>
//           )}
//           {preferences.category && (
//             <li>
//               Category: {preferences.category} 
//               <button onClick={() => handleRemoveFilter('category')}>X</button>
//             </li>
//           )}
//           {preferences.author && (
//             <li>
//               Author: {preferences.author} 
//               <button onClick={() => handleRemoveFilter('author')}>X</button>
//             </li>
//           )}
//         </ul>
//       </div>

//       {/* Articles Section */}
//       <div>
//         {articles.length > 0 ? (
//           articles.map((article, index) => (
//             <div key={index} className="article">
//               <h2>{article.headline || article.title}</h2>
//               <p>{article.standfirst || article.description}</p>
//               <p><strong>Author:</strong> {article.author || "Unknown"}</p>
//               <p><strong>Published on:</strong> 
//                 {article.publishedAt ? formatDate(article.publishedAt) : "Unknown Date"}
//               </p>
//               <a href={article.webUrl} target="_blank" rel="noopener noreferrer">Read more</a>
//             </div>
//           ))
//         ) : (
//           <p>No articles found.</p>
//         )}
//       </div>

//       {/* Pagination Section */}
//       <div className="pagination">
//         <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
//           Previous
//         </button>
//         <span>Page {currentPage}</span>
//         <button onClick={() => paginate(currentPage + 1)} disabled={articles.length < articlesPerPage}>
//           Next
//         </button>
//       </div>

//       <div>
//         <button onClick={handleReset} className="reset-button">
//           Reset All 
//         </button>
//       </div>
//       <footer className="footer">      
//           <p>&copy; {new Date().getFullYear()} News Aggregator. All rights reserved.</p>
//      </footer>
//     </div>
//   );
// };

// export default NewsAggregator;
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { setPreferences } from './actions';
// import { fetchNewsFromNewsAPI, fetchNewsFromGuardian, fetchNewsFromBBC, fetchNewsFromNYT } from './newsApi';
// import './App.css';

// const NewsAggregator = () => {
//   const dispatch = useDispatch();
//   const preferences = useSelector((state) => state.preferences);

//   const [query, setQuery] = useState(''); // Default query set to empty
//   const [articles, setArticles] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [articlesPerPage] = useState(5);

//   useEffect(() => {
//     console.log('Updated Preferences:', preferences);
//     fetchArticles(); // Fetch articles on mount without waiting for query
//   }, []); // Empty dependency array to run only on component mount

//   const fetchArticles = async () => {
//     const filters = {
//       date: preferences.date || '',
//       sources: preferences.sources || '',
//       author: preferences.author || '',
//       category: preferences.category || '',
//     };

//     console.log('Filters:', filters);

//     let newsAPIArticles = [];
//     let guardianArticles = [];
//     let bbcArticles = [];
//     let nytArticles = [];

//     // Fetch articles based on the source preference
//     if (preferences.sources === 'newsapi' || preferences.sources === '') {
//       newsAPIArticles = await fetchNewsFromNewsAPI(query, filters);
//     }
//     if (preferences.sources === 'guardian' || preferences.sources === '') {
//       guardianArticles = await fetchNewsFromGuardian(query, filters);
//     }
//     if (preferences.sources === 'bbc-news' || preferences.sources === '') {
//       bbcArticles = await fetchNewsFromBBC(query, filters);
//     }
//     if (preferences.sources === 'nyt' || preferences.sources === '') {
//       nytArticles = await fetchNewsFromNYT(query, filters);
//     }

//     // Normalize articles from all sources
//     const allArticles = [
//       ...newsAPIArticles.map(article => ({
//         ...article,
//         author: article.author || "Unknown",
//         publishedAt: article.publishedAt || "Unknown"
//       })),
//       ...guardianArticles.map(article => ({
//         ...article,
//         headline: article.webTitle || "No headline available",
//         author: article.fields?.byline || "Unknown",
//         publishedAt: article.webPublicationDate || "Unknown"
//       })),
//       ...bbcArticles.map(article => ({
//         ...article,
//         headline: article.webTitle || "No headline available",
//         author: article.author || "Unknown",
//         publishedAt: article.publishedAt || "Unknown"
//       })),
//       ...nytArticles.map(article => ({
//         ...article,
//         author: article.byline ? article.byline : article.headline || "Unknown",
//         publishedAt: article.published_date || "Unknown"
//       })),
//     ];

//     const filteredArticles = allArticles.filter((article) => {
//       // Date filter
//       if (filters.date && article.publishedAt) {
//         const articleDate = new Date(article.publishedAt).toISOString().split('T')[0]; // Normalize to YYYY-MM-DD format
//         if (articleDate !== filters.date) return false;
//       }

//       // Author filter
//       if (filters.author && article.author) {
//         if (!article.author.toLowerCase().trim().includes(filters.author.toLowerCase().trim())) return false;
//       }

//       // Category filter
//       if (filters.category && article.category) {
//         if (!article.category.toLowerCase().includes(filters.category.toLowerCase())) return false;
//       }

//       return true;
//     });

//     // Pagination logic
//     const indexOfLastArticle = currentPage * articlesPerPage;
//     const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
//     const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);

//     setArticles(currentArticles); // Update articles state
//   };

//   const handlePreferencesChange = (newPreferences) => {
//     if (newPreferences.date) {
//       const date = newPreferences.date;
//       newPreferences.date = date ? new Date(date).toISOString().split('T')[0] : '';
//     }
//     dispatch(setPreferences(newPreferences));
//     localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
//   };

//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const handleReset = () => {
//     setQuery('');
//     setCurrentPage(1);
//     dispatch(setPreferences({
//       date: '',
//       sources: '',
//       author: '',
//       category: '', // Reset category
//     }));
//     localStorage.removeItem('userPreferences');
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//   };

//   const handleRemoveFilter = (filterType) => {
//     const updatedPreferences = { ...preferences };
//     updatedPreferences[filterType] = '';
//     dispatch(setPreferences(updatedPreferences));
//     localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
//   };

//   return (
//     <div>
//       <h1>News Aggregator - Personalized News Feed</h1>
//       <div className="marquee-container">
//         <p className="marquee">
//           The News Aggregator allows users to search for and filter articles based on their preferences, 
//           such as category, source, and date, for a tailored news experience.
//         </p>
//       </div>

//       <div>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search for articles"
//         />

//         {/* Filters Section */}
//         <div className="filters-container">
//           <div className="filter-item">
//             <input 
//               type="date"
//               value={preferences.date || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, date: e.target.value })}
//             />
//           </div>

//           <div className="filter-item">
//             <select 
//               value={preferences.sources || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, sources: e.target.value })}
//             >
//               <option value="">Filter by Source</option>
//               <option value="newsapi">NewsAPI</option>
//               <option value="guardian">The Guardian</option>
//               <option value="bbc-news">BBC News</option>
//               <option value="nyt">The New York Times</option>
//             </select>
//           </div>

//           <div className="filter-item">
//             <select 
//               value={preferences.category || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, category: e.target.value })}
//             >
//               <option value="">Filter by Category</option>
//               <option value="entertainment">Entertainment</option>
//               <option value="sports">Sports</option>
//               <option value="technology">Technology</option>
//               <option value="business">Business</option>
//               <option value="health">Health</option>
//               <option value="science">Science</option>
//             </select>
//           </div>

//           <div className="filter-item">
//             <input
//               type="text"
//               value={preferences.author || ''}
//               onChange={(e) => handlePreferencesChange({ ...preferences, author: e.target.value })}
//               placeholder="Filter by Author"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="active-filters">
//         <h3>Active Filters:</h3>
//         <ul>
//           {preferences.date && (
//             <li>
//               Date: {preferences.date} 
//               <button onClick={() => handleRemoveFilter('date')}>X</button>
//             </li>
//           )}
//           {preferences.sources && (
//             <li>
//               Source: {preferences.sources} 
//               <button onClick={() => handleRemoveFilter('sources')}>X</button>
//             </li>
//           )}
//           {preferences.category && (
//             <li>
//               Category: {preferences.category} 
//               <button onClick={() => handleRemoveFilter('category')}>X</button>
//             </li>
//           )}
//           {preferences.author && (
//             <li>
//               Author: {preferences.author} 
//               <button onClick={() => handleRemoveFilter('author')}>X</button>
//             </li>
//           )}
//         </ul>
//       </div>

//       {/* Articles Section */}
//       <div>
//         {articles.length > 0 ? (
//           articles.map((article, index) => (
//             <div key={index} className="article">
//               <h2>{article.headline || article.title}</h2>
//               <p>{article.standfirst || article.description}</p>
//               <p><strong>Author:</strong> {article.author || "Unknown"}</p>
//               <p><strong>Published on:</strong> 
//                 {article.publishedAt ? formatDate(article.publishedAt) : "Unknown Date"}
//               </p>
//               <a href={article.webUrl} target="_blank" rel="noopener noreferrer">Read more</a>
//             </div>
//           ))
//         ) : (
//           <p>No articles found.</p>
//         )}
//       </div>

//       {/* Pagination Section */}
//       <div className="pagination">
//         <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
//           Previous
//         </button>
//         <span>Page {currentPage}</span>
//         <button onClick={() => paginate(currentPage + 1)} disabled={articles.length < articlesPerPage}>
//           Next
//         </button>
//       </div>

//       <div>
//         <button onClick={handleReset} className="reset-button">
//           Reset All 
//         </button>
//       </div>
//        {/* Footer Section */}
//        <footer className="footer">
//         <p>&copy; {new Date().getFullYear()} News Aggregator. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

export default NewsAggregator;
