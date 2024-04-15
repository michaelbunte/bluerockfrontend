import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';
import {
    set_selected_sensors_cache_to_loaded,
    select_selected_sensors_cache_state,
    initial_page_load
} from "./CachesSlice";

export default function Todo() {
    const dispatch = useDispatch();

    useEffect(()=>{dispatch(initial_page_load())}, []);

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
                dispatch(initial_page_load());
            }}
        >enter</button>
    </div>)
}