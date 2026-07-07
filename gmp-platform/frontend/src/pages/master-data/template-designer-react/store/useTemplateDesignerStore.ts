import { create } from 'zustand';
import type { CanvasNode, ModelField, TemplateDesignerDocument, TemplateDesignerTabKey } from '../types';
import { getComponentDefinition } from '../registry/componentRegistry';
import { getFieldTypeDefinition } from '../registry/fieldRegistry';

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mapNodes(nodes: CanvasNode[], nodeId: string, updater: (node: CanvasNode) => CanvasNode): CanvasNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) return updater(node);
    if (!node.children?.length) return node;
    return {
      ...node,
      children: mapNodes(node.children, nodeId, updater),
    };
  });
}

function findNode(nodes: CanvasNode[], nodeId: string): CanvasNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.children?.length) {
      const nested = findNode(node.children, nodeId);
      if (nested) return nested;
    }
  }
  return null;
}

function insertNodeIntoTree(nodes: CanvasNode[], parentId: string | null, node: CanvasNode): CanvasNode[] {
  if (!parentId) {
    return [...nodes, node];
  }
  return nodes.map((current) => {
    if (current.id === parentId) {
      return {
        ...current,
        children: [...(current.children ?? []), { ...node, parentId }],
      };
    }
    if (!current.children?.length) return current;
    return {
      ...current,
      children: insertNodeIntoTree(current.children, parentId, node),
    };
  });
}

function syncBoundNodesForField(nodes: CanvasNode[], fieldId: string, field: ModelField): CanvasNode[] {
  return nodes.map((node) => {
    const nextNode = node.bindings?.fieldId === fieldId
      ? {
          ...node,
          type: field.type,
          props: {
            ...getComponentDefinition(field.type).createDefaultNode().props,
            ...node.props,
            label: field.name || node.props.label || field.type,
            placeholder: field.placeholder || '',
            required: field.required,
            readonly: field.readonly,
            hidden: field.hidden,
          },
        }
      : node;

    if (!nextNode.children?.length) {
      return nextNode;
    }

    return {
      ...nextNode,
      children: syncBoundNodesForField(nextNode.children, fieldId, field),
    };
  });
}

export interface TemplateDesignerStore {
  activeTab: TemplateDesignerTabKey;
  document: TemplateDesignerDocument | null;
  savedSnapshot: string;
  selectedFieldId: string | null;
  selectedNodeId: string | null;
  setDocument: (document: TemplateDesignerDocument) => void;
  setActiveTab: (tab: TemplateDesignerTabKey) => void;
  setSelectedFieldId: (fieldId: string | null) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
  addField: (type: string) => ModelField;
  updateField: (fieldId: string, patch: Partial<ModelField>) => void;
  insertNode: (parentId: string | null, node: CanvasNode) => void;
  addNodeFromField: (fieldId: string, parentId?: string | null) => void;
  bindFieldToNode: (nodeId: string, fieldId: string) => void;
  updateNodeProps: (nodeId: string, patch: Record<string, unknown>) => void;
  getCurrentPage: () => TemplateDesignerDocument['canvas']['pages'][number] | null;
  getSelectedNode: () => CanvasNode | null;
  getFieldById: (fieldId: string) => ModelField | null;
  addWorkflowNode: () => void;
  setWorkflowNodes: (nodes: TemplateDesignerDocument['workflow']['nodes']) => void;
  setWorkflowEdges: (edges: TemplateDesignerDocument['workflow']['edges']) => void;
  markSaved: () => void;
  isDirty: () => boolean;
}

