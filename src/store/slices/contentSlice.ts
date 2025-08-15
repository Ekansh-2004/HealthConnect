import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Quiz {
  id: string;
  title: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
}

export interface Story {
  id: string;
  content: string;
  approved: boolean;
  createdAt: string;
}

interface ContentState {
  quizzes: Quiz[];
  stories: Story[];
  myths: Array<{ id: string; myth: string; fact: string; }>;
  loading: boolean;
}

const initialState: ContentState = {
  quizzes: [],
  stories: [],
  myths: [],
  loading: false,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload;
    },
    setStories: (state, action: PayloadAction<Story[]>) => {
      state.stories = action.payload;
    },
    setMyths: (state, action: PayloadAction<Array<{ id: string; myth: string; fact: string; }>>) => {
      state.myths = action.payload;
    },
    addStory: (state, action: PayloadAction<Story>) => {
      state.stories.push(action.payload);
    },
  },
});

export const { setQuizzes, setStories, setMyths, addStory } = contentSlice.actions;
export default contentSlice.reducer;