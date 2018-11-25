import React from 'react';
import webMidi from 'webmidi';

export class MidiController extends React.Component  {
  constructor (props) {
    super(props);
    this.webMidi = webMidi;
    this.webMidi.enable(err => {
      if (err) {
        console.log("WebMidi could not be enabled.", err)
      } else {
        this.webMidi.addListener("connected", () => this.updateDevices());
        this.webMidi.addListener("disconnected", () => this.updateDevices());
      }
    });
    this.state = {
      devices: [],
    };
  }

  handleDeviceSelect = (e) => {
    this.setDevice(e.target.value);
  }

  setDevice = (device) => {
    // Clean up an existing connections
    this.removeExistingDevice();
    // Setup the devicing
    this.input = this.webMidi.getInputByName(device);
    this.input.addListener("noteon", "all", e => {
      console.log(e)
    });

    this.input.addListener("noteoff", "all", e => {
      console.log("Received 'noteoff' message (" + e.note.name + e.note.octave + ").");
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
    } = this.state;
    return (
      <select onChange={this.handleDeviceSelect}>
        {this.state.devices.map(device => <option key={device} value={device}>{device}</option>)}
      </select>
    );
  }
}
