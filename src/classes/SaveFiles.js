import path from 'path';
import fs from 'fs-extra'
import envPaths from 'env-paths';

import { absFromRoot } from '../utils/root';
import { log } from '../utils/log';

const userPaths = envPaths('OmenRitual');
const songsPath = path.join(userPaths.data, 'songs');
const lastPath = path.join(userPaths.data, 'last.json');

fs.ensureDirSync(songsPath);
if (!fs.pathExistsSync(lastPath)) fs.writeJsonSync(lastPath, {});

export class SaveFiles {

  static getLastSong() {
    const lastSong = fs.readJsonSync(lastPath);
    if (!lastSong.file) return false;
    try {
      return fs.readJsonSync(lastSong.file);
    } catch(e) {
      return false;
    }
  }

  static setLastSong(file) {
    fs.writeJsonSync(lastPath, {file}, {spaces: 2});
  }

  /**
   *
   * @param {Song} song
   */
  static saveSong(song) {
    const name = song.opts.name;
    const data = song.exportData();
    const file = path.join(songsPath, name + '.json');
    log(data);
    fs.writeJsonSync(file, data, {spaces: 2});
    SaveFiles.setLastSong(file);
  }

}
