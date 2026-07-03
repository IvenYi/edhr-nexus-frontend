import { KeyMode, TransactionMode, PrintModeEnums } from '@gct/runtime';
import { openPaasOnlineFormUrl } from '/@online-form/views/render/__logic__/preview.logic';
import { message } from 'ant-design-vue';
import { GlobalLoading } from '../Modal/index';
import {
  postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postExcelDataValidate } from '/@/apis/gct-apaas/ExcelController';
import { postPrintLabelBackEndPrint } from '/@/apis/gct-apaas/PrintController';
import { usePrinter } from '/@/hooks/develop/usePrinter';
import { useApaasSi } from '/@online-form/views/integration/apaas_si/index';
import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/hooks/index';
import RecordBookEditorModal from '/@online-form/views/integration/apaas_ebr/record-book/editor/record-book-editor-modal.vue';
import { useRecordBookFill } from '/@online-form/views/integration/apaas_ebr/record-book/fill';
import { RenderModeEnum } from '@gct/nocode-base';
import exportTemplate from '../__component__/export-template.vue';
import importTemplate from '../__component__/import-template.vue';
import { downloadByData, downloadByUrl } from '/@/utils/file/download';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { PrintModeEnum, FileModeEnum } from '@gct/nocode-web-render';
import {
  getExcelTmplDetail,
  getExcelTmplDownloadById,
  getExcelTmplDownloadPlatById,
} from '/@/apis/gct-apaas/ExcelTmplController';
import { transformUrl } from '/@/components/Cropper/hooks/useFile';
import { useUserStore } from '/@/store/modules/user';
import {
  openDesignModal as openBizFlowDesignModal,
  modalProps as BizModalProps,
  PathModalProps as BizPathModalProps,
  openBizFlowPathModal,
} from '/@page-designer/_kit/kit-medpro/web/biz-process/components/process-design/index';
import {
  openEdhrSummaryModal,
  EdhrSummaryProps,
  openDesignModal,
} from '/@web-render/views/edhr-application/render/edhr-summary/index';
import DetailModal from '/@web-render/views/edhr-application/render/change-task/modals/detail.vue';
import { postSsUploadZip } from '/@/apis/gct-apaas/FileUploadController';

interface PrintProps {
  documentKey: string | TransactionMode;
  /**打印方式 */
  printMode: PrintModeEnums;
  modelKey: string;
  /**模版规则 */
  documentType: KeyMode;
  /**连接规则 */
  ruleConfig: any;
  /** 打印字段 */
  printField: string;
  /**单据字段 */
  fields: string[];
  /** 页面名称 */
  tTitle?: string;
  /** 是否需要更新打印状态 */
  updateStatus?: '0' | '1';
  /**模型 key */
  model?: string;
}

/**单据打印 */
export async function documentPrint(formData: object, props: PrintProps) {
  const {
    documentKey,
    fields,
    printMode,
    documentType,
    ruleConfig,
    printField,
    modelKey,
    tTitle,
    updateStatus,
    model = '',
  } = props;
  const data = fields.reduce(
    (preVal, curr) => {
      const value = formData[curr];
      if (curr && value) {
        preVal[curr] = value;
      }
      return preVal;
    },
    tTitle ? { gct_title_: encodeURIComponent(tTitle) } : {},
  );
  // if (isEmpty(data)) {
  //   message.warn('查询条件不能为空');
  //   return;
  // }
  const tid = await getReftemplatekey();
  if (!tid) {
    message.warn($t('sys.pageDesigner.pleaseSelectADocumentTemplate'));
    return;
  }

  const instance = GlobalLoading({});
  openPaasOnlineFormUrl({
    tid: tid,
    params: data,
    mode: printMode,
    instance,
    updateStatus: updateStatus ?? '0',
    model,
  });
  /**获取模版 */
  async function getReftemplatekey(): Promise<string> {
    if (documentType === KeyMode.SYSTEM) {
      return documentKey;
    } else if (documentKey === TransactionMode.CURRENT) {
      return formData[printField];
    } else {
      const { fieldKey, nodes } = ruleConfig;
      const dataIds = formData.id_ as string;
      return postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(
        { modelCategory: EntityModelCategoryEnum.ENTITY },
        {
          dataIds,
          fieldKey,
          modelKey,
          refModelChain: nodes,
        },
      );
    }
  }
}

