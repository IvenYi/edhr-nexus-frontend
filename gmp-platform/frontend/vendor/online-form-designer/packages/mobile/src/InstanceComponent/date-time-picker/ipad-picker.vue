<template>
  <van-popup
    closeable
    v-model:show="showPopup"
    destroy-on-close
    class="date-popup"
    round
    :teleport="teleport"
  >
    <div class="text-center h48px lh-48px font-600 text-17px">{{
      popupOption.title || '选择时间'
    }}</div>
    <Picker
      v-model="dateValue"
      v-bind="props"
      :maxDate="popupOption.maxDate"
      :minDate="popupOption.minDate"
    />
    <div class="pt12px pb12px pr16px pl16px ks-row mb--20px">
      <div class="pr12px">
        <van-button block @click="cancel" class="w124px">取消</van-button>
      </div>
      <van-button type="primary" block @click="submit">确认</van-button>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import Picker from './components/index.vue';
  import { usePadTeleport } from '@mobile/utils/usePadTeleport';

  const { teleport } = usePadTeleport();
  const props = defineProps<{
    /**日期样式显示格式 默认 YYYY-MM-DD HH:mm:ss*/
    displayFormat?: string;
    /**日期数据值格式 默认 YYYY-MM-DD HH:mm:ss*/
    valueFormat?: string;
  }>();

  const popupOption = reactive({ title: '', maxDate: undefined, minDate: undefined });
  const dateValue = ref('');
  const showPopup = ref(false);
  const resolveCallback = ref();
  function openPicker({ title = '', value = '', maxDate, minDate }) {
    popupOption.title = title;
    popupOption.maxDate = maxDate;
    popupOption.minDate = minDate;
    dateValue.value = value;
    showPopup.value = true;
    return new Promise((resolve, reject) => {
      resolveCallback.value = resolve;
    });
  }

  function cancel() {
    showPopup.value = false;
  }
  function submit() {
    showPopup.value = false;
    resolveCallback.value(dateValue.value);
  }
  defineExpose({ openPicker });
</script>
<style lang="less" scoped>
  .date-popup {
    width: 400px;
    // height: 528px;
    overflow: hidden;
  }
</style>
