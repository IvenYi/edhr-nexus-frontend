import client from './client';

// Product Families
export const getProductFamilies = (params?: Record<string, unknown>) =>
  client.get('/master-data/product-families', { params });
export const createProductFamily = (body: Record<string, unknown>) =>
  client.post('/master-data/product-families', body);
export const updateProductFamily = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/product-families/${id}`, body);
export const deleteProductFamily = (id: number) =>
  client.delete(`/master-data/product-families/${id}`);

// Units
export const getUnits = (params?: Record<string, unknown>) =>
  client.get('/master-data/units', { params });
export const createUnit = (body: Record<string, unknown>) =>
  client.post('/master-data/units', body);
export const updateUnit = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/units/${id}`, body);
export const deleteUnit = (id: number) =>
  client.delete(`/master-data/units/${id}`);

// Equipment Types
export const getEquipmentTypes = (params?: Record<string, unknown>) =>
  client.get('/master-data/equipment', { params });
export const createEquipmentType = (body: Record<string, unknown>) =>
  client.post('/master-data/equipment', body);
export const updateEquipmentType = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/equipment/${id}`, body);
export const deleteEquipmentType = (id: number) =>
  client.delete(`/master-data/equipment/${id}`);

// Operations
export const getOperations = (params?: Record<string, unknown>) =>
  client.get('/master-data/operations', { params });
export const createOperation = (body: Record<string, unknown>) =>
  client.post('/master-data/operations', body);
export const updateOperation = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/operations/${id}`, body);
export const deleteOperation = (id: number) =>
  client.delete(`/master-data/operations/${id}`);

// Routes
export const getRoutes = (params?: Record<string, unknown>) =>
  client.get('/master-data/routes', { params });
export const createRoute = (body: Record<string, unknown>) =>
  client.post('/master-data/routes', body);
export const updateRoute = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/routes/${id}`, body);
export const deleteRoute = (id: number) =>
  client.delete(`/master-data/routes/${id}`);

// SOP Documents
export const getSopDocuments = (params?: Record<string, unknown>) =>
  client.get('/master-data/sop-documents', { params });
export const createSopDocument = (body: Record<string, unknown>) =>
  client.post('/master-data/sop-documents', body);
export const updateSopDocument = (id: number, body: Record<string, unknown>) =>
  client.put(`/master-data/sop-documents/${id}`, body);
export const deleteSopDocument = (id: number) =>
  client.delete(`/master-data/sop-documents/${id}`);
