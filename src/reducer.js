import { SET_PREFERENCES } from './actions';

const initialState = {
  preferences: {
    date: '',       // Ensure date is included in the initial state
    category: '',
    sources: '',    // Default empty string for sources
    author: '',
  },
};

const preferencesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PREFERENCES:
      return {
        ...state,
        preferences: {
          ...state.preferences,  // Keep existing preferences
          ...action.payload,      // Update only the changed preferences
        },
      };
    default:
      return state;
  }
};

export default preferencesReducer;
