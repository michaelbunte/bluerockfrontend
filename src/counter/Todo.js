import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, SmartTable } from 'adminlte-2-react';
import { LTTB } from 'downsample';
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
    change_to_next_time_step_and_refresh,
    PLAYBACK_HZ,
    select_playback_speed_name,
    select_user_selected_sensors,
    update_selected_downloadable_sensors
} from "./CachesSlice";

import {
    useWindowDimensions,
    CenteredBox,
    PrettyBox
} from "../Components/helperfuncs";
import { Box, Col, Row, Content } from 'adminlte-2-react';

import BrushChart from "../Components/Chart";

import BluerockSchematic from "../Components/BluerockSchematic";

function MiniCard({ top = "", bottom = "" }) {
    return <div style={{ padding: "4px", background: "white", margin: "2.5px", borderRadius: "3px", boxShadow: "6px 6px 5px 0px rgba(0,0,0,0.1)" }}>
        <div> {top} </div>
        <div> {bottom} </div>
    </div>
}


const tableColumns = [
    { title: 'Sensor', data: 'sensor' },
    { title: 'Display', data: 'selectbox_display' },
    { title: 'Download', data: 'selectbox_download' },
];

function UserSensorTable() {
    const dispatch = useDispatch();
    const modal_table_dict = useSelector(select_sensor_table);
    const user_selected_sensors = useSelector(select_user_selected_sensors);

    const user_selected_downloads = new Set(useSelector(state => state.caches.selected_downloadable_sensors));

    const sensor_table_data = Object.keys(modal_table_dict)
        .sort()
        .filter(value => value != "get")
        .map(key => ({
            "sensor": modal_table_dict.get(key, "human_readible_name")
                + (modal_table_dict.get(key, "abbreviated_name") && " (" + modal_table_dict.get(key, "abbreviated_name") + ")"),
            "selectbox_display": <input
                type="checkbox"
                key={key}
                checked={user_selected_sensors.has(key)}
                onClick={async (e)=>{
                    let us = new Set(user_selected_sensors);

                    if (us.has(key))  {
                        us.delete(key);
                    } else {
                        us.add(key);
                    }

                    await dispatch(update_sensor_list({
                        set_selected_sensors_to_loading: true,
                        selected_sensors: Array.from(us)
                    }));
                    
                }}
                readOnly
            />,
            "selectbox_download": <input
                type="checkbox"
                key={key}
                checked={user_selected_downloads.has(key)}
                onClick={() => {
                    let us = new Set(user_selected_downloads);
                    if (us.has(key)) {
                        us.delete(key);
                    } else {
                        us.add(key);
                    }

                    dispatch(update_selected_downloadable_sensors(Array.from(us)));
                }}
            />
        }))

    return <SmartTable
        columns={tableColumns}
        data={sensor_table_data}
        striped={true}
        condensed={true}
        pageSize={10}
        selectedRows={[]}
    />
}

export default function Todo() {
    const dispatch = useDispatch();
    const handle_start = useSelector(state => state.caches.handle_1_date);
    const handle_end = useSelector(state => state.caches.handle_2_date);
    const sensor_table = useSelector(select_sensor_table);
    const are_caches_loading = useSelector(select_loading);
    const is_playing = useSelector(state => state.caches.playing)
    const playback_speed = useSelector(select_playback_speed_name);
    const user_selected_sensors = useSelector(select_user_selected_sensors);

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
                selected_sensors: ["permtemp"]
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
        }, 1000 / PLAYBACK_HZ);
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
            selected_sensors: Array.from(user_selected_sensors)
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
            data={LTTB(selected_sensors_cache[sensor_name], 800)}
            on_chart_resize={on_chart_resize}
        />);

    let current_time = new Date((new Date(handle_start).getTime() + new Date(handle_end).getTime()) / 2).toISOString();

    return (<div>

        <CenteredBox style={{ "background": "rgba(0,0,0,0)", "borderWidth": "0px" }}>
            <Row>
                <Col md={7}>
                    <PrettyBox>
                        <BluerockSchematic
                            md={sensor_table}
                        />
                    </PrettyBox>
                    <PrettyBox>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ padding: "10px" }}>
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
                            </div>
                            <MiniCard
                                top={"Playback Speed:"}
                                bottom={playback_speed}
                            />
                            <MiniCard
                                top={"Selected Time"}
                                bottom={current_time}
                            />
                            <MiniCard
                                top={"Displayed Time"}
                                bottom={sensor_table.get("plctime", "current_value")}
                            />
                        </div>
                    </PrettyBox>
                    <PrettyBox>
                        <UserSensorTable />
                    </PrettyBox>
                </Col>
                <Col md={4} style={{ width: "695px" }}>
                    <PrettyBox>
                        <>
                            {charts}
                        </>
                    </PrettyBox>
                </Col>
            </Row>
        </CenteredBox>
    </div>)
}