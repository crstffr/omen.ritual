#!/usr/bin/env node

const midi = require('midi');

// Get input ports and log their names

const input = new midi.Input();
const inports = input.getPortCount();

if (inports > 0) console.log('Midi Input Ports:');
else console.log('No midi input ports found');

Array(inports).fill().forEach((v,i) => {
  console.log(`${i}: ${input.getPortName(i)}`)
});

console.log('');

// Get output ports and log their names

const output = new midi.Output();
const outports = output.getPortCount();

if (outports > 0) console.log('Midi Output Ports:');
else console.log('No midi output ports found');

Array(outports).fill().forEach((v,i) => {
  console.log(`${i}: ${output.getPortName(i)}`)
});
