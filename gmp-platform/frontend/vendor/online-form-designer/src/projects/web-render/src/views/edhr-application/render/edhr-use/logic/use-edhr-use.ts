import { ref, computed } from 'vue';
import { EdhrUseAction } from './constants';
import { type PaginationProps } from '/@/components/Table';
import { openModal } from '../modal/use-modal';
import { listByPage, removeByIds, submit } from './use-model-service';
import { IEdhrUse } from './type';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

export function UseEdhrUse() {
  const userActions = computed(() => {
    const page = 'edhr-use';
    return {
      Insert: getPermissionByKey(page, 'Insert'),
      Update: getPermissionByKey(page, 'Update'),
      Delete: getPermissionByKey(page, 'Delete'),
    };
  });

  /** 搜索条件 */
  const searchParams = ref<IParams>({
    productFamilyId: undefined,
    productIds: [],
  });
  /** 分页 */
  const pagination = ref<PaginationProps>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  /** 表格数据 */
  const tableData = ref<IData[]>();

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
        'product_family_id_.eq': searchParams.value.productFamilyId,
        'product_ref_.versionIn': searchParams.value.productIds,
      },
    };
    const res = await listByPage(params);
    console.log('查询条件params', params, res);
    if (res.data) {
      const dict = res.dict;
      tableData.value =
        res.data.map((x) => {
          console.log('dsdf', x);
          // 解析每条数据
          if (x.product_ref_) {
            x.__dict__product_ref_ = dict.product_ref_?.[x.product_ref_];
          }
          if (x.product_family_id_) {
            x.__dict__product_family_id_ = dict.product_family_id_?.[x.product_family_id_];
          }
          if (x.edhr_id_) {
            x.__dict__edhr_id_ = dict.edhr_id_?.[x.edhr_id_];
          }

          if (x.product_release_ref_) {
            x.__dict__product_release_ref_ = dict.product_release_ref_?.[x.product_release_ref_];
          }
          return x;
        }) || [];
      pagination.value.total = res.totalCount || 0;
    } else {
      tableData.value = [];
      pagination.value.total = 0;
    }
  };

  /** 编辑 */
  const edit = (data: IEdhrUse) => {
    openModal({
      data,
      action: EdhrUseAction.EDIT,
      shouldClose: async (_data) => {
        await submit(_data);
        console.log('调用后台接口：edit', _data);
        await load();
        return true;
      },
    });
  };

  /** 新建 */
  const create = () => {
    openModal({
      action: EdhrUseAction.NEW,
      shouldClose: async (data: IEdhrUse) => {
        await submit(data);
        console.log('调用后台接口：create', data);
        await load();
        return true;
      },
    });
  };

  /** 删除 */
  const remove = async (data: IEdhrUse) => {
    await removeByIds(data.id_!);
    console.log('调用后台接口：remove', data);
    load();
  };

  /**
   * 执行操作
   * @param action 操作标识
   * @param record 对应的edhr数据
   */
  function executeAction(action: EdhrUseAction, record?: any) {
    switch (action) {
      case EdhrUseAction.DELETE:
        remove(record);
        break;
      case EdhrUseAction.EDIT:
        edit(record);
        break;
      case EdhrUseAction.NEW:
        create();
        break;
      case EdhrUseAction.ITEMS:
        // create();
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
