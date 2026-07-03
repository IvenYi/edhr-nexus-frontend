import { reactive, ref, computed } from 'vue';
import { ProductFamilyAction } from './constants';
import { type PaginationProps } from '/@/components/Table';
import { openModal } from '../modal/use-modal';
import { TracingBackToThePast } from '/@web-render/render/Event/Modal';
import { listByPage, removeByIds, submit } from './use-model-service';
import { IProductFamily } from './type';
import { importDataForModal } from '/@web-render/render/Event/utils/builtInMethods';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

export function UseProductFamily() {
  const userActions = computed(() => {
    const page = 'product-family';
    return {
      Insert: getPermissionByKey(page, 'Insert'),
      Copy: getPermissionByKey(page, 'Copy'),
      Update: getPermissionByKey(page, 'Update'),
      Delete: getPermissionByKey(page, 'Delete'),
      Trace: getPermissionByKey(page, 'Trace'),
      IMPORT: getPermissionByKey(page, 'IMPORT'),
    };
  });

  /** 搜索条件 */
  const searchParams = ref<IParams>({
    name: undefined,
  });
  /** 分页 */
  const pagination = ref<PaginationProps>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  /** 表格数据 */
  const tableData = ref<IData[]>();
  const loading = ref<boolean>(false);

  /** 建模追溯 */
  const openTrace = (data: IProductFamily) => {
    TracingBackToThePast({ id: data.id_ }).open();
  };

  /** 加载 */
  const load = async (pageRest = false) => {
    if (pageRest) {
      pagination.value.current = 1;
      pagination.value.pageSize = 20;
    }
    const params = {
      pageNo: pagination.value.current ?? 1,
      pageSize: pagination.value.pageSize,
      query: {
        'name_.like': searchParams.value.name,
        'code_.like': searchParams.value.code,
      },
    };
    const res = await listByPage(params);
    console.log('查询条件params', params, res);
    if (res) {
      tableData.value = res.data || [];
      pagination.value.total = res.totalCount || 0;
    } else {
      tableData.value = [];
      pagination.value.total = 0;
    }
  };

  /** 复制 */
  const copy = (data: IProductFamily) => {
    const cloneData = { ...data };
    cloneData.name_ = 'copy_of_' + cloneData.name_;
    if (cloneData.code_) {
      cloneData.code_ = 'copy_of_' + cloneData.code_;
    }
    openModal({
      data: cloneData,
      action: ProductFamilyAction.COPY,
      shouldClose: async (_data) => {
        delete _data.id_;
        await submit(_data);
        console.log('调用后台接口：copy', _data);
        await load();
        return true;
      },
    });
  };
  /** 编辑 */
  const edit = (data: IProductFamily) => {
    openModal({
      data,
      action: ProductFamilyAction.EDIT,
      shouldClose: async (_data) => {
        await submit(_data);
        console.log('调用后台接口：edit', _data);
        await load();
        return true;
      },
    });
  };
  /** 详情 */
  const view = (data: IProductFamily) => {
    openModal({
      data,
      action: ProductFamilyAction.DETAIL,
    });
  };

  /** 新建 */
  const create = () => {
    openModal({
      action: ProductFamilyAction.NEW,
      shouldClose: async (data: IProductFamily) => {
        await submit(data);
        console.log('调用后台接口：create', data);
        await load();
        return true;
      },
    });
  };

  /** 删除 */
  const remove = async (data: IProductFamily) => {
    await removeByIds(data.id_!);
    console.log('调用后台接口：remove', data);
    load();
  };

  const dataImport = () => {
    importDataForModal(
      {
        tmplKey: 'import_product_family_tmpl_ebjd',
        modelKey: 'em_product_family',
        useGetExcelTmplDownloadById: true,
      },
      {
        async onSuccess() {
          await load();
          loading.value = false;
        },
        onError() {
          loading.value = false;
        },
      },
    );
  };

  /**
   * 执行操作
   * @param action 操作标识
   * @param record 对应的edhr数据
   */
  function executeAction(action: ProductFamilyAction, record?: any) {
    switch (action) {
      case ProductFamilyAction.COPY:
        copy(record);
        break;
      case ProductFamilyAction.DELETE:
        remove(record);
        break;
      case ProductFamilyAction.DETAIL:
        view(record);
        break;
      case ProductFamilyAction.DOWNLOAD_IMPORT_TEMPLATE:
        break;
      case ProductFamilyAction.EDIT:
        edit(record);
        break;
      case ProductFamilyAction.IMPORT:
        dataImport();
        break;
      case ProductFamilyAction.MODELING_TRACEABILITY:
        openTrace(record);
        break;
      case ProductFamilyAction.NEW:
        create();
        break;
      default:
        console.error(action, '暂不支持');
    }
  }

  return {
    load,
    tableData,
    searchParams,
    pagination,
    executeAction,
    userActions,
  };
}
