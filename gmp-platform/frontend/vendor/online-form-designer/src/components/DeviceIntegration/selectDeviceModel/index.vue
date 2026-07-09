<template>
  <div class="h600px ks-row device-integration-select-device-model">
    <DeviceList class="264px flex-col menus" v-model="deviceRow.deviceId" @select="selectDevice" />
    <div class="ks-col">
      <div class="p16px text-[#1A1D23] font-600">设备参数</div>
      <div class="px16px ks-row-middle">
        <a-input v-model:value="searchValue" placeholder="搜索参数名称、编码" class="w230px">
          <template #prefix>
            <span class="gct-iconfont icon-search"></span>
          </template>
        </a-input>
        <div class="ks-col text-right mr8px" v-if="!isMaster"> 查看全部参数 </div>
        <a-switch
          v-model:checked="showAll"
          size="small"
          @change="changeShowRule"
          v-if="!isMaster"
        />
      </div>
      <vxe-table
        :auto-resize="true"
        ref="tableRef"
        :tree-config="{ children: 'children', expandAll: true }"
        class="m16px"
        :data="configData"
        :loading="loading"
        @checkbox-change="onRadioChange"
        row-key="field"
        border
        show-overflow
        :checkbox-config="{
          highlight: true,
          checkMethod: ({ row }) => row._hasChecked,
          trigger: 'row',
          showHeader: false,
        }"
      >
        <vxe-column type="checkbox" width="50" />
        <vxe-column tree-node field="label" title="参数名称" resizable />
        <vxe-column field="field" title="参数编码" resizable />
        <vxe-column field="defaultValue" title="值" v-if="!isMaster">
          <template #default="{ row }">
            {{ dataRef[row?.field] ?? '--' }}
          </template>
        </vxe-column>
        <vxe-column field="toField" title="绑定字段" v-else>
          <template #default="{ row }">
            <a-select
              @click.stop
              @mousedown.stop
              v-model:value="row.toField"
              class="w100%"
              v-if="!row.children?.length"
              placeholder="请选择"
            >
              <a-select-option :value="i.key" v-for="i in fieldOptions" :key="i.key">
                {{ i.name }}
              </a-select-option>
            </a-select>
          </template>
        </vxe-column>
        <template #empty>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </template>
      </vxe-table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, onBeforeUnmount, nextTick, reactive } from 'vue';
  import DeviceList from './deviceList.vue';
  import {
    getDeviceInterconnectionInfo,
    getDeviceInterconnectionData,
  } from '/@/apis/gct-platform/DeviceInterconnectionController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { useTopicDataCenter } from '../useTopicDataCenter';
  import { DeviceRow, Schema, FieldConfig } from '../types';
  import { Empty } from 'ant-design-vue';
  import { FIELD_TYPE, DeviceParamsTypeEnum } from '@gct/runtime';

  const Params_Map = {
    [FIELD_TYPE.TEXT]: [DeviceParamsTypeEnum.STRING],
    [FIELD_TYPE.LONG_TEXT]: [DeviceParamsTypeEnum.STRING],
    [FIELD_TYPE.INTEGER]: [DeviceParamsTypeEnum.INTEGER],
    [FIELD_TYPE.LONG]: [DeviceParamsTypeEnum.LONG],
    [FIELD_TYPE.DECIMAL]: [DeviceParamsTypeEnum.FLOAT],
    [FIELD_TYPE.DOUBLE]: [DeviceParamsTypeEnum.FLOAT],
    [FIELD_TYPE.BOOLEAN]: [DeviceParamsTypeEnum.BOOLEAN],
    [FIELD_TYPE.DATE]: [DeviceParamsTypeEnum.DATE],
    [FIELD_TYPE.DATE_TIME]: [DeviceParamsTypeEnum.DATE],
  };
  // Props 类型定义
  const { isMaster, modal, bindModelKey, deviceConfig, selectField, fieldType, masterFieldMap } =
    defineProps<{
      isMaster: boolean;
      modal: any;
      bindModelKey?: string;
      deviceConfig: DeviceRow;
      selectField?: string;
      masterFieldMap: Record<string, string>;
      fieldType: FIELD_TYPE;
    }>();
  const { subscribeTopic, unsubscribeTopic } = useTopicDataCenter(
    { key: 'DeviceIntegrationSelectDeviceModel' },
    (data) => {
      console.log('subscribeTopic data', data);
      dataRef.value = data;
    },
  );
  const showAll = ref(false);
  const dataRef = ref({});
  const tableRef = ref();
  const loading = ref(false);
  const searchValue = ref();
  const deviceRow = reactive<DeviceRow>({
    deviceId: deviceConfig.deviceId,
    deviceType: deviceConfig.deviceType,
    deviceKey: deviceConfig.deviceKey,
  });
  const configData = ref<FieldConfig[]>([]);
  const rawConfigData = ref<FieldConfig[]>([]);
  const selectedRow = ref<FieldConfig | null>(null);
  const fieldOptions = ref<any[]>([]);
  modal && modal.callback(submitDevice);

  onMounted(async () => {
    await getFieldList();
    if (deviceRow.deviceId) {
      await selectDevice({ type: deviceRow.deviceType, key: deviceRow.deviceKey });
      const row = rawConfigData.value.find((i) => i.field === selectField);
      onRadioChange({ row, checked: true });
      if (isMaster) {
        configData.value.forEach((item) => {
          if (item.field === selectField) {
            item.children?.forEach((child) => {
              if (masterFieldMap[child.field]) {
                child.toField = masterFieldMap[child.field];
              }
            });
          }
        });
      }
    }
  });

  onBeforeUnmount(() => {});

  async function submitDevice() {
    const data = selectedRow.value
      ? {
          deviceRow,
          valueData: { ...dataRef.value },
          _row: selectedRow.value,
        }
      : null;
    if (deviceRow.deviceType === 'MQTT') {
      /**销毁慢了导致异步问题 */
      await unsubscribeTopic();
    }
    return { ok: true, data };
  }
  async function getFieldList() {
    if (!isMaster) return;
    fieldOptions.value = await getFieldMetaList({
      modelKey: bindModelKey,
    });
  }

  async function selectDevice(data: { type: string; key: string }) {
    dataRef.value = {};
    await getConfigData(deviceRow.deviceId);
    if (data.type === 'MQTT') {
      subscribeTopic({ deviceKey: data.key });
    } else {
      unsubscribeTopic();
      getDeviceData(deviceRow.deviceId);
    }

    tableRef.value?.setAllTreeExpand(true);
    selectedRow.value = null;
  }
  function onRadioChange({ row, checked }) {
    tableRef.value?.setAllCheckboxRow(false);
    if (checked) {
      tableRef.value?.setCheckboxRow(row, true);
      selectedRow.value = row;
    } else {
      selectedRow.value = null;
    }
  }

  async function getConfigData(id) {
    try {
      loading.value = true;
      const res = await getDeviceInterconnectionInfo({ id });
      if (!res) return;
      deviceRow.deviceType = res.type;
      deviceRow.deviceKey = res.key;
      const list = schemaToFieldConfigs(JSON.parse(res.schema as any));
      rawConfigData.value = list;
      configData.value = transformedData(list);
    } catch (error) {
      configData.value = [];
    }
    loading.value = false;
  }
  async function getDeviceData(deviceId) {
    try {
      const res = await getDeviceInterconnectionData({ deviceId });
      const data = JSON.parse(res);
      dataRef.value = data || {};
    } catch (error) {
      dataRef.value = {};
    }
  }

  function transformedData(list: any[]) {
    const keyword = searchValue.value;
    return filterTreeData(list, keyword).filter((i) => isMaster || checkedFieldType(i.type));
  }
  function filterTreeData(list: any[], keyword: string) {
    if (!keyword) return list;
    const key = keyword.toLowerCase();
    return list
      .map((item) => {
        const selfMatch =
          item.label?.toLowerCase().includes(key) || item.field?.toLowerCase().includes(key);

        if (item.children?.length) {
          const children = filterTreeData(item.children, keyword);

          // 子节点命中 → 保留父节点
          if (children.length) {
            return { ...item, children };
          }
        }

        return selfMatch ? { ...item } : null;
      })
      .filter(Boolean);
  }
  async function changeShowRule() {
    configData.value = transformedData(rawConfigData.value);
    await nextTick();
    const row = configData.value.find((i) => i.field === selectedRow.value?.field);
    row && tableRef.value?.setCheckboxRow(row, true);
  }
  watch(
    () => searchValue.value,
    async () => {
      configData.value = transformedData(rawConfigData.value);
      tableRef.value?.setAllTreeExpand(true);
    },
  );
  function checkedFieldType(type: DeviceParamsTypeEnum) {
    return showAll.value || Params_Map[fieldType].includes(type);
  }
  // schema 转换字段配置
  function schemaToFieldConfigs(schema: Schema = {}): FieldConfig[] {
    const { properties = {} } = schema;
    return Object.entries(properties)
      .map(([field, config]) => {
        // Array + Object（子表）
        if (config.type === 'Array' && config.items?.type === 'Object') {
          const children = Object.entries(config.items.properties ?? {}).map(
            ([childField, childConfig]) => ({
              field: childField,
              toField: undefined,
              label: childConfig.description ?? childField,
              type: childConfig.type ?? 'String',
              required: Boolean(childConfig.required),
              defaultValue: null,
              sort: Number(childConfig.sort ?? 0),
              remark: childConfig.remark ?? '',
            }),
          );
          return {
            field,
            label: config.description ?? field,
            type: 'Array',
            required: Boolean(config.required),
            defaultValue: null,
            sort: Number(config.sort ?? 0),
            remark: config.remark ?? '',
            children: children.sort((a, b) => a.sort - b.sort),
            _hasChecked: children.length > 0,
          };
        }

        // 普通字段
        return {
          field,
          label: config.description ?? field,
          type: config.type ?? 'String',
          required: Boolean(config.required),
          defaultValue: null,
          sort: Number(config.sort ?? 0),
          remark: config.remark ?? '',
          _hasChecked: true,
        };
      })
      .filter((i) => {
        return isMaster ? i.type === 'Array' : i.type !== 'Array';
      })
      .sort((a, b) => a.sort - b.sort);
  }
</script>
<style scoped lang="less">
  .device-integration-select-device-model {
    --vxe-table-row-radio-checked-background-color: hsl(from var(--ant-primary-color) h s 94%);
  }

  .menus {
    border-right: 1px solid #e0e3eb;
  }
</style>
