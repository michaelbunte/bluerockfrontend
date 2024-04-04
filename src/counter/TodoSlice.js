
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
export const todoSlice = createSlice({
    name: "todoSlice",
    initialState: {
        value: ["item1", "item2"]
    },
    reducers: {
        addTodo: (state, action) => {
            state.value.push(action.payload)
        }
    }
})

export const { addTodo } = todoSlice.actions;
export const selectTodos = (state) => state.todo.value;
export default todoSlice.reducer;
