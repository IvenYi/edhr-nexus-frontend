/**
 * Word 触发主工程交互
 */

import { GctDialog } from '../utils/Dialog';
import { OnlineFormModelModal } from '@gct/runtime-web';
import InputParamModal from '/@online-form/views/designer/modules/panel/panel-data-init-config/common/add-ipaas/input-param-modal.vue';
import OutParamModal from '/@online-form/views/designer/modules/panel/panel-data-init-config/common/add-ipaas/out-param-modal.vue';
import { selectAndInitFieldMap } from '/@online-form/components/device';

type TriggerName =
  // 数据初始化 数据源 选择表单模型弹框
  | 'OPEN_DATA_INIT_DATASOURCE_FORM_MODEL_MODAL'
  // 数据初始化 数据源 入参配置弹框
  | 'OPEN_DATA_INIT_DATASOURCE_INPUT_PARAMS_MODAL'
  // 数据初始化 数据源 出参配置弹框
  | 'OPEN_DATA_INIT_DATASOURCE_OUTPUT_PARAMS_MODAL'
  // 数据加载 设备互联 添加参数映射
  | 'OPEN_DATA_LOAD_DEVICE_INTERCONNECTION_ADD_PARAM_MAPPING_MODAL';

export const triggerHandler = async (name: TriggerName, options?: any) => {
  return new Promise((resolve, reject) => {
    if (name === 'OPEN_DATA_INIT_DATASOURCE_FORM_MODEL_MODAL') {
      gct.openUtil
        .modal(OnlineFormModelModal, options, {
          title: '表单模型选择',
          width: 800,
          okText: '确定',
          okButtonProps: {
            disabled: true,
          },
        })
        .then(resolve);
    } else if (name === 'OPEN_DATA_INIT_DATASOURCE_INPUT_PARAMS_MODAL') {
      GctDialog.open(InputParamModal, {
        ...options,
        callback: resolve,
      });
    } else if (name === 'OPEN_DATA_INIT_DATASOURCE_OUTPUT_PARAMS_MODAL') {
      GctDialog.open(OutParamModal, {
        ...options,
        callback: resolve,
      });
    } else if (name === 'OPEN_DATA_LOAD_DEVICE_INTERCONNECTION_ADD_PARAM_MAPPING_MODAL') {
      selectAndInitFieldMap().then(resolve);
    } else {
      reject(new Error(`Unknown trigger name: ${name}`));
    }
  });
};
