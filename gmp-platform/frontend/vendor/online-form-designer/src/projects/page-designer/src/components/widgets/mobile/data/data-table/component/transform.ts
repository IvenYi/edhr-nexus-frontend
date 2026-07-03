enum AlignType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

const alignMap: Record<AlignType, string> = {
  [AlignType.LEFT]: 'flex-start',
  [AlignType.CENTER]: 'center',
  [AlignType.RIGHT]: 'flex-end',
  [AlignType.JUSTIFY]: 'space-between',
};

export function transformFont2flexStyle(params) {
  const flexStyle = params.style?.contentFont?.align as AlignType;
  return alignMap[flexStyle] || 'flex-start';
}