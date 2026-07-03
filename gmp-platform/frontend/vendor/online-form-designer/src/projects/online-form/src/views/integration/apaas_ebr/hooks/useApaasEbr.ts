import { GctDialog } from '/@/utils/Dialog';
// import EbrEdhrFillModal from '../render/ebr-edhr-fill-modal.vue';
import EbrEdhrFillModal from '../ebr-view/ebr-edhr-fill-modal.vue';
import { PaasSiFormBuilderModal } from '/@online-form/views/integration/apaas_si/index';
import EdhrInstanceRelationList from '../modal/edhr-instance-relation-list.vue';
import EdhrLog from '../../../../components/edhr-log/index.vue';
import WordFormBuilderModal from '../../../../word-render/components/word-form-builder-modal.vue';
import { OfficeTypeEnum } from '@gct/nocode-base';

export function useApaasEbr() {
  /**
   * 打开eDHR实例关联关系列表
   */
  async function openLinkList(materialNo, edhrSelfId, rolePerm) {
    GctDialog.open(EdhrInstanceRelationList, {
      baseProps: {
        currentMaterialNo: materialNo,
        edhrSelfId: edhrSelfId,
        roleEdhrButtonPerm: rolePerm,
      },
      options: {
        title: $t('sys.pageDesigner.refList'),
      },
    });
  }

  /** eDHR查看 */
  function openEdhrViewDrawer(materialNo) {
    gct.openUtil.fullScreen(EbrEdhrFillModal, {
      materialNo: materialNo,
      isViewPage: true,
      needAutoSave: false,
      paramExtraProps: { _gct_useDynRowHeight_: true },
    });
  }

  /**
   * @param options.officeType    在线表单类型
   * @param options.selfId    在线表单实例id
   * @param options.modelKey  在线表单主模型 key
   * @param options.title     弹框标题
   * @param options.keep      点击按钮后是否直接关闭弹框
   * @param options.isViewPage  是否是详情页面
   * @param options.params    参数
   * @param options.callback  弹框关闭回调
   */
  function openSingleDrawer(options) {
    const { officeType = OfficeTypeEnum.EXCEL, selfId, modelKey, params = {} } = options;
    // 只有对应上的实例才能根据字段内容进行高亮
    if (selfId && params._gct_nocode_trace_values_) {
      options.params = { ...params, _gct_nocode_of_instance_id_: selfId };
    }

    const paramExtraProps = { ...(options.params || options?.params || {}) };

    // 如果是详情页面增加行高自适应
    if (!('_gct_useDynRowHeight_' in paramExtraProps) && options.isViewPage) {
      paramExtraProps._gct_useDynRowHeight_ = true;
    }

    console.log('openSingleDrawer paramExtraProps', paramExtraProps);

    if (officeType === OfficeTypeEnum.EXCEL) {
      GctDialog.open(PaasSiFormBuilderModal, {
        selfId: options.selfId,
        materialNo: options.materialNo,
        keep: options.keep,
        isViewPage: options.isViewPage,
        needAutoSave: !options.isViewPage,
        paramExtraProps,
        renderFormInfo: options.renderFormInfo,
        showRightBtns: options.showRightBtns,
        options: {
          title: options?.title ?? $t('sys.onlineForm.formOperations'),
        },
        callback: options.callback,
      });
    } else if (officeType === OfficeTypeEnum.WORD) {
      GctDialog.open(WordFormBuilderModal, {
        selfId: options.selfId,
        materialNo: options.materialNo,
        modelKey: modelKey,
        keep: options.keep,
        isViewPage: options.isViewPage,
        paramExtraProps,
        options: {
          title: options?.title ?? $t('sys.onlineForm.formOperations'),
        },
        callback: options.callback,
      });
    }
  }

  /**
   * eDHR填报
   * @param options.materialNo    物料编号
   * @param options.ofTmplId      选择的模板id
   * @param options.ofInstanceId  选择的模板实例id
   * @param options.viewPageLimit 查看页面限制，只能操作固定表单
   * @param options.isViewPage    是否是详情页面
   * @param options.needAutoSave  是否开启自动保存
   * @param options.params        参数
   * @param options.callback      弹框关闭回调
   * @param options.formInstBtnPerKey    formInstBtnPerKey
   * @param options.sopList    sop集合(可选)
   */
  function openFillWikiFullScreenModal(options) {
    const { ofInstanceId, params = {} } = options;

    // 只有对应上的实例才能根据字段内容进行高亮
    if (ofInstanceId && params._gct_nocode_trace_values_) {
      options.params = { ...params, _gct_nocode_of_instance_id_: ofInstanceId };
    }

    const paramExtraProps = { ...(options.params || options?.params || {}) };

    // 如果是详情页面增加行高自适应
    if (!('_gct_useDynRowHeight_' in paramExtraProps) && options.isViewPage) {
      paramExtraProps._gct_useDynRowHeight_ = true;
    }

    console.log('openFillWikiFullScreenModal paramExtraProps', paramExtraProps);

    gct.openUtil.fullScreen(EbrEdhrFillModal, {
      materialNo: options.materialNo,
      ofInstanceId,
      ofTmplId: options.ofTmplId,
      viewPageLimit: options.viewPageLimit,
      isViewPage: options.isViewPage,
      needAutoSave: options.needAutoSave,
      pageType: options.pageType,
      paramExtraProps,
      callback: options.callback,
      taggedMap: options.taggedMap,
      formInstBtnPerKey: options.formInstBtnPerKey,
      sopList: options.sopList,
    });
  }

  function openEdhrLogDrawer({ instanceId }) {
    gct.openUtil.drawer(
      EdhrLog,
      {
        instanceId: instanceId,
      },
      {
        title: $t('sys.developer.appCenter.operationLog'),
        width: 800,
      },
    );
  }

  return {
    openSingleDrawer,
    openEdhrViewDrawer,
    openFillWikiFullScreenModal,
    openLinkList,
    openEdhrLogDrawer,
  };
}
