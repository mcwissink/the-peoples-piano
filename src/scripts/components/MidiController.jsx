import React from 'react';
import WebMidi from 'webmidi';
import Soundfont from 'soundfont-player';

export class MidiController extends React.Component  {
  constructor (props) {
    super(props);
    this.state = {
      loading: false,
      devices: [],
    };
    WebMidi.enable(err => {
      if (err) {
        console.log("WebMidi could not be enabled.", err)
      } else {
        WebMidi.addListener("connected", () => this.updateDevices());
        WebMidi.addListener("disconnected", () => this.updateDevices());
      }
    });
  }

  handleDeviceSelect = (e) => {
    this.setDevice(e.target.value);
  }

  setDevice = (device) => {
    // Tell the user we are loading things
    this.setState({ loading: true });
    // Clean up an existing connections
    this.removeExistingDevice();
    // Setup the devicing
    this.input = WebMidi.getInputByName(device);
    // Create the soundfont
    Soundfont.instrument(new AudioContext(), 'electric_piano_1').then(soundfont => {
      this.setState({ loading: false });
      this.input.addListener("noteon", "all", e => {
        soundfont.play(e.note.number);
      });

      this.input.addListener("noteoff", "all", e => {

      });
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
    } = this.state;
    return (
      <div>
        <select onChange={this.handleDeviceSelect}>
          {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
        </select>
        {loading && <span>Loading...</span>}
      </div>
    );
  }
}
