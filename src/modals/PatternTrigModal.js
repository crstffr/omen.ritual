import { MidiIO } from '../classes/LocalMidi';
import { ModalFormSingleInput } from '../components/ModalFormSingleInput';

export const PatternTrigModal = new ModalFormSingleInput({
  label: 'Trigger',
  valueType: 'number',
  valueMax: 127,
  valueMin: 0,
  inputWidth: 4
});

PatternTrigModal.startListeningForMidi = (chan) => {
  this.removeListener = MidiIO.onMessage(msg => {
    if (msg.channel !== chan) return;
    PatternTrigModal.setValue(msg.note);
    PatternTrigModal.render();
  });
};

PatternTrigModal.stopListeningForMidi = () => {
  if (!this.removeListener) return;
  this.removeListener();
};
