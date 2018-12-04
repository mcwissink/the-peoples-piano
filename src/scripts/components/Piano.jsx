import React from 'react';
import * as PIXI from 'pixi.js';

const KEY_WIDTH = 20;
const BLACK_KEYS = [0, 2, 5, 7, 10];

// Draws the piano using canvas
export class Piano extends React.Component {
  componentDidMount() {
    this.pixi = new PIXI.Application({
      width: 1040,
      height: 500,
      view: this.canvas,
      backgroundColor : 0xffffff,
    });
    this.graphics = new PIXI.Graphics();
    this.pixi.stage.addChild(this.graphics);
    this.pixi.ticker.add(this.update, this);
  }

  componentWillUnmount() {
    this.pixi.destroy();
  }

  update(dt) {
    this.graphics.clear();
    this.drawPiano();
  }

  drawPiano() {
    let blackNotePosition = 0;
    let whiteNotePosition = 0;
    for (let i = 1; i <= 88; i++) {
      // Add 20 because of midi's mapping to real piano
      // http://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
      const active = this.props.activeNotes[i + 20] !== undefined;
      const keyInOctave = i % 12;
      // Weird trickery to draw the piano... It's not perfect
      if (BLACK_KEYS.indexOf(keyInOctave) === -1) {
        this.drawWhiteKey(whiteNotePosition * KEY_WIDTH, 0, active);
        whiteNotePosition++;
      } else {
        this.drawBlackKey((blackNotePosition * KEY_WIDTH) + (KEY_WIDTH/2), 0, active);
        blackNotePosition += (keyInOctave === 2 || keyInOctave === 7) ? 2 : 1;
      }
    }
  }

  drawBlackKey(x, y, active) {
    const fillColor = active ? 0xff0000 : 0x000000;
    this.graphics.beginFill(fillColor);
    this.graphics.drawRect(x, y, KEY_WIDTH*0.8, 100);
    this.graphics.endFill();
  }

  drawWhiteKey(x, y, active) {
    const fillColor = active ? 0xff0000 : 0xffffff;
    this.graphics.beginFill(fillColor);
    this.graphics.lineStyle(2, 0x000000);
    this.graphics.drawRect(x, y, KEY_WIDTH, 150);
    this.graphics.endFill();
  }

  render() {
    return <canvas ref={canvas => this.canvas = canvas} />;
  }
}
