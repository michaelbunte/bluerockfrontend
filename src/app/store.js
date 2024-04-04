import { configureStore } from '@reduxjs/toolkit';
import todoReducer from "../counter/TodoSlice";

export const store = configureStore({
    reducer: {
        todo: todoReducer,
    },
});
