import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { useDispatch } from 'react-redux';
import { createSelector } from 'reselect';

const CACHE_OVERFLOW_RATIO = 0.5;

const get_min_date = (date_string_1, date_string_2) => {
    return new Date(Math.min(new Date(date_string_1), new Date(date_string_2))).toISOString();
}

const get_max_date = (date_string_1, date_string_2) => {
    return new Date(Math.max(new Date(date_string_1), new Date(date_string_2))).toISOString();
}

export const binarySearchNearestTime = (arr, targetTime) => {
    let target_time_millis = new Date(targetTime).getTime();
    let left = 0;
    let right = arr.length - 1;
    let nearestIndex = -1;
    let minDiff = Infinity;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const midTime = new Date(arr[mid]["timezone"]).getTime();
        const diff = Math.abs(midTime - target_time_millis);

        if (diff < minDiff) {
            nearestIndex = mid;
            minDiff = diff;
        }

        if (midTime === target_time_millis) {
            return mid; // Exact match found
        } else if (midTime < target_time_millis) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return nearestIndex;
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

        const sensor_table_dict = {};
        sensor_table.forEach(row => {
            sensor_table_dict[row["internal_data_name"]] = row;
        });

        return {
            sensor_table: sensor_table_dict,
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
        let {
            set_selected_sensors_to_loading,
            selected_sensors
        } = args;

        if (set_selected_sensors_to_loading) {
            await dispatch({
                type: "caches/set_selected_sensors_cache_to_loading"
            });
        }


        let state = getState();


        let min_date = new Date(get_min_date(state.caches.handle_1_date, state.caches.handle_2_date)).getTime();
        let max_date = new Date(get_max_date(state.caches.handle_1_date, state.caches.handle_2_date)).getTime();
        let difference = max_date - min_date;

        max_date = new Date(max_date + difference * CACHE_OVERFLOW_RATIO);

        let query_range = {
            start: new Date(min_date).toISOString(),
            end: new Date(max_date).toISOString(),
        };

        await dispatch({
            type: "caches/update_most_recent_query",
            payload: query_range
        });

        let retrieved_sensor_values = await Promise.all(selected_sensors.map(
            sensor_name =>
                fetch(`http://${host_string}/bluerock/adaptive_all_history/${sensor_name}/${new Date(query_range.start)}/${new Date(query_range.end)}`)
                    .then(response => response.json())
        ));

        state = getState();
        let first_date = get_min_date(state.caches.most_recent_query.start, state.caches.most_recent_query.end);
        let second_date = get_max_date(state.caches.most_recent_query.start, state.caches.most_recent_query.end);

        // if the query range has been updated, during the previous request,then
        // we want to discard the data
        if (first_date != query_range.start || second_date != query_range.end) {
            return;
        }

        await dispatch({
            type: "caches/update_most_recent_completed_query",
            payload: query_range
        });

        let selected_sensors_obj = {};
        for (let i = 0; i < selected_sensors.length; i++) {
            selected_sensors_obj[selected_sensors[i]] = retrieved_sensor_values[i];
        }

        await dispatch({
            type: "caches/set_selected_sensors_cache_to_loaded"
        });

        await dispatch({
            type: "caches/update_selected_sensors_cache",
            payload: selected_sensors_obj
        })
    }
)


