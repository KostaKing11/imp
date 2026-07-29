import * as Application from "expo-application";
import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

// Self-updating for the installed Android app. The web version reloads
// itself through the service worker, and there is no APK to replace
// there, so all of this is a no-op off Android.
//
// The release flow is: build the APK, publish a GitHub release whose tag
// is the new version, attach the APK to it. The app reads that release,
// compares the tag to its own version, and offers to install it.

const RELEASE_API = "https://api.github.com/repos/KostaKing11/imp/releases/latest";

export type Release = {
  version: string;
  apkUrl: string;
  notes: string | null;
};

// "v1.2.3" / "1.2.3 " -> [1, 2, 3]. Anything non-numeric becomes 0, so a
// malformed tag simply never looks newer than what is installed.
function parseVersion(raw: string): number[] {
  return raw
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => {
      const n = parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
}

export function isNewer(candidate: string, current: string): boolean {
  const a = parseVersion(candidate);
  const b = parseVersion(current);
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    if (x !== y) return x > y;
  }
  return false;
}

// The version this build actually is — read from the APK itself rather
// than from app.json, so it cannot drift from what is installed.
export function currentVersion(): string {
  return Application.nativeApplicationVersion ?? "0.0.0";
}

// Only installed Android builds can replace themselves.
export function updatesSupported(): boolean {
  return Platform.OS === "android";
}

// Asks GitHub for the newest release. Returns null when there is nothing
// newer, when the release has no APK attached, or when anything at all
// goes wrong — a failed update check must never interrupt a game.
export async function checkForUpdate(): Promise<Release | null> {
  if (!updatesSupported()) return null;

  try {
    const response = await fetch(RELEASE_API, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) return null;

    const data = (await response.json()) as {
      tag_name?: string;
      name?: string;
      body?: string;
      draft?: boolean;
      prerelease?: boolean;
      assets?: { name?: string; browser_download_url?: string }[];
    };
    if (data.draft || data.prerelease) return null;

    const version = data.tag_name ?? data.name;
    if (!version || !isNewer(version, currentVersion())) return null;

    const apk = (data.assets ?? []).find((a) => a.name?.toLowerCase().endsWith(".apk"));
    if (!apk?.browser_download_url) return null;

    return {
      version: version.replace(/^v/i, ""),
      apkUrl: apk.browser_download_url,
      notes: data.body?.trim() || null,
    };
  } catch {
    return null;
  }
}

// Downloads the APK and hands it to Android's package installer. The
// user still confirms the install in the system dialog — this only gets
// them there without a trip to the browser.
export async function downloadAndInstall(
  release: Release,
  onProgress?: (fraction: number) => void
): Promise<void> {
  const folder = new Directory(Paths.cache, "updates");
  if (!folder.exists) folder.create({ intermediates: true });

  const target = new File(folder, `imp-${release.version}.apk`);
  if (target.exists) target.delete();

  const file = await File.downloadFileAsync(release.apkUrl, target, {
    // A half-finished download from a previous attempt must not block us.
    idempotent: true,
    onProgress: onProgress
      ? ({ bytesWritten, totalBytes }) => {
          // totalBytes is -1 when the server sent no Content-Length; there
          // is nothing to show a fraction against, so leave the bar alone.
          if (totalBytes > 0) onProgress(bytesWritten / totalBytes);
        }
      : undefined,
  });

  // The installer is a different app, so it cannot read a file:// path in
  // our sandbox — it needs a content:// URI it has been granted access
  // to. The native module exposes this; the typings do not yet.
  const contentUri = (file as unknown as { contentUri: string }).contentUri;

  // Required lazily: expo-intent-launcher is Android-only, and importing
  // it at module load would take the web bundle down with it.
  const { startActivityAsync } = require("expo-intent-launcher") as
    typeof import("expo-intent-launcher");

  await startActivityAsync("android.intent.action.VIEW", {
    data: contentUri,
    type: "application/vnd.android.package-archive",
    // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
    flags: 1 | 0x10000000,
  });
}
