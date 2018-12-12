import React, {Component} from 'react';
//import './Login.css';

export class Login extends Component {

  login = () => {
    if(this.props.username !== ""){
      this.props.history.push("/");
    }
  }

  render() {
     return (
      <div className="row" id="Body">
        <div className="medium-5 columns left">
          <h2 id="welcomeText">Play some sweet sweet music</h2>
          <h4>Login</h4>
          <label>Username</label>
          <input type="text" name="username" placeholder="Username" onChange={this.props.handleUserNameChange}/>
          <input type="submit" className="button success" value="Login" onClick={this.login}/>
        </div>
      </div>
    );
  }
}
