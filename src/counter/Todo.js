import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';
import {
    set_selected_sensors_cache_to_loaded,
    select_selected_sensors_cache_state,
    initial_page_load,
    handle_time_increment
} from "./CachesSlice";

export default function Todo() {
    const dispatch = useDispatch();
    const select = useSelector(state => state.caches.start_date);
    const overall_cache_state = useSelector(state => state.caches)

    const [is_init_load, set_is_init_load] = useState(true);

    useEffect(() => {
        // ensures this can only run once

        if (!is_init_load) { return; }
        set_is_init_load(false);
        const load = async () => {
            await dispatch(initial_page_load());
        }
        load();
    }, [select]);

    const selected_sensors_cache_state = useSelector(select_selected_sensors_cache_state);
    return (<div>
        {selected_sensors_cache_state}
        <button
            onClick={() => {
                dispatch(set_selected_sensors_cache_to_loaded());
            }}
        >enter</button>

        <button
            onClick={() => {
                console.log("dispatching")
                dispatch(handle_time_increment());
            }}
        >enter</button>
        <div>
            {JSON.stringify(overall_cache_state)}
        </div>
    </div>)
}