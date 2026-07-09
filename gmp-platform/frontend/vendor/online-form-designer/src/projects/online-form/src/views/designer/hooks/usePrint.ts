import { ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { DesignMode } from '../enums';
import { useSpreadSheet } from './useSpreadSheet';
import { useModelFields } from './useModelFields';
import { message } from 'ant-design-vue';
import type { OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';
import {
  getLocalDesignerDocument,
  getLocalDesignerFieldList,
  getLocalDesignerModelInfo,
  isLocalDesignerId,
  saveLocalDesignerDocument,
} from './local-designer-cache';

const { setDoc, setSheetMaps, setDesignMode, setCallback, platformType } = useSpreadSheet();
const { initMasterModel } = useModelFields();
const { t } = useI18n();

const loading = ref<boolean>(false);
const apiEnv = ref();

const FormTypeEnum = {
  FILE: 'FILE',
  TEXT: 'TEXT',
  VIEW: 'VIEW',
} as const;

const ViewTypeEnum = {
  VIEW_SQL: 'SQL',
  VIEW_MODEL: 'VIEW_MODEL',
  VIEW_JS: 'JS',
} as const;

const PlatformEnum = {
  INTEGRATION_PAAS_SI: 'INTEGRATION_PAAS_SI',
} as const;

const jsEngineExecByKeyHook = (api, params) => (query) => {
  return api(
    {
      key: params.bindKey,
    },
    query,
  );
};
/** 是否启用反向建模 */
const enableReverseModeling = ref(false);

/**
 * 打印模版
 * @returns
 */
export function usePrint() {
  let formTmplConfig = '';
  const formTmplConfigC = {
    setConfigStr(value?: string) {
      formTmplConfig = value || '';
    },
    getConfigStr() {
      return formTmplConfig;
    },
  };
  /**
   * 初始化
   * @param id
   * @param [designMode]
   * @param [isDesignView] 是否是电子表单的设计界面
   */

  async function initialize(
    id: string,
    designMode?: DesignMode,
    isDesignView?: boolean,
    env?: string,
    model?: string,
  ) {
    apiEnv.value = env;
    try {
      loading.value = true;
      await _initialize(id, designMode, isDesignView, model);
    } finally {
      loading.value = false;
    }
  }

  async function _initialize(
    id: string,
    designMode?: DesignMode,
    isDesignView?: boolean,
    model?: string,
  ) {
    const isLocalDesigner = isLocalDesignerId(id);
    const remoteApis = isLocalDesigner
      ? undefined
      : await import('./remote-apis').then(({ loadRemoteApis }) => loadRemoteApis());
    const api = remoteApis?.apis[platformType.value];

    let res;
    if (isLocalDesigner) {
      res = getLocalDesignerDocument(id);
    } else if (model) {
      // 通过模型设计维护后，需要走业务服务接口
      res = (
        await remoteApis!.modelComprehensiveController.getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            bsKey: 'biz_info',
            modelKey: model,
            modelCategory: 'entity',
          },
          {
            id: id,
          },
        )
      )?.data;
    } else {
      res = await api!.getDocument(
        {
          id,
        },
        apiEnv.value
          ? {
              headers: {
                Env: apiEnv.value,
              },
            }
          : {},
      );
    }

    if (res?.formType === FormTypeEnum.FILE) {
      setDoc(res);
      return;
    }

    const fieldApis = isLocalDesigner
      ? {
          getFieldMetaList: ({ modelKey }) => getLocalDesignerFieldList(modelKey),
          getModelMetaSubModelList: () => [],
          getModelDetail2FieldList: () => getLocalDesignerModelInfo(),
        }
      : {};
    if (platformType.value === PlatformEnum.INTEGRATION_PAAS_SI) {
      if (res?.formType === FormTypeEnum.VIEW) {
        const apis = {
          getFieldMetaList: null,
          getModelMetaSubModelList: null,
          getModelDetail2FieldList: null,
          getViewModelFieldList: null,
          getViewSqlFieldList: null,
          getViewJsFieldList: null,
        };

        if (res?.viewType === ViewTypeEnum.VIEW_SQL) {
          Object.assign(fieldApis, apis, {
            getViewSqlFieldList: remoteApis!.sqlViewModelController.getSqlViewModelInfo,
          });
        } else if (res?.viewType === ViewTypeEnum.VIEW_MODEL) {
          Object.assign(fieldApis, apis, {
            getViewModelFieldList: remoteApis!.viewModelController.getViewModelInfo,
          });
        } else if (res?.viewType === ViewTypeEnum.VIEW_JS) {
          Object.assign(fieldApis, apis, {
            getViewJsFieldList: jsEngineExecByKeyHook(
              remoteApis!.jsEngineController.getJsEngineExecByKey,
              {
                bindKey: res?.bindKey,
              },
            ),
          });
        }
      }
    }

    // 非文本表单类型初始化模型数据
    if (res?.formType !== FormTypeEnum.TEXT && res?.modelKey) {
      await initMasterModel(
        {
          key: res?.modelKey,
          name: res?.modelName,
        },
        fieldApis,
      );
    }

    /** 是否使用暂存逻辑存取数据，普通模式的流程和普通表单才支持 */
    enableReverseModeling.value =
      !isLocalDesigner &&
      !!isDesignView &&
      remoteApis!.reverseModeling.isReverseModelingEnabled(res as OnlineFormTmplResponse);

    if (enableReverseModeling.value) {
      // 普通表单的设计模式下，额外请求暂存数据并合并
      const stashData = await remoteApis!.onlineFormTmplController.getOnlineFormTmplStash({
        id: id,
      });
      Object.assign(res!, stashData);
      console.log('stashData', stashData);
    }

    // 表单bom信息
    const formTmplBomList = isLocalDesigner
      ? []
      : await remoteApis!.onlineFormTmplController.getOnlineFormTmplGetBomByFormTmplId({ id });
    res.formTmplBomList = formTmplBomList ?? [];

    setDoc(res);
    formTmplConfigC.setConfigStr(res.communicationConfig);

    // setPaper({
    //   ...cloneDeep(DefaultPaper),
    //   ...createPaperConfig(res),
    //   ...JSON.parse(res?.designerJson || '{}'),
    // });
    setSheetMaps(res?.designerJson ? JSON.parse(res.designerJson) : null, res);

    /** 在线表单集成 */
    if (platformType.value === PlatformEnum.INTEGRATION_PAAS_SI) {
      setDesignMode(designMode ?? DesignMode.Collect);
    }

    setCallback({
      save: async (data) => {
        data.communicationConfig = formTmplConfigC.getConfigStr();
        if (isLocalDesigner) {
          saveLocalDesignerDocument(data);
        } else if (enableReverseModeling.value) {
          await remoteApis!.onlineFormTmplController.putOnlineFormTmplStashById({ id }, data);
        } else if (model) {
          await remoteApis!.modelComprehensiveController.putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
            {
              bsKey: 'updateById',
              modelKey: model,
              modelCategory: 'entity',
            },
            {
              designer_json_: data.designerJson,
              runtime_json_: data.runtimeJson,
              direction: data.direction,
            },
            {
              id: id,
            },
            {
              transferToConfig: {
                Env: apiEnv.value,
              },
            },
          );
        } else {
          await api!.saveDocument(
            { id },
            data,
            apiEnv.value
              ? {
                  headers: {
                    Env: apiEnv.value,
                  },
                }
              : {},
          );
        }
        message.success(t('sys.saveSuccess'), 1);
      },
      publish: async (data, msg: string = $t('sys.onlineForm.formPublishedSuccessfully')) => {
        if (isLocalDesigner) {
          saveLocalDesignerDocument(data);
          message.success(msg, 1);
          return;
        }

        await remoteApis!.onlineFormTmplController.postOnlineFormTmplRelease(data, { tmplId: id });
        message.success(msg, 1);
      },
    });

    /**
     * 设置上传api
     */
    loading.value = false;
  }

  return {
    loading,
    initialize,
    enableReverseModeling,
  };
}
