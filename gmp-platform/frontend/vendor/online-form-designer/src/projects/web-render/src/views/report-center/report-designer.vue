<template>
  <basic-page-render>
    <div class="flex h100% w100%">
      <report-slider
        ref="reportSlider"
        @changeSelect="changeSelect"
        module="report_module"
        :siderTitle="t('sys.report.reportCategory')"
      />

      <div class="table-wrap empty" v-if="tableData && !tableData.length && !isSearch">
        <van-empty :image="emptyPng" :description="$t('sys.report.noReportTip')" />
        <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
          {{ t('sys.new') + t('sys.report.report') }}
        </a-button>
      </div>
      <template v-if="(tableData && tableData.length) || isSearch">
        <div class="table-wrap">
          <div class="flex justify-between mb-20px">
            <a-input-group compact>
              <a-select
                v-model:value="serachType"
                style="width: 100px"
                @change="handleChange"
                class="type"
              >
                <a-select-option value="name">{{ t('sys.report.reportName') }}</a-select-option>
                <a-select-option value="visibleRange">{{
                  t('sys.report.viewerRange')
                }}</a-select-option>
              </a-select>
              <a-input
                v-show="serachType === 'name'"
                v-model:value.trim="formData.name"
                style="width: 200px"
                :placeholder="t('sys.searchText')"
                @pressEnter="getTableData()"
              >
                <template #suffix>
                  <SearchOutlined @click="getTableData()" />
                </template>
              </a-input>
              <span v-show="serachType === 'visibleRange'" ref="selectRef">
                <a-select
                  v-model:value="formData.visibleRange"
                  style="width: 200px"
                  class="visible-range"
                  :dropdownMatchSelectWidth="false"
                  :open="open"
                  :placeholder="t('sys.chooseText')"
                  :fieldNames="{
                    label: 'name',
                    value: 'formatId',
                  }"
                  :options="options"
                  allowClear
                  @click="open = !open"
                  @change="rangeChange"
                >
                  <template #placeholder>
                    {{ t('sys.chooseText') }}
                  </template>
                  <template #dropdownRender="{ menuNode: menu }">
                    <query-select
                      style="width: 300px"
                      @changeSelect="changevisibleRange"
                      :selectKey="formData.visibleRange"
                    />
                  </template>
                </a-select>
              </span>
            </a-input-group>

            <div class="flex">
              <switch-tab class="mr-16px" v-model:showType="clientType" type="designer" />
              <a-button v-if="userActions.Insert" class="mr-16px" type="primary" @click="handleAdd">
                {{ t('sys.new') + t('sys.report.report') }}
              </a-button>
            </div>
          </div>

          <!-- 表格 -->
          <report-table
            v-if="clientType === 'List'"
            :tableData="tableData"
            :pagination="pagination"
            :categoryId="selectKeys"
            @reload="handleTableChange"
          />
          <!-- 卡片 -->
          <view-card
            v-else
            :tableData="tableData"
            :pagination="pagination"
            :categoryId="selectKeys"
            :isEdit="true"
            @reload="handleTableChange"
          />
        </div>
      </template>
    </div>
    <create-report @register="register" @ok="() => getTableData()" />
  </basic-page-render>
</template>

<script setup lang="ts" name="process-instance">
  import { ref, reactive, onMounted, computed, unref, onUnmounted } from 'vue';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';
  import ReportSlider from './component/report-slider.vue';
  import ReportTable from './component/report-table.vue';
  import ViewCard from './component/view-card.vue';
  import SwitchTab from './component/switch-tab.vue';
  import emptyPng from '/@/assets/images/empty.png';
  import { useI18n } from 'vue-i18n';
  import CreateReport from './modals/create-report.vue';
  import { useModal } from '/@/components/Modal';
  import { postReportPageList } from '/@/apis/gct-apaas/ReportController';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import QuerySelect from './component/select-query/index.vue';

  const [register, { openModal }] = useModal();
  const userStore = useUserStore();

  const state = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_report-designer_switch-tab`,
    () => {
      return {
        type: '',
      };
    },
  );

  const selectKeys = ref('');
  const reportSlider = ref(null);
  const { t } = useI18n();
  const clientType = ref<'Card' | 'List'>(state.value.type || 'List');
  const tableData = ref();
  const selectRef = ref();
  const formData = ref({
    name: '',
    visibleRange: undefined,
  });

  const loading = ref(false);
  const options = ref([]);
  const serachType = ref('name');
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: ['10', '20', '50', '100'],
    total: 1,
  });
  const handleAdd = () => {
    openModal(true, {
      categoryId: selectKeys.value || reportSlider.value?.getFirstCategory()?.id,
    });
  };

  /** 筛选项类型变化 */
  const handleChange = () => {
    formData.value = {
      name: '',
      visibleRange: undefined,
    };
    getTableData();
  };
  const handleClickOutside = (event) => {
    const dropdownEl = document.querySelector('.waiting-area-tabs');
    if (
      selectRef.value &&
      !selectRef.value.contains(event.target) &&
      dropdownEl &&
      !dropdownEl.contains(event.target)
    ) {
      open.value = false;
    }
  };

  const open = ref(false);

  const isSearch = ref(false);

  const userActions = computed(() => {
    const page = 'ReportDesign';
    return {
      Insert: !!getPermissionByKey(page, 'Insert'),
    };
  });

  const changevisibleRange = (value, option) => {
    formData.value.visibleRange = value;
    options.value = [option];
    open.value = false;
    pagination.current = 1;
    getTableData();
  };

  const rangeChange = (value) => {
    if (!value) {
      setTimeout(() => {
        formData.value.visibleRange = undefined;
      });
      getTableData();
    }
  };
  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current || pagination.current;
    pagination.total = total || pagination.total;
    pagination.pageSize = pageSize || pagination.pageSize;
    getTableData();
  };

  const getTableData = () => {
    loading.value = true;

    postReportPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      categoryId: selectKeys.value,
      ...formData.value,
    })
      .then((res) => {
        if (formData.value.name || formData.value.visibleRange) {
          isSearch.value = true;
        } else {
          isSearch.value = false;
        }

        tableData.value = res?.data || [];
        pagination.total = res?.totalCount || 0;
        if (!res?.data.length && res?.totalCount) {
          pagination.current--;
          getTableData();
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const changeSelect = (id) => {
    pagination.current = 1;
    selectKeys.value = id == 1 ? '' : id;
    if (id) {
      getTableData();
    }
  };
  onMounted(() => {
    getTableData();
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<style lang="scss" scoped>
  .table-wrap {
    width: calc(100% - 246px);
    width: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :deep(.type.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    border-radius: 4px 0 0 4px;
  }

  :deep(.type.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    border-radius: 4px 0 0 4px;
  }

  :deep(.visible-range.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
    margin-left: -1px;
    border-radius: 0 4px 4px 0;
  }

  :deep(span.ant-input-affix-wrapper) {
    border-top-right-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
  }

  :deep(.van-empty__description) {
    margin-top: 4px;
  }
</style>
