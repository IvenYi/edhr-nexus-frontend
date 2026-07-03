<template>
  <Teleport to=".preview-print">
    <div class="gct-edhr-se-print cmp-paper-wrapper">
      <img src="../top.png" alt="" />
      <div class="module-container">
        <div class="title">批次信息</div>
        <div class="container-header">
          <div class="container-header-item" v-for="item in containerColumns" :key="item.key">
            {{ item.title }}
          </div>
        </div>
        <div class="container-detail">
          <div class="container-detail-item" v-for="item in containerColumns" :key="item.key">
            {{ containerData[item.key] || '-' }}
          </div>
        </div>
      </div>
      <div class="module-container">
        <div class="title">生产信息</div>
        <a-table
          :dataSource="dataSource"
          :columns="productionColumns"
          :pagination="false"
          bordered
          :rowClassName="
            (record) => {
              if (!record.index) {
                return 'gct-no-padding';
              }
            }
          "
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'workflow_step_name'">
              <div v-if="record.index">{{ text }}</div>
              <div v-else>
                <div
                  class="move-in-data-collection-container"
                  v-for="item in record.moveInDataCollectionHistory"
                  :key="item.id_"
                >
                  <div class="detail-title">
                    {{ item.name_ ? `数据采集 - ${item.name_}` : '数据采集' }} | 进站
                  </div>
                  <div style="padding: 12px">
                    <a-table
                      v-if="item.collection_method_ === 'dataCollection'"
                      :dataSource="item.entries_"
                      :columns="entriesColumns"
                      :pagination="false"
                      bordered
                      class="mt-10px"
                    >
                      <template #bodyCell="{ column, record, index }">
                        <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                        <template v-if="column.dataIndex === 'value_'">
                          <template v-if="record.type_ === 'image'">
                            <template v-if="getDataCollectValue(record)?.length">
                              <div
                                v-for="(img, i) in getDataCollectValue(record)"
                                :key="i"
                                class="mt-6px"
                              >
                                <img :src="img" style="max-width: 150px" />
                              </div>
                            </template>
                          </template>
                          <template v-else-if="record.type_ === 'attachment'">
                            <FieldUpload
                              :modelValue="getDataCollectValue(record)"
                              :isDesign="false"
                              readonly
                              hideSwitch
                            />
                          </template>
                          <template v-else>
                            {{ getDataCollectValue(record) }}
                          </template>
                        </template>
                      </template>
                    </a-table>
                    <div class="bg-#F7F8FA p-10px mt-10px" v-else>
                      <a-button
                        type="link"
                        ghost
                        @click="openOnlineFormModal(item.online_form_inst_id_)"
                      >
                        {{ `电子表单 【${item.online_form_name_}】` }}
                      </a-button>
                    </div>
                  </div>
                </div>
                <div
                  class="move-data-collection-container"
                  v-for="item in record.moveDataCollectionHistory"
                  :key="item.id_"
                >
                  <div class="detail-title">
                    {{ item.name_ ? `数据采集 - ${item.name_}` : '数据采集' }} | 出站
                  </div>
                  <div style="padding: 12px">
                    <a-table
                      v-if="item.collection_method_ === 'dataCollection'"
                      :dataSource="item.entries_"
                      :columns="entriesColumns"
                      :pagination="false"
                      bordered
                      class="mt-10px"
                    >
                      <template #bodyCell="{ column, record, index }">
                        <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                        <template v-if="column.dataIndex === 'value_'">
                          <template v-if="record.type_ === 'image'">
                            <template v-if="getDataCollectValue(record)?.length">
                              <div
                                v-for="(img, i) in getDataCollectValue(record)"
                                :key="i"
                                class="mt-6px"
                              >
                                <img :src="img" style="max-width: 150px" />
                              </div>
                            </template>
                          </template>
                          <template v-else-if="record.type_ === 'attachment'">
                            <FieldUpload
                              :modelValue="getDataCollectValue(record)"
                              :isDesign="false"
                              readonly
                              hideSwitch
                            />
                          </template>
                          <template v-else>
                            {{ getDataCollectValue(record) }}
                          </template>
                        </template>
                      </template>
                    </a-table>
                    <div class="bg-#F7F8FA p-10px mt-10px" v-else>
                      <a-button
                        type="link"
                        ghost
                        @click="openOnlineFormModal(item.online_form_inst_id_)"
                      >
                        {{ `电子表单 【${item.online_form_name_}】` }}
                      </a-button>
                    </div>
                  </div>
                </div>
                <div class="txn-scrap-container" v-if="record.txn_scrap_detail.length">
                  <div class="detail-title"> 不良品报废 </div>
                  <div style="padding: 12px">
                    <a-table
                      :dataSource="record.txn_scrap_detail"
                      :columns="txnScrapDetailColumns"
                      :pagination="false"
                      bordered
                      class="mt-10px"
                    >
                      <template #bodyCell="{ column, index }">
                        <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                      </template>
                    </a-table>
                  </div>
                </div>
                <div class="material-issue-container" v-if="record.material_issue.length">
                  <div class="detail-title"> 上料信息 </div>
                  <div style="padding: 12px">
                    <a-table
                      :dataSource="record.material_issue"
                      :columns="txnMaterialIssueColumns"
                      :pagination="false"
                      bordered
                      class="mt-10px"
                    >
                      <template #bodyCell="{ column, index }">
                        <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                      </template>
                    </a-table>
                  </div>
                </div>
              </div>
            </template>
            <template v-if="column.dataIndex === 'move_in_info'">
              <div v-if="record.move_in_user && record.move_in_date">
                <div>{{ getUserName(record.move_in_user) }}</div>
                <div>{{ record.move_in_date }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
            <template v-if="column.dataIndex === 'move_info'">
              <div v-if="record.move_user && record.move_date">
                <div>{{ getUserName(record.move_user) }}</div>
                <div>{{ record.move_date }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
            <template v-if="column.dataIndex === 'move_sign'">
              <img
                v-if="record.move_sign_name"
                :src="record.move_sign_name"
                style="max-width: 150px"
              />
              <div v-else-if="record.move_user_name">
                <div>{{ getUserName(record.move_user_name) }}</div>
                <div>{{ record.move_sign_time }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
            <template v-if="column.dataIndex === 'move_in_sign'">
              <img
                v-if="record.move_in_sign_name"
                :src="record.move_in_sign_name"
                style="max-width: 150px"
              />
              <div v-else-if="record.move_in_user_name">
                <div>{{ getUserName(record.move_in_user_name) }}</div>
                <div>{{ record.move_in_sign_time }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
            <template v-if="column.dataIndex === 'qualified_qty'">
              <div v-if="text">
                <div>{{ text }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
            <template v-if="column.dataIndex === 'unqualified_qty'">
              <div v-if="text">
                <div>{{ text }}</div>
              </div>
              <div v-else style="text-align: center">-</div>
            </template>
          </template>
        </a-table>
      </div>
      <div class="module-container page-break" v-if="dataCollects.length || onLineFormIds.length">
        <div class="title">检验信息</div>
        <div
          class="move-in-data-collection-container"
          v-for="item in dataCollects"
          :key="item.name"
        >
          <div class="detail-title"> {{ item.name }} </div>
          <div style="padding: 12px">
            <a-table
              :dataSource="item.dataList"
              :columns="entriesColumns"
              :pagination="false"
              bordered
              class="mt-10px"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.dataIndex === 'index'">{{ index + 1 }}</template>
                <template v-if="column.dataIndex === 'value_'">
                  <template v-if="record.type_ === 'image'">
                    <template v-if="getDataCollectValue(record)?.length">
                      <div v-for="(img, i) in getDataCollectValue(record)" :key="i" class="mt-6px">
                        <img :src="img" style="max-width: 150px" />
                      </div>
                    </template>
                  </template>
                  <template v-else>
                    {{ getDataCollectValue(record) }}
                  </template>
                </template>
              </template>
            </a-table>
          </div>
        </div>
        <div v-if="onLineFormIds.length">
          <div class="page-break"></div>
          <MedProStandardEdhrBatchView
            :selfId="onLineFormIds"
            :paramExtraProps="{ _gct_useDynRowHeight_: true }"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts" name="gct-edhr-se-print">
  import { computed, onMounted, ref, onBeforeMount, onUnmounted } from 'vue';
  import { EntityModelCategoryEnum } from '/@/projects/app-designer/src/enum';
  import { useRoute } from 'vue-router';
  import {
    containerColumns,
    productionColumns,
    entriesColumns,
    txnScrapDetailColumns,
    txnMaterialIssueColumns,
  } from '../type';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { MedProStandardEdhrBatchView } from '/@online-form/views/integration/apaas_si/index';
  import { getDesignerCommonGetCanBeUsedOrg } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getUserInfoById, getUserListByTenantId } from '/@/apis/gct-platform/UserController';
  // import { getUserListByTenantId } from '/@/apis/gct-platform/MinioController';
  import { FieldUpload } from '/@/components/FieldUpload';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const route = useRoute();
  const usePathQuery = usePathQueryStore();

  const dataSource = ref<any>([]);

  const containerId = computed(() => {
    return route.params.id?.toString() || '';
  });

  const getDataSource = async () => {
    const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_query_container_edhr_mcoa',
        modelKey: 'em_container',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        data: {
          containerId: containerId.value,
          level: 'print',
          containerInfo: [],
        },
      },
    );
    const promises = res.map(async (item, index) => {
      let moveInUser, moveUser;
      if (item.move_in_sign_user_id) {
        moveInUser = await getUserInfoById({ id: item.move_in_sign_user_id });
      }
      if (item.move_sign_user_id) {
        moveUser = await getUserInfoById({ id: item.move_sign_user_id });
      }
      const entry = {
        index: index + 1,
        move_in_user_name: moveInUser?.fullname,
        move_user_name: moveUser?.fullname,
        ...item,
      };
      const {
        material_issue,
        txn_scrap_detail,
        moveDataCollectionHistory,
        moveInDataCollectionHistory,
      } = item;

      if (
        moveInDataCollectionHistory?.length ||
        moveDataCollectionHistory?.length ||
        material_issue?.length ||
        txn_scrap_detail?.length
      ) {
        return [
          entry,
          {
            material_issue,
            txn_scrap_detail,
            moveDataCollectionHistory,
            moveInDataCollectionHistory,
          },
        ];
      }

      return entry;
    });

    // 等待所有异步操作完成并处理结果
    const results = await Promise.all(promises);

    // 将结果扁平化
    const data = results.flat().filter(Boolean); // 过滤掉 undefined
    dataSource.value = data;
  };

  const containerData = ref({});

  const getContainerData = async () => {
    const data: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_container',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { query: { 'id_.eq': containerId.value } },
    );
    const transformData = transformSourceData(data.data, data.dict) as any;
    const obj = transformData?.[0] ?? {};
    containerData.value = {
      name_: obj.name_ ?? '-',
      qty_: obj.qty_ ?? '-',
      product_id_: (obj.product_id_ && obj._DICT.product_id_?.[obj.product_id_][0]) ?? '-',
      mfg_order_id_: (obj.mfg_order_id_ && obj._DICT.mfg_order_id_?.[obj.mfg_order_id_][0]) ?? '-',
      workflow_id_: (obj.workflow_id_ && obj._DICT.workflow_id_?.[obj.workflow_id_][0]) ?? '-',
    };
  };

  const onLineFormIds = ref<any>([]);
  const dataCollects = ref<any>([]);

  const getCheckData = async () => {
    const data: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_check_task',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { query: { 'container_id_.eq': containerId.value } },
    );

    const _onlineFormIds: any = [];
    const _dataCollects: any = [];
    data.data.forEach(async (item) => {
      if (item.collection_method_ === 'onlineForm') {
        _onlineFormIds.push(item.online_form_id_);
      } else {
        let dataList = await getDataCollect(item.id_);
        _dataCollects.push({
          name: item.checklist_name_,
          dataList,
        });
      }
    });
    dataCollects.value = _dataCollects;
    onLineFormIds.value = _onlineFormIds;
  };

  const getDataCollect = async (id) => {
    const data: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'listAll',
        modelKey: 'em_data_collection_item_history',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { query: { 'ref_master_id_.eq': id } },
    );
    const transformData = transformSourceData(data.data, data.dict) as any;
    return transformData;
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

  const getOrgName = (id) => {
    return orgData.value.find((n) => n.id === id)?.name ?? '';
  };

  const getUserName = (id) => {
    return userDataNotOrg.value.find((n) => n.id === id)?.fullname ?? (id.length > 8 ? '' : id);
  };

  const getDataCollectValue = (record) => {
    let value = record.value_;
    switch (record.type_) {
      case 'user':
        value = getUserName(value);
        break;
      case 'org':
        value = getOrgName(value);
        break;
      case 'boolean':
        value = value === 'true' ? record?.true_text_ ?? value : record?.false_text_ ?? value;
        break;
      case 'image':
      case 'attachment':
        let urls = value ? value.split(',') : [];
        urls = urls.map((item) => {
          return import.meta.env.VITE_MINIO_PATH + '/' + item;
        });
        value = urls;
        break;
    }
    return value;
  };

  const openOnlineFormModal = (id) => {
    const aid = usePathQuery.getAid();
    const { getEnv } = useEnv();
    const env = getEnv();
    window.open(
      `${location.origin}/src/projects/print-ssr/index.html?inst=${id}&appTag=${aid}#?env=${env}`,
    );
  };

  onBeforeMount(() => {
    // body下的增加特定样式
    document.body.classList.add('batch-edhr-print');
    getUserDataNotOrg();
    getOrgData();
    getCheckData();
    getContainerData();
  });

  onMounted(() => {
    getDataSource();
  });

  onUnmounted(() => {
    document.body.classList.remove('batch-edhr-print');
  });
