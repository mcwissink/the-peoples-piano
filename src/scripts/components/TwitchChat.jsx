import React from 'react';

export class TwitchChat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
    };
  }

  updateDimensions = () => {
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
    console.log(height);
    return (
      <iframe
        frameBorder="0"
        scrolling="no"
        id="chat_embed"
        src="https://www.twitch.tv/embed/hebo/chat"
        height={height}
        width="350">
      </iframe>
    );
  }
}
