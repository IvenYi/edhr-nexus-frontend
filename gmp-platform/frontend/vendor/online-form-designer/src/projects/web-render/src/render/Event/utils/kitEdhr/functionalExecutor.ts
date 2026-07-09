import { message as Message } from 'ant-design-vue';
import { openDocumentFillingModal } from '../builtInMethods';
import {
  openEdhrReworkProcessModal,
  openEdhrTxnSplitModal,
  openLabelPrintModal,
  openTxnSourceInfoModal,
} from './modal';
import { EntityModelCategoryEnum } from '@gct/runtime';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

enum ETaskTypeEnum {
  FORM_NODE = 'form_node',
  CONFIG_NODE = 'config_node',
  LABEL_PRINT = 'label_print',
  INSPECTION_EXECUTE = 'inspection_execute',
  RELEASE_EXECUTE = 'release_execute',
}

interface ITxnExecutionConfig {
  /** 事务主体数据 */
  mainData: {
    id_: string;
    container_id_?: string;
    sn_id_?: string;
    product_id_?: string;
    isSn?: boolean;
    [key: string]: any;
  };
  /** 事务节点数据 */
  txnNodeData?: {
    component_key_: string;
    current_task_type_: ETaskTypeEnum;
    online_form_inst_id_: string;
    [key: string]: any;
  };
  /** 节点执行配置 */
  nodeConfig?: {
    /** 状态过滤 */
    status?: string[];
    /** 任务类型过滤 */
    taskType?: ETaskTypeEnum[];
    /** 特定任务类型的处理函数 */
    specificatedFunc?: {
      [key in ETaskTypeEnum]?: Function;
    };
    specificatedParams?: {
      [key in ETaskTypeEnum]?: any;
    };
  };
  /** 节点执行前的回调 */
  beforeFunc?: () => Promise<void> | void;
  /** 节点执行后的回调 */
  callback?: () => void;
}

export class FunctionalExecutor {
  /**
   * 事务执行
   * @param config{ITxnExecutionConfig} 事务执行配置
   * @returns
   */
  static async handleTxn(config: ITxnExecutionConfig) {
    const {
      mainData,
      txnNodeData: initialTxnNodeData,
      nodeConfig,
      beforeFunc,
      callback,
    } = config ?? {};

    if (beforeFunc && typeof beforeFunc === 'function') {
      await beforeFunc();
    }

    let txnNodeData: ITxnExecutionConfig['txnNodeData'] = initialTxnNodeData;
    if (!initialTxnNodeData) {
      const txnNodeRes =
        (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'em_txn_node_status',
            bsKey: 'biz_permissions_search',
          },
          {
            query: {
              'status_.in': nodeConfig?.status || ['waiting', 'running'],
              'current_task_type_.in': nodeConfig?.taskType || [
                'form_node',
                'config_node',
                'label_print',
              ],
              txn_inst_id_: mainData.id_ || mainData.txn_inst_id_,
            },
          },
        )) || ({} as any);
      txnNodeData = txnNodeRes?.data?.[0];
    }

    if (!txnNodeData) {
      Message.warn($t('sys.edhr.noTxnPermission'));
      return;
    }
    const { component_key_, current_task_type_, online_form_inst_id_, config_ } = txnNodeData;
    const taskSpecificatedFunc = nodeConfig?.specificatedFunc?.[current_task_type_];

    // 表单节点
    if (current_task_type_ === ETaskTypeEnum.FORM_NODE && online_form_inst_id_) {
      openDocumentFillingModal({
        selfId: online_form_inst_id_,
        callback: () => typeof callback === 'function' && callback(),
      });
    }
    // 配置节点
    if (current_task_type_ === ETaskTypeEnum.CONFIG_NODE) {
      if (component_key_ === 'component_rework') {
        //1. 返工
        const taskSpecificatedParams = nodeConfig?.specificatedParams?.['component_rework'];
        const extProps = taskSpecificatedParams || {};
        const isSn = mainData?.isSn || false;
        openEdhrReworkProcessModal({
          ...extProps,
          params: {
            ...mainData,
            taskType: isSn ? 'sn' : 'container',
            txn_inst_id_: mainData.id_ || mainData.txn_inst_id_,
            container_id_: !isSn ? mainData?.container_id_ : undefined,
            sn_id_: isSn ? mainData?.sn_id_ : undefined,
            product_id_: mainData?.product_id_,
          },
          callback: () => typeof callback === 'function' && callback(),
        });
      }
      if (component_key_ === 'component_split') {
        //2. 批次拆分
        openEdhrTxnSplitModal({
          params: mainData,
          callback: () => typeof callback === 'function' && callback(),
        });
      }
    }

    // 3. 标签打印节点
    if (current_task_type_ === ETaskTypeEnum.LABEL_PRINT) {
      const printConfig = typeof config_ === 'string' ? JSON.parse(config_ ?? '{}') : {};
      openLabelPrintModal({
        params: {
          txnInstId: mainData.id_,
          printTmplId: printConfig.printTmplId,
          printService: printConfig.printService,
          printNumber: printConfig.printNumber,
          templateType: printConfig.templateType,
        },
        callback: () => typeof callback === 'function' && callback(),
      });
    }

    // 4. 检验执行
    if (current_task_type_ === ETaskTypeEnum.INSPECTION_EXECUTE) {
      taskSpecificatedFunc && taskSpecificatedFunc();
    }

    // 5. 放行执行
    if (current_task_type_ === ETaskTypeEnum.RELEASE_EXECUTE) {
      taskSpecificatedFunc && taskSpecificatedFunc();
    }
  }

  /**
   * 查看事务来源详情
   * @param params.sourceType 事务来源类型 {'process_form': 流程表单, 'txn': 事务}
   * @param params.formInstId 在线表单实例ID
   * @param params.txnInstId 事务实例ID
   */
  static async viewTxnSource(params) {
    const { sourceType, formInstId, txnInstId } = params;
    if (!formInstId || !txnInstId) return;

    if (sourceType === 'process_form') {
      openDocumentFillingModal({
        title: $t('sys.onlineForm.formDetail'),
        selfId: formInstId,
        isViewPage: true,
      });
    } else {
      openTxnSourceInfoModal({ txnInstId });
    }
  }
}
