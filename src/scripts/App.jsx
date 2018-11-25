import React from 'react';
import { MidiController } from './MidiController';

export class App extends React.Component {
  render() {
    return (
      <div>
        <MidiController/>
        <iframe
          frameborder="0"
          scrolling="no"
          id="chat_embed"
          src="https://www.twitch.tv/embed/hebo/chat"
          height="500"
          width="350">
        </iframe>
      </div>
    );
  }
}
