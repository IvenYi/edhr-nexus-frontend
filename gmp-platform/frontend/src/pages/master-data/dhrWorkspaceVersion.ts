type VersionIdentity = { id: string | number };
type VersionSelection =
  | { status: 'ready'; versionId: string }
  | { status: 'loading' | 'missing' | 'empty'; versionId: null };

export function resolveDhrWorkspaceVersion(
  versions: readonly VersionIdentity[] | undefined,
  requestedVersionId?: string | number | null,
  preferredVersionId?: string | null,
): VersionSelection {
  if (!versions) return { status: 'loading', versionId: null };
  if (requestedVersionId != null) {
    const id = String(requestedVersionId);
    return versions.some((version) => String(version.id) === id)
      ? { status: 'ready', versionId: id }
      : { status: 'missing', versionId: null };
  }
  const selected = versions.find((version) => String(version.id) === preferredVersionId) ?? versions[0];
  return selected
    ? { status: 'ready', versionId: String(selected.id) }
    : { status: 'empty', versionId: null };
}