// Handles updating the cache displaying values on the schematic 
export const update_playback_cache_async = createAsyncThunk(
    "caches/update_playback_cache",
    async (args, { dispatch, getState }) => {
        let state = getState();
        console.log("calling playback cache")

        let width = new Date(state.caches.most_recent_playback_cache_query.end).getTime() - new Date(state.caches.most_recent_playback_cache_query.start).getTime();
        let current_time = new Date((new Date(state.caches.handle_1_date).getTime() + new Date(state.caches.handle_2_date).getTime()) / 2);
        let target_width_size = 300 * state.caches.time_step_size;

        // check if last query width is valid
        // if not, run a new query

        let query_range = {
            start: new Date(current_time.getTime() - target_width_size * 0.1).toISOString(),
            end: new Date(current_time.getTime() + target_width_size * 0.9).toISOString()
        };

        if (width > target_width_size * 1.1 || width < target_width_size * 0.9) {
            await dispatch({
                type: "caches/update_most_recent_playback_cache_query",
                payload: query_range
            })
            let new_cache = await fetch(`http://${host_string}/bluerock/adaptive_all_sensors/${query_range.start}/${query_range.end}`)
                .then(response => response.json());

            // TODO: need to check if new_cache is still valid
            await dispatch({
                type: "caches/update_playback_cache",
                payload: new_cache
            });
            await dispatch({
                type: "caches/update_most_recent_completed_playback_cache_query",
                payload: query_range
            })
            return;
        }


        let eighty_perc_cutoff_completed =
            new Date(
                0.2 * new Date(state.caches.most_recent_completed_playback_cache_query.start).getTime()
                + 0.8 * new Date(state.caches.most_recent_completed_playback_cache_query.end).getTime()
            );

        let five_perc_cutoff_completed =
            new Date(
                0.95 * new Date(state.caches.most_recent_completed_playback_cache_query.start).getTime()
                + 0.05 * new Date(state.caches.most_recent_completed_playback_cache_query.end).getTime()
            );

        let eighty_perc_cutoff =
            new Date(
                0.2 * new Date(state.caches.most_recent_playback_cache_query.start).getTime()
                + 0.8 * new Date(state.caches.most_recent_playback_cache_query.end).getTime()
            )

        let five_perc_cutoff =
            new Date(
                0.95 * new Date(state.caches.most_recent_completed_playback_cache_query.start).getTime()
                + 0.05 * new Date(state.caches.most_recent_completed_playback_cache_query.end).getTime()
            );


        // // if the most recent request is valid, then don't do anything else
        // if (
        //     current_time <= new Date(state.caches.most_recent_completed_playback_cache_query.start)
        //     ||
        //     current_time >= new Date(state.caches.most_recent_completed_playback_cache_query.end)
        // ) {

        // }

        async function handle_playback_cache_request() {
            await dispatch({
                type: "caches/update_most_recent_playback_cache_query",
                payload: query_range
            })

            let new_cache = await fetch(`http://${host_string}/bluerock/adaptive_all_sensors/${query_range.start}/${query_range.end}`)
                .then(response => response.json());

            let state = getState();
            if (
                query_range.start != state.caches.most_recent_playback_cache_query.start
                ||
                query_range.end != state.caches.most_recent_playback_cache_query.end
            ) {
                console.log("discarding")
                console.log(query_range.start)
                console.log(state.caches.most_recent_playback_cache_query.start)
                return;
            }

            await dispatch({
                type: "caches/update_most_recent_completed_playback_cache_query",
                payload: query_range
            })

            await dispatch({
                type: "caches/update_playback_cache",
                payload: new_cache
            })

            await dispatch({
                type: "caches/set_playback_cache_state_to_loaded"
            });
        }

        // check if time is completely invalid ( < 0 % or >100%)
        // then need to actually wait and load
        if (
            current_time <= new Date(state.caches.most_recent_completed_playback_cache_query.start)
            ||
            current_time >= new Date(state.caches.most_recent_completed_playback_cache_query.end)
        ) {
            // can just return if the last request was valid
            if (!(
                current_time <= five_perc_cutoff
                ||
                current_time >= eighty_perc_cutoff
            )) {
                return;
            }

            await dispatch({
                type: "caches/set_playback_cache_state_to_loading"
            });
            await handle_playback_cache_request();
            return;
        }

        // check to see if cache is close to being exhausted (but not entirely)
        // if so, request a new cache, but don't ask for any loads
        if (
            current_time <= five_perc_cutoff_completed
            ||
            current_time >= eighty_perc_cutoff_completed
        ) {
            // can just return if the last request was valid
            if (!(
                current_time <= five_perc_cutoff
                ||
                current_time >= eighty_perc_cutoff
            )) {
                return;
            }
            
            await handle_playback_cache_request();
            return;
        }


        // check if time is valid ( > 5% and < 80% )
        // check if last query is valid
        // if not, requery
    }
)

export const handle_time_increment = createAsyncThunk(
    "caches/handle_time_increment",
    async (amount, { dispatch, getState }) => {
        const state = getState();
        if (
            !state.caches.playing
            || state.caches.selected_sensors_cache_state != "loaded"
            || state.caches.playback_cache_state != "loaded"
        ) {
            return;
        }

        // check if the sensor range is completely invalid
        // ie, progressing any more will mean that unloaded data will be 
        // visible on the dashboard
        let min_date = new Date(Math.min(new Date(state.caches.handle_1_date), new Date(state.caches.handle_2_date)));
        let max_date = new Date(Math.max(new Date(state.caches.handle_1_date), new Date(state.caches.handle_2_date)));
        if (
            min_date < new Date(state.caches.most_recent_completed_query.start)
            || max_date > new Date(state.caches.most_recent_completed_query.end)
        ) {
            await dispatch(update_sensor_list({
                set_selected_sensors_to_loading: true,
                selected_sensors: ["permtemp", "recycleflow"]
            }));
            return;
        }

        await Promise.all([dispatch({ type: "caches/increment_handle_positions" }), dispatch(update_playback_cache_async())])


        // Check to see that the most recent query actually could actually be a
        // valid cache range.
        // We check to see that the window width of the last query is roughly
        // the correct size.
        // We also see if the last query's max_range is above half of the 
        // CACHE_OVERFLOW_RATIO, if so, a new request is needed
        let most_recent_query_start = new Date(state.caches.most_recent_query.start);
        let most_recent_query_end = new Date(state.caches.most_recent_query.end);
        let handle_diff = max_date.getTime() - min_date.getTime();
        let timeout_position = new Date((handle_diff * (1 + CACHE_OVERFLOW_RATIO / 2)) + most_recent_query_start.getTime());
        let window_ratio = Math.abs(most_recent_query_end.getTime() - most_recent_query_start.getTime()) / (max_date.getTime() - min_date.getTime());
        if (
            max_date > timeout_position
            || window_ratio < 0.9 + CACHE_OVERFLOW_RATIO
            || window_ratio > 1.1 + CACHE_OVERFLOW_RATIO
            || most_recent_query_start > min_date
        ) {
            await dispatch(update_sensor_list({
                set_selected_sensors_to_loading: false,
                selected_sensors: ["permtemp", "recycleflow"]
            }));
        }

        // TODO: trigger selected sensor list query, but don't set state to loading

        return {};
    }
)

