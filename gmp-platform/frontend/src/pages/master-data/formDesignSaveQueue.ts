/** One editor session: serialize manual/autosaves against the last acknowledged revision.
 * An ambiguous failure stops later saves until the native version is reopened. */
export function createFormDesignSaveQueue(initialRevision: number | undefined) {
  let revision = initialRevision;
  let tail: Promise<unknown> = Promise.resolve();
  return {
    save<T extends { data: { data: { revision?: number } } }>(write: (expectedRevision: number | undefined) => Promise<T>): Promise<T> {
      const next = tail.then(async () => {
        const response = await write(revision);
        revision = response.data.data.revision;
        return response;
      });
      tail = next;
      return next;
    },
  };
}
