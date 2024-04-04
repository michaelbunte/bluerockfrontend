import { useState } from "react"
import { useSelector, useDispatch } from 'react-redux';
import { selectTodos, addTodo, unicornAsync } from "./TodoSlice";

export default function Todo() {
    const [write_text, set_write_text] = useState("");
    const dispatch = useDispatch();
    const todos = useSelector(selectTodos);
    return (<div>
        <div>
            hello there
        </div>
        <input
            type="text"
            value={write_text}
            onChange={(e) => set_write_text(e.target.value)} />
        <button
            onClick={() => {
                dispatch(addTodo(write_text))
                set_write_text("");
            }}
        >enter</button>

        <button
            onClick={() => {
                dispatch(unicornAsync())
            }}
        >add unicorn</button>
        <div>
            {todos.map(value => <div>{value}</div>)}
        </div>
    </div>)
}