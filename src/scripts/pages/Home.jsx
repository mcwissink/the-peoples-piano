import React from 'react';
import {MidiController} from '../components/MidiController.jsx';
import {TwitchChat} from '../components/TwitchChat.jsx';

export class Home extends React.Component {
  render() {
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
