import {
  DeviceLink,
  DeviceLinkTmplUtil,
  FormModelController,
  FormTmplConfigController,
  useFormModel,
  useFormTmplConfig,
} from '@gct/nocode-base';
import EditTmplModal from './tmpl/edit-tmpl-modal.vue';
import TmplDetailDrawer from './tmpl/tmpl-detail-drawer.vue';
import SelectTmplDrawer from './tmpl-select/select-tmpl-drawer.vue';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleFilled } from '@ant-design/icons-vue';
import { createVNode } from 'vue';

export type { DeviceLink };
/**
 * 便捷使用设备互联模板编辑功能
 * @export
 */
export function useDeviceTmpl(
  opts: {
    formModelController?: FormModelController;
    formTmplConfigController?: FormTmplConfigController;
  } = {},
) {
  // 传递表单模板字段控制器，如果不传则从inject里取
  let c = opts.formModelController;
  if (!c) {
    const { injectController } = useFormModel();
    c = injectController();
  }
  let tmplC = opts.formTmplConfigController;
  if (!tmplC) {
    tmplC = useFormTmplConfig().injectController();
  }

  /** 确认是否新建 */
  const isConfirmCreate = async () => {
    return new Promise((resolve, reject) => {
      Modal.confirm({
        title: $t('sys.onlineForm.confirmCompletion'),
        content: $t('sys.onlineForm.saveConfigurationAsNewLoadingTemplate'),
        icon: createVNode(ExclamationCircleFilled),
        okText: $t('sys.okText'),
        cancelText: $t('sys.cancelText'),
        closable: false,
        centered: true,
        onOk: async () => {
          resolve(true);
        },
        onCancel: () => {
          reject();
        },
      });
    });
  };

  const createOrUpdateApi = async (tmpl: DeviceLink.BasicTmpl) => {
    try {
      await tmplC!.createOrUpdate(tmpl);
    } catch (error) {
      message.error(error.message);
      return false;
    }
    return true;
  };

  /** 创建模板 */
  async function createTmpl() {
    const tmpl = DeviceLinkTmplUtil.createTmpl(
      tmplC!.state.IOTPermission
        ? DeviceLink.TmplTypeEnum.DEVICE_INTERCONNECTION
        : DeviceLink.TmplTypeEnum.AI_OCR,
    );
    const res = await gct.openUtil.modal<{
      ok: boolean;
      data: DeviceLink.BasicTmpl;
    }>(
      EditTmplModal,
      {
        tmpl,
        formModelController: c,
        tmplController: tmplC,
        beforeOkClose: async (tmpl) => {
          await isConfirmCreate();
          return createOrUpdateApi(tmpl);
        },
      },
      {
        title: $t('sys.edhr.addTmpl'),
        width: '800px',
        height: '678px',
      },
    );
    return res;
  }

  /** 编辑模板 */
  async function editTmpl(tmpl: DeviceLink.BasicTmpl) {
    const res = await gct.openUtil.modal<{
      ok: boolean;
      data: DeviceLink.BasicTmpl;
    }>(
      EditTmplModal,
      {
        tmpl,
        formModelController: c,
        beforeOkClose: createOrUpdateApi.bind(this),
      },
      {
        title: $t('sys.onlineForm.editTemplate'),
        width: '800px',
        height: '678px',
      },
    );
    return res;
  }

  /** 打开模板详情 */
  function openTmplDetail(tmpl: DeviceLink.BasicTmpl) {
    gct.openUtil.drawer(
      TmplDetailDrawer,
      {
        tmpl,
        formModelController: c,
      },
      {
        title: $t('sys.onlineForm.templateDetails'),
        width: '800px',
      },
    );
  }

  /**
   * 打开选择模板抽屉
   *
   * @param opts
   * @return {*}
   */
  async function selectTmpl(opts: { runningTmplIds?: string[] }) {
    const res = await gct.openUtil.drawer<any>(
      SelectTmplDrawer,
      {
        runningTmplIds: opts.runningTmplIds,
        formModelController: c,
        formTmplConfigController: tmplC,
      },
      {
        title: $t('sys.edhr.selectDeviceTmpl'),
        width: '356px',
        showFooter: true,
        class: 'gct-ant-drawer',
      },
    );
    if (res.ok) {
      return res.data as DeviceLink.BasicTmpl;
    }
  }

  return {
    createTmpl,
    editTmpl,
    openTmplDetail,
    selectTmpl,
  };
}
