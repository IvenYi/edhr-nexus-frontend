<template>
  <div class="py16px px24px">
    <a-form ref="queryConfigFormRef" :model="queryConfig" layout="vertical" v-bind="formItemLayout">
      <a-collapse
        ghost
        v-model:activeKey="activeKey"
        expand-icon-position="right"
        class="config-collapse"
      >
        <a-collapse-panel key="1" header="基础信息">
          <a-form-item label="页面名称" name="name" :rules="[{ required: true }]">
            <a-input v-model:value="queryConfig.name" />
          </a-form-item>
          <a-form-item label="图标">
            <IconNextPicker
              show-background
              show-color
              v-model:value="queryConfig.icon"
              v-model:background="queryConfig.background"
              v-model:color="queryConfig.color"
              :style="{
                '--box-size': '40px',
              }"
            />
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel key="2" header="业务筛选条件">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="返工任务名称">
                <a-input
                  v-model:value="queryConfig.query.f_rework_name__jhwd"
                  type="text"
                  allowClear
                  placeholder="请输入返工任务名称"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="生产批次">
                <a-input
                  v-model:value="queryConfig.query.f_name__jhwd"
                  type="text"
                  allowClear
                  placeholder="请输入生产批次"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="订单编号">
                <a-input
                  v-model:value="queryConfig.query.f_order_code__jhwd"
                  type="text"
                  allowClear
                  placeholder="请输入订单编号"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="工单编号">
                <a-input
                  v-model:value="queryConfig.query.f_code__jhwd"
                  type="text"
                  allowClear
                  placeholder="请输入工单编号"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="物料">
                <a-tree-select
                  v-model:value="queryConfig.query.f_product_id__jhwd"
                  style="width: 100%"
                  :tree-data="productOptions"
                  show-search
                  placeholder="请选择物料"
                  allowClear
                  treeNodeLabelProp="full_path"
                  :virtual="false"
                  :filterTreeNode="() => true"
                  dropdown-class-name="gct-custom-select-dropdown vxe-table--ignore-clear"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="返工状态">
                <a-select
                  v-model:value="queryConfig.query.f_status__jhwd"
                  style="width: 100%"
                  :options="statusOptions"
                  show-arrow
                  allow-clear
                  placeholder="请选择返工状态"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel key="3" header="数量筛选条件">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="返工数量">
                <a-input-group compact>
                  <a-select
                    v-model:value="queryConfig.queryOperators.f_qty__jhwd"
                    :options="OPERATOR_TYPE"
                    style="width: 60px"
                  />
                  <a-input-number
                    v-model:value="queryConfig.query.f_qty__jhwd"
                    :min="1"
                    :step="1"
                    :precision="0"
                    style="width: calc(100% - 60px) !important"
                    placeholder="请输入返工数量"
                  />
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel key="4" header="时间筛选条件">
          <a-form-item v-for="field in time_fields" :key="field.key" :label="field.label">
            <div class="absolute right-0px top--31px">
              固定日期
              <a-switch
                :checked="!dynamicDateTypes.some((e) => e.value === queryConfig.query[field.key])"
                @change="(val) => handleTimeTypeChange(val, field.key)"
              />
            </div>
            <template
              v-if="!dynamicDateTypes.some((e) => e.value === queryConfig.query[field.key])"
            >
              <a-input-group compact>
                <a-select
                  v-model:value="queryConfig.queryOperators[field.key]"
                  :options="timeOptions"
                  style="width: 100px"
                />
                <a-range-picker
                  v-model:value="queryConfig.query[field.key]"
                  format="YYYY-MM-DD HH:mm:ss"
                  valueFormat="YYYY-MM-DD HH:mm:ss"
                  :showTime="true"
                  style="width: calc(100% - 100px)"
                />
              </a-input-group>
            </template>
            <a-radio-group
              v-else
              v-model:value="queryConfig.query[field.key]"
              :options="dynamicDateTypes"
            />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed, h, onMounted } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { IconNextPicker, IconNext } from '/@/components/Icon';
  // import FieldWidget from './field-widget.vue';
  import dayjs from 'dayjs';
  import { IModal, SEARCH_SEVICE, useModal, EntityModelCategoryEnum } from '@gct/runtime';
  import { merge } from 'lodash-es';
  import {
    getModelComprehensiveEnumInfoByModelCategory,
    postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { DateSystemEnum, Ch_SystemVars } from '../../../user-group/constant/config';

  const OPERATOR_TYPE = [
    {
      label: '=',
      value: 'eq',
    },
    {
      label: '>',
      value: 'gt',
    },
    {
      label: '>=',
      value: 'ge',
    },
    {
      label: '<',
      value: 'lt',
    },
    {
      label: '<=',
      value: 'le',
    },
    {
      label: '!=',
      value: 'ne',
    },
  ];

  const productOptions = ref([]);

  const TIME_OPE = [
    SEARCH_SEVICE.RANGE,
    SEARCH_SEVICE.ORANGE,
    SEARCH_SEVICE.RORANGE,
    SEARCH_SEVICE.LORANGE,
  ];

  const timeOptions = computed(() => {
    return TIME_OPE.map((e) => {
      return {
        label: $t(`sys.model.${e}`),
        value: e,
      };
    });
  });

  const time_fields = [
    {
      label: '工单计划开始时间',
      key: 'f_planned_start_date__jhwd',
    },
    {
      label: '工单计划结束时间',
      key: 'f_planned_completion_date__jhwd',
    },
    {
      label: '工单实际开始时间',
      key: 'f_real_start_date__jhwd',
    },
    {
      label: '工单实际结束时间',
      key: 'f_real_completion_date__jhwd',
    },
    {
      label: '返工实际开始时间',
      key: 'f_start_date__jhwd',
    },
    {
      label: '返工实际结束时间',
      key: 'f_completion_date__jhwd',
    },
  ];

  const defProps = defineProps<{
    config?: any;
    modal: IModal;
  }>();

  const statusOptions = ref([]);
  const formItemLayout = {
    // labelCol: { span: 4 },
    // wrapperCol: { span: 20 },
  };
  const queryConfig = ref<any>({
    id: '',
    name: '',
    showCount: false,
    icon: '',
    query: {},
    queryOperators: {},
  });
  const activeKey = ref(['1', '2', '3', '4']);
  const queryConfigFormRef = ref();

  // const dynamicDateTypes = [
  //   {
  //     value: 'day',
  //     label: '本日',
  //   },
  //   {
  //     value: 'week',
  //     label: '本周',
  //   },
  //   {
  //     value: 'month',
  //     label: '本月',
  //   },
  //   {
  //     value: 'year',
  //     label: '本年',
  //   },
  // ];

  const dynamicDateTypes = computed(() => {
    return Object.values(DateSystemEnum)
      .filter((e) => e !== DateSystemEnum.NOW)
      .map((e) => {
        return {
          value: e,
          label: $t(Ch_SystemVars[e]),
        };
      });
  });

  onMounted(() => {
    merge(queryConfig.value, defProps.config);
    getStatusData();
    getProductData();
  });

  // function getTimeRange(type) {
  //   if (type !== 'week') {
  //     return {
  //       start: dayjs().startOf(type).format('YYYY-MM-DD HH:mm:ss'),
  //       end: dayjs().endOf(type).format('YYYY-MM-DD HH:mm:ss'),
  //     };
  //   } else {
  //     const currentDate = dayjs();
  //     const day = currentDate.day();
  //     const subtractDays = day === 0 ? 6 : day - 1;
  //     const start = currentDate.subtract(subtractDays, 'day').startOf('day');
  //     const end = start.add(6, 'day').endOf('day');
  //     return {
  //       start: start.format('YYYY-MM-DD HH:mm:ss'),
  //       end: end.format('YYYY-MM-DD HH:mm:ss'),
  //     };
  //   }
  // }

  async function onSave() {
    await queryConfigFormRef.value.validate();
    return {
      ok: true,
      params: {
        ...queryConfig.value,
      },
    };
  }

  const handleTimeTypeChange = (checked, key) => {
    queryConfig.value.query[key] = !checked ? DateSystemEnum.CUR_WEEK : undefined;
    queryConfig.value.queryOperators[key] = !checked ? 'range' : undefined;
  };

  const getStatusData = async () => {
    const res: any = await getModelComprehensiveEnumInfoByModelCategory(
      { modelCategory: EntityModelCategoryEnum.ENTITY },
      {
        modelKey: 'em_container',
        fieldKey: 'status_',
      },
    );
    statusOptions.value = res?.map((e) => {
      return {
        ...e,
        label: e.text,
      };
    });
  };

  const getProductData = async () => {
    const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'rdoListByPage',
        modelKey: 'em_product',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { pageSize: 999999, pageNo: 1 },
      {},
    );
    productOptions.value = res?.data?.map((e) => {
      return {
        ...e,
        label: e.name_,
        value: e.id_,
        title: e.name_,
        full_path: () =>
          h('div', [
            h('span', `${e.name_}`),
            h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default')),
          ]),
        children: e.__CHILDREN__?.map((f) => {
          return {
            ...f,
            value: `${f.base_id_}:${f.id_}`,
            label: f.name_,

            title: () =>
              h('div', [
                h('span', { class: 'version' }, f.version_),
                f.default_ ? h('span', { class: 'version gct-custom-tag ml8px' }, '默认') : null,
              ]),
            full_path: () => h('div', [h('span', `${f.name_}:${f.version_}`)]),
          };
        }),
      };
    });
  };

  useModal(onSave);
</script>

<style lang="less" scoped>
  .query-config-wrapper {
    :deep(.ant-checkbox) {
      top: 0;
    }
  }
  :deep(.config-collapse) {
    .ant-collapse-header {
      font-size: 16px;
      color: #000000;
      font-weight: 500;
      padding: 0;
      padding-bottom: 16px;

      &::before {
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        background-color: var(--van-primary-color);
        border-radius: 10px;
        margin-right: 8px;
        position: relative;
        top: 6px;
      }
    }
  }

  :deep(.ant-collapse-content > .ant-collapse-content-box) {
    padding: 0;
  }
  :deep(
      .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
    ) {
    padding: 0;
  }
  :deep(
      .ant-collapse-icon-position-right
        > .ant-collapse-item
        > .ant-collapse-header
        .ant-collapse-arrow
    ) {
    right: 0;
    top: 14px;
  }

  :deep(.ant-row.ant-form-item) {
    margin-bottom: 16px;
  }
</style>
