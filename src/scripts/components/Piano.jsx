import React from 'react';
import * as PIXI from 'pixi.js';

const KEY_WIDTH = 20;
const KEY_HEIGHT = 150;
const BLACK_KEYS = [0, 2, 5, 7, 10];

class Note {
  constructor(x, y, width, height) {
    this.x = x,
    this.y = y,
    this.width = width;
    this.height = height
  }
  draw(graphics) {
    graphics.beginFill(0xff0000);
    graphics.drawRect(this.x, this.y, this.width, this.height);
    graphics.endFill();
  }

  update(dt) {
    this.y--;
  }
}

// Draws the piano using canvas
export class Piano extends React.Component {
  componentDidMount() {
    this.pixi = new PIXI.Application({
      width: KEY_WIDTH*52,
      height: 500,
      view: this.canvas,
      backgroundColor : 0xffffff,
      forceCanvas: true,
    });
    this.graphics = new PIXI.Graphics();
    // We need to declare a new graphics object for proper layering
    this.graphicsBlackKeys = new PIXI.Graphics();
    this.pixi.stage.addChild(this.graphics);
    this.pixi.stage.addChild(this.graphicsBlackKeys);

    // Create a linear gradient so our notes fade out on the top of the screen
    const gradientWidth = this.pixi.renderer.width;
    const gradientHeight = 150;
    const canvas = document.createElement('canvas');
    canvas.width = gradientWidth;
    canvas.height = gradientHeight;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, gradientHeight);
    gradient.addColorStop(0.1, "#ffffff");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, gradientWidth, gradientHeight);
    var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
    this.pixi.stage.addChild(sprite);

    this.pixi.ticker.add(this.update, this);

    // activeDrawNotes remembers which notes to actively update when a key is pressed
    this.activeDrawNotes = {};
    // pastDrawNotes updates the notes that have been released. Scrolling them into the distance
    this.pastDrawNotes = [];
    // Set top of keyboard with some padding
    this.topOfKeyboard = this.pixi.renderer.height - KEY_HEIGHT - 1;
  }

  componentWillUnmount() {
    this.pixi.destroy();
  }

  update(dt) {
    this.graphics.clear();
    this.graphicsBlackKeys.clear();
    this.drawPiano(dt);
    this.drawNotes(dt);
  }

  drawNotes(dt) {
    for (const activeDrawNote of Object.values(this.activeDrawNotes)) {
      activeDrawNote.draw(this.graphics);
      activeDrawNote.update();
    }
    for (const i in this.pastDrawNotes) {
      const pastDrawNote = this.pastDrawNotes[i];
      pastDrawNote.draw(this.graphics);
      pastDrawNote.update(dt);
      // Remove the note once it is out of sight
      if (pastDrawNote.y + pastDrawNote.height < -10) {
        this.pastDrawNotes.splice(i, 1);
      }
    }
  }

  drawPiano(dt) {
    let blackNotePosition = 0;
    let whiteNotePosition = 0;
    for (let i = 1; i <= 88; i++) {
      // Add 20 because of midi's mapping to real piano
      // http://www.inspiredacoustics.com/en/MIDI_note_numbers_and_center_frequencies
      const active = this.props.activeNotes[i + 20] !== undefined;
      const keyInOctave = i % 12;
      // Weird math trickery to draw the piano... It's not perfect since the white keys are drawn over parts of the black keys
      if (BLACK_KEYS.indexOf(keyInOctave) === -1) {
        const x = whiteNotePosition * KEY_WIDTH;
        this.drawWhiteKey(x, this.topOfKeyboard, active);
        whiteNotePosition++;
        // Handle drawing the notes
        if (active) {
          if (this.activeDrawNotes[i] === undefined) {
            this.activeDrawNotes[i] = new Note(x, this.topOfKeyboard, KEY_WIDTH, 1);
          } else {
            this.activeDrawNotes[i].height++;
          }
        } else {
          if (this.activeDrawNotes[i] !== undefined) {
            this.pastDrawNotes.push(this.activeDrawNotes[i]);
            delete this.activeDrawNotes[i];
          }
        }
      } else {
        const x = (blackNotePosition * KEY_WIDTH) + (KEY_WIDTH/2)
        this.drawBlackKey(x, this.topOfKeyboard, active);
        blackNotePosition += (keyInOctave === 2 || keyInOctave === 7) ? 2 : 1;
        // Handle drawing the notes
        if (active) {
          if (this.activeDrawNotes[i] === undefined) {
            // No active note so create one
            this.activeDrawNotes[i] = new Note(x, this.topOfKeyboard, KEY_WIDTH*0.8, 1);
          } else {
            // update the active note
            this.activeDrawNotes[i].height++;
          }
        } else {
          if (this.activeDrawNotes[i] !== undefined) {
            // The note is no longer active so add it to pastDrawNotes and remove it from activeDrawNotes
            this.pastDrawNotes.push(this.activeDrawNotes[i]);
            delete this.activeDrawNotes[i];
          }
        }
      }
    }
  }

  drawBlackKey(x, y, active) {
    const fillColor = active ? 0xff0000 : 0x000000;
    this.graphicsBlackKeys.beginFill(fillColor);
    this.graphicsBlackKeys.lineStyle(1, 0x000000);
    this.graphicsBlackKeys.drawRect(x, y, KEY_WIDTH*0.8, KEY_HEIGHT*0.65);
    this.graphicsBlackKeys.endFill();
  }

  drawWhiteKey(x, y, active) {
    const fillColor = active ? 0xff0000 : 0xffffff;
    this.graphics.beginFill(fillColor);
    this.graphics.lineStyle(1, 0x000000);
    this.graphics.drawRect(x, y, KEY_WIDTH, KEY_HEIGHT);
    this.graphics.endFill();
  }

  render() {
    return <canvas ref={canvas => this.canvas = canvas} />;
  }
}
