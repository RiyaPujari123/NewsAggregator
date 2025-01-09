import React, { useState } from 'react';

const Search = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('entertainment');
  const [source, setSource] = useState('newsapi');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ searchQuery, category, source, date });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search articles"
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="entertainment">Entertainment</option>
        <option value="sports">Sports</option>
        <option value="politics">Politics</option>
      </select>
      <select value={source} onChange={(e) => setSource(e.target.value)}>
        <option value="newsapi">News API</option>
        <option value="guardian">The Guardian</option>
        <option value="bbc">BBC News</option>
      </select>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <button type="submit">Search</button>
    </form>
  );
};

export default Search;
