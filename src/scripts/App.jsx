import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Home} from './pages/Home.jsx';

export class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" component={Home}/>
        </Switch>
      </BrowserRouter>
    );
  }
}
