import { ModalFormFilePicker } from '../components/ModalFormFilePicker';
import { absFromRoot } from '../utils/root';

export const PatternFileModal = new ModalFormFilePicker({
  label: 'File',
  baseDir: absFromRoot('/midi'),
  validFileExts: ['.mid', '.midi']
});
