import React from 'react';

// Renders a Twitch chat
export class TwitchChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
    };
  }

  updateDimensions = () => {
    // Since the iframe for the twitchchat takes height as a number, we have to properly get the window
    // height since we can't use regular css to make it full size
    this.setState({height: window.innerHeight});
  }

  componentWillMount() {
    this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    const {
      height,
    } = this.state;
    return (
      <iframe
        className="twitch-chat"
        frameBorder="0"
        scrolling="no"
        id="chat_embed"
        src="https://www.twitch.tv/embed/akc97/chat"
        height={height}
        width="350">
      </iframe>
    );
  }
}
