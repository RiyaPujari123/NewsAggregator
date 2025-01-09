import React from 'react';

const ArticleList = ({ articles }) => {
  return (
    <div>
      {articles.length > 0 ? (
        articles.map((article, index) => (
          <div key={index} className="article">
            <h2>{article.title}</h2>
            <p>{article.description}</p>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))
      ) : (
        <p>No articles found</p>
      )}
    </div>
  );
};

export default ArticleList;
