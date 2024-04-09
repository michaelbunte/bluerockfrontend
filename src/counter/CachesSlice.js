import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"


export const cachesSlice = createSlice({
    name: "caches",
    initialState: {
        selected_sensors_cache_state: "empty"
    },
    reducers: {
        set_selected_sensors_cache_to_loading: (state) => {
            state.selected_sensors_cache_state = "loading"
        },
        set_selected_sensors_cache_to_loaded: (state) => {
            state.selected_sensors_cache_state = "loaded";
        }
    }
});

export const { set_selected_sensors_cache_to_loaded } = cachesSlice.actions;
export const select_selected_sensors_cache_state = (state) => state.caches.selected_sensors_cache_state;
export default cachesSlice.reducer;