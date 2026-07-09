import {
  CategoryModuleEnum,
  EdhrVersionAction,
  EdhrVersionActionMap,
  EdhrVersionActions,
  EdhrVersionParentActions,
  ControlAction,
  ApproveControlAction,
} from '../constant';
import { debounce } from 'lodash-es';
import { FormTypeEnum } from '@gct/nocode-base';
import { EdhrDetailDrawer, EdhrModal } from '../edhr';
import { message, Modal } from 'ant-design-vue';
import { useCommonVersion } from './useFormVersion';
import {
  deleteEdhrTmplRemoveVersionById,
  getEdhrTmplGetVersionById,
  postEdhrTmplCopyById,
  postEdhrTmplCopyVersionById,
  postEdhrTmplSave,
  postEdhrTmplSaveVersion,
  putEdhrTmplSetDefaultById,
  putEdhrTmplUpdateVersionByIdById,
} from '/@/apis/gct-apaas/EdhrTmplController';
import { EdhrTmplRequest, FormRelateDTO } from '/@/apis/gct-apaas/model';
import { reactive } from 'vue';
import { BasicAction } from '/@web-render/utils/UserappPermissions';
import { executeControlAction } from './useControl';
import { executeApprovalControlAction } from './useApproveControl';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
import { useCategory } from './useCategory';
import { isEnableDocControl } from '/@online-form/views/web-render/hooks/useControl';
import { DhrPermissionEnum } from '/@/perms/index';
import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
import { getDocOutlineList } from '/@/apis/gct-apaas/DocOutlineController';
import { postOnlineFormTmplInfos } from '/@/apis/gct-apaas/OnlineFormTmplController';
import { TracingBackToThePast } from '/@web-render/render/Event/Modal';

