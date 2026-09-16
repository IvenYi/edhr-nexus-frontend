import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { getFilePreviewBlob } from '@/api/files';
import { formatSignatureTime, readSignaturePresentation } from './signaturePresentation';

export default function SignatureDisplay({ value, displayMode, imageMarker }: {
  value: unknown;
  displayMode?: unknown;
  imageMarker?: string;
}) {
  const signature = readSignaturePresentation(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const [image, setImage] = useState<{ fileId: string; url: string } | null>(null);
  const fileId = signature?.signatureImageFileId;
  const objectUrl = signature?.signatureImageObjectUrl;
  useEffect(() => {
    if (!fileId || objectUrl) return;
    let active = true;
    let url: string | undefined;
    getFilePreviewBlob(fileId).then((response) => {
      if (!active) return;
      url = URL.createObjectURL(response.data);
      setImage({ fileId, url });
    }).catch(() => { if (active) setImage(null); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [fileId, objectUrl]);
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.height > 0 && entry.contentRect.height < 44 && entry.contentRect.width >= 160);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  if (!signature) return null;
  const timeText = formatSignatureTime(signature.signedAt, displayMode);
  const imageSrc = objectUrl || (fileId ? (image?.fileId === fileId ? image.url : undefined) : signature.signatureImageUrl);
  return (
    <Box
      ref={rootRef}
      data-signature-display="true"
      data-signature-layout={compact && timeText ? 'inline' : 'stacked'}
      title={[signature.signerName, timeText].filter(Boolean).join(' · ')}
      sx={{
        width: '100%', height: '100%', minWidth: 0, minHeight: 0,
        display: 'grid', alignItems: 'center', justifyItems: 'center',
        gridTemplateColumns: compact && timeText ? 'minmax(0, 1fr) auto' : 'minmax(0, 1fr)',
        gridTemplateRows: !compact && timeText ? 'minmax(0, 1fr) 14px' : 'minmax(0, 1fr)',
        gap: compact ? '6px' : '1px', overflow: 'hidden', textTransform: 'none',
      }}
    >
      {imageSrc ? (
        <Box component="img" {...(imageMarker ? { [imageMarker]: 'true' } : {})}
          src={imageSrc} alt={signature.signerName ? `${signature.signerName}电子签名` : '电子签名'}
          sx={{ display: 'block', width: '100%', height: '100%', maxHeight: 64, minHeight: 0, minWidth: 0, objectFit: 'contain' }} />
      ) : (
        <Typography component="span" sx={{ fontSize: 14, minWidth: 0, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#303133' }}>
          {signature.signerName || '签名图片暂不可用'}
        </Typography>
      )}
      {timeText ? (
        <Typography component="time" data-signature-time="true"
          sx={{ fontSize: 10, lineHeight: '14px', color: '#6b7280', fontWeight: 400, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {timeText}
        </Typography>
      ) : null}
    </Box>
  );
}
