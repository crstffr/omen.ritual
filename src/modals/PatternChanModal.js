import { ModalFormSingleInput } from '../components/ModalFormSingleInput';

export const PatternChanModal = new ModalFormSingleInput({
  label: 'Channel',
  valueType: 'number',
  valueMax: 16,
  valueMin: 1,
  inputWidth: 3
});
