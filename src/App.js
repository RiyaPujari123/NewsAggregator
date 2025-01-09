import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import NewsAggregator from './NewsAggregator';


const App = () => {
  return (
    <Provider store={store}>
      <NewsAggregator />
    </Provider>
  );
};

export default App;

