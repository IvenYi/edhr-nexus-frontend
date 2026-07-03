import { onBeforeMount, reactive, ref, watch, computed } from 'vue';
import {
  CategoryModuleEnum,
  ControlAction,
  ApproveControlAction,
  FormVersionAction,
  FormVersionActionMap,
  FormVersionActions,
  FormVersionParentActions,
} from '../constant';
import { FormRelateDTO, OnlineFormTmplRequest } from '/@/apis/gct-apaas/model';
import { useRoute, useRouter } from 'vue-router';
import { getPermissionByKey, BasicAction } from '/@web-render/utils/UserappPermissions';
import { OnlineFormDetailDrawer, OnlineFormModal } from '../form';
import {
  deleteOnlineFormTmplRemoveVersionById,
  getOnlineFormTmplGetVersionById,
  postOnlineFormTmplCopyById,
  postOnlineFormTmplCopyCustomizeById,
  postOnlineFormTmplCopyVersionById,
  postOnlineFormTmplSave,
  postOnlineFormTmplSaveVersion,
  putOnlineFormTmplSetDefaultById,
  putOnlineFormTmplUpdateVersionByIdById,
} from '/@/apis/gct-apaas/OnlineFormTmplController';
import { message, Modal } from 'ant-design-vue';
import { useUUid } from '/@/hooks/web/useUUid';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { pick } from 'lodash-es';
import { executeControlAction, isEnableDocControl } from './useControl';
import { executeApprovalControlAction } from './useApproveControl';
import { ControlStatusEnum } from '/@/projects/app-designer/src/views/online-form/constants';
import { openMockReportUrl } from '/@online-form/views/render/__logic__/preview.logic';
import { FormTypeEnum, PlatformEnum } from '@gct/nocode-base';
import { useCategory } from './useCategory';

import { usePagePermissions } from '/@web-render/views/edhr-application/hooks/usePagePermissions';
import { DhrPermissionEnum } from '/@/perms/index';
import { getInterfaceApi } from '@gct/runtime';
import { TracingBackToThePast } from '/@web-render/render/Event/Modal';
import { openVersionDiff } from '../form/version-diff';

/**
 * 使用通用版本控制
 * @export
 * @param module
 * @return {*}
 */
