<!-- 自定义query查询 -->
<template>
  <a-drawer
    v-model:visible="visible"
    :title="$t('sys.appDesigner.add')"
    :width="400"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    :closable="false"
    destroyOnClose
    @close="onClose"
  >
    <template #extra>
      <close-outlined
        style="font-size: 16px; color: rgba(0, 0, 0, 0.45)"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <a-button type="primary" ghost class="w-full mb-4" @click="onAddNew">
      <template #icon>
        <PlusOutlined />
      </template>
      {{ $t('sys.edhr.queryDefinitionPage') }}
    </a-button>
    <div class="query-config-wrapper">
      <div
        v-for="(op, index) in configData"
        :key="op.id"
        class="flex items-center justify-between mb-2"
      >
        <a-checkbox v-model:checked="op.checked">
          <span class="flex items-center">
            <IconNext
              :value="op.icon"
              :size="16"
              :color="op.color ?? 'var(--ant-primary-color)'"
              class="mr-2"
            />
            {{ op.name }}
          </span>
        </a-checkbox>
        <div class="ope-action" v-if="op.createType !== 'BUILT_IN'">
          <i
            class="iconfont icon-bianji cursor-pointer mr-2 text-[#797a7d]"
            @click="onEdit(index)"
          ></i>
          <i
            class="iconfont icon-shanchu cursor-pointer text-[#797a7d]"
            @click="onDelete(index)"
          ></i>
        </div>
      </div>
    </div>
    <template #footer>
      <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
      <a-button type="primary" @click="onSubmit" :loading="confirmLoading">确定</a-button>
    </template>
  </a-drawer>

  <!-- query 配置 -->
  <a-modal
    v-if="queryVisible"
    :title="$t('sys.edhr.queryDefinitionPage')"
    v-model:visible="queryVisible"
    :width="640"
    @ok="onQueryConfigOk"
    @cancel="queryVisible = false"
    :bodyStyle="{
      paddingTop: '16px',
      paddingRight: '24px',
      paddingBottom: '16px',
      paddingLeft: '24px',
    }"
  >
    <a-form ref="queryConfigFormRef" :model="queryConfig" layout="vertical" v-bind="formItemLayout">
      <a-collapse
        ghost
        v-model:activeKey="activeKey"
        expand-icon-position="right"
        class="config-collapse"
      >
        <a-collapse-panel key="1" :header="$t('sys.appDesigner.basicInfo')">
          <a-form-item
            :label="$t('sys.appDesigner.pageName')"
            name="name"
            :rules="[{ required: true }]"
          >
            <a-input v-model:value="queryConfig.name" />
          </a-form-item>
          <!-- <a-form-item label="显示数据条目数">
            <a-switch v-model:checked="queryConfig.showCount" />
          </a-form-item> -->
          <a-form-item :label="$t('sys.appDesigner.icon')">
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

        <a-collapse-panel key="2" :header="$t('sys.edhr.businessFilter')">
          <a-row :gutter="16">
            <a-col
              v-for="field in computedQueryFields.filter(
                (e) => e.type !== 'inputnumber' && e.type !== 'datetimepicker',
              )"
              :key="field.id"
              :span="12"
            >
              <a-form-item :label="field.alias">
                <FieldWidget :widget="field" :rowValue="queryConfig.query" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel key="3" :header="$t('sys.edhr.numberFilter')">
          <a-row :gutter="16">
            <a-col
              v-for="field in computedQueryFields.filter((e) => e.type === 'inputnumber')"
              :key="field.id"
              :span="12"
            >
              <a-form-item :label="field.alias">
                <a-input-group compact>
                  <a-select
                    v-model:value="queryConfig.queryOperators[`${field.props.field}`]"
                    :options="OPERATOR_TYPE"
                    style="width: 60px"
                  />
                  <FieldWidget
                    :widget="field"
                    :rowValue="queryConfig.query"
                    style="width: calc(100% - 60px)"
                  />
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel key="4" :header="$t('sys.edhr.timeFilter')">
          <a-form-item :label="$t('sys.edhr.fixedDate')">
            <a-switch v-model:checked="queryConfig.isDefiniteDate" />
          </a-form-item>
          <a-row v-if="!queryConfig.isDefiniteDate" :gutter="16">
            <a-col
              v-for="field in computedQueryFields.filter((e) => e.type === 'datetimepicker')"
              :key="field.id"
              :span="12"
            >
              <a-form-item :label="field.alias">
                <a-input-group compact>
                  <a-select
                    v-model:value="queryConfig.queryOperators[`${field.props.field}`]"
                    :options="OPERATOR_TYPE"
                    style="width: 60px"
                  />
                  <FieldWidget
                    :widget="field"
                    :rowValue="queryConfig.query"
                    style="width: calc(100% - 60px)"
                  />
                </a-input-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item v-else :label="$t('sys.edhr.fixedDateType')">
            <a-radio-group v-model:value="queryConfig.definiteTimeType" name="radioGroup">
              <a-radio value="day">{{ $t('sys.edhr.today') }}</a-radio>
              <a-radio value="week">{{ $t('sys.edhr.thisWeek') }}</a-radio>
              <a-radio value="month">{{ $t('sys.edhr.thisMonth') }}</a-radio>
              <a-radio value="year">{{ $t('sys.edhr.thisYear') }}</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts" name="query-definition">
  import { ref, computed, h } from 'vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { Modal, message } from 'ant-design-vue';
  import { getSysConfigInfo, putSysConfigById } from '/@/apis/gct-apaas/SysConfigController';
  import { IconNextPicker, IconNext } from '/@/components/Icon';
  import FieldWidget from './field-widget.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import dayjs from 'dayjs';

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

  const { t } = useI18n();

  const defProps = defineProps<{
    configId: string;
    widget?: any;
    queryConfigWidgets: any[];
  }>();

  const emits = defineEmits<{
    (e: 'updated', value: any): void;
  }>();

  const formItemLayout = {
    // labelCol: { span: 4 },
    // wrapperCol: { span: 20 },
  };
  const visible = ref(false);
  const queryVisible = ref(false);
  const queryEditMode = ref<'add' | 'edit'>('add');
  const configData = ref<any>([]);
  const queryConfig = ref<any>({
    id: '',
    name: '',
    showCount: false,
    icon: '',
    query: {},
    queryOperators: {},
    definiteTimeType: 'week',
  });
  const activeKey = ref(['1', '2', '3', '4']);
  const queryConfigFormRef = ref();
  const confirmLoading = ref(false);

  const computedQueryFields = computed(() => {
    return defProps.queryConfigWidgets;
  });

  function onOpen() {
    visible.value = true;
    loadConfig();
  }

  function onClose() {
    visible.value = false;
  }

  async function onSubmit() {
    try {
      confirmLoading.value = true;
      const { query, queryOperators } = queryConfig.value;
      // 处理查询条件中字典项和操作项
      Object.keys(query).forEach((key) => {
        if (query[key] && Object.hasOwn(queryOperators, key)) {
          query[`${key}.${queryOperators[key]}`] = query[key];
          delete query[key];
        }
      });
      delete query._OPCT;
      delete query._DICT;
      await putSysConfigById(
        { id: defProps.configId },
        { value: JSON.stringify(configData.value) },
      );
      message.success(t('sys.operationSuccess'));
      emits('updated', configData.value);
      visible.value = false;
    } catch (err) {}
    confirmLoading.value = false;
  }

  function onAddNew() {
    queryVisible.value = true;
    queryEditMode.value = 'add';
    queryConfig.value = {
      id: '',
      name: '',
      showCount: false,
      icon: '',
      query: {},
      queryOperators: {},
      definiteTimeType: 'week',
    };
  }

  async function onEdit(index: number) {
    queryVisible.value = true;
    queryEditMode.value = 'edit';
    const currentQuery = configData.value[index];
    const { query, queryOperators } = currentQuery;
    Object.keys(queryOperators).forEach((key) => {
      query[key] = query?.[`${key}.${queryOperators[key]}`];
      delete query[`${key}.${queryOperators[key]}`];
    });
    queryConfig.value = { ...currentQuery };
    console.log(configData.value, queryConfig.value, 'queryConfig.value');
  }

  async function onDelete(index: number) {
    Modal.confirm({
      title: '确定要删除这个自定义查询页面吗?',
      icon: h(ExclamationCircleOutlined),
      content: h('div', { style: 'color:#767a7d;' }, '删除后不可恢复，请谨慎操作'),
      onOk() {
        configData.value.splice(index, 1);
      },
    });
  }

  function getTimeRange(type) {
    if (type !== 'week') {
      return {
        start: dayjs().startOf(type).format('YYYY-MM-DD HH:mm:ss'),
        end: dayjs().endOf(type).format('YYYY-MM-DD HH:mm:ss'),
      };
    } else {
      const currentDate = dayjs();
      const day = currentDate.day();
      const subtractDays = day === 0 ? 6 : day - 1;
      const start = currentDate.subtract(subtractDays, 'day').startOf('day');
      const end = start.add(6, 'day').endOf('day');
      return {
        start: start.format('YYYY-MM-DD HH:mm:ss'),
        end: end.format('YYYY-MM-DD HH:mm:ss'),
      };
    }
  }

  async function onQueryConfigOk() {
    await queryConfigFormRef.value.validate();
    if (queryEditMode.value === 'add') {
      configData.value.push({
        ...queryConfig.value,
        id: `task_${queryConfig.value?.name}_${Date.now()}`,
        checked: true,
      });
    } else {
      const index = configData.value.findIndex((item) => item.id === queryConfig.value.id);
      configData.value[index] = { ...queryConfig.value };
    }
    queryVisible.value = false;
    console.log(queryConfig.value, 'configData');
  }

  async function loadConfig() {
    const configRes = await getSysConfigInfo({ key: defProps.configId });
    configData.value = JSON.parse(configRes?.value as string);
    console.log(defProps.queryConfigWidgets, configData.value, 'queryConfigWidgets');
  }

  defineExpose({
    onOpen,
    onClose,
    onSubmit,
  });
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
