import React from 'react';
import WebMidi from 'webmidi';
import Soundfont from 'soundfont-player';

export class MidiController extends React.Component  {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      error: false,
      devices: [],
    };
    // Create our websocket
    this.socket = new WebSocket(window.location.href.replace(/^http/, "ws"));
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

    // Initalize the Soundfont
    Soundfont.instrument(new AudioContext(), 'electric_piano_1').then(soundfont => {
      // Set a reference to the sound font so we can call it later
      this.soundfont = soundfont;
      // We are done loading
      this.setState({ loading: false });
    });
  }

  socketOnMessage = (message) => {
    // Make sure we have a soundfont initalized
    if (this.soundfont) {
      // Play the sound sent from the server
      this.soundfont.play(JSON.parse(message.data).note);
    }
  }

  handleDeviceSelect = (e) => {
    this.setDevice(e.target.value);
  }

  setDevice = (device) => {
    // Tell the user we are loading things
    this.setState({ loading: true });
    // Clean up an existing connections
    this.removeExistingDevice();
    // Setup the input device
    this.input = WebMidi.getInputByName(device);
    this.input.addListener("noteon", "all", e => {
      this.soundfont.play(e.note.number);
      // Broadcast the note to other clients
      this.socket.send(JSON.stringify({note: e.note.number}));
    });

    this.input.addListener("noteoff", "all", e => {

    });
  }

  removeExistingDevice() {
    if (this.input) {
      this.input.removeListener();
    }
  }

  updateDevices() {
    const devices = WebMidi.inputs.map(input => input.name);
    this.setState({ devices });
    this.setDevice(devices[0]);
  }

  render() {
    const {
      devices,
      loading,
      error,
    } = this.state;
    if (loading) {
      return <span>Loading...</span>;
    } else if (error) {
      return <span>Web MIDI is not supported by this browser (try using Chrome)</span>;
    } else {
      return (
        <select onChange={this.handleDeviceSelect}>
          {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
        </select>
      );
    }
  }
}
