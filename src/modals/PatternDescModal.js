import { ModalFormSingleInput } from '../components/ModalFormSingleInput';

export const PatternDescModal = new ModalFormSingleInput({
  label: 'Description',
  valueType: 'string',
  valueMax: 30,
  inputWidth: 20
});
