import React from 'react';
import WebMidi from 'webmidi';
import io from 'socket.io-client';
import Soundfont from 'soundfont-player';
import {keyboardMapping, soundfonts} from '../util.js';
import {Pianist} from './Pianist.jsx';
import {Piano} from './Piano.jsx';
import * as PIXI from 'pixi.js';

const KEYBOARD_INPUT = "computer keyboard";

// Handles all the midi and sockets
export class MidiController extends React.Component  {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      devices: [KEYBOARD_INPUT],
      device: "",
      soundfont: soundfonts[2],
      users: [],
    };
    // Create our socket
    this.socket = new io.connect(window.location.href.replace(/^http/, "ws"));
    this.socket.on('connect_error', e => console.log("error"));
    this.socket.on('connect', e => console.log("socket.io connection open"));
    this.socket.on('users', users => {
      this.setState({ users })
    });
    this.socket.on('user_connected', user => {
      console.log(`Added user: ${user.name}`);
      // A new user joined so add them to the list of users
      this.setState(prevState => ({ users: prevState.users.concat(user) }));
    });
    this.socket.on('user_disconnected', user => {
      console.log(`Removed user: ${user.name}`);
      // A user disconnected so remove them from the list of users
      this.setState(prevState => ({ users: prevState.users.filter(u => u.id !== user.id) }));
    });
    this.socket.on('noteon', data => this.playNote(data.note, data.id));
    this.socket.on('noteoff', data => this.stopNote(data.note, data.id));

    // Create am audio AudioContext
    this.ac = new AudioContext();

    // Create an object that stores active notes so we can stop them later
    this.activeNotes = {};

    // Join stuff with the socket so we can start broadcasting
    this.socket.emit('join', props.username);
  }

  componentDidMount() {
    // InitSetupalize the WebMidi instance
    WebMidi.enable(err => {
      if (err) {
        this.setState({ error: true });
      } else {
        WebMidi.addListener("connected", () => this.updateDevices());
        WebMidi.addListener("disconnected", () => this.updateDevices());
      }
    });

    // Setup the soundfont
    this.setSoundfont(this.state.soundfont);
  }

  socketOnOpen = () => {
    const name = prompt("Enter a username:");
    this.socket.send(name);
  }

  handleSoundfonSelect = e => {
    const soundfont = e.target.value;
    this.setState({ soundfont });
    this.setSoundfont(soundfont);
  }

  handleDeviceSelect = e => {
    const device = e.target.value;
    this.setState({ device });
    // Just clear any existing input
    this.removeExistingMidiDevice();
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    // The device could be a blank, so just don't do anything if we get that
    if (device !== "") {
      if (device === KEYBOARD_INPUT) {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
      } else {
        this.setMidiDevice(device);
      }
    }
  }

  handleKeyDown = e => {
    const note = keyboardMapping[e.key];
    // For some reason, this funtion is called multiple times while the key is pressed
    // So just check if we have an active note already
    if (note !== undefined && this.activeNotes[note] === undefined) {
      this.playNote(note, this.socket.id);
      // Broadcast the note event to other clients
      this.socket.emit('noteon', note);
    }
  }

  handleKeyUp = e => {
    const note = keyboardMapping[e.key];
    if (note !== undefined) {
      this.stopNote(note, this.socket.id);
      // Broadcast the note event to other clientscv
      this.socket.emit('noteoff', note);
    }
  }

  setSoundfont = soundfont => {
    // Set soundfont and tell user we are loading
    this.setState({ soundfont, loading: true });
    // Initalize the Soundfont
    Soundfont.instrument(this.ac, soundfont, { adsr: [0.01, 0.1, 1, 100] }).then(soundfont => {
      // Set a reference to the sound font so we can call it later
      this.soundfont = soundfont;
      // We are done loading
      this.setState({ loading: false });
    });
  }

  setMidiDevice = device => {
    // Clean up an existing connections
    this.removeExistingMidiDevice();
    // Setup the input device
    this.input = WebMidi.getInputByName(device);
    this.input.addListener("noteon", "all", e => {
      const note = e.note.number;
      this.playNote(note, this.socket.id);
      // Broadcast the note event to other clients
      this.socket.emit('noteon', note);
    });

    this.input.addListener("noteoff", "all", e => {
      const note = e.note.number;
      this.stopNote(note, this.socket.id);
      // Broadcast the note event to other clientscv
      this.socket.emit('noteoff', note);
    });
  }

  // Play the note from a user, specified by their id
  playNote = (note, id) => {
    // Play the sound locally and store a reference to the player
    this.activeNotes[note] = { player: this.soundfont.start(note), color: parseInt(this.state.users.find(u => u.id === id).color.replace(/\#/, '0x'), 16) };
  }

  // Stop the note from a user, specified by their id
  stopNote = (note, id) => {
    const activeNote = this.activeNotes[note];
    if (activeNote !== undefined) {
      activeNote.player.stop();
      // Free up memory, less work for garbage collection?
      delete this.activeNotes[note];
    }
  }

  removeExistingMidiDevice() {
    if (this.input) {
      this.input.removeListener();
    }
  }

  updateDevices() {
    let devices = WebMidi.inputs.map(input => input.name);
    // if (devices.length === 0) {
    //   this.setState({ device: "" });
    // } else {
    //   this.setState({ device: devices[0] });
    // }
    // Add the compute keyboard as an input optoin
    devices.push(KEYBOARD_INPUT);
    this.setState({ devices });
  }

  render() {
    const {
      devices,
      device,
      loading,
      error,
      soundfont,
      users,
    } = this.state;
    return (
      <div>
        <Piano activeNotes={this.activeNotes}/>
        <div>
          {error && <div>Web MIDI is not supported by this browser (try using Chrome)</div>}
          <span>Input: </span>
          <select value={device} onChange={this.handleDeviceSelect}>
            <option value=""></option>
            {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
          </select>
          <br/>
          <span>Sound: </span>
          <select value={soundfont} onChange={this.handleSoundfonSelect}>
            {soundfonts.map(sf => <option key={sf} value={sf}>{sf}</option>)}
          </select>
          {loading && <span> Loading...</span>}
        </div>
        <u><span>Users</span></u>
        <div>
          {users.map(user => <Pianist socket={this.socket} name={user.name} color={user.color} upvotes={user.upvotes} downvotes={user.downvotes} id={user.id}/>)}
        </div>
      </div>
    );
  }
}
