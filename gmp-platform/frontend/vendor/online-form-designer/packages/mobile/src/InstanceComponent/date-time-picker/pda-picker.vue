<template>
  <van-popup
    closeable
    v-model:show="showPopup"
    destroy-on-close
    class="date-popup"
    round
    position="bottom"
  >
    <div class="pda-confirm" @click="submit">确认</div>
    <Picker
      v-model="dateValue"
      v-bind="props"
      :maxDate="popupOption.maxDate"
      :minDate="popupOption.minDate"
    />
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';
  import Picker from './components/index.vue';

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
    popupOption.maxDate = maxDate;
    popupOption.minDate = minDate;
    popupOption.title = title;
    dateValue.value = value;
    showPopup.value = true;
    return new Promise((resolve, reject) => {
      resolveCallback.value = resolve;
    });
  }

  function submit() {
    showPopup.value = false;
    resolveCallback.value(dateValue.value);
  }
  defineExpose({ openPicker });
</script>
<style lang="less" scoped>
  .date-popup {
    height: 430px;
    overflow: hidden;
  }

  .pda-confirm {
    position: absolute;
    z-index: 999;
    right: 0;
    width: 80px;
    height: 42px;
    margin-bottom: -42px;
    padding-right: 20px;
    color: var(--van-primary-color);
    font-size: 15px;
    line-height: 42px;
    text-align: right;
  }
</style>
