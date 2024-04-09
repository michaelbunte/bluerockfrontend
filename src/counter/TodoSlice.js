import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getUnicorn } from './UnicornAPI';


export const unicornAsync = createAsyncThunk(
    'todo/fetchCount',
    async (amount) => {
        const response = await getUnicorn(amount);
        // The value we return becomes the `fulfilled` action payload
        return response.data;
    }
);

export const todoSlice = createSlice({
    name: "todo",
    initialState: {
        value: ["item1", "item2"],
        play_state: false,
        playback_cache_state: "loading",
        cache: [],
        start_bound: new Date(),
        end_bound: new Date(),
        previous_query: { start: new Date(), end: new Date()},
        sensor_info_table: {},
        time_step: 1000
    },
    reducers: {
        addTodo: (state, action) => {
            state.value.push(action.payload)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(unicornAsync.pending, (state) => {
                console.log("pending");
            })
            .addCase(unicornAsync.fulfilled, (state, action) => {
                console.log("done");
                state.value.push(action.payload)
            })
    }
})

export const { addTodo } = todoSlice.actions;
export const selectTodos = (state) => state.todo.value;
export default todoSlice.reducer;
