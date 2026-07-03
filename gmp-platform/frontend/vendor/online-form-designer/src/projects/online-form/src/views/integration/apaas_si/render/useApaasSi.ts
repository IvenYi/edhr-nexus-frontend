import { GctDialog } from '/@/utils/Dialog';
import PaasSiFormBuilderModal from './PaasSiFormBuilderModal.vue';

export function useApaasSi() {
  /**
   * 打开在线表单填报弹框
   * @param options.selfId    在线表单实例id
   * @param options.title     弹框标题
   * @param options.keep      点击按钮后是否直接关闭弹框
   * @param options.modeType  表单显示模式(强制显示)【适用于基础表单预览查看】
   * @param options.isViewPage      是否是查看页面
   * @param options.params    参数
   * @param options.callback  弹框关闭回调
   */
  function openMedProDrawer(options) {
    const isViewPage = options.isViewPage ?? options.modeType === 'view-mode';

    const paramExtraProps = { ...(options.params || options?.params || {}) };

    // 如果是详情页面增加行高自适应
    if (!('_gct_useDynRowHeight_' in paramExtraProps) && isViewPage) {
      paramExtraProps._gct_useDynRowHeight_ = true;
    }

    console.log('openMedProDrawer paramExtraProps', paramExtraProps);

    GctDialog.open(PaasSiFormBuilderModal, {
      selfId: options.selfId,
      keep: options.keep,
      modeType: options.modeType,
      isViewPage: isViewPage,
      needAutoSave: !isViewPage,
      paramExtraProps: paramExtraProps,
      callback: options.callback,
      showRightBtns: options?.showRightBtns,
      readonlyInstance: options?.readonlyInstance,
      dataCollectionInfo: options?.dataCollectionInfo,
      printConfig: options?.printConfig,
      options: {
        title: options?.title ?? $t('sys.onlineForm.formOperations'),
      },
    });
  }

  return {
    openMedProDrawer,
  };
}
