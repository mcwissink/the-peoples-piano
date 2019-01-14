import React from 'react';
import WebMidi from 'webmidi';
import io from 'socket.io-client';
import {keyboardMapping} from '../util.js';
import {Pianist} from './Pianist.jsx';
import {Piano} from './Piano.jsx';
import * as PIXI from 'pixi.js';
import MIDISounds from 'midi-sounds-react';

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
      instrument: 0,
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
  }

  socketOnOpen = () => {
    const name = prompt("Enter a username:");
    this.socket.send(name);
  }

  handleInstrumentSelect = e => {
    const instrument = e.target.value;
    // Set the instrument to -1 until it is loaded
    this.midiSounds.cacheInstrument(instrument);
    this.midiSounds.player.loader.waitLoad(() => {
			this.setState({
				instrument,
			});
		});
  }

  handleDeviceSelect = e => {
    this.setDevice(e.target.value);
  }

  setDevice(device) {
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
    // Loading instrument is async so make sure it exists before accessing it
    if (this.midiSounds) {
      // Play the sound locally and store a reference to the player
      this.activeNotes[note] = {
        player: this.midiSounds.player.queueWaveTable(
          this.midiSounds.audioContext,
          this.midiSounds.equalizer.input,
  			  window[this.midiSounds.player.loader.instrumentInfo(this.state.instrument).variable], 0, note, 9999, 1),
        color: parseInt(this.state.users.find(u => u.id === id).color.replace(/\#/, '0x'), 16),
      };
    }
  }

  // Stop the note from a user, specified by their id
  stopNote = (note, id) => {
    const activeNote = this.activeNotes[note];
    if (activeNote !== undefined) {
      activeNote.player.cancel();
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

  createSelectItems() {
		if (this.midiSounds) {
			if (!(this.items)) {
				this.items = [];
				for (let i = 0; i < this.midiSounds.player.loader.instrumentKeys().length; i++) {
					this.items.push(<option key={i} value={i}>{'' + (i + 0) + '. ' + this.midiSounds.player.loader.instrumentInfo(i).title}</option>);
				}
			}
			return this.items;
		}
	}

  render() {
    const {
      devices,
      device,
      loading,
      error,
      instrument,
      users,
    } = this.state;
    return (
      <div>
        <Piano activeNotes={this.activeNotes}/>
        <div>
          {error && <div>Web MIDI is not supported by this browser (try using Chrome)</div>}
          <span>Input: </span>
          <select disabled={loading} value={device} onChange={this.handleDeviceSelect}>
            <option value=""></option>
            {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
          </select>
          <br/>
          <span>Instrument: </span>
          <select onChange={this.handleInstrumentSelect}>
            {this.createSelectItems()}
          </select>
          {loading && <span> Loading...</span>}
        </div>
        <u><span>Users</span></u>
        <div>
          {users.map(user => <Pianist socket={this.socket} name={user.name} color={user.color} upvotes={user.upvotes} downvotes={user.downvotes} id={user.id}/>)}
        </div>
        <MIDISounds ref={ref => {
          if (ref !== null) {
            this.midiSounds = ref;
            this.midiSounds.cacheInstrument(instrument);
          }
        }} />
      </div>
    );
  }
}
