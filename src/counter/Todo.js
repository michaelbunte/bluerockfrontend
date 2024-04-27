import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';

import {
    set_selected_sensors_cache_to_loaded,
    select_selected_sensors_cache_state,
    initial_page_load,
    update_handle_1_date,
    update_handle_2_date,
    handle_time_increment,
    update_sensor_list,
    select_sensor_table,
    select_loading
} from "./CachesSlice";

import BrushChart from "../Components/Chart";

import BluerockSchematic from "../Components/BluerockSchematic";

export default function Todo() {
    const dispatch = useDispatch();
    const handle_start = useSelector(state => state.caches.handle_1_date);
    const handle_end = useSelector(state => state.caches.handle_2_date);
    const sensor_table = useSelector(select_sensor_table);
    const overall_cache_state = useSelector(state => state.caches);
    const playback_cache_state = useSelector(state => state.caches.playback_cache_state);
    const are_caches_loading = useSelector(select_loading);
    const playback_cache = useSelector(state => state.caches.playback_cache);

    const [is_init_load, set_is_init_load] = useState(true);
    const [handle_1_date, set_handle_1_date] = useState(new Date());
    const [handle_2_date, set_handle_2_date] = useState(new Date());

    useEffect(() => {
        // ensures this can only run once

        if (!is_init_load) { return; }
        const load = async () => {
            await dispatch(initial_page_load());
            await dispatch(update_sensor_list({
                set_selected_sensors_to_loading: false,
                selected_sensors: ["permtemp", "recycleflow"]
            }));
        }
        load();
        set_is_init_load(false);
    }, []);

    useEffect(() => {
        set_handle_1_date(new Date(handle_start));
        set_handle_2_date(new Date(handle_end));
    }, [handle_start, handle_end]);

    useEffect(() => {
        const interval = setInterval(async () => {
            await dispatch(handle_time_increment());
        }, 0.333e3);
        return () => clearInterval(interval);
    }, []);

    const selected_sensors_cache_state = useSelector(select_selected_sensors_cache_state);
    const selected_sensors_cache = useSelector(state => state.caches.selected_sensors_cache);

    const sensor_names = Object.keys(selected_sensors_cache);

    const on_chart_resize = async (low, high) => {
        await dispatch(update_handle_1_date(new Date(low).toISOString()));
        await dispatch(update_handle_2_date(new Date(high).toISOString()));
        await dispatch(update_sensor_list({
            set_selected_sensors_to_loading: true,
            selected_sensors: ["permtemp", "recycleflow"]
        }));
    };

    const charts = sensor_names.map(sensor_name =>
        <BrushChart
            title={sensor_name}
            key={sensor_name}
            brush_1_time={new Date(handle_1_date)}
            brush_2_time={new Date(handle_2_date)}
            set_brush_1_time={set_handle_1_date}
            set_brush_2_time={set_handle_2_date}
            is_loading={are_caches_loading}
            data={selected_sensors_cache[sensor_name]}
            on_chart_resize={on_chart_resize}
        />);

    let playback_cache_start = "";
    try {
        playback_cache_start = JSON.stringify(overall_cache_state.playback_cache[0]["timezone"])
    } catch(e) {}

    return (<div>
        <div>
            {playback_cache_state}
        </div>
        <div>
            most recent completed query: {overall_cache_state.most_recent_completed_playback_cache_query.start} - {overall_cache_state.most_recent_completed_playback_cache_query.end}
        </div>
        <div>
            playback cache start: {playback_cache_start}
        </div>
        <div>
            current time: {new Date((new Date(handle_start).getTime() + new Date(handle_end).getTime())/2).toISOString()}
        </div>
        {selected_sensors_cache_state}
        <button
            onClick={() => {
                dispatch(set_selected_sensors_cache_to_loaded());
            }}
        >enter</button>

        <div>
            {charts}
        </div>

        <div>
            {JSON.stringify(playback_cache)}
        </div>


        <BluerockSchematic
            md={sensor_table}
        />

    </div>)
}