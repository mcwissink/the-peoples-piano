import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Home} from './pages/Home.jsx';
import {Login} from './pages/Login.js';

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: ''
    };
  }

  handleUserNameChange = e => {
    this.setState({ username: e.target.value });
  }

  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/piano" render={() =>
              <Home
                  username={this.state.username}/>
              }/>
          <Route path="/" render={({ history }) =>
              <Login
                handleUserNameChange={this.handleUserNameChange}
                username={this.state.username}
                history={history}
              />
            }/>

        </Switch>
      </BrowserRouter>
    );
  }
}
