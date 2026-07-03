export enum SealType {
  COMMON = 'COMMON',
  CONTRACT = 'CONTRACT',
  FINANCE = 'FINANCE',
  PERSONNEL = 'PERSONNEL',
  OTHER = 'OTHER',
}

export const sealTypeOptions = Object.values(SealType).map((value) => ({
  label: `sys.tenant.assetCenter.sealManagement.type.${value}`,
  value,
}));

export const sealTypeMap = sealTypeOptions.reduce((a, b) => ({ ...a, [b.value]: b.label }), {});

export const getSealImageUrl = (path: string) => {
  return `${import.meta.env.VITE_MINIO_PATH}${path}`;
};
