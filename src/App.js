import './App.css';
import Todo from './counter/Todo';
import { store } from "./app/store"
import { Provider } from 'react-redux';
import React from 'react';
import AdminLTE from 'adminlte-2-react';

function App() {
  return (
    // <React.StrictMode>
    <AdminLTE title={["Hello", "World"]} titleShort={["He", "we"]} theme="blue" >

      <Provider store={store} path="/">
          <Todo />
      </Provider>
    </AdminLTE>

    // </React.StrictMode>
  );
}

export default App;
