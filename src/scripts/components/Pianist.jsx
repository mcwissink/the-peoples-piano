import React from 'react';

export class Pianist extends React.Component {
  componentDidMount() {
  }
	
  render() {
    const {
      name,
      color,
    } = this.props;
    return (
      <div>
        <span style={ { background: color } }>Color</span>
        <span>{" " + name + ": "}</span>
		    <span>{this.props.upvotes + "  "}</span>
        <button onClick={(e) => this.props.socket.emit('upvote', this.props.id)}>
          Upvote
        </button>
        <button onClick={(e) => this.props.socket.emit('downvote', this.props.id)}>
          Downvote
        </button>
      </div>
    );
  }
}
