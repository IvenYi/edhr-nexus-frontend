import { message } from 'ant-design-vue';
import { LOCAL_FORM_DESIGNER_ID, saveLocalDesignerDocument } from '../hooks/local-designer-cache';
import { usePrint } from '../hooks/usePrint';
import { useSpreadSheet } from '../hooks/useSpreadSheet';
import { uploaderFiles } from '/@/utils/file/download';
import type {
  HostedDesignerSnapshot,
  TemplateDesignerTabKey,
  TemplateDesignerBridgeMessage,
  TemplateDesignerHostEvent,
  TemplateDesignerSavePayload,
} from './template-designer-protocol';
import { isTemplateDesignerBridgeMessage } from './template-designer-protocol';

function postHostEvent(event: TemplateDesignerHostEvent) {
  window.parent?.postMessage(event, '*');
}

function parseJsonObject(input?: string | null) {
  if (!input) return undefined;
  try {
    const parsed = JSON.parse(input);
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch (error) {
    console.warn(error);
    return undefined;
  }
}

function resolveDesignerJson(snapshot: HostedDesignerSnapshot) {
  return snapshot.designerPayload.canvasDesignJson || snapshot.designerPayload.modelDesignJson || '';
}

function primeLocalDesignerDocument(snapshot: HostedDesignerSnapshot) {
  const designerJson = resolveDesignerJson(snapshot);
  saveLocalDesignerDocument({
    name: snapshot.templateName || '表单模板设计',
    version: snapshot.versionLabel || 'V1',
    designerJson: parseJsonObject(designerJson) ? designerJson : undefined,
    runtimeJson: snapshot.designerPayload.workflowDesignJson || '',
  });
}

function toHostSavePayload(data: { designerJson?: string; runtimeJson?: string }): TemplateDesignerSavePayload {
  return {
    modelDesignJson: data.designerJson || '',
    canvasDesignJson: data.designerJson || '',
    workflowDesignJson: data.runtimeJson || '',
  };
}

export function requestHostClose() {
  postHostEvent({ type: 'close-request' });
}

interface HostedDesignerRuntimeOptions {
  setActiveTab?: (tab: TemplateDesignerTabKey) => void;
}

export async function initializeHostedDesigner(options: HostedDesignerRuntimeOptions = {}) {
  const { initialize } = usePrint();
  const {
    setCallback,
    sheetsHasChanged,
    save,
    exportDesignSnapshot,
    doc,
    globalSubTables,
    validateImportFile,
    importFileToPaper,
    removeThead,
    removeSubTable,
  } = useSpreadSheet();

  let initialized = false;
  let currentHostSnapshot: HostedDesignerSnapshot | null = null;

  const handleImportTemplate = async () => {
    const files = await uploaderFiles({
      accept: '.xlsx,.xlsm,.docx,.xls,.doc',
    });
    const file = files[0];
    if (!file || !validateImportFile(file)) return;

    const payload = {
      autoDetectFields: true,
      withFields: ['BASE', 'PROCESS'].includes(doc.value.formType as string),
    };
    const importPayload =
      /\.(docx?|DOCX?)$/.test(file.name)
        ? { ...payload, withFields: false }
        : payload;

    removeThead();
    for (const item of globalSubTables.value) {
      removeSubTable(item);
    }
    await importFileToPaper(file, importPayload);
    postHostEvent({ type: 'dirty-change', dirty: sheetsHasChanged() });
  };

  const handleSimulateFillSnapshotRequest = async () => {
    const saveData = await exportDesignSnapshot();
    saveLocalDesignerDocument(saveData);
    const snapshot: HostedDesignerSnapshot = {
      templateId: currentHostSnapshot?.templateId ?? doc.value.id ?? LOCAL_FORM_DESIGNER_ID,
      versionId: currentHostSnapshot?.versionId ?? doc.value.version ?? '',
      templateName: currentHostSnapshot?.templateName ?? doc.value.name ?? '表单模板',
      versionLabel: currentHostSnapshot?.versionLabel ?? doc.value.version ?? 'V1',
      designerPayload: toHostSavePayload(saveData),
    };
    postHostEvent({ type: 'simulate-fill-snapshot', snapshot });
  };

  const handleMessage = async (event: MessageEvent) => {
    if (!isTemplateDesignerBridgeMessage(event.data)) return;
    const data: TemplateDesignerBridgeMessage = event.data;

    if (data.type === 'close') {
      return;
    }

    if (data.type === 'save') {
      try {
        await save();
      } catch (error) {
        postHostEvent({
          type: 'error',
          message: error instanceof Error ? error.message : '保存失败',
        });
      }
      return;
    }

    if (data.type === 'set-active-tab') {
      options.setActiveTab?.(data.tab);
      return;
    }

    if (data.type === 'import-template') {
      try {
        await handleImportTemplate();
      } catch (error) {
        postHostEvent({
          type: 'error',
          message: error instanceof Error ? error.message : '模板导入失败',
        });
      }
      return;
    }

    if (data.type === 'simulate-fill-snapshot-request') {
      try {
        await handleSimulateFillSnapshotRequest();
      } catch (error) {
        postHostEvent({
          type: 'error',
          message: error instanceof Error ? error.message : '模拟填报快照生成失败',
        });
      }
      return;
    }

    if (data.type === 'save-success') {
      postHostEvent({ type: 'dirty-change', dirty: false });
      message.success('保存成功', 1);
      return;
    }

    if (data.type === 'save-error') {
      message.error(data.message || '保存失败', 1);
      return;
    }

    if (data.type !== 'init' || initialized) {
      return;
    }

    try {
      initialized = true;
      currentHostSnapshot = data.design;
      primeLocalDesignerDocument(data.design);
      await initialize(LOCAL_FORM_DESIGNER_ID);
      setCallback({
        save: async (saveData) => {
          saveLocalDesignerDocument(saveData);
          postHostEvent({ type: 'save-request', payload: toHostSavePayload(saveData) });
        },
      });
      postHostEvent({ type: 'dirty-change', dirty: sheetsHasChanged() });
    } catch (error) {
      initialized = false;
      postHostEvent({
        type: 'error',
        message: error instanceof Error ? error.message : '设计器初始化失败',
      });
    }
  };

  window.addEventListener('message', handleMessage);
  postHostEvent({ type: 'ready' });

  return () => {
    window.removeEventListener('message', handleMessage);
  };
}
