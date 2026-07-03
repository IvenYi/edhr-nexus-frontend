<template>
  <div
    class="device h32px w22px! ks-row-center-middle ml4px cursor-pointer"
    @click="selectDeviceModel"
  >
    <span
      class="gct-iconfont icon-icon_shebeihulian text-14px text-[#A6A6A6]"
      :class="{ active: inMqtt }"
    ></span>
  </div>
</template>

<script setup lang="ts">
  import { ref, nextTick, watchEffect, computed } from 'vue';
  import { overlay } from '@gct/runtime-web';
  import SelectDeviceModal from './selectDeviceModel/index.vue';
  import { useTopicDataCenter } from './useTopicDataCenter';
  import { LowCodeWidget, FIELD_TYPE } from '@gct/runtime';
  import { DeviceRow } from './types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useTransformByField } from './tansform';

  const props = defineProps<{
    /**
     * 是否为主子表
     */
    isMaster?: boolean;
    /**
     * 子表绑定的模型key
     */
    bindModelKey?: string;
    /**
     * 组件key
     */
    widget: LowCodeWidget.FieldSchema;
    formData: object;
  }>();
  const Event = getPageEvent();
  const emit = defineEmits(['change']);
  // 定义变量
  const fieldInfo = ref<any>(null);
  /**子表的映射关系表 */
  const masterFieldMap = ref({});
  const deviceConfig = ref<DeviceRow>({});
  const inMqtt = ref<boolean>(false);
  const { id } = props.widget;
  const { fieldType, format, precision } = props.widget.props;

  // 使用 Topic 数据中心钩子
  const { subscribeTopic, unsubscribeTopic } = useTopicDataCenter({ key: id }, updateFormValue);
  /**转化函数 */
  const { transformFieldValue } = useTransformByField({
    fieldInfo,
    masterFieldMap,
    format,
    precision,
    fieldType,
    isMaster: props.isMaster,
  });
  // 选择设备模型并更新状态
  async function selectDeviceModel() {
    const result = await overlay.modal<{ ok: boolean; data: { deviceRow: DeviceRow } }>(
      SelectDeviceModal,
      {
        isMaster: props.isMaster,
        bindModelKey: props.bindModelKey,
        deviceConfig: deviceConfig.value,
        selectField: fieldInfo.value?.field,
        fieldType,
        masterFieldMap: masterFieldMap.value,
      },
      { width: 1040, title: $t('选择设备参数') },
    );
    if (!result?.ok) return;
    if (!result?.data) {
      unsubscribeTopic();
      inMqtt.value = false;
      deviceConfig.value = {};
      return;
    }

    const { deviceRow, _row, valueData } = result.data;
    fieldInfo.value = _row;
    inMqtt.value = deviceRow.deviceType === 'MQTT';
    deviceConfig.value = deviceRow;
    if (props.isMaster) {
      /**子表数据映射关系处理 */
      masterFieldMap.value = {};
      _row.children?.forEach((child: any) => {
        if (!child.toField) return;
        masterFieldMap.value[child.field] = child.toField;
      });
    }
    updateFormValue(valueData);
    inMqtt.value ? subscribeTopic({ deviceKey: deviceRow.deviceKey }) : unsubscribeTopic();
  }

  // 处理订阅数据
  async function updateFormValue(data: object) {
    try {
      const transformedValue = await transformFieldValue(data);
      emit('change', transformedValue);
      Event.runEventByName(
        'afterDeviceFill',
        props.widget.events,
        transformedValue,
        data,
        props.formData,
      );
    } catch (error) {
      console.error('数据转换错误', error);
    }
  }
</script>
<style scoped lang="less">
  .device {
    border-radius: 4px;

    &:hover {
      background-color: #edeef0;

      .gct-iconfont {
        color: #5a5f6b;
      }
    }

    .active {
      color: var(--ant-primary-color) !important;
    }
  }
</style>
