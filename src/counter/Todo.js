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
    select_sensor_table
} from "./CachesSlice";

import BrushChart from "../Components/Chart";

import BluerockSchematic from "../Components/BluerockSchematic";

export default function Todo() {
    const dispatch = useDispatch();
    const handle_start = useSelector(state => state.caches.handle_1_date);
    const handle_end = useSelector(state => state.caches.handle_2_date);
    const sensor_table = useSelector(select_sensor_table);
    const overall_cache_state = useSelector(state => state.caches);

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
            is_loading={selected_sensors_cache_state == "loading"}
            data={selected_sensors_cache[sensor_name]}
            on_chart_resize={on_chart_resize}
        />);


    return (<div>
        <div>
            {handle_start}
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


        <BluerockSchematic
            md={sensor_table}
        />

    </div>)
}