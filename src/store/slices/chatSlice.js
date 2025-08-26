import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: [],
  isOpen: false,
  loading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { toggleChat, addMessage, setLoading, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;