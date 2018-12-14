import React, {Component} from 'react';
//import './Login.css';

export class Login extends Component {

  join = () => {
    if(this.props.username !== ""){
      this.props.history.push("/");
    }
  }

  render() {
     return (
      <div className="row" id="Body">
        <div className="medium-5 columns left">
          <h2 id="welcomeText">The People&#8217;s Piano</h2>
          <h3 id="subText">Play some sweet, sweet music</h3>
          <input id="playerName" type="text" name="username" placeholder="Username" onChange={this.props.handleUserNameChange}/>
          <input type="submit" className="button success" value="Join" onClick={this.join}/>
        </div>
      </div>
    );
  }
}
