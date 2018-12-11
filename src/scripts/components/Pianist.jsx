import React from 'react';

export class Pianist extends React.Component {
  componentDidMount() {
	  this.props.socket.emit('upvote', this.props.name);
  }
	
  render() {
    const {
      name,
    } = this.props;
    return (
      <div>
        <span>{name + ": "}</span>
		<span>{this.props.upvotes}</span>
      </div>
    );
  }
}
