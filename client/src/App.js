import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

function callAPI(self, callback) {
  fetch('api/test', {
    accept: 'application/json'
  })
    .then(data => data.json())
    .then(function(data) {
      console.log('returning data from API');
      console.log(data.message);

      self.setState({
        textMessage: data.message
      });
    });
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textMessage: 'test'
    };
  }

  componentDidMount() {
    let self = this;
    callAPI(self);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React!</h1>
          <h2>{this.state.textMessage}</h2>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload Test!
        </p>
      </div>
    );
  }
}

export default App;
