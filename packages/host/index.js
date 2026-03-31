import {ScriptManager} from '@callstack/repack/client';
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

// if (!__DEV__) {
ScriptManager.shared.setStorage(AsyncStorage);
// }

const MANIFEST_CACHE_FILE = 'mf_manifest_cache.json';

// Load cached manifest from disk into globalThis for the runtime plugin
async function loadManifestCache() {
  try {
    const RNFS = require('react-native-fs');
    const cachePath = `${RNFS.DocumentDirectoryPath}/${MANIFEST_CACHE_FILE}`;
    const exists = await RNFS.exists(cachePath);
    if (exists) {
      const text = await RNFS.readFile(cachePath, 'utf8');
      //@ts-ignore
      globalThis.__MF_MANIFEST_CACHE__ = JSON.parse(text);
      console.log('[ManifestCache] Loaded from disk');
    }
  } catch (err) {
    console.warn('[ManifestCache] Failed to load:', err);
  }
}

// Called by the runtime plugin when it caches a new manifest
globalThis.__MF_MANIFEST_CACHE_PERSIST__ = async () => {
  try {
    const RNFS = require('react-native-fs');
    const cachePath = `${RNFS.DocumentDirectoryPath}/${MANIFEST_CACHE_FILE}`;
    await RNFS.writeFile(
      cachePath,
      JSON.stringify(globalThis.__MF_MANIFEST_CACHE__),
      'utf8',
    );
    console.log('[ManifestCache] Saved to disk');
  } catch (err) {
    console.warn('[ManifestCache] Failed to save:', err);
  }
};

loadManifestCache();

AppRegistry.registerComponent(appName, () => App);
