import { ref, computed } from 'vue';
import { ProductAction } from './constants';
import { IProduct, IProductVersion } from './type';
import { openModal } from '../modal/use-modal';
import { PaginationProps } from '/@/components/Table';
import * as apis from './use-model-service';
import { TracingBackToThePast } from '/@/projects/web-render/src/render/Event/Modal';
import { omit, pick } from 'lodash-es';
import { importDataForModal } from '/@web-render/render/Event/utils/builtInMethods';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

export function useProduct() {
  const userActions = computed(() => {
    const page = 'product-modeling';
    return {
      Insert: getPermissionByKey(page, 'Insert'),
      Copy: getPermissionByKey(page, 'Copy'),
      Delete: getPermissionByKey(page, 'Delete'),
      Trace: getPermissionByKey(page, 'Trace'),
      InsertVer: getPermissionByKey(page, 'InsertVer'),
      UpdateVer: getPermissionByKey(page, 'UpdateVer'),
      CopyVer: getPermissionByKey(page, 'CopyVer'),
      DeleteVer: getPermissionByKey(page, 'DeleteVer'),
      IMPORT: getPermissionByKey(page, 'IMPORT'),
    };
  });

  /** 搜索条件 */
  const searchParams = ref<IParams>({
    name: undefined,
    productFamilyId: undefined,
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
  const openTrace = (data: IProductVersion) => {
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
        'product_family_id_.eq': searchParams.value.productFamilyId,
      },
    };
    const res = await apis.listByPage(params);
    console.log('查询条件params', params, res);
    if (res.data) {
      const dict = res.dict;
      tableData.value =
        res.data.map((item) => {
          // 解析每条数据
          const result = omit(item, ['__CHILDREN__']);
          result.children = item.__CHILDREN__;
          if (result.children?.length) {
            result.children.forEach((x) => {
              x.__dict__product_family = dict.product_family_id_?.[x.product_family_id_];
              x.__dict__product_type = dict.product_type_?.[x.product_type_];
            });
          }
          return result;
        }) || [];
      pagination.value.total = res.totalCount || 0;
    } else {
      tableData.value = [];
      pagination.value.total = 0;
    }
  };

  /** 复制 */
  const copy = (data: IProduct) => {
    const defaultVersion = data.children?.find((item) => item.default_) as IProductVersion;
    const cloneData = { ...defaultVersion } as any;
    cloneData.name_ = 'copy_of_' + cloneData.name_;
    delete cloneData.base_id_;
    delete cloneData.id_;
    delete cloneData.code_;
    openModal({
      data: cloneData,
      action: ProductAction.COPY,
      shouldClose: async (_data) => {
        await apis.createRdo(_data);
        await load();
        return true;
      },
    });
  };

  /** 创建版本 */
  const createVersion = (data: IProduct) => {
    const defaultVersion = data.children?.find((item) => item.default_) as IProductVersion;
    const cloneData = pick(defaultVersion, ['name_', 'base_id_']) as any;
    openModal({
      data: cloneData,
      action: ProductAction.CREATE_VERSION,
      shouldClose: async (_data) => {
        await apis.createVersion(_data);
        await load();
        return true;
      },
    });
  };

  /** 复制版本 */
  const copyVersion = (data: IProductVersion) => {
    const cloneData = { ...data };
    cloneData.version_ = 'copy_of_' + cloneData.version_;
    delete cloneData.code_;
    openModal({
      data: cloneData,
      action: ProductAction.COPY_VERSION,
      shouldClose: async (_data) => {
        delete _data.id_;
        await apis.createVersion(_data);
        await load();
        return true;
      },
    });
  };

  /** 编辑 */
  const editVersion = (data: IProductVersion) => {
    openModal({
      data,
      action: ProductAction.EDIT_VERSION,
      shouldClose: async (_data) => {
        await apis.updateVersion(_data);
        await load();
        return true;
      },
    });
  };

  /** 详情 */
  const view = (data: IProductVersion) => {
    openModal({
      data,
      action: ProductAction.DETAIL,
    });
  };

  /** 新建RDO */
  const create = () => {
    openModal({
      action: ProductAction.CREATE,
      shouldClose: async (data: IProductVersion) => {
        await apis.createRdo(data);
        await load();
        return true;
      },
    });
  };

  /** 删除 */
  const remove = async (data: IProduct) => {
    await apis.removeRdo(data.id_!);
    load();
  };
  /** 删除版本 */
  const deleteVersion = async (data: IProductVersion) => {
    await apis.removeVersion(data.id_!);
    load();
  };

  const dataImport = () => {
    importDataForModal(
      {
        tmplKey: 'import_product_tmpl_ebjd',
        modelKey: 'em_product',
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
  function executeAction(action: ProductAction, record?: IProduct | IProductVersion) {
    switch (action) {
      case ProductAction.CREATE:
        create();
        break;
      case ProductAction.COPY:
        copy(record as IProduct);
        break;
      case ProductAction.COPY_VERSION:
        copyVersion(record as IProductVersion);
        break;
      case ProductAction.DETAIL:
        view(record as IProductVersion);
        break;
      case ProductAction.DELETE:
        remove(record as IProduct);
        break;
      case ProductAction.DELETE_VERSION:
        deleteVersion(record as IProductVersion);
        break;
      case ProductAction.CREATE_VERSION:
        createVersion(record as IProduct);
        break;
      case ProductAction.EDIT_VERSION:
        editVersion(record as IProductVersion);
        break;
      case ProductAction.IMPORT:
        dataImport();
        break;
      case ProductAction.MODELING_TRACEABILITY:
        openTrace(record as IProductVersion);
        break;
      case ProductAction.DOWNLOAD_IMPORT_TEMPLATE:
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
