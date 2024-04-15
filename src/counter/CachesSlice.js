import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"

let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";
// fetch(`http://${host_string}/bluerock/adaptive_all_history/${selected_sensor}/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`);

export const initial_page_load = createAsyncThunk(
    'caches/initial_page_load',
    async (amount) => {
        console.log("fetching")
        let [sensor_table, plcrange] = await Promise.all([
            fetch(`http://${host_string}/bluerock/sensor_info_table`)
                .then(response => response.json()),
            fetch(`http://${host_string}/bluerock/adaptive_all_history/plctime/${new Date("1970").toISOString()}/${new Date("2100").toISOString()}`)
                .then(response => response.json()),
        ]);

        return {
            sensor_table: sensor_table,
            start_date: new Date(plcrange[0][0]).toISOString(),
            end_date: new Date(plcrange[plcrange.length - 1][0]).toISOString()
        };
    }
)

export const cachesSlice = createSlice({
    name: "caches",
    initialState: {
        selected_sensors_cache_state: "empty",
        start_date: new Date("1970").toISOString(),
        end_date: new Date("1970").toISOString(),
    },
    reducers: {
        set_selected_sensors_cache_to_loading: (state) => {
            state.selected_sensors_cache_state = "loading"
        },
        set_selected_sensors_cache_to_loaded: (state) => {
            state.selected_sensors_cache_state = "loaded";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initial_page_load.fulfilled, (state, action) => {
                console.log(action.payload)
                state.start_date = action.payload.start_date;
                state.end_date = action.payload.end_date;
                state.sensor_table = action.payload.sensor_table;
            })
            .addCase(initial_page_load.rejected, (state) => {
                window.alert("Failed To Contact Server");
            })
            

    }
});

export const {
    set_selected_sensors_cache_to_loading,
    set_selected_sensors_cache_to_loaded
} = cachesSlice.actions;

export const select_selected_sensors_cache_state =
    (state) => state.caches.selected_sensors_cache_state;

export default cachesSlice.reducer;