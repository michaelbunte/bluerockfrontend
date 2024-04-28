import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup } from 'adminlte-2-react';
import {
    set_selected_sensors_cache_to_loaded,
    select_selected_sensors_cache_state,
    initial_page_load,
    update_handle_1_date,
    update_handle_2_date,
    handle_time_increment,
    update_sensor_list,
    select_sensor_table,
    select_loading,
    binarySearchNearestTime,
    toggle_playback,
    select_playback_speed,
    change_to_next_time_step_and_refresh
} from "./CachesSlice";

import {
    useWindowDimensions,
    CenteredBox,
    PrettyBox
} from "../Components/helperfuncs";
import { Box, Col, Row, Content } from 'adminlte-2-react';

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
    const is_playing = useSelector(state => state.caches.playing)
    const playback_cache = useSelector(state => state.caches.playback_cache);
    const playback_speed = useSelector(select_playback_speed);

    const [is_init_load, set_is_init_load] = useState(true);
    const [handle_1_date, set_handle_1_date] = useState(new Date());
    const [handle_2_date, set_handle_2_date] = useState(new Date());

    const { height, width } = useWindowDimensions();

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
    let playback_cache_end = "";
    try {
        playback_cache_start = JSON.stringify(overall_cache_state.playback_cache[0]["timezone"])
        playback_cache_end = JSON.stringify(overall_cache_state.playback_cache[overall_cache_state.playback_cache.length - 1]["timezone"])
    } catch (e) { }


    let current_time = new Date((new Date(handle_start).getTime() + new Date(handle_end).getTime()) / 2).toISOString();
    let bin = binarySearchNearestTime(playback_cache, current_time);

    return (<div>

        <CenteredBox style={{ "background": "rgba(0,0,0,0)", "borderWidth": "0px" }}>
            <Row>
                <Col md={8}>
                    <PrettyBox contents={
                        <BluerockSchematic
                            md={sensor_table}
                        />
                    } />
                    <PrettyBox contents={
                        <>
                            <ButtonGroup>
                                <Button
                                    text={is_playing
                                        ? <div style={{ letterSpacing: "-2px" }}>▮▮</div>
                                        : <div>▶</div>}
                                    onClick={() => dispatch(toggle_playback())}
                                />
                                <Button
                                    text={<div style={{ letterSpacing: "-3px" }}>▶▶</div>}
                                    onClick={() => { dispatch(change_to_next_time_step_and_refresh()) }} />
                            </ButtonGroup>
                        </>
                    } />
                </Col>
                <Col md={4} style={{width: "695px"}}>
                    <PrettyBox contents={
                        <>
                            {charts}
                        </>
                    } />
                </Col>
            </Row>
        </CenteredBox>
        <div>
            playback_speed: {playback_speed}
        </div>
        <div>
            bin cache pos: {bin}
        </div>
        <div>
            length: {playback_cache.length}
        </div>
        <div>
            {playback_cache_state}
        </div>
        <div>
            playback cache range: {playback_cache_start} - {playback_cache_end}
        </div>
        <div>
            current time: {current_time}
        </div>


        <div>
            {/* {JSON.stringify(playback_cache)} */}
        </div>
        <div>
            <div style={{ display: "flex", alignItems: "center" }}>
                <ButtonGroup>
                    <Button
                        text={is_playing
                            ? <div style={{ letterSpacing: "-2px" }}>▮▮</div>
                            : <div>▶</div>}
                        onClick={() => dispatch(toggle_playback())}
                    />
                    <Button
                        text={<div style={{ letterSpacing: "-3px" }}>▶▶</div>}
                        onClick={() => { dispatch(change_to_next_time_step_and_refresh()) }} />
                </ButtonGroup>
                <div style={{ paddingLeft: "20px" }}>
                    {/* {!ticking ? "paused" : playback_speed.get_current_speed()} */}
                </div>
                <div style={{ paddingLeft: "20px" }}>
                    <div style={{ fontWeight: "bold" }}>Target Time:</div>
                </div>
            </div>
        </div>



    </div>)
}