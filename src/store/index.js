import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import contentSlice from './slices/contentSlice';
import chatSlice from './slices/chatSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    content: contentSlice,
    chat: chatSlice,
  },
});

// ...removed TypeScript types...