interface LabelPrintProps {
  /**打印方式 */
  printMode: PrintModeEnums;
  /**打印模版key 或者模版的引用类型 */
  printKey: string | TransactionMode;
  printField: string;
  /**打印服务key */
  serverKey: string;
  /**关联模型 */
  modelKey: string;
  /**标签模版类型 */
  labelMode: KeyMode;
  /**打印机类型 */
  printType: KeyMode;
  /**打印字段key */
  printVal: string;
  /**连接规则 */
  ruleConfig: any;
  /**打印机链接规则 */
  printRuleConfig: any;
  /**网络打印机类型 或者打印机id*/
  printRefType: string | TransactionMode;
}
/**标签打印 */
export async function labelPrint(formdata: object, props: LabelPrintProps) {
  const {
    printType,
    printVal,
    printKey,
    serverKey,
    modelKey,
    labelMode,
    printMode,
    ruleConfig,
    printRuleConfig,
    printRefType,
    printField,
  } = props;
  const labelKey = await getReftemplatekey();
  if (printMode === PrintModeEnums.Local) {
    const { printLabelKey } = usePrinter();
    await printLabelKey(labelKey, formdata, {
      bizServiceKey: serverKey,
      printType: formdata.printType,
    });
  } else {
    //服务打印
    //  fieldKey, // 打印机字段key
    //  printerKey, // 系统打印机
    const dataId = formdata.id_ as string;
    const printData: { printerKey?: string; fieldKey?: string } = {};
    if (printType === KeyMode.SYSTEM) {
      printData.printerKey = printRefType;
    } else if (printRefType === TransactionMode.CURRENT) {
      printData.fieldKey = printVal;
    } else {
      /**网络打印机引用其他模型 */
      printData.printerKey =
        await postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(
          { modelCategory: EntityModelCategoryEnum.ENTITY },
          {
            dataIds: dataId,
            fieldKey: printRuleConfig.fieldKey,
            modelKey,
            refModelChain: printRuleConfig.nodes,
          },
        );
    }
    await postPrintLabelBackEndPrint({
      dataId, // 当前数据
      labelId: labelKey, // 标签模板key
      modelKey, // 当前模板key
      bizServiceKey: serverKey,
      ...printData,
    });
  }
  async function getReftemplatekey(): Promise<string> {
    if (labelMode === KeyMode.SYSTEM) {
      return printKey;
    } else if (printKey === TransactionMode.CURRENT) {
      return formdata[printField];
    } else {
      /**标签模版引用其他模型 */
      const { fieldKey, nodes } = ruleConfig;
      const dataId = formdata.id_ as string;
      return postModelComprehensiveQueryFieldValueByRefChainDataByModelCategory(
        { modelCategory: EntityModelCategoryEnum.ENTITY },
        {
          dataIds: dataId,
          fieldKey,
          modelKey,
          refModelChain: nodes,
        },
      );
    }
  }
}

interface IOnlineFormModalProps {
  /** 弹框类型 */
  modelType: 'modal' | 'drawer';
  /** 数据采集信息 */
  dataCollectionInfo?: any;
  /** 在线表单实例id */
  selfId?: string;
  /**弹框标题 */
  title?: string;
  /** 点击按钮后是否直接关闭弹框 */
  keep?: boolean;
  /** 表单显示模式(强制显示)【适用于基础表单预览查看】 */
  modeType?: RenderModeEnum;
  /** 打印配置 */
  printConfig?: {
    apiMode: PrintModeEnum;
    fileMode: FileModeEnum;
  };
  /**弹框关闭回调 */
  callback?: Function;
}

/** 在线表单填报 */
export async function onlineFormModal(props: IOnlineFormModalProps) {
  if (!props.dataCollectionInfo && !props.selfId) {
    message.error('不存在单据实例,无法操作,请联系管理员');
    return;
  }
  if (!props.modelType) return;

  const { openMedProDrawer } = useApaasSi();
  if (props.modelType === 'modal') {
    openMedProDrawer(props);
  } else if (props.modelType === 'drawer') {
    openMedProDrawer(props);
  }
}