export function useCommonVersion(module: CategoryModuleEnum, inEDHRApp) {
  /** 用户操作权限 */
  const pageAuthKey = module === CategoryModuleEnum.ONLINE_FORM ? 'OnlineForm' : 'eDHR';

  const form2dhrUsePerms = computed(() => {
    if (inEDHRApp) {
      const perms = usePagePermissions(pageAuthKey);
      return perms.value;
    }

    return {
      [BasicAction.Update]: getPermissionByKey(pageAuthKey, BasicAction.Update),
      [BasicAction.Delete]: getPermissionByKey(pageAuthKey, BasicAction.Delete),
      [BasicAction.Design]: getPermissionByKey(pageAuthKey, BasicAction.Design),
      [BasicAction.Insert]: getPermissionByKey(pageAuthKey, BasicAction.Insert),
      [DhrPermissionEnum.Import]: getPermissionByKey(pageAuthKey, DhrPermissionEnum.Import),
      [DhrPermissionEnum.Export]: getPermissionByKey(pageAuthKey, DhrPermissionEnum.Export),
    };
  });

  const route = useRoute();
  /** 查询条件 */
  const fetchParams = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
    categoryId: '',
    query: '',
    code: '',
    controlStatus: undefined,
    approveStatus: undefined,
  });

  /** 表格数据 */
  const tableData = ref<FormRelateDTO[]>([]);

  // 回显路由缓存的数据
  onBeforeMount(async () => {
    if (!route?.query?.cacheKey) {
      return;
    }
    const queryData = route?.query?.cacheKey
      ? decodeURIComponent(route.query!.cacheKey! as string)
      : '{}';
    const encode = JSON.parse(queryData);
    fetchParams.current = encode.current ?? 1;
    fetchParams.pageSize = encode.pageSize ?? 20;
    fetchParams.query = encode.query || '';
    fetchParams.code = encode.code || '';
    fetchParams.controlStatus = encode.controlStatus || undefined;
    fetchParams.approveStatus = encode.approveStatus || undefined;
    fetchParams.categoryId = encode.categoryId?.toString() || '';
  });

  async function load(pageRest = false) {
    if (pageRest) {
      fetchParams.current = 1;
      fetchParams.pageSize = 20;
    }
    // if (!fetchParams.categoryId) {
    //   throw new Error('categoryId is required');
    // }

    try {
      const res = await getInterfaceApi.getTmplsList(
        {
          categoryId: fetchParams.categoryId,
          pageNo: fetchParams.current ?? 1,
          pageSize: fetchParams.pageSize,
          name: fetchParams.query,
          code: fetchParams.code,
          moduleType: module,
          // !: 根据应用区分走的是文控状态还是审批状态
          controlStatus: fetchParams.controlStatus || undefined,
          approveStatus: fetchParams.approveStatus || undefined,
          // !表单模板数据默认查启用的状态，在这里默认查所有，所以传undefined区分下
          operatingState: undefined,
        },
        { errorMessageMode: 'none' },
      );

      tableData.value = res?.data ?? [];
      fetchParams.total = res?.totalCount || 0;
    } catch (error) {
      tableData.value = [];
      fetchParams.total = 0;
      console.error('[online-form] failed to load form templates', error);
    }
  }

  function getFetchUniqueKey(v: IData) {
    return `${v.categoryId}-${v.current}-${v.pageSize}`;
  }

  watch(
    () => {
      return { ...fetchParams };
    },
    (v, oldV) => {
      // 没有分类时不加载
      // if (!v?.categoryId) {
      //   return;
      // }
      // 查询条件不变的时候不重新加载
      if (oldV && getFetchUniqueKey(v) === getFetchUniqueKey(oldV)) {
        return;
      }
      load(oldV?.categoryId !== v?.categoryId);
    },
    {
      deep: true,
    },
  );

  return { fetchParams, tableData, form2dhrUsePerms, load };
}

