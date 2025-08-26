import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  quizzes: [],
  stories: [],
  myths: [],
  loading: false,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setQuizzes: (state, action) => {
      state.quizzes = action.payload;
    },
    setStories: (state, action) => {
      state.stories = action.payload;
    },
    setMyths: (state, action) => {
      state.myths = action.payload;
    },
    addStory: (state, action) => {
      state.stories.push(action.payload);
    },
  },
});

export const { setQuizzes, setStories, setMyths, addStory } = contentSlice.actions;
export default contentSlice.reducer;