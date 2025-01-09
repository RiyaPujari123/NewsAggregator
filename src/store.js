import { createStore } from 'redux';
import preferencesReducer from './reducer';

const store = createStore(preferencesReducer);

export default store;
