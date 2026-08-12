import client from './client';
import type { PageResult } from '@/types/common';

const basePath = '/master-data/process-modeling/product-families';

export interface ProductFamilyModel {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  remark?: string | null;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedBy?: string | null;
  updatedAt?: string | null;
  memberCount: number;
  processVersionCount: number;
}

export interface ProductFamilyPayload {
  code: string;
  name: string;
  description?: string | null;
  remark?: string | null;
}

export interface ProductFamilyMemberOption {
  memberId?: string | null;
  productId: string;
  productCode: string;
  productName: string;
  materialTypeName: string;
  productFamilyId?: string | null;
  productFamilyName?: string | null;
  currentMember: boolean;
}

export const getProductFamilies = (params: { page?: number; size?: number; keyword?: string }) =>
  client.get(basePath, { params }) as Promise<{ data: { data: PageResult<ProductFamilyModel> } }>;

export const createProductFamily = (body: ProductFamilyPayload) =>
  client.post(basePath, body) as Promise<{ data: { data: ProductFamilyModel } }>;

export const updateProductFamily = (id: string, body: ProductFamilyPayload) =>
  client.put(`${basePath}/${id}`, body) as Promise<{ data: { data: ProductFamilyModel } }>;

export const deleteProductFamily = (id: string) => client.delete(`${basePath}/${id}`);

export const getProductFamilyMemberOptions = (id: string) =>
  client.get(`${basePath}/${id}/members`) as Promise<{ data: { data: ProductFamilyMemberOption[] } }>;

export const addProductFamilyMembers = (id: string, productIds: string[]) =>
  client.post(`${basePath}/${id}/members/batch-add`, productIds);

export const transferProductFamilyMember = (id: string, productId: string) =>
  client.post(`${basePath}/${id}/members/${productId}/transfer`, undefined, { params: { confirmed: true } });

export const removeProductFamilyMember = (id: string, productId: string) =>
  client.delete(`${basePath}/${id}/members/${productId}`);