export function useFormVersion() {
  const appInfoStore = useAppInfoStore();
  const inEDHRApp =
    appInfoStore.appInfo.suiteKey === 'eDHR' || appInfoStore.appInfo.suiteKey === 'MEDPRO';
  const commons = useCommonVersion(CategoryModuleEnum.ONLINE_FORM, inEDHRApp);
  const { getCategoryName } = useCategory({ module: CategoryModuleEnum.ONLINE_FORM });
  const router = useRouter();
  const { fetchParams, form2dhrUsePerms, load } = commons;
  const { getUuid } = useUUid([], '', { chars: 'lowercase&number' });
  /** 是否启用文控 */
  const enableDocControl = isEnableDocControl();

  /** 根据权限计算实际的操作 */
  function calcActions(actions: Array<FormVersionAction | ControlAction | ApproveControlAction>) {
    return actions
      .filter((action) => {
        const authAction = FormVersionActionMap[action]?.authAction;
        if (!authAction) return true;

        const key = inEDHRApp ? authAction[1] : authAction[0];
        return !key || form2dhrUsePerms.value[key];
      })
      .map((action) => {
        return {
          action: action,
          label: $t(FormVersionActionMap[action].label),
        };
      });
  }
  /** 版本父级操作 */
  const versionParentActions = calcActions(FormVersionParentActions);
  /** 版本操作 */
  const versionActions = calcActions(FormVersionActions);

  /**
   * 打开表单详情
   * @param record
   */
  const openFormDetail = async (
    id: string,
    payload?: {
      showEdit?: boolean;
      showMockBtn?: boolean;
    },
  ) => {
    const { showEdit = true, showMockBtn = true } = payload || {};

    const info = await getOnlineFormTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    const dataReactive = reactive(info);
    dataReactive.categoryName = info.categoryName || getCategoryName(info.categoryId!);

    // 启用文控的时候，受控和流程中的不能编辑
    let noEdit = false;
    if (enableDocControl) {
      noEdit = [ControlStatusEnum.CONTROLLED, ControlStatusEnum.RUNNING].includes(
        info.controlStatus as any,
      );
    }
    await gct.openUtil.drawer(
      OnlineFormDetailDrawer,
      {
        data: dataReactive,
        showEdit:
          showEdit &&
          !noEdit &&
          form2dhrUsePerms.value[inEDHRApp ? DhrPermissionEnum.UpdateVer : BasicAction.Update],
        showMockBtn,
        onEdit: async () => {
          const res = await editFormTmplVersion(id);
          if (res) {
            Object.assign(dataReactive, res);
          }
        },
      },
      {
        title: $t('sys.detail'),
        width: '70%',
        height: '100%',
        destroyOnClose: true,
      },
    );
  };

  /**
   * 设计表单
   * @param record
   */
  const designForm = async (id: string, query = {}) => {
    await router.replace({
      name: 'OnlineForm',
      query: { cacheKey: encodeURIComponent(JSON.stringify(fetchParams)) },
    });

    await router.push({
      name: 'OnlineFormDesigner',
      params: { id },
      query: query,
    });
  };

  /**
   * 文件表单模拟填报
   * @param id
   */
  const fileSimulationFilling = (id: string) => {
    openMockReportUrl({ tid: id, platformType: PlatformEnum.INTEGRATION_PAAS_SI });
  };

  /**
   * 打开表单模态编辑完成之后返回更改后的数据
   * 取消操作返回undefined
   * @param opts
   * @return {*}
   */
  async function openFormModal(args: {
    data?: Partial<OnlineFormTmplRequest>;
    disabledFields?: Array<keyof OnlineFormTmplRequest>;
    /** 允许表单类型转换 */
    allowFormTypeChange?: boolean;
    showFieldConfig?: boolean; // 是否显示字段配置列表
    showOk2Open?: boolean; // 是否显示确认并打开按钮
    formAction?: FormVersionAction | ControlAction | ApproveControlAction;
    title: string;
    shouldClose?: (data, isOk2Open?: boolean) => Promise<boolean>;
  }): Promise<OnlineFormTmplRequest | undefined> {
    const res = await gct.openUtil.modal(
      OnlineFormModal,
      {
        data: args.data,
        disabledFields: args.disabledFields,
        allowFormTypeChange: args.allowFormTypeChange,
        formAction: args.formAction,
        showFieldConfig: args.showFieldConfig,
        showOk2Open: args.showOk2Open,
        shouldClose: args.shouldClose,
      },
      {
        title: args.title,
        width: 'auto',
        wrapClassName: 'online-form-custom-modal',
        height: 'auto',
        showFooter: false,
      },
    );
    if (res.ok) {
      return res.data![0] as OnlineFormTmplRequest;
    }
  }

  /**
   * 新建表单模版
   */
  async function createFormTmpl() {
    await openFormModal({
      title: $t('sys.newSth', { sth: $t('sys.expression.form') }),
      data: {
        categoryId: fetchParams.categoryId,
        modelKey: 'fm_' + getUuid(),
      },
      showOk2Open: true,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postOnlineFormTmplSave(data);
          await load();
          if (isOk2Open && res) {
            if (data.formType === FormTypeEnum.FILE) {
              fileSimulationFilling(res);
            } else {
              designForm(res);
            }
          }

          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * 表单复制
   */
  async function copyFormTmpl(id: string) {
    const info = await getOnlineFormTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.id = undefined;
    info.default = undefined;
    info.name = 'copy_of_' + info.name;
    info.modelKey = 'fm_' + getUuid();
    await openFormModal({
      title: $t('sys.pageDesigner.copyText'),
      showFieldConfig: false,
      showOk2Open: true,
      data: info,
      // data: pick(
      //   info,
      //   'id',
      //   'categoryId',
      //   'formType',
      //   'edition',
      //   'name',
      //   'version',
      //   'modelKey',
      //   'height',
      //   'width',
      //   'paperSize',
      //   'direction',
      //   'viewType',
      //   'dsKey',
      //   'script',
      //   'bindKey',
      //   'description',
      // ),
      disabledFields: [
        'formType',
        'officeType',
        'edition',
        'paperSize',
        'height',
        'width',
        'direction',
        'viewType',
        'dsKey',
        'script',
        'bindKey',
      ],
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postOnlineFormTmplCopyCustomizeById({ id }, data);
          await load();

          if (isOk2Open && res) {
            if (data.formType === FormTypeEnum.FILE) {
              fileSimulationFilling(res);
            } else {
              designForm(res);
            }
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * 表单模版版本创建
   */
  async function createFormTmplVersion(id: string) {
    const isConfirm = await new Promise((resolve) => {
      Modal.confirm({
        title: $t('sys.onlineForm.createFormVersionTipTitle'),
        content: $t('sys.onlineForm.createFormVersionTipContent'),
        width: 615,
        onOk() {
          resolve(true);
        },
        onCancel() {
          resolve(false);
        },
      });
    });
    if (!isConfirm) {
      return;
    }

    const info = await getOnlineFormTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.version = undefined;
    info.default = undefined;
    info.description = undefined;
    await openFormModal({
      title: $t('sys.pageDesigner.version_createText'),
      showFieldConfig: false,
      showOk2Open: true,
      formAction: FormVersionAction.CREATE_VERSION,
      data: pick(
        info,
        'baseId',
        'categoryId',
        'officeType',
        'formType',
        'edition',
        'name',
        'modelKey',
        'height',
        'width',
        'paperSize',
        'direction',
        'viewType',
        'dsKey',
        'script',
        'bindKey',
      ),
      disabledFields: [
        'categoryId',
        'formType',
        'officeType',
        'edition',
        'name',
        'modelKey',
        'viewType',
        'dsKey',
        'script',
        'bindKey',
      ],
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postOnlineFormTmplSaveVersion(data);
          await load();

          if (isOk2Open && res) {
            if (data.formType === FormTypeEnum.FILE) {
              fileSimulationFilling(res);
            } else {
              designForm(res);
            }
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /**
   * 表单模版版本编辑
   */
  async function editFormTmplVersion(id: string) {
    const info = await getOnlineFormTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    const disabledFields = [
      'modelKey',
      'officeType',
      'paperSize',
      'height',
      'width',
      'direction',
      'viewType',
      'dsKey',
      'script',
      'bindKey',
    ] as any;
    if ([FormTypeEnum.VIEW, FormTypeEnum.TEXT, FormTypeEnum.FILE].includes(info.formType as any)) {
      disabledFields.push('edition');
    }

    const data = await openFormModal({
      title: $t('sys.editSth', { sth: $t('sys.expression.form') }),
      data: info as any,
      disabledFields: disabledFields,
      allowFormTypeChange: true,
      formAction: FormVersionAction.EDIT_VERSION,
      shouldClose: async (data) => {
        try {
          await putOnlineFormTmplUpdateVersionByIdById({ id }, data);
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
   * 设置表单版本为默认
   */
  async function setDefaultFormVersionAction(id: string) {
    await putOnlineFormTmplSetDefaultById({ id });
    await load();
  }

  /**
   * 表单版本复制
   */
  async function copyFormTmplVersion(id: string) {
    const info = await getOnlineFormTmplGetVersionById({ id });
    if (!info) {
      throw new Error($t('sys.onlineForm.noData'));
    }
    info.version = 'Copy' + info.version;
    info.default = undefined;
    info.description = undefined;
    // info.updateRemark = undefined;
    await openFormModal({
      title: $t('sys.pageDesigner.version_copyText'),
      data: info as any,
      showOk2Open: true,
      disabledFields: [
        'categoryId',
        'formType',
        'officeType',
        'edition',
        'name',
        'modelKey',
        'paperSize',
        'height',
        'width',
        'direction',
        'viewType',
        'dsKey',
        'script',
        'bindKey',
      ],
      formAction: FormVersionAction.COPY_VERSION,
      shouldClose: async (data, isOk2Open) => {
        try {
          const res = await postOnlineFormTmplCopyVersionById({ id }, data);
          await load();
          if (isOk2Open && res) {
            if (data.formType === FormTypeEnum.FILE) {
              fileSimulationFilling(res);
            } else {
              designForm(res);
            }
          }
          return true;
        } catch (error) {
          return false;
        }
      },
    });
  }

  /** 删除表单版本 */
  async function deleteFormTmplVersion(record: FormRelateDTO) {
    Modal.confirm({
      title: $t('sys.confirmDel', {
        sth: `【${record.name}】${$t('sys.pageDesigner.fieldCmp.online_form')}`,
      }),
      content: $t('sys.onlineForm.deleteVersionTips', {
        sth: $t('sys.expression.form'),
      }),
      async onOk() {
        await deleteOnlineFormTmplRemoveVersionById({ id: record.id! });
        message.success($t('sys.appDesigner.deleteSuccess'));
        await load();
      },
      onCancel() {},
    });
  }

  /**
   * 拷贝表单模版
   * @param id
   */
  async function copyFormTmp(id: string) {
    await postOnlineFormTmplCopyById({ id });
    message.success($t('sys.pageDesigner.copySuccess'));
    await load();
  }

  /**
   * 执行操作
   * @param action 操作标识
   * @param record 对应的表单数据
   */
  function executeAction(
    action: FormVersionAction | ControlAction | ApproveControlAction,
    record: FormRelateDTO,
  ) {
    switch (action) {
      case FormVersionAction.DESIGN_VERSION:
        designForm(record.id!);
        break;
      case FormVersionAction.SIMULATION_FILLING:
        fileSimulationFilling(record.id!);
        break;
      case FormVersionAction.COPY_FORM:
        const defaultId = record.children?.find((item) => item.default === 1)?.id;
        copyFormTmpl(defaultId!);
        break;
      case FormVersionAction.COPY_FORM_WITH_VERSION:
        copyFormTmpl(record.id!);
        break;
      case FormVersionAction.DELETE_VERSION:
        deleteFormTmplVersion(record);
        break;
      case FormVersionAction.COPY_VERSION:
        copyFormTmplVersion(record.id!);
        break;
      case FormVersionAction.CREATE_VERSION:
        createFormTmplVersion(record.id!);
        break;
      case FormVersionAction.EDIT_VERSION:
        editFormTmplVersion(record.id!);
        break;
      case FormVersionAction.SET_DEFAULT_VERSION:
        setDefaultFormVersionAction(record.id!);
        break;
      case FormVersionAction.MODELING_TRACEABILITY:
        TracingBackToThePast({ id: record.id!, modelKey: 'em_edhr_tmpl' }).open();
        break;
      case FormVersionAction.VERSION_DIFF:
        openVersionDiff(record.id!);
        break;

      case ControlAction.PROCESS_DESIGN:
      case ControlAction.BUTTON_DESIGN:
      case ApproveControlAction.PROCESS_DESIGN:
      case ApproveControlAction.BUTTON_DESIGN:
        designForm(record.id!, { process: '1' });
        break;
      /**
       * !: 根据应用区分走的是useControl还是useApproveControl
       */
      case ControlAction.CONTROL:
      case ControlAction.CONTROL_PATH:
      case ControlAction.WITHDRAW:
        executeControlAction(record, action, CategoryModuleEnum.ONLINE_FORM, () => load());
        break;

      case ApproveControlAction.APPROVE:
      case ApproveControlAction.APPROVE_PATH:
      case ApproveControlAction.WITHDRAW:
      case ApproveControlAction.EFFECT:
        executeApprovalControlAction(record, action, CategoryModuleEnum.ONLINE_FORM, () => load());
        break;

      default:
        console.error(action, '暂不支持');
    }
  }

  return {
    ...commons,
    versionParentActions,
    versionActions,
    openFormDetail,
    createFormTmpl,
    executeAction,
  };
}
