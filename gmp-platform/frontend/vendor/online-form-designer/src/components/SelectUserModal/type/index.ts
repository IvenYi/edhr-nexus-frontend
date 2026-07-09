import type { PickerOrgDTO, PickerUserDTO } from '/@/apis/gct-platform/model';

export type OrgDTO = PickerOrgDTO & { formatId: string };
export type UserDTO = PickerUserDTO & { formatId: string };
