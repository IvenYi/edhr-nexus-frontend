import { ref } from 'vue';
import { UserGrantedAction } from './constants';
import { type PaginationProps } from '/@/components/Table';
import { openModal } from '../modal/use-modal';
import { IUserGranted } from './type';
import {
  getAppGrantedUserGrantedStatistic,
  getAppGrantedUserPageList,
  getAppGrantedUserRemoveAndTransfer,
  postAppGrantedUserBatch,
} from '/@/apis/gct-apaas/AppGrantedUserController';
import { AppGrantedStatisticDTO } from '/@/apis/gct-platform/model';
import { usePagePermissions } from '../../../hooks/usePagePermissions';

/** 统计数据 */
const statistics = ref<AppGrantedStatisticDTO>({
  total: 0,
  remain: 0,
  used: 0,
});

const totalMap = ref({});

export function UseUserGranted() {
  const userGrantedUsePerms = usePagePermissions('user-granted');

  /** 搜索条件 */
  const searchParams = ref<IParams>({
    fullname: undefined,
    username: undefined,
  });
  /** 分页 */
  const pagination = ref<PaginationProps>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  /** 表格数据 */
  const tableData = ref<IData[]>();

  /** 加载数据 */
  const load = async () => {
    // const params = {
    //   pageNo: pagination.value.current ?? 1,
    //   pageSize: pagination.value.pageSize,
    //   ...searchParams.value,
    // };
    // const res = await getAppGrantedUserPageList(params);
    // console.log('查询条件params', params, res);
    // if (res) {
    //   tableData.value = res.data || [];
    //   pagination.value.total = res.totalCount || 0;
    // } else {
    //   tableData.value = [];
    //   pagination.value.total = 0;
    // }

    // 加载统计数据
    const info = await getAppGrantedUserGrantedStatistic({});
    statistics.value = info!;
  };

  async function getTotal(type) {
    delete totalMap.value[type];
    const res = await getAppGrantedUserPageList({
      pageNo: 1,
      pageSize: 999999,
      searchTag: type === 'share' ? 2 : 1,
    });
    totalMap.value[type] = res?.totalCount || 0;
  }

  /** 移除并移交 */
  const handover = (data: IUserGranted) => {
    return new Promise((resolve) => {
      openModal({
        data,
        action: UserGrantedAction.Handover,
        shouldClose: async ({ user }) => {
          await getAppGrantedUserRemoveAndTransfer({
            sUserId: data.id!,
            tUserId: user,
          });
          console.log('调用后台接口：edit', user);
          await load();
          resolve(true);
          return true;
        },
      });
    });
  };

  /** 添加 */
  const add = () => {
    return new Promise((resolve) => {
      openModal({
        action: UserGrantedAction.Add,
        shouldClose: async ({ user }) => {
          await postAppGrantedUserBatch({ userIds: user });
          // await postAppGrantedUser({ userId: user });
          console.log('调用后台接口：create', user);
          await load();
          getTotal('authore');
          getTotal('share');
          resolve(true);
          return true;
        },
      });
    });
  };

  /**
   * 执行操作
   * @param action 操作标识
   * @param record 对应的edhr数据
   */
  function executeAction(action: UserGrantedAction, record?: any) {
    switch (action) {
      case UserGrantedAction.Add:
        add();
        break;
      case UserGrantedAction.Handover:
        handover(record);
        break;
      default:
        console.error(action, '暂不支持');
    }
  }
  function resetAll() {
    statistics.value = {
      total: 0,
      remain: 0,
      used: 0,
    };
    totalMap.value = {};
  }

  return {
    load,
    statistics,
    tableData,
    searchParams,
    pagination,
    executeAction,
    userGrantedUsePerms,
    add,
    handover,
    totalMap,
    getTotal,
    resetAll,
  };
}