const TIME_STEP_SIZES = [
    1000 * 60 * 1,
    1000 * 60 * 5,
    1000 * 60 * 10, // 10 * 3 minutes a second
    1000 * 60 * 30,
]

export const cachesSlice = createSlice({
    name: "caches",
    initialState: {
        playing: true,
        test: "not tested",
        selected_sensors_cache_state: "loading",
        selected_sensors_cache: [],
        playback_cache: [],
        playback_cache_state: "loaded",
        start_date: new Date("1970").toISOString(),
        end_date: new Date("1970").toISOString(),
        handle_1_date: new Date("1970").toISOString(),
        handle_2_date: new Date("1970").toISOString(),
        sensor_table: {},
        time_step_size: TIME_STEP_SIZES[0],
        most_recent_query: {
            start: new Date("1970").toISOString(),
            end: new Date("1970").toISOString()
        },
        most_recent_completed_query: {
            start: new Date("1970").toISOString(),
            end: new Date("1970").toISOString()
        },
        most_recent_playback_cache_query: {
            start: new Date("1970").toISOString(),
            end: new Date("1970").toISOString()
        },
        most_recent_completed_playback_cache_query: {
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
        set_playback_cache_state_to_loading: (state) => {
            state.playback_cache_state = "loading";
        },
        set_playback_cache_state_to_loaded: (state) => {
            state.playback_cache_state = "loaded";
        },
        update_most_recent_query: (state, action) => {
            let { start, end } = action.payload;

            state.most_recent_query = {
                start: start,
                end: end,
            };
        },
        update_most_recent_completed_query: (state, action) => {
            let { start, end } = action.payload;

            state.most_recent_completed_query = {
                start: start,
                end: end,
            };
        },
        update_most_recent_playback_cache_query: (state, action) => {
            let { start, end } = action.payload;
            state.most_recent_playback_cache_query = {
                start: start,
                end: end
            }
        },
        update_most_recent_completed_playback_cache_query: (state, action) => {
            let { start, end } = action.payload;
            state.most_recent_completed_playback_cache_query = {
                start: start,
                end: end
            }
        },
        update_handle_1_date: (state, action) => {
            state.handle_1_date = action.payload;
        },
        update_handle_2_date: (state, action) => {
            state.handle_2_date = action.payload;
        },
        update_selected_sensors_cache: (state, action) => {
            state.selected_sensors_cache = action.payload;
        },
        increment_handle_positions: (state) => {
            state.handle_1_date = new Date(new Date(state.handle_1_date).getTime() + state.time_step_size).toISOString();
            state.handle_2_date = new Date(new Date(state.handle_2_date).getTime() + state.time_step_size).toISOString();
        },
        update_playback_cache: (state, action) => {
            state.playback_cache = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(initial_page_load.fulfilled, (state, action) => {
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

            .addCase(handle_time_increment.rejected, (state, error) => {
                console.error(error);
            })
    }
});

export const {
    set_selected_sensors_cache_to_loading,
    set_selected_sensors_cache_to_loaded,
    update_handle_1_date,
    update_handle_2_date
} = cachesSlice.actions;

export const select_selected_sensors_cache_state =
    (state) => state.caches.selected_sensors_cache_state;

export const select_loading = state =>
    state.caches.selected_sensors_cache_state == "loading"
    || state.caches.playback_cache_state == "loading";

const select_sensor_table_state = state => state.caches.sensor_table;

// createSelector allows for memoizing
export const select_sensor_table = createSelector(
    [
        select_sensor_table_state,
        state => state.caches.handle_1_date,
        state => state.caches.handle_2_date,
        state => state.caches.playback_cache
    ],
    (sensorTable, handle_1_date, handle_2_date, playback_cache) => {
        let sensor_table = JSON.parse(JSON.stringify(sensorTable));

        sensor_table["get"] = function (sensorname, field) {
            if (this === undefined || this[sensorname] === undefined) {
                return field === "on_click" ? () => { } : "";
            }
            return this[sensorname][field];
        }

        let current_time = (new Date(handle_1_date).getTime() + new Date(handle_2_date).getTime()) / 2;
        let curr_idx = binarySearchNearestTime(playback_cache, current_time);

        Object.keys(sensor_table).forEach(
            key => {
                sensor_table[key]["on_click"] = () => { }
                try {
                    sensor_table[key]["current_value"] = playback_cache[curr_idx][key];
                } catch (e) {
                    sensor_table[key]["current_value"] = undefined;
                }
            }
        );


        return sensor_table;
    }
);


export default cachesSlice.reducer;