interface IEDHRFillFullScreenModalProps {
  /** 物料编号 */
  materialNo: string;
  /** 选择的模板id */
  ofTmplId?: string;
  /** 选择的模板实例id */
  ofInstanceId?: string;
  /** 查看页面限制，只能操作固定表单 */
  viewPageLimit?: boolean;
  /** 是否是详情页面 */
  isViewPage?: boolean;
  /** 是否开启自动保存 */
  needAutoSave?: boolean;
  /** 参数 */
  params?: Record<string, any>;
  /** 弹框关闭回调 */
  callback?: Function;
}

export async function eDHRFillFullScreenModal(props: IEDHRFillFullScreenModalProps) {
  if (!props.materialNo) {
    message.error('不存在物料编号,无法操作,请联系管理员');
    return;
  }

  const { openFillWikiFullScreenModal } = useApaasEbr();
  openFillWikiFullScreenModal(props);
}

export async function openDocumentFillingModal(props) {
  if (!props.selfId) {
    message.error('不存在表单实例id,无法操作,请联系管理员');
    return;
  }

  const { _gct_custom_basic_info, ...otherProps } = props || {};
  if (_gct_custom_basic_info) {
    otherProps.renderFormInfo = DetailModal;
  }

  const { openSingleDrawer } = useApaasEbr();
  openSingleDrawer(otherProps);
}

type IOpenCreateRecordBookParams = {
  data?: any;
  type?: 'create' | 'view' | 'edit' | 'prem' | string;
  callback?: () => void;
};

export async function openCreateRecordBookModal({
  data,
  type,
  callback,
}: IOpenCreateRecordBookParams): Promise<boolean> {
  if (!type) {
    message.error('无法操作，请联系管理员');
    return false;
  }

  const params: Record<string, any> = {
    type,
    callback,
  };

  // 非 create 场景需要携带 rowData 并从后端拉取表单配置
  if (type !== 'create') {
    // 检查基本必须字段（根据后端要求调整）
    if (!data || !data.id_ || !data.tmpl_id_) {
      message.error('无法操作，缺少必要数据，请联系管理员');
      return false;
    }

    params.rowData = data;

    try {
      const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_notebook_fill_config',
          bsKey: 'getOne',
        },
        {
          query: {
            'tmpl_id_.eq': data.tmpl_id_.split(':')?.[1],
            'notebook_id_.eq': data.id_,
          },
        },
      );

      // 如果后端返回 data 字段则注入 formData
      if (res?.data) {
        params.formData = res.data;
      } else {
        message.warn('未找到表单配置，可能无法完整编辑');
      }
    } catch (err: any) {
      console.error('拉取表单配置失败：', err);
      message.error(err?.message ?? '获取表单配置失败，请重试或联系管理员');
      return false;
    }
  }

  try {
    gct.openUtil.fullScreen(RecordBookEditorModal, params);
    return true;
  } catch (err) {
    console.error('打开编辑器失败：', err);
    message.error('打开编辑器失败，请重试');
    return false;
  }
}

export async function openRecordBookFillModal(props): Promise<boolean> {
  const { openRecordBookFillFullModal } = useRecordBookFill();
  return openRecordBookFillFullModal(props);
}

/**
 * DHR汇总/全屏弹窗
 * @param props 弹窗参数
 */
export function eDHRSummaryFullModal(props: EdhrSummaryProps) {
  // const { openModal } = useEdhrSummary();
  openEdhrSummaryModal(props);
}

/**
 * 汇总配置/设计弹窗
 * @param props 弹窗参数
 */
export function eDHRSummaryDesignModal(props: { id: string; name: string }) {
  openDesignModal(props);
}

