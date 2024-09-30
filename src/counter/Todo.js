import { useState, useEffect } from "react"
import { useSelector, useDispatch } from 'react-redux';
import { Button, ButtonGroup, SmartTable } from 'adminlte-2-react';
import {
    DoublePlay,
    SinglePlay,
    Pause,
    SkipSmall,
    SkipLarge,
    SkipSmallLeft,
    SkipLargeLeft
} from "../Components/playbackcomponents";
import {
    initial_page_load,
    update_handle_1_date,
    update_handle_2_date,
    handle_time_increment,
    update_sensor_list,
    select_sensor_table,
    select_loading,
    toggle_playback,
    change_to_next_time_step_and_refresh,
    PLAYBACK_HZ,
    select_playback_speed_name,
    select_user_selected_sensors,
    update_selected_downloadable_sensors,
    pause_playback,
    SYSTEMS,
    select_current_system,
    update_selected_system,
    select_host_string
} from "./CachesSlice";
import 'react-datetime-picker/dist/DateTimePicker.css';
import 'react-calendar/dist/Calendar.css';
import 'react-clock/dist/Clock.css';
import DateTimePicker from 'react-datetime-picker';
import {
    useWindowDimensions,
    CenteredBox,
    PrettyBox,
    Download_selected_sensors,
} from "../Components/helperfuncs";
import Dropdown from "../Components/Dropdown";
import { Box, Col, Row, Content, Select } from 'adminlte-2-react';
import StockTicker from "../Components/StockTicker";


import BrushChart from "../Components/Chart";

import BluerockSchematic from "../Components/BluerockSchematic";
import SantaTeresaPryorFarmsSchematic from "../Components/SantaTeresaPryorFarmsSchematic";

function MiniCard({ top = "", bottom = "" }) {
    return <div style={{ padding: "4px", background: "white", margin: "2.5px", borderRadius: "3px", boxShadow: "6px 6px 5px 0px rgba(0,0,0,0.1)" }}>
        <div> {top} </div>
        <div> {bottom} </div>
    </div>
}

