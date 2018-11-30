Chat React Components
- ChatBox: the frontend box holding comments
- Comment: React component of the chat user and their comment
- Our design for this hasn’t been finalized as well. We still need to talk through some implementation aspects

Piano React Components
- MidiController: uses Web MIDI api to capture midi inputs from users and sends it to the server

MongoDB
- There’s no apparent need for MongoDB implementation.
- Midis are not stored but sent out to the live audience that is listening
- Comments will be stored by Twitch
- We still need to consider applications for MongoDB if it’s a requirement for the project
