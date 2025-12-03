
import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // This should point to the compiled output of your main process entry file
    // By default, if your entry is `src/main.ts`, the output will be in `.webpack/main`
    // and the file will be `index.js`.
    entry: 'src/main.ts',
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}), 
    new MakerZIP({}, ['darwin']),
    new MakerRpm({}), 
    new MakerDeb({})
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
  ],
};

export default config;
