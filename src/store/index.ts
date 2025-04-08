import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
// We'll add these slices as we continue building
// import tasksReducer from './slices/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    // tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
