import envPaths from 'env-paths';
import { absFromRoot } from '../utils/root';
import { log } from '../utils/log';
import fs from 'fs-extra'

const userPaths = envPaths('OmenRitual');

export class SaveFiles {

  static getSaves() {

    log(userPaths.data);

  }

}
