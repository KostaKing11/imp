// The app's confirm dialogs are a React component, but they are asked for
// from plain functions all over the codebase (and from the Android back
// handler, which is not in a render at all). This is the wire between the
// two: a single slot the host registers itself in.

export type ConfirmRequest = {
  title: string;
  message: string;
  onYes: () => void;
};

type Show = (request: ConfirmRequest) => void;

let show: Show | null = null;

// Called once by ConfirmHost when it mounts. Passing null on unmount.
export function registerConfirmHost(fn: Show | null): void {
  show = fn;
}

export function isConfirmHostMounted(): boolean {
  return show !== null;
}

export function askConfirm(request: ConfirmRequest): void {
  show?.(request);
}
