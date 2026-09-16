export interface SignaturePresentation {
  signerName: string;
  signedAt?: string;
  signatureImageUrl?: string;
  signatureImageObjectUrl?: string;
  signatureImageFileId?: string;
}

export function readSignaturePresentation(value: unknown): SignaturePresentation | null {
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    // Production execution currently stores: operator · signedAt · signatureId.
    const match = value.match(/^(.*) · (\d{4}-\d{2}-\d{2}T[^ ]+) · ([^·]+)$/);
    return match ? { signerName: match[1], signedAt: match[2] } : { signerName: value };
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const text = (key: string) => typeof record[key] === 'string' ? record[key] as string : undefined;
  const signerName = text('signerName') ?? '';
  const signatureImageUrl = text('signatureImageUrl');
  const signatureImageObjectUrl = text('signatureImageObjectUrl');
  const signatureImageFileId = typeof record.signatureImageFileId === 'number'
    ? String(record.signatureImageFileId) : text('signatureImageFileId');
  if (!signerName && !signatureImageUrl && !signatureImageObjectUrl && !signatureImageFileId) return null;
  return { signerName, signatureImageUrl, signatureImageObjectUrl, signatureImageFileId, signedAt: text('signedAt') };
}

export function formatSignatureTime(signedAt: string | undefined, displayMode: unknown) {
  if (displayMode !== 'signatureDate' && displayMode !== 'signatureDateTime') return '';
  const match = signedAt?.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/);
  if (!match) return '未记录签署时间';
  const [, year, month, day, hour, minute, second] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)
    || (hour !== undefined && (Number(hour) > 23 || Number(minute) > 59 || Number(second ?? 0) > 59))) return '未记录签署时间';
  const dateText = `${year}-${month}-${day}`;
  if (displayMode === 'signatureDate') return dateText;
  return hour === undefined ? '未记录签署时间' : `${dateText} ${hour}:${minute}${second === undefined ? '' : `:${second}`}`;
}