</script>

<style lang="less">
  body.batch-edhr-print {
    overflow: auto !important;
  }

  @media print {
    @page {
      size: 210mm 297mm;
    }
  }

  html {
    height: 100%;
    overflow: visible;
  }

  body {
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #000;
    background: rgb(248, 249, 250);

    th,
    td,
    table {
      border-color: #999 !important;
    }
  }

  body > div {
    width: 210mm !important;
  }

  #app {
    display: none;
  }

  .gct-edhr-se-print {
    width: 210mm;

    img {
      width: 100%;
    }

    .ant-table-container {
      border-left-color: #999 !important;
    }

    .ant-table .ant-table-thead > tr > th {
      background-color: rgba(0, 0, 0, 0.1) !important;
    }

    .container-header {
      display: flex;
      background-color: rgba(0, 0, 0, 0.1) !important;
      &-item {
        border: 1px solid #999;
        color: rgba(0, 0, 0, 0.85);
        padding: 16px;
        flex: 1;
        &:not(:first-child) {
          border-left: none;
        }
      }
    }

    .container-detail {
      display: flex;
      &-item {
        border: 1px solid #999;
        border-top: none;
        padding: 16px;
        flex: 1;
        &:not(:first-child) {
          border-left: none;
        }
      }
    }

    .module-container {
      .title {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 48px;
        background: rgba(49, 104, 236, 0.2);
        border: 1px solid transparent;
        font-weight: 500;
        font-size: 16px;
        color: #3168ec;
      }
    }

    .detail-title {
      height: 48px;
      background: rgba(49, 104, 236, 0.1);
      border-radius: 0px 0px 0px 0px;
      display: flex;
      align-items: center;
      font-weight: 500;
      font-size: 16px;
      color: #3168ec;
      padding: 0 16px;

      &::before {
        content: '';
        display: inline-block;
        width: 2px;
        height: 12px;
        background: #3168ec;
        margin-right: 8px;
      }
    }

    .gct-no-padding {
      & > .ant-table-cell {
        padding: 0;
      }
    }

    .page-break {
      page-break-before: left;
    }
  }
</style>
