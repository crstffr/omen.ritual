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
    const data = fs.readJsonSync(lastPath);
    if (!data.file) return false;
    return data.file;
  }

  static setLastSong(file) {
    fs.writeJsonSync(lastPath, {file}, {spaces: 2});
  }

  /**
   *
   * @returns {SongExport}
   */
  static loadLastSong() {
    const song = SaveFiles.getLastSong();
    if (!song) return null;
    return SaveFiles.loadSong(song);
  }

  /**
   *
   * @param {string} file
   * @returns {SongExport}
   */
  static loadSong(file) {
    try {
      return fs.readJsonSync(file);
    } catch(e) {
      return null;
    }
  }

  /**
   *
   * @param {Song} song
   */
  static saveSong(song) {
    const name = song.name;
    const data = song.exportData();
    const file = path.join(songsPath, name + '.json');
    fs.writeJsonSync(file, data, {spaces: 2});
    SaveFiles.setLastSong(file);
  }

}
