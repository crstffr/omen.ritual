import path from 'path';
import pkgDir from 'pkg-dir';

export function root() {
  return pkgDir.sync();
}

export function absFromRoot(file = '') {
  return path.join(root(), file);
}
