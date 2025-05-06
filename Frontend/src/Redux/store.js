// store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { userSlice } from './features/userSlice';


import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const rootReducer = combineReducers({
  user: userSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['location'], // 🔥 Exclude location from being persisted
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ Prevents redux-persist warnings
    }),
});

export const persistor = persistStore(store);
export default store;