/** 导入*/
export async function importDataForModal(
  {
    tmplKey,
    modelKey,
    timeout = 20,
    ref_master_id_,
    ref_field_key_,
    useGetExcelTmplDownloadById = false,
    batchImport = false,
  },
  { onSuccess, onError },
) {
  gct.openUtil.modal(
    importTemplate,
    {
      tmplKey,
      ref_master_id_,
      ref_field_key_,
      batchImport,
      /**上传excle */
      async importFun(file, isMasterTable) {
        const formData = new FormData();
        formData.append('file', file);
        return batchImport
          ? postSsUploadZip(formData, {
              transferToConfig: {
                timeout: 300 * 1000,
                headers: {
                  'Content-Type': 'multipart/form-data;charset=UTF-8',
                },
              },
              errorMessageMode: 'none',
            })
          : postExcelDataValidate(
              formData,
              {
                modelKey,
                headerRowNo: 4,
                startRowNo: isMasterTable === 1 ? 5 : 6,
                tmplKey,
                ref_master_id_,
                ref_field_key_,
                importType: isMasterTable,
              },
              {
                transferToConfig: {
                  timeout: 300 * 1000,
                  headers: {
                    'Content-Type': 'multipart/form-data;charset=UTF-8',
                  },
                },
                errorMessageMode: 'none',
              },
            );
      },
      /**下载模版 */
      async downloadTemplate() {
        if (!tmplKey) return;
        try {
          if (useGetExcelTmplDownloadById) {
            const { data, headers } = await getExcelTmplDownloadById(
              { id: `${modelKey}$${tmplKey}` },
              {
                isReturnNativeResponse: true,
                transferToConfig: { responseType: 'blob', timeout: 20000 },
              },
            );
            const attachment = new URLSearchParams(
              headers?.['content-disposition'].replace('attachment;', '') || '',
            );
            const filename = attachment.get('filename') || '';
            downloadByData(data, { filename });
          } else {
            const { data, headers } = await getExcelTmplDownloadPlatById(
              { id: `${modelKey}$${tmplKey}` },
              {
                isReturnNativeResponse: true,
                transferToConfig: { responseType: 'blob', timeout: 20000 },
              },
            );
            const attachment = new URLSearchParams(
              headers?.['content-disposition'].replace('attachment;', '') || '',
            );
            const filename = attachment.get('filename') || '';
            downloadByData(data, { filename });
          }
        } catch (error) {}
      },
      onSuccess,
      onError,
    },
    {
      title: batchImport ? $t('sys.pageDesigner.batchImport') : $t('sys.app.importExcel'),
      width: '1080px',
      height: '748px',
      showFooter: false,
    },
  );
}

/** 导出 */
export async function exportDataForModal(
  {
    tmplKey,
    modelCategory = EntityModelCategoryEnum.ENTITY,
    modelKey,
    action,
    timeout = 20,
    queryData = {},
  },
  { onSuccess, onError },
) {
  gct.openUtil.modal(
    exportTemplate,
    {
      async exportFun() {
        let number = 0;
        let download;
        let exportInfo = [];
        try {
          const { data, headers } =
            (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
              { modelCategory, modelKey, bsKey: action },
              { tmplKey, ...queryData },
              { tmplKey },
              {
                isReturnNativeResponse: true,
                transferToConfig: { responseType: 'blob', timeout: 300 * 1000 },
              },
            )) as any;
          if (data) {
            const attachment = new URLSearchParams(
              headers?.['content-disposition'].replace('attachment;', '') || '',
            );
            exportInfo = headers?.report
              ? Array.isArray(JSON.parse(headers?.report))
                ? JSON.parse(headers?.report)
                : [JSON.parse(headers?.report)]
              : [];
            const filename = attachment.get('filename') || '';
            download = () => downloadByData(data, { filename });
            number = attachment.get('totalCount') || 0;
          }
          onSuccess && onSuccess();
        } catch (error) {
          onError && onError();
        }
        return { number, download, exportInfo };
      },
    },
    {
      title: $t('sys.app.exportExcel'),
      width: '1080px',
      height: '748px',
      showFooter: false,
    },
  );
}

/** 获取当前登录信息 */
export async function getCurrentUserInfo() {
  const userStore = useUserStore();
  return userStore.userInfo;
}
interface BizFlowProps extends BizModalProps, BizPathModalProps {
  instMode?: boolean;
}

/**
 * 打开业务流的设计界面
 * @param props
 * @param instMode 只显示流程路径
 */
export async function openBizFlowModal(props: BizFlowProps, instMode = false) {
  if (instMode) {
    openBizFlowPathModal(props);
  } else openBizFlowDesignModal(props);
}
