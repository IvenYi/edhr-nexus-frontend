<template>
  <a-drawer
    v-model:visible="visible"
    :title="$t('sys.process.ruleSetting')"
    :maskStyle="{ backgroundColor: 'transparent' }"
    placement="right"
    width="70%"
    :closable="false"
    @close="onClose"
    class="process-instance-drawer"
  >
    <template #extra>
      <close-outlined
        style=" margin-left: 12px; color: rgb(0 0 0 / 45%);font-size: 16px"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <SerialNumberContainer
      :readonly="false"
      :disabled="false"
      :required="true"
      :serialConfigValue="serialConfigValue"
      field="app"
      :isFeild="true"
      :serialValiIds="[]"
      :increaseHidden="false"
      @update:value="handleUpdate"
    />
    <!-- <a-table
      :columns="columns"
      :data-source="dataSource"
      bordered
      :pagination="false"
      :rowKey="(record, index) => index"
    >
      <template #bodyCell="{ column, text, record, index }">
        <template v-if="column.dataIndex === 'type'">
          <a-select v-model:value="record.type" style="width: 100%">
            <a-select-option v-for="(item, index) in typeList" :key="index" :value="item.value">{{
              item.label
            }}</a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex === 'format'">
          <a-select
            v-if="record.type && typeList.find((d) => d.value == record.type)?.formatList?.length"
            v-model:value="record.format"
            style="width: 100%"
          >
            <a-select-option
              v-for="(item, index) in typeList.find((d) => d.value == record.type)?.formatList"
              :key="index"
              :value="item.value"
            >
              {{ item.label }}
            </a-select-option>
          </a-select>
          <span v-else>--</span>
        </template>
        <template v-if="column.dataIndex === 'content'">
          <a-input v-model:value="record.content" />
        </template>
        <template v-if="column.dataIndex === 'length'">
          <a-input v-model:value="record.length" />
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <span @click="onDel(index)">
            <MinusCircleOutlined :style="{ color: 'red' }" />
          </span>
        </template>
      </template>
      <template #summary>
        <a-table-summary fixed>
          <a-table-summary-row>
            <a-table-summary-cell :col-span="6">
              <a-button type="link" @click="onAdd">
                <template #icon>
                  <PlusCircleOutlined />
                </template>
                添加行
              </a-button>
              <a-button type="link" style="float: right"> 重置列表 </a-button>
            </a-table-summary-cell>
          </a-table-summary-row>
        </a-table-summary>
      </template>
    </a-table> -->
    <template #footer>
      <div style="text-align: right">
        <a-button type="default" @click="onClose" style="margin-right: 10px">取消</a-button>
        <a-button type="primary" @click="onOk">确认</a-button>
      </div>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SerialNumberContainer from './serial-number-container.vue';

  const { t } = useI18n();
  const emit = defineEmits(['ok']);

  const typeList = [
    {
      value: 'date',
      label: t('sys.component.fieldTypeProps.dateFormat'),
      formatList: [
        {
          value: 'YYYYMMDDhhmmss',
          label: 'YYYYMMDDhhmmss',
        },
        {
          value: 'YYYYMMDDhhmm',
          label: 'YYYYMMDDhhmm',
        },
        {
          value: 'YYYYMMDD',
          label: 'YYYYMMDD',
        },
        {
          value: 'hhmmss',
          label: 'hhmmss',
        },
        {
          value: 'hhmm',
          label: 'hhmm',
        },
      ],
    },
    {
      value: 'field',
      label: t('sys.message.metaFiled'),
      formatList: [
        {
          value: 'sn',
          label: t('sys.platform.sn'),
        },
        {
          value: 'orderNo',
          label: t('sys.platform.order'),
        },
      ],
    },
    {
      value: 'code',
      label: t('sys.platform.uniqueCode'),
      formatList: [
        {
          value: 'flowNo',
          label: t('sys.platform.flowNo'),
        },
        {
          value: 'timestamp',
          label: t('sys.platform.timestamp'),
        },
      ],
    },
    {
      value: 'str',
      label: t('sys.platform.fixedChar'),
      formatList: null,
    },
  ];

  const columns = [
    {
      title: '#',
      key: 'index',
      customRender: ({ index }: { index: number }) => index + 1, // 当前页从1开始
      width: 30,
      align: 'center',
    },
    {
      title: `* ${t('sys.platform.style.type')}`,
      dataIndex: 'type',
      width: '30%',
    },
    {
      title: `* ${t('sys.platform.style.format')}`,
      dataIndex: 'format',
      width: '25%',
    },
    {
      title: `* ${t('sys.content')}`,
      dataIndex: 'content',
      width: '20%',
    },
    {
      title: t('sys.mode.length'),
      dataIndex: 'length',
      width: '12%',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'operation',
      width: '8%',
      align: 'center',
    },
  ];

  const dataSource: any = ref([]);

  const onAdd = () => {
    const row = {
      type: '',
      content: '',
      length: 1,
    };
    dataSource.value.push(row);
  };

  const onDel = async (index) => {
    dataSource.value = dataSource.value.filter((_, i) => i !== index);
    // dataSource.value.splice(index, 1);
  };

  const visible = ref<boolean>(false);
  let key = '';
  const serialConfigValue = ref();
  const onOpen = async (k, data) => {
    visible.value = true;
    key = k;
    serialConfigValue.value = data;
  };

  const onClose = () => {
    visible.value = false;
  };

  const onOk = () => {
    emit('ok', key, serialConfigValue.value);
  };

  const handleUpdate = (val) => {
    serialConfigValue.value = val;
  };

  defineExpose({ onOpen, onClose });
</script>

<style lang="less" scoped>
  :global(.process-instance-drawer .ant-drawer-body) {
    display: flex !important;
    flex: 1;
    flex-direction: column !important;
    padding: 12px 24px;
    background: #f7f8fa;
  }
</style>
