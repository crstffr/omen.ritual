import path from 'path';

import { Events } from '../classes/Events';
import { log } from '../utils/log';

import { ModalFormFilePicker } from '../components/ModalFormFilePicker';

export const PatternFileModal = new ModalFormFilePicker({
  label: 'File',
  baseDir: process.env.MIDI_FOLDER,
  validFileExts: ['.mid', '.midi']
});

PatternFileModal.picker.key(['space'], () => {
  const {
    cwd,
    value,
  } = PatternFileModal.picker;
  const file = path.join(cwd, value);
  Events.emit('previewFile', file);
});

PatternFileModal.form.on('cancel', () => {
  Events.emit('previewStop');
});

PatternFileModal.form.on('submit', () => {
  Events.emit('previewStop');
});