export function useEdhrVersion(categoryModule = CategoryModuleEnum.EDHR) {
  const appInfoStore = useAppInfoStore();
  const inEDHRApp = appInfoStore.appInfo.suiteKey === 'eDHR';
  const commons = useCommonVersion(categoryModule, inEDHRApp);
  const { getCategoryName } = useCategory({ module: categoryModule });
  const { fetchParams, form2dhrUsePerms, load } = commons;
  const enableDocControl = isEnableDocControl();
  /** 根据权限计算实际的操作 */
  function calcActions(actions: Array<EdhrVersionAction | ControlAction | ApproveControlAction>) {
    return actions
      .filter((action) => {
        const authAction = EdhrVersionActionMap[action]?.authAction;
        if (!authAction) return true;

        const key = inEDHRApp ? authAction[1] : authAction[0];
        return !key || form2dhrUsePerms.value[key];
      })
      .map((action) => {
        return {
          action: action,
          label: EdhrVersionActionMap[action].label,
        };
      });
  }
  /** 版本父级操作 */
  const versionParentActions = calcActions(EdhrVersionParentActions);
  /** 版本操作 */
  const versionActions = calcActions(EdhrVersionActions);

  /**
   * 打开edhr详情
   * @param record
   */
  const openEdhrDetail = async (row) => {
    const { id, controlStatus, approveStatus } = row;
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    const dataReactive = reactive(info);
    dataReactive.categoryName = getCategoryName(info.categoryId!);
    dataReactive.controlStatus = controlStatus;
    dataReactive.approveStatus = approveStatus;

    // 启用文控的时候，受控和流程中的不能编辑
    let noEdit = false;
    if (enableDocControl) {
      noEdit = [ControlStatusEnum.CONTROLLED, ControlStatusEnum.RUNNING].includes(controlStatus);
    }

    await gct.openUtil.drawer(
      EdhrDetailDrawer,
      {
        data: dataReactive,
        showEdit:
          !noEdit &&
          form2dhrUsePerms.value[inEDHRApp ? DhrPermissionEnum.UpdateVer : BasicAction.Update],
        onEdit: async () => {
          const res = await editEdhrTmplVersion(id);
          if (res) {
            Object.assign(dataReactive, res);
          }
        },
        onPrint: async () => {
          debouncedPrint(id);
        },
      },
      {
        title: $t('sys.detail'),
        width: '70%',
        height: '100%',
      },
    );
  };

  async function createPrintTask(id: string) {
    try {
      const res = (await getDocOutlineList({ baseId: id })) ?? [];
      const docList = (res || []).filter((item: any) => item?.type === 'DOC');

      if (docList.length === 0) {
        message.warning($t('sys.onlineForm.noPrintableFormTemplateTip'));
        return;
      }

      const ids = Array.from(new Set(docList.map((item: any) => item?.id || '').filter(Boolean)));

      if (ids.length === 0) {
        message.warning($t('sys.onlineForm.noPrintableFormTemplateTip'));
        return;
      }

      const formList = await postOnlineFormTmplInfos({ ids: ids });

      if (!formList || formList?.length === 0) {
        message.warning($t('sys.onlineForm.noPrintableFormTemplateTip'));
        return;
      }

      const printable = formList?.filter((f: any) => f?.formType !== FormTypeEnum.FILE);

      if (printable.length === 0) {
        message.warning($t('sys.onlineForm.noPrintableFormTemplateTip'));
        return;
      }

      // 如果需要自动提交任务，解除注释并填入实际参数
      await postFileTaskSubmit({
        tmplInstantId: id,
        type: 'EDHR_TMPL',
      });

      message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
    } catch (err) {}
  }

  const debouncedPrint = debounce(createPrintTask, 300, {
    leading: false,
    trailing: true,
  });

  /**
   * 设计edhr
   * @param record
   */
  const designEdhr = async (id: string) => {
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    const dataReactive = reactive(info);
    await gct.openUtil.drawer(
      EdhrDetailDrawer,
      {
        data: dataReactive,
        showEdit:
          form2dhrUsePerms.value[inEDHRApp ? DhrPermissionEnum.UpdateVer : BasicAction.Update],
        defaultEdit: true,
        onEdit: async () => {
          const res = await editEdhrTmplVersion(id);
          if (res) {
            Object.assign(dataReactive, res);
          }
        },
        onPrint: async () => {
          debouncedPrint(info.id);
        },
      },
      {
        title: $t('sys.edhr.design'),
        width: '70%',
        height: '100%',
      },
    );
  };

  /**
   * 打开edhr模态编辑完成之后返回更改后的数据
   * 取消操作返回undefined
   * @param opts
   * @return {*}
   */
  async function openEdhrModal(args: {
    data?: Partial<EdhrTmplRequest>;
    disabledFields?: Array<keyof EdhrTmplRequest>;
    title: string;
    showOk2Open?: boolean; // 是否显示确认并打开按钮
    shouldClose?: (data, isOk2Open?: boolean) => Promise<boolean>;
  }): Promise<EdhrTmplRequest | undefined> {
    const res = await gct.openUtil.modal(
      EdhrModal,
      {
        data: args.data,
        categoryModule,
        disabledFields: args.disabledFields,
        showOk2Open: args.showOk2Open,
        shouldClose: args.shouldClose,
      },
      {
        title: args.title,
        width: 640,
        height: 'auto',
        wrapClassName: 'edhr-custom-modal',
        showFooter: false,
      },
    );
    if (res.ok) {
      return res.data![0] as EdhrTmplRequest;
    }
  }

  /**
   * 新建edhr模版
   */
  async function createEdhrTmpl() {
    await openEdhrModal({
      title: $t('sys.newSth'),
      data: {
        categoryId: fetchParams.categoryId,
      },
      showOk2Open: true,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postEdhrTmplSave(data);
          await load();
          if (isOk2Open && res) {
            designEdhr(res);
          }

          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * 复制edhr模版
   */
  async function copyEdhrTmpl(id: string) {
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.default = undefined;
    info.name = 'copy_of_' + info.name;
    await openEdhrModal({
      title: $t('sys.pageDesigner.copyText'),
      data: info as any,
      showOk2Open: true,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postEdhrTmplCopyById({ id }, data);
          await load();
          if (isOk2Open && res) {
            designEdhr(res);
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * edhr模版版本创建
   */
  async function createEdhrTmplVersion(id: string) {
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.version = undefined;
    info.default = undefined;
    info.description = undefined;
    await openEdhrModal({
      title: $t('sys.pageDesigner.version_createText'),
      data: info as any,
      disabledFields: ['categoryId', 'name'],
      showOk2Open: true,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postEdhrTmplSaveVersion(data);
          await load();

          if (isOk2Open && res) {
            designEdhr(res);
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * edhr模版版本编辑
   */
  async function editEdhrTmplVersion(id: string) {
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    const data = await openEdhrModal({
      title: $t('sys.editSth'),
      data: info as any,
      shouldClose: async (data) => {
        try {
          await putEdhrTmplUpdateVersionByIdById({ id }, data);
          await load();
          return true;
        } catch (error) {
          return false;
        }
      },
    });
    if (data) {
      return data;
    }
  }

  /**
   * 设置edhr版本为默认
   */
  async function setDefaultEdhrVersionAction(id: string) {
    await putEdhrTmplSetDefaultById({ id });
    await load();
  }

  /**
   * edhr版本复制
   */
  async function copyEdhrTmplVersion(id: string) {
    const info = await getEdhrTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.version = 'Copy' + info.version;
    info.default = undefined;
    info.description = undefined;
    await openEdhrModal({
      title: $t('sys.pageDesigner.version_copyText'),
      data: info as any,
      disabledFields: ['categoryId', 'name'],
      showOk2Open: true,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postEdhrTmplCopyVersionById({ id }, data);
          await load();

          if (isOk2Open && res) {
            designEdhr(res);
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /** 删除edhr版本 */
  async function deleteEdhrTmplVersion(record: FormRelateDTO) {
    Modal.confirm({
      title: $t('sys.confirmDel', {
        sth: `【${record.name}】DHR`,
      }),
      content: $t('sys.onlineForm.deleteVersionTips', {
        sth: 'DHR',
      }),
      async onOk() {
        await deleteEdhrTmplRemoveVersionById({ id: record.id! });
        message.success($t('sys.appDesigner.deleteSuccess'));
        await load();
      },
      onCancel() {},
    });
  }

  /**
   * 拷贝edhr模版
   * @param id
   */
  async function copyEdhrTmp(id: string) {
    await postEdhrTmplCopyById({ id });
    message.success($t('sys.pageDesigner.copySuccess'));
    await load();
  }

  /**
   * 执行操作
   * @param action 操作标识
   * @param record 对应的edhr数据
   */
  function executeAction(
    action: EdhrVersionAction | ControlAction | ApproveControlAction,
    record: FormRelateDTO,
  ) {
    switch (action) {
      case EdhrVersionAction.DESIGN_VERSION:
        designEdhr(record.id!);
        break;
      case EdhrVersionAction.COPY_EDHR:
        const defaultId = record.children?.find((item) => item.default === 1)?.id;
        copyEdhrTmpl(defaultId!);
        break;
      case EdhrVersionAction.COPY_EDHR_WITH_VERSION:
        copyEdhrTmpl(record.id!);
        break;
      case EdhrVersionAction.DELETE_VERSION:
        deleteEdhrTmplVersion(record);
        break;
      case EdhrVersionAction.COPY_VERSION:
        copyEdhrTmplVersion(record.id!);
        break;
      case EdhrVersionAction.CREATE_VERSION:
        createEdhrTmplVersion(record.id!);
        break;
      case EdhrVersionAction.EDIT_VERSION:
        editEdhrTmplVersion(record.id!);
        break;
      case EdhrVersionAction.SET_DEFAULT_VERSION:
        setDefaultEdhrVersionAction(record.id!);
        break;
      case EdhrVersionAction.MODELING_TRACEABILITY:
        TracingBackToThePast({ id: record.id!, modelKey: 'em_form_tmpl' }).open();
        break;

      case ControlAction.CONTROL:
      case ControlAction.CONTROL_PATH:
      case ControlAction.WITHDRAW:
        executeControlAction(record, action, CategoryModuleEnum.EDHR, () => commons.load());
        break;

      case ApproveControlAction.APPROVE:
      case ApproveControlAction.APPROVE_PATH:
      case ApproveControlAction.WITHDRAW:
      case ApproveControlAction.EFFECT:
        executeApprovalControlAction(record, action, CategoryModuleEnum.EDHR, () => commons.load());
        break;
      default:
        console.error(action, '暂不支持');
    }
  }

  return {
    ...commons,
    versionParentActions,
    versionActions,
    openEdhrDetail,
    createEdhrTmpl,
    executeAction,
  };
}
