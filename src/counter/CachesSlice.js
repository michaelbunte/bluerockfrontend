import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { useDispatch } from 'react-redux';

const get_min_date = (date_string_1, date_string_2) => {
    return new Date(Math.min(new Date(date_string_1), new Date(date_string_2))).toISOString();
}

const get_max_date = (date_string_1, date_string_2) => {
    return new Date(Math.max(new Date(date_string_1), new Date(date_string_2))).toISOString();
}


let host_string = "ec2-54-215-192-153.us-west-1.compute.amazonaws.com:5001";
// fetch(`http://${host_string}/bluerock/adaptive_all_history/${selected_sensor}/${cache_size["start"].toISOString()}/${cache_size["end"].toISOString()}`);

export const initial_page_load = createAsyncThunk(
    'caches/initial_page_load',
    async (amount) => {
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


/*
args: {
    set_selected_sensors_to_loading: bool,
    selected_sensors: ["sensor1", "sensor2", ...]
}
*/
export const update_sensor_list = createAsyncThunk(
    "caches/update_sensor_list",
    async (args, { dispatch, getState }) => {
        const state = getState();
        let {
            set_selected_sensors_to_loading,
            selected_sensors
        } = args;

        console.log("calling update sensor list")
        if (set_selected_sensors_to_loading) {
            await dispatch({
                type: "caches/set_selected_sensors_cache_to_loading"
            });
        }

        await dispatch({
            type: "caches/update_most_recent_query",
            payload: {
                start: get_min_date(state.caches.handle_1_date, state.caches.handle_2_date),
                end: get_max_date(state.caches.handle_1_date, state.caches.handle_2_date),
            }
        });

    }
)

export const handle_time_increment = createAsyncThunk(
    "caches/handle_time_increment",
    async (amount, { dispatch, getState }) => {
        const state = getState();
        console.log(state.caches);
        // if (
        //     !state.caches.playing
        //     || state.caches.selected_sensors_cache_state != "loaded"
        //     || state.caches.playback_cache_state != "loaded"
        // ) { return; }

        dispatch({
            type: "caches/try_test"
        });

        return {}
    }
)

export const cachesSlice = createSlice({
    name: "caches",
    initialState: {
        playing: false,
        test: "not tested",
        selected_sensors_cache_state: "empty",
        playback_cache_state: "empty",
        start_date: new Date("1970").toISOString(),
        end_date: new Date("1970").toISOString(),
        handle_1_date: new Date("1970").toISOString(),
        handle_2_date: new Date("1970").toISOString(),
        sensor_table: [],
        most_recent_query: {
            start: new Date("1970").toISOString(),
            end: new Date("1970").toISOString()
        }
    },
    reducers: {


        set_selected_sensors_cache_to_loading: (state) => {
            state.selected_sensors_cache_state = "loading";
        },
        set_selected_sensors_cache_to_loaded: (state) => {
            state.selected_sensors_cache_state = "loaded";
        },
        try_test: (state) => {
            state.test = "we have tested"
        },
        update_most_recent_query: (state, action) => {
            let { start, end } = action.payload;

            state.most_recent_query = {
                start: start,
                end: end,
            };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initial_page_load.fulfilled, (state, action) => {
                console.log("connected to server")
                state.start_date = action.payload.start_date;
                state.handle_1_date = action.payload.start_date;
                state.end_date = action.payload.end_date;
                state.handle_2_date = action.payload.end_date;
                state.sensor_table = action.payload.sensor_table;
            })
            .addCase(initial_page_load.rejected, () => {
                window.alert("Failed To Contact Server");
            })

            .addCase(update_sensor_list.rejected, (state, error) => {
                console.error(error)
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