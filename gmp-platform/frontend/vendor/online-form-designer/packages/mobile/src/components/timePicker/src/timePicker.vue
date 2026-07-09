<template>
  <van-popup
    v-model:show="isShow"
    position="bottom"
    :closeable="false"
    :style="{ height: '50%', overflow: 'hidden' }"
    round
  >
    <van-time-picker
      v-model="value"
      title="选择时间"
      v-if="isShow"
      :columns-type="timeType"
      :formatter="formatterFn"
      :filter="filterFn"
      :min-time="MIN"
      :max-time="MAX"
      @confirm="confirm"
      @cancel="cancel"
    />
  </van-popup>
</template>

<script setup name="timePicker" lang="ts">
  import { ref, nextTick } from 'vue';
  import { type openPickerCallback } from './typing';
  import { type TimePickerColumnType } from 'vant';

  const value = ref([]);
  const isShow = ref<boolean>(false);
  const timeType = ref<any[TimePickerColumnType]>(['hour', 'minute', 'second']);
  const MIN = ref<any>();
  const MAX = ref<any>();
  const formatterFn = ref();
  const filterFn = ref();
  let handleOk: openPickerCallback;

  const openTimePickerOpen = ({
    val,
    columnsType,
    minTime,
    maxTime,
    callback,
    formatter,
    filter,
  }: any) => {
    value.value = val;
    isShow.value = true;
    timeType.value = columnsType || ['hour', 'minute', 'second'];
    MIN.value = minTime || '';
    MAX.value = maxTime || '';
    handleOk = callback;
    formatterFn.value = formatter;
    filterFn.value = filter;
  };

  const confirm = async () => {
    await nextTick();
    handleOk && handleOk(value.value);
    isShow.value = false;
  };

  const cancel = () => {
    isShow.value = false;
  };

  defineExpose({ openTimePickerOpen });
</script>

<style scoped lang="less"></style>
