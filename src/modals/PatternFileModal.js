import path from 'path';
import { ModalFormFilePicker } from '../components/ModalFormFilePicker';
import { Events } from '../classes/Events';
import { absFromRoot } from '../utils/root';
import { log } from '../utils/log';

export const PatternFileModal = new ModalFormFilePicker({
  label: 'File',
  baseDir: absFromRoot('/midi'),
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

PatternFileModal.picker.on('file', () => {
  Events.emit('previewStop');
});
