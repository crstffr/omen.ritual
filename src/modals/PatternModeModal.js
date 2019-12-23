import { PatternModesList } from '../classes/PatternModes';
import { ModalFormSingleInput } from '../components/ModalFormSingleInput';

export const PatternModeModal = new ModalFormSingleInput({
  label: 'Mode',
  valueType: 'options',
  valueOpts: PatternModesList,
  inputWidth: 5
});
