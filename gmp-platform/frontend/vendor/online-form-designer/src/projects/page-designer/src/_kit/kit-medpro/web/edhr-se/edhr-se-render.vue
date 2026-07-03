<template>
  <div>
    <div class="bg-[#fff] px-4 py-3 border-rd">
      <a-form ref="searchRef" :model="searchFormState">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item label="工单" name="orderName">
              <a-select
                v-model:value="searchFormState.orderName"
                show-search
                style="width: 100%"
                :placeholder="t('sys.chooseText')"
                :options="orderList"
                optionFilterProp="label"
                @change="changeOrder"
                allowClear
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="批次" required name="containerId">
              <a-select
                v-model:value="searchFormState.containerId"
                show-search
                optionFilterProp="label"
                style="width: 100%"
                :placeholder="t('sys.chooseText')"
                :loading="containerLoading"
                :options="containerList"
                allowClear
                @popupScroll="onContainerPopupScroll"
                @search="handleContainerSearch"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <a-button class="mr-10px" @click="resetForm">{{ t('sys.reset') }}</a-button>
              <a-button class="mr-10px" type="primary" @click="onSubmit">
                {{ t('sys.query') }}
              </a-button>
              <a-button v-if="print" type="primary" @click="handlerPrint">{{
                t('sys.print')
              }}</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <div
        v-if="containerData.name_"
        class="relative grid grid-cols-6 gap-2 p-2 results-field-container"
        :style="{ 'grid-template-columns': `repeat(6, 1fr)` }"
      >
        <div class="container-detail-item" v-for="item in containerColumns" :key="item.key">
          {{ item.title + '：' + containerData[item.key] }}
        </div>
      </div>
    </div>
    <div
      class="bg-[#fff] px-4 py-3 border-rd mt-8px"
      v-if="modulesList?.includes('passingStation')"
    >
      <a-collapse v-model:activeKey="passingStationKey" ghost class="gct-vant-item">
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <a-collapse-panel key="1">
          <template #header>
            <span class="collapse-title">
              <span class="collapse-txt">过站信息</span>
            </span>
          </template>
          <a-table
            :dataSource="passingStationDataSource"
            :columns="passingStationColumns"
            :pagination="false"
            class="mt-10px"
          >
            <template #bodyCell="{ column, record, index, text }">
              <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
              <template v-if="column.dataIndex === 'move_info'">
                <div v-if="record.move_user && record.move_date">
                  {{ `${getUserName(record.move_user)} / ${record.move_date}` }}
                </div>
                <div v-else>-</div>
              </template>
              <template v-if="column.dataIndex === 'move_in_info'">
                <div v-if="record.move_in_user && record.move_in_date">
                  {{ `${getUserName(record.move_in_user)} / ${record.move_in_date}` }}
                </div>
                <div v-else>-</div>
              </template>
              <template v-if="column.dataIndex === 'move_sign'">
                <img
                  v-if="record.move_sign_name"
                  :src="record.move_sign_name"
                  style="max-width: 150px"
                />
                <div v-else-if="record.move_sign_user_id">
                  <div>{{ getUserName(record.move_sign_user_id) }}</div>
                  <div>{{ record.move_sign_time }}</div>
                </div>
                <div v-else>-</div>
              </template>
              <template v-if="column.dataIndex === 'move_in_sign'">
                <img
                  v-if="record.move_in_sign_name"
                  :src="record.move_in_sign_name"
                  style="max-width: 150px"
                />
                <div v-else-if="record.move_in_sign_user_id">
                  <div>{{ getUserName(record.move_in_sign_user_id) }}</div>
                  <div>{{ record.move_in_sign_time }}</div>
                </div>
                <div v-else>-</div>
              </template>
              <template v-if="column.dataIndex === 'qualified_qty'">
                <div v-if="text">
                  <div>{{ text }}</div>
                </div>
                <div v-else>-</div>
              </template>
              <template v-if="column.dataIndex === 'unqualified_qty'">
                <div v-if="text">
                  <div>{{ text }}</div>
                </div>
                <div v-else>-</div>
              </template>

              <template v-if="column.dataIndex === 'action'">
                <a-button type="link" @click="handleDetail(record)" style="padding-left: 0px">
                  {{ t('sys.view') }}
                </a-button>
              </template>
            </template>
          </a-table>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <div class="bg-[#fff] px-4 py-3 border-rd mt-8px" v-if="modulesList?.includes('check')">
      <a-collapse v-model:activeKey="checkKey" ghost class="gct-vant-item">
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <a-collapse-panel key="1">
          <template #header>
            <span class="collapse-title">
              <span class="collapse-txt">检验信息</span>
            </span>
          </template>
          <a-table
            :dataSource="checkDataSource"
            :columns="checkColumns"
            :pagination="false"
            class="mt-10px"
          >
            <template #bodyCell="{ column, record, text, index }">
              <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
              <template v-if="column.dataIndex === 'inspectors_'">{{
                (text && record._DICT?.inspectors_?.[text]?.[0]) || '-'
              }}</template>
              <template v-if="column.dataIndex === 'complete_time_'">{{ text || '-' }}</template>
              <template v-if="column.dataIndex === 'status_'">{{
                record._DICT.status_[text][0]
              }}</template>
              <template v-if="column.dataIndex === 'action'">
                <a-button
                  type="link"
                  @click="handleChecklistDetail(record)"
                  style="padding-left: 0px"
                >
                  {{ t('sys.view') }}
                </a-button>
              </template>
            </template>
          </a-table>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <Drawer ref="passingStationDrawerRef" :userDataNotOrg="userDataNotOrg" :orgData="orgData" />
    <CheckListDrawer ref="checklistDrawerRef" :userDataNotOrg="userDataNotOrg" :orgData="orgData" />
  </div>
