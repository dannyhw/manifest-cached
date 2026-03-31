/**
 * MF2 runtime plugin — caches manifests in globalThis (in-memory).
 * Persistence to disk is handled by index.js via the onCacheUpdate callback.
 *
 * Cannot import native modules here — this runs during MF2 bootstrap
 * before shared modules (react-native) are initialized.
 */
const OfflineManifestPlugin = () => ({
  name: 'offline-manifest-plugin',

  async fetch(url, options) {
    try {
      const res = await fetch(url, options);
      const cloned = res.clone();
      const text = await cloned.text();
      if (!globalThis.__MF_MANIFEST_CACHE__) {
        globalThis.__MF_MANIFEST_CACHE__ = {};
      }
      globalThis.__MF_MANIFEST_CACHE__[url] = text;
      // Notify index.js to persist
      if (typeof globalThis.__MF_MANIFEST_CACHE_PERSIST__ === 'function') {
        globalThis.__MF_MANIFEST_CACHE_PERSIST__();
      }
      console.log('[OfflinePlugin] Manifest fetched and cached');
      return res;
    } catch (err) {
      console.log('[OfflinePlugin] Network failed, checking cache...');
      const cached =
        globalThis.__MF_MANIFEST_CACHE__ &&
        globalThis.__MF_MANIFEST_CACHE__[url];
      if (cached) {
        console.log('[OfflinePlugin] Serving manifest from cache');
        return new Response(cached, {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        });
      }
      throw err;
    }
  },
});

export default OfflineManifestPlugin;
