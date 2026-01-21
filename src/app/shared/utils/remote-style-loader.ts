type FederationManifest = Record<string, string>;

type RemoteEntry = {
  styles?: string[];
  assets?: string[];
};

const DEFAULT_MANIFEST_URL = '/federation.manifest.json';
const loadedStyles = new Set<string>();

const loadStylesheet = (url: string, key: string): Promise<void> => {
  if (loadedStyles.has(key)) {
    return Promise.resolve();
  }

  if (typeof document === 'undefined') {
    return Promise.resolve();
  }

  if (document.querySelector(`link[data-remote-style="${key}"]`)) {
    loadedStyles.add(key);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.dataset['remoteStyle'] = key;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
    loadedStyles.add(key);
  });
};

const resolveStyleUrls = (remoteEntryUrl: string, remoteEntry?: RemoteEntry | null): string[] => {
  const baseUrl = new URL('.', remoteEntryUrl).toString();
  const stylesFromEntry =
    remoteEntry?.styles ??
    remoteEntry?.assets?.filter((asset) => asset.endsWith('.css')) ??
    [];

  if (stylesFromEntry.length > 0) {
    return stylesFromEntry.map((asset) => new URL(asset, baseUrl).toString());
  }

  return [new URL('styles.css', baseUrl).toString()];
};

export const loadRemoteStyles = async (
  remoteName: string,
  manifestUrl = DEFAULT_MANIFEST_URL
): Promise<void> => {
  if (typeof fetch === 'undefined') {
    return;
  }

  try {
    const manifestResponse = await fetch(manifestUrl, { cache: 'no-cache' });
    if (!manifestResponse.ok) {
      return;
    }

    const manifest = (await manifestResponse.json()) as FederationManifest;
    const remoteEntryUrl = manifest[remoteName];
    if (!remoteEntryUrl) {
      return;
    }

    let remoteEntry: RemoteEntry | null = null;
    try {
      const remoteEntryResponse = await fetch(remoteEntryUrl, { cache: 'no-cache' });
      if (remoteEntryResponse.ok) {
        remoteEntry = (await remoteEntryResponse.json()) as RemoteEntry;
      }
    } catch {
      remoteEntry = null;
    }

    const styleUrls = resolveStyleUrls(remoteEntryUrl, remoteEntry);
    await Promise.all(
      styleUrls.map((url, index) => loadStylesheet(url, `${remoteName}:${index}:${url}`))
    );
  } catch {
    return;
  }
};
