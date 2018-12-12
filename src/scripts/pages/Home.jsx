import React from 'react';
import {MidiController} from '../components/MidiController.jsx';
import {TwitchChat} from '../components/TwitchChat.jsx';
import { Redirect } from 'react-router'

export class Home extends React.Component {
  render() {
    if (this.props.username === '') {
      return <Redirect to='/welcome'/>;
    }
    return (
      <div>
        <div>
          <MidiController username={this.props.username}/>
        </div>
        <TwitchChat/>
      </div>
    );
  }
}