</template>

<script setup lang="ts" name="gct-edhr-se">
  import { nextTick, onMounted, reactive, ref, toRefs } from 'vue';
  import { IEDhrSE } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
  import { passingStationColumns, checkColumns, containerColumns } from './type';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getUserInfoById, getUserListByTenantId } from '/@/apis/gct-platform/UserController';
  import Drawer from './components/drawer.vue';
  import CheckListDrawer from './components/checklist-drawer.vue';
  import { debounce } from 'lodash-es';
  import { FileModeEnum, PrintModeEnum } from '@gct/nocode-web-render';

  const { t } = useI18n();

  const props = defineProps<{
    widget: IEDhrSE;
  }>();

  const { print, modulesList } = toRefs(props.widget.props);
  const Event = getPageEvent();

  const searchRef = ref();

  const searchFormState = ref({
    orderName: undefined,
    containerId: undefined,
  });

  // 工单列表
  const orderList = ref([]);
  const containerLoading = ref(false);
  // 批次选项列表
  const containerList = ref<any[]>([]);
  const pagination = reactive<{ [key: string]: any }>({
    pageNo: 1,
    pageSize: 50,
    totalPage: 0,
    totalCount: 0,
  });
  const containerLoadMore = ref<boolean>(false);

  const getFieldData = async () => {
    const res: any = await postModelDataQueryRefData({
      modelKey: 'em_container',
      fieldKey: 'mfg_order_id_',
      refModelKey: 'em_mfg_order',
      pageNo: 1,
      pageSize: 99999,
    });
    orderList.value =
      res?.data?.map((item) => {
        return {
          label: item.name_,
          value: item.id_,
        };
      }) || [];
  };
  const getContainerList = async (name?: string, searchTotal?: boolean) => {
    try {
      containerLoading.value = true;
      const res: any = await Event.context.$httpBizService(
        {
          action: 'listByPage',
          key: 'em_container',
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          query: { 'mfg_order_id_.eq': searchFormState.value.orderName, 'name_.like': name },
          pageNo: !searchTotal ? pagination.pageNo : 1,
          pageSize: !searchTotal ? pagination.pageSize : 999999,
          sorts: [
            { sortField: 'create_time_', sortType: 'desc' },
            { sortField: 'name_', sortType: 'desc' },
          ],
        },
      );
      if (!searchTotal) {
        containerLoadMore.value = !!(res.totalPage > res.pageNo);
      }
      (res?.data ?? []).forEach((op) => {
        if (!containerList.value.find((it) => it.value === op.id_)) {
          containerList.value.push({
            label: op.name_,
            value: op.id_,
          });
        }
      });
    } catch (err) {}
    containerLoading.value = false;
  };
  const changeOrder = async () => {
    searchFormState.value.containerId = undefined;
    containerList.value = [];
    pagination.pageNo = 1;
    pagination.pageSize = 50;
    getContainerList();
  };
  const onContainerPopupScroll = debounce(async (e) => {
    const { target } = e;
    if (target.scrollTop + target.offsetHeight + 30 >= target.scrollHeight) {
      if (!containerLoadMore.value) return;
      try {
        pagination.pageNo += 1;
        await getContainerList();
        await nextTick();
      } catch (error) {}
    }
  }, 300);
  // 批次支持远程搜索匹配
  const handleContainerSearch = debounce(async (name) => {
    if (containerList.value.find((op) => op.label.includes(name))) {
      return;
    }
    await getContainerList(name, true);
    containerLoadMore.value = true;
  }, 300);
  const onSubmit = async () => {
    await searchRef.value
      .validate()
      .then(async () => {
        Event.runEventByName('afterSearch', props.widget.events, searchFormState.value.containerId);
        await getContainerData();
        if (modulesList.value?.includes('passingStation')) {
          await getPassingStationData();
        }
        if (modulesList.value?.includes('check')) {
          await getCheckData();
        }
      })
      .catch((error) => {
        console.log('error', error);
      });
  };
  const resetForm = async () => {
    searchRef.value.resetFields();
    containerData.value = {};
    passingStationDataSource.value = [];
    checkDataSource.value = [];
    containerList.value = [];
    pagination.pageNo = 1;
    pagination.pageSize = 50;
    getContainerList();
    await Event.runEventByName('afterClear', props.widget.events);
  };

  const containerData = ref<any>({});

  const getContainerData = async () => {
    const data: any = await Event.context.$customBizService.get(
      {
        action: 'getById',
        key: 'em_container',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { id: searchFormState.value.containerId },
    );
    const transformData = transformSourceData([data.data], data.dict) as any;
    const obj = transformData?.[0] ?? {};
    containerData.value = {
      ...obj,
      name_: obj.name_ ?? '-',
      qty_: obj.qty_ ?? '-',
      product_id_: (obj.product_id_ && obj._DICT.product_id_?.[obj.product_id_][0]) ?? '-',
      mfg_order_id_: (obj.mfg_order_id_ && obj._DICT.mfg_order_id_?.[obj.mfg_order_id_][0]) ?? '-',
      workflow_id_: (obj.workflow_id_ && obj._DICT.workflow_id_?.[obj.workflow_id_][0]) ?? '-',
    };
  };

  const passingStationDataSource = ref<any>([]);
  const passingStationKey = ref(['1']);
  const passingStationDrawerRef = ref();

  const getPassingStationData = async () => {
    if (!searchFormState?.value?.containerId) return;
    const res: any = await Event.context.$customBizService.post(
      {
        action: 'biz_query_container_edhr_mcoa',
        key: 'em_container',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        data: {
          containerId: searchFormState.value.containerId,
          level: 'list', //查询列表：list，查询详情：detail，打印：print
          containerInfo: [], //在查询详情时，将明细全部传入，此处主要需要进站与出站的事务id
        },
      },
    );

    const promises = res.map(async (item) => {
      let moveInUser, moveUser;
      if (item.move_in_sign_user_id) {
        moveInUser = await getUserInfoById({ id: item.move_in_sign_user_id });
      }
      if (item.move_sign_user_id) {
        moveUser = await getUserInfoById({ id: item.move_sign_user_id });
      }

      const entry = {
        move_in_user_name: moveInUser?.fullname,
        move_user_name: moveUser?.fullname,
        ...item,
      };

      return entry;
    });

    // 等待所有异步操作完成并处理结果
    const results = await Promise.all(promises);

    // 将结果扁平化
    const data = results.flat().filter(Boolean); // 过滤掉 undefined
    passingStationDataSource.value = data;
  };
  const checklistDrawerRef = ref();

  const handleDetail = (row) => {
    passingStationDrawerRef.value.showDrawer(row, searchFormState.value.containerId);
  };

  const handleChecklistDetail = (row) => {
    if (row.collection_method_ === 'dataCollection') {
      checklistDrawerRef.value.showDrawer(row);
    } else {
      Event.context.$onlineFormModal({
        modelType: 'drawer',
        selfId: row.online_form_id_,
        title: '详情',
        keep: false,
        modeType: 'view-mode',
        callback: (options) => {
          console.log('options', options);
        },
      });
    }
  };

  const checkDataSource = ref([]);
  const checkKey = ref(['1']);

  const getCheckData = async () => {
    if (!searchFormState?.value?.containerId) return;
    const data: any = await Event.context.$httpBizService(
      {
        action: 'listAll',
        key: 'em_check_task',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { query: { 'container_id_.eq': searchFormState.value.containerId } },
    );
    checkDataSource.value = transformSourceData(data.data, data.dict) as any;
  };

  const handlerPrint = () => {
    searchRef.value
      .validate()
      .then(async () => {
        if (!containerData?.value?.id_) {
          await getContainerData();
        }
        await Event.runEventByName('onPrint', props.widget.events, containerData.value);
        const url = `${location.origin}${location.pathname}#/edhr/print-view/${searchFormState.value.containerId}`;
        window.open(url);
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  const orgData = ref<any>([]);
  const userDataNotOrg = ref<any>([]);

  // 查询所有的部门
  const getOrgData = async () => {
    const data = (await getDesignerCommonGetCanBeUsedOrg()) ?? [];
    orgData.value = data.map((e) => {
      return { ...e, formatId: `ORG:${e.id}` };
    });
  };

  // 查询部门下的人员
  const getUserDataNotOrg = async () => {
    userDataNotOrg.value = ((await getUserListByTenantId()) ?? []).map((e) => {
      return { ...e, formatId: `USER:${e.id}` };
    });
  };

  const getUserName = (id) => {
    return userDataNotOrg.value.find((n) => n.id === id)?.fullname ?? '';
  };

  onMounted(() => {
    getFieldData();
    getContainerList();
    getOrgData();
    getUserDataNotOrg();
  });

  defineExpose({
    getContainerData: () => {
      return containerData.value;
    },
    search: onSubmit,
  });
</script>
<style scoped lang="less">
  :deep(.ant-collapse-header) {
    padding: 0 !important;
    .collapse-title {
      position: relative;
      padding-left: 6px;
      &::before {
        position: absolute;
        left: 0;
        top: 50%;
        content: '';
        width: 3px;
        height: 16px;
        background: var(--ant-primary-color);
        transform: translate(0, -50%);
      }
      .collapse-txt {
        font-size: 16px;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.85);
        margin-left: 4px;
      }
    }
  }

  :deep(.ant-collapse-item-disabled > .ant-collapse-header) {
    cursor: default !important;
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0 !important;
  }

  .collapse-icon-down {
    position: absolute;
    right: 0;
    bottom: -4px;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }
  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }
</style>
