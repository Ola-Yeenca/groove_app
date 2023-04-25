import React, { component } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';


export default class App extends Component {
  constructor(props) {
    super(props);

  }
  render() {
    return (
      <div>
        <h1>Test App</h1>
      </div>
    );
  }
}


const appDiv = getElementByID('app');
render(<App />, appDiv);