function capitalize_words(sentence) {
    return sentence.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

function pretty_string_selected_system(system_name) {
    let output = capitalize_words(system_name)
    return output;
}


const tableColumns = [
    { title: 'Sensor', data: 'sensor' },
    { title: 'Display', data: 'selectbox_display' },
    { title: 'Download', data: 'selectbox_download' },
    {
        backgroundColor: 'lightcoral',
        padding: '20px',
        textAlign: 'center',
        marginLeft: 'auto',
    }
];

function UserSensorTable() {
    const dispatch = useDispatch();
    const modal_table_dict = useSelector(select_sensor_table);
    const user_selected_sensors = useSelector(select_user_selected_sensors);
    const user_selected_downloads = new Set(useSelector(state => state.caches.selected_downloadable_sensors));


    const sensor_table_data = Object.keys(modal_table_dict)
        .sort()
        .filter(value => value != "get")
        .map(key => {
            let sensor_name_arr = [];
            if (modal_table_dict.get(key, "human_readible_name")) {
                sensor_name_arr.push(modal_table_dict.get(key, "human_readible_name"));
            }
            if (modal_table_dict.get(key, "internal_data_name")) {
                sensor_name_arr.push(modal_table_dict.get(key, "internal_data_name"));
            }
            if (modal_table_dict.get(key, "abbreviated_name")) {
                sensor_name_arr.push(modal_table_dict.get(key, "abbreviated_name"));
            }
            let sensor_name_string = sensor_name_arr.join(", ");

            return {
                "sensor": sensor_name_string,
                "key": sensor_name_string,
                "selectbox_display": <input
                    type="checkbox"
                    // readOnly={true}
                    defaultChecked
                    key={key}
                    checked={user_selected_sensors.has(key)}
                    onClick={(e) => {
                        let us = new Set(user_selected_sensors);

                        if (us.has(key)) {
                            us.delete(key);
                        } else {
                            us.add(key);
                        }

                        dispatch(update_sensor_list({
                            set_selected_sensors_to_loading: true,
                            selected_sensors: Array.from(us)
                        }));

                    }}
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
            }
        })

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
    const host_string = useSelector(state => state.caches.host_string);
    const selected_system = useSelector(select_current_system);

    const [is_init_load, set_is_init_load] = useState(true);
    const [handle_1_date, set_handle_1_date] = useState(new Date());
    const [handle_2_date, set_handle_2_date] = useState(new Date());

    const [start_download_date, set_start_download_date] = useState(new Date('2021-01-03'));
    const [end_download_date, set_end_download_date] = useState(new Date('2021-01-05'));
    const [download_loading, set_download_loading] = useState(false);

    function get_handles_and_diff() {
        const handle_diff = new Date(handle_2_date).getTime() - new Date(handle_1_date).getTime();
        const h1 = new Date(handle_1_date).getTime();
        const h2 = new Date(handle_2_date).getTime();
        return [h1, h2, handle_diff];
    }

    function update_handles(h1, h2) {
        dispatch(update_handle_1_date(new Date(h1).toISOString()));
        dispatch(update_handle_2_date(new Date(h2).toISOString()));
    }

    function skipforwardssmall() {
        const [h1, h2, handle_diff] = get_handles_and_diff()
        update_handles(h1 + handle_diff / 200, h2 + handle_diff / 200);
    }

    function skipbackwardssmall() {
        const [h1, h2, handle_diff] = get_handles_and_diff()
        update_handles(h1 - handle_diff / 200, h2 - handle_diff / 200);
    }

    function skipbackwardslarge() {
        const [h1, h2, handle_diff] = get_handles_and_diff()
        update_handles(h1 - handle_diff / 15, h2 - handle_diff / 15);
    }

    function skipforwardslarge() {
        const [h1, h2, handle_diff] = get_handles_and_diff()
        update_handles(h1 + handle_diff / 15, h2 + handle_diff / 15);
    }

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


    const chart_click_error_f = () => {
        if (!is_playing) { return; }
        dispatch(pause_playback())
    }

    const charts = sensor_names.map(sensor_name =>
        <div onMouseDown={chart_click_error_f} key={sensor_name}>
            <StockTicker
                title={sensor_table.get(sensor_name, "human_readible_name")}
                data={selected_sensors_cache[sensor_name]}
                set_min_value={set_handle_1_date}
                set_max_value={set_handle_2_date}
                min_value={handle_1_date.getTime()}
                max_value={handle_2_date.getTime()}
                upon_window_resize={on_chart_resize}
                is_loading={are_caches_loading}
                allow_user_updates={is_playing}
            />
        </div>
    );

    let current_time = new Date((new Date(handle_start).getTime() + new Date(handle_end).getTime()) / 2).toISOString();

    let current_schematic = <></>;
    if (selected_system === "bluerock") {
        current_schematic = <BluerockSchematic
            md={sensor_table}
        />
    } else if (selected_system === "santa_teresa" || selected_system === "pryor_farms") {
        current_schematic = <SantaTeresaPryorFarmsSchematic
            md={sensor_table}
        />
    }

    return (<div>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%',
            position: 'relative',
        }}>
            <div style={{
                padding: '20px',
                textAlign: 'center',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
            }}>
                <div style={{
                    fontWeight: "bold",
                    fontSize: "3rem",
                    textAlign: "center",
                    paddingTop: "12px"
                }}>
                    {pretty_string_selected_system(selected_system)} Dashboard
                </div>

            </div>
            <div style={{
                padding: '20px',
                textAlign: 'center',
                marginLeft: 'auto'
            }}>
                <Dropdown choices={SYSTEMS} selected_system={selected_system} handle_change={(event) => {
                    dispatch(update_selected_system(event.target.value));
                }} />

            </div>
        </div>
        <CenteredBox style={{ "background": "rgba(0,0,0,0)", "borderWidth": "0px" }}>
            <Row>
                <Col md={7}>
                    <PrettyBox>
                        {current_schematic}
                    </PrettyBox>
                    <PrettyBox>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <div style={{ padding: "10px" }}>
                                <ButtonGroup>
                                    <Button
                                        text={<div ><SkipLargeLeft /></div>}
                                        onClick={skipbackwardslarge} />
                                    <Button
                                        text={<div> <SkipSmallLeft /></div>}
                                        onClick={skipbackwardssmall}
                                    />
                                    <Button
                                        text={is_playing
                                            ? <Pause />
                                            : <div><SinglePlay /></div>}
                                        onClick={() => dispatch(toggle_playback())}
                                    />
                                    <Button
                                        text={<div ><DoublePlay /></div>}
                                        onClick={() => { dispatch(change_to_next_time_step_and_refresh()) }} />
                                    <Button
                                        text={<div> <SkipSmall /></div>}
                                        onClick={skipforwardssmall}
                                    />
                                    <Button
                                        text={<SkipLarge />}
                                        onClick={skipforwardslarge}
                                    />
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
                    <PrettyBox>
                        <ButtonGroup>
                            <Button
                                text={download_loading ? "loading" : "Download Data"}
                                color="blue"
                                onClick={async () => {
                                    if (download_loading) { return; }

                                    set_download_loading(true);
                                    await Download_selected_sensors(start_download_date, end_download_date, Array.from(user_selected_sensors), host_string);
                                    set_download_loading(false);
                                }}
                            />
                        </ButtonGroup>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "20px"
                        }}
                        >
                            <div style={{ zIndex: 100 }}>
                                <div>Start Date</div>
                                <DateTimePicker
                                    onChange={set_start_download_date}
                                    value={start_download_date}
                                />
                            </div>
                            <div style={{ zIndex: 100 }}>
                                <div>End Date</div>
                                <DateTimePicker
                                    onChange={set_end_download_date}
                                    value={end_download_date}
                                />
                            </div>
                        </div>
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