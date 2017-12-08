import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

function callAPI(query, callback) {
  console.log('test');
  return fetch('api/test', {
    accept: 'application/json'
  }).then(parseJSON);
}

function parseJSON(response) {
  console.log('Got response!');
  return response.json();
}

console.log('testing!');
const result = callAPI();

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React!</h1>
          <h2>{JSON.stringify(result)}LL</h2>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload Test!
        </p>
      </div>
    );
  }
}

export default App;
