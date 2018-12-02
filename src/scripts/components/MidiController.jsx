import React from 'react';
import WebMidi from 'webmidi';
import Soundfont from 'soundfont-player';
import {keyboardMapping, soundfonts} from '../util.js';

const KEYBOARD_INPUT = "computer keyboard";

export class MidiController extends React.Component  {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      devices: [KEYBOARD_INPUT],
      device: "",
      soundfont: soundfonts[2],
    };
    // Create our websocket
    this.socket = new WebSocket(window.location.href.replace(/^http/, "ws"), null, 10000, 10);
    this.socket.onmessage = this.socketOnMessage;
  }

  componentDidMount() {
    // Initalize the WebMidi instance
    WebMidi.enable(err => {
      if (err) {
        this.setState({ error: true });
      } else {
        WebMidi.addListener("connected", () => this.updateDevices());
        WebMidi.addListener("disconnected", () => this.updateDevices());
      }
    });

    this.setSoundfont(this.state.soundfont);
  }

  socketOnMessage = message => {
    // Make sure we have a soundfont initalized
    if (this.soundfont) {
      // Play the sound sent from the server
      this.soundfont.play(JSON.parse(message.data).note);
    }
  }

  handleSoundfonSelect = e => {
    const soundfont = e.target.value;
    this.setState({ soundfont });
    this.setSoundfont(soundfont);
  }

  handleDeviceSelect = e => {
    const device = e.target.value;
    this.setState({ device });

    // Clean up an existing connections
    this.removeExistingDevice();
    // The device could be a blank, so just don't do anything if we get that
    if (device !== "" && device !== KEYBOARD_INPUT) {
      this.setMidiDevice(device);
    }
  }

  handleKeyPress = e => {
    if (this.state.device === KEYBOARD_INPUT) {
      const note = keyboardMapping[e.key];
      if (note !== null) {
        this.playNote(note);
      }
    }
  }

  setSoundfont = soundfont => {
    // Set soundfont and tell user we are loading
    this.setState({ soundfont, loading: true });
    // Initalize the Soundfont
    Soundfont.instrument(new AudioContext(), soundfont).then(soundfont => {
      // Set a reference to the sound font so we can call it later
      this.soundfont = soundfont;
      // We are done loading
      this.setState({ loading: false });
    });
  }

  setMidiDevice = device => {
    // Setup the input device
    this.input = WebMidi.getInputByName(device);
    this.input.addListener("noteon", "all", e => this.playNote(e.note.number));

    this.input.addListener("noteoff", "all", e => {

    });
  }

  playNote = note => {
    if (this.soundfont !== undefined) {
      // Play the sound locally
      this.soundfont.play(note);
      // Broadcast the note to other clients
      this.socket.send(JSON.stringify({ note }));
    }
  }

  removeExistingDevice() {
    if (this.input) {
      this.input.removeListener();
    }
  }

  updateDevices() {
    let devices = WebMidi.inputs.map(input => input.name);
    if (devices.length === 0) {
      this.setState({ device: "" });
    } else {
      this.setState({ device: devices[0] });
      this.setMidiDevice(devices[0]);
    }
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
    } = this.state;
    return (
      <div onKeyPress={this.handleKeyPress}>
        {error && <span>Web MIDI is not supported by this browser (try using Chrome)</span>}
        <select value={device} onChange={this.handleDeviceSelect}>
          <option value=""></option>
          {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
        </select>
        <select value={soundfont} onChange={this.handleSoundfonSelect}>
          {soundfonts.map(sf => <option key={sf} value={sf}>{sf}</option>)}
        </select>
        {loading && <span> Loading...</span>}
      </div>
    );
  }
}