export const useTemplateDesignerStore = create<TemplateDesignerStore>((set, get) => ({
  activeTab: 'model',
  document: null,
  savedSnapshot: '',
  selectedFieldId: null,
  selectedNodeId: null,
  setDocument: (document) => set({ document }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedFieldId: (selectedFieldId) => set({ selectedFieldId }),
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  addField: (type) => {
    const definition = getFieldTypeDefinition(type);
    const field = {
      ...definition.defaultField(),
      id: createId('field'),
      code: `${type}_${Date.now()}`,
    };
    set((state) => ({
      document: state.document
        ? {
            ...state.document,
            model: {
              ...state.document.model,
              fields: [...state.document.model.fields, field],
            },
          }
        : state.document,
      selectedFieldId: field.id,
    }));
    return field;
  },
  updateField: (fieldId, patch) => set((state) => {
    if (!state.document) {
      return { document: state.document };
    }

    let updatedField: ModelField | null = null;
    const nextFields = state.document.model.fields.map((field) => {
      if (field.id !== fieldId) return field;
      updatedField = { ...field, ...patch };
      return updatedField;
    });

    const nextPages = updatedField
      ? state.document.canvas.pages.map((page) => ({
          ...page,
          nodes: syncBoundNodesForField(page.nodes, fieldId, updatedField as ModelField),
        }))
      : state.document.canvas.pages;

    return {
      document: {
        ...state.document,
        model: {
          ...state.document.model,
          fields: nextFields,
        },
        canvas: {
          ...state.document.canvas,
          pages: nextPages,
        },
      },
    };
  }),
  insertNode: (parentId, node) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          canvas: {
            ...state.document.canvas,
            pages: state.document.canvas.pages.map((page) => (
              page.id === state.document?.canvas.currentPageId
                ? { ...page, nodes: insertNodeIntoTree(page.nodes, parentId, node) }
                : page
            )),
          },
        }
      : state.document,
    selectedNodeId: node.id,
  })),
  addNodeFromField: (fieldId, parentId = null) => {
    const field = get().getFieldById(fieldId);
    if (!field) return;
    const component = getComponentDefinition(field.type);
    const node = component.createDefaultNode();
    node.props = {
      ...node.props,
      label: field.name || component.label,
      placeholder: field.placeholder || '',
      required: field.required,
      readonly: field.readonly,
      hidden: field.hidden,
    };
    node.bindings = { ...node.bindings, fieldId: field.id };
    get().insertNode(parentId, node);
  },
  bindFieldToNode: (nodeId, fieldId) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          canvas: {
            ...state.document.canvas,
            pages: state.document.canvas.pages.map((page) => (
              page.id === state.document?.canvas.currentPageId
                ? {
                    ...page,
                    nodes: mapNodes(page.nodes, nodeId, (node) => ({
                      ...node,
                      bindings: { ...node.bindings, fieldId: fieldId || undefined },
                    })),
                  }
                : page
            )),
          },
        }
      : state.document,
  })),
  updateNodeProps: (nodeId, patch) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          canvas: {
            ...state.document.canvas,
            pages: state.document.canvas.pages.map((page) => (
              page.id === state.document?.canvas.currentPageId
                ? {
                    ...page,
                    nodes: mapNodes(page.nodes, nodeId, (node) => ({
                      ...node,
                      props: { ...node.props, ...patch },
                    })),
                  }
                : page
            )),
          },
        }
      : state.document,
  })),
  getCurrentPage: () => {
    const document = get().document;
    if (!document) return null;
    return document.canvas.pages.find((page) => page.id === document.canvas.currentPageId) ?? null;
  },
  getSelectedNode: () => {
    const page = get().getCurrentPage();
    const selectedNodeId = get().selectedNodeId;
    if (!page || !selectedNodeId) return null;
    return findNode(page.nodes, selectedNodeId);
  },
  getFieldById: (fieldId) => {
    const document = get().document;
    if (!document) return null;
    return document.model.fields.find((field) => field.id === fieldId) ?? null;
  },
  addWorkflowNode: () => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            nodes: [
              ...state.document.workflow.nodes,
              {
                id: createId('workflow-node'),
                position: {
                  x: 80 + state.document.workflow.nodes.length * 40,
                  y: 80 + state.document.workflow.nodes.length * 24,
                },
                data: {
                  label: `节点 ${state.document.workflow.nodes.length + 1}`,
                },
              },
            ],
          },
        }
      : state.document,
  })),
  setWorkflowNodes: (nodes) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            nodes,
          },
        }
      : state.document,
  })),
  setWorkflowEdges: (edges) => set((state) => ({
    document: state.document
      ? {
          ...state.document,
          workflow: {
            ...state.document.workflow,
            edges,
          },
        }
      : state.document,
  })),
  markSaved: () => {
    const document = get().document;
    set({ savedSnapshot: document ? JSON.stringify(document) : '' });
  },
  isDirty: () => {
    const { document, savedSnapshot } = get();
    if (!document) return false;
    return JSON.stringify(document) !== savedSnapshot;
  },
}));
