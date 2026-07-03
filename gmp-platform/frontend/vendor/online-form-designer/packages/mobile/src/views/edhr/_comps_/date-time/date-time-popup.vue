<template>
  <basic-popup
    v-model:show="show"
    :popup-props="popupProps"
    :show-header="false"
    :show-footer="false"
    :extra-style="{
      left: 'auto',
      right: 0,
      height: 'auto',
    }"
  >
    <div class="p-1px">
      <van-picker-group
        title="选择日期时间"
        :tabs="['选择日期', '选择时间']"
        @confirm="onConfirm"
        @cancel="show = false"
      >
        <van-date-picker v-model="currentDate" />
        <van-time-picker v-model="currentTime" :columns-type="['hour', 'minute']" />
      </van-picker-group>
    </div>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import dayjs from 'dayjs';
  import { showFailToast } from 'vant';

  const props = defineProps<{
    popupProps: any;
    context?: {
      min: string;
      max: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const [year, month, date, hour, minute] = dayjs().format('YYYY-MM-DD-HH-mm').split('-');
  const currentDate = ref([year, month, date]);
  const currentTime = ref([hour, minute]);

  const onConfirm = () => {
    if (props.onOk && typeof props.onOk === 'function') {
      const time = `${currentDate.value.join('-')} ${currentTime.value.join(':')}`;
      if (props.context?.min && time <= props.context.min) {
        showFailToast(`时间不能早于${props.context.min}`);
        return;
      } else if (props.context?.max && time >= props.context.max) {
        showFailToast(`时间不能晚于${props.context.min}`);
        return;
      }
      props.onOk(time);
    }
    show.value = false;
  };
</script>

<style scoped lang="less"></style>
