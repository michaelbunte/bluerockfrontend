import logo from './logo.svg';
import './App.css';
import Todo from './counter/Todo';
import { store } from "./app/store"
import { Provider } from 'react-redux';
import React from 'react';

function App() {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <div style={{padding: "20px"}}>
          <Todo />
        </div>
      </Provider>
    </React.StrictMode>
  );
}

export default App;
