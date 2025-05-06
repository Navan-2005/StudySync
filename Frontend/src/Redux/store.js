// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { userSlice } from './features/userSlice';
import PomodoroReducer from './features/PomodoroSlice';


import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

// Include pomodoro reducer in the combined reducers
const rootReducer = combineReducers({
  user: userSlice.reducer,
  pomodoro: PomodoroReducer, // Added pomodoro reducer here
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['location'], // 🔥 Exclude location from being persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer, // Now includes both user and pomodoro reducers
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Prevents redux-persist warnings
    }),
});

export const persistor = persistStore(store);
export default store;