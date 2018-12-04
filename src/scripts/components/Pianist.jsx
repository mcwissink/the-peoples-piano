import React from 'react';

export class Pianist extends React.Component {
  render() {
    const {
      name,
    } = this.props;
    return (
      <div>
        <span>{name}</span>
      </div>
    );
  }
}
