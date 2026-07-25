// Bus for a single-process server: every socket is already in the same
// place, so publishing is a no-op and rooms are just a set of codes.

export function createMemoryBus() {
  const codes = new Set();
  return {
    async claimRoom(code) {
      if (codes.has(code)) return false;
      codes.add(code);
      return true;
    },
    async roomExists(code) {
      return codes.has(code);
    },
    keepRoom() {},
    releaseRoom(code) {
      codes.delete(code);
    },
    publish() {},
    subscribe() {},
    unsubscribe() {},
    onRemote() {},
  };
}
