<template>
  <van-popup closeable v-model:show="showPopup" destroy-on-close class="ios-popup" round>
    <van-picker
      v-model="selectedValues"
      :columns="popupOption.columns"
      :visible-option-num="7"
      option-height="40"
      @cancel="cancel"
      @confirm="submit"
      @change="changeValue"
      ref="pickerRef"
      confirm-button-text
      cancel-button-text
    >
      <template #title>
        <div class="text-center w100% text-18px font-600"> {{ popupOption.title }}</div>
      </template>
      <template #option="option">
        <div class="van-ellipsis text-18px">
          {{ option?.text }}
        </div>
      </template>
      <template #columns-bottom>
        <div class="pt12px pb12px pr16px pl16px ks-row">
          <div class="pr12px">
            <van-button block @click="showPopup = false" class="w124px">取消</van-button>
          </div>
          <van-button type="primary" block @click="submit">确认</van-button>
        </div>
      </template>
    </van-picker>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, computed } from 'vue';

  const popupOption = reactive({
    title: '',
    columns: [],
  });
  const beforeValidate = ref<any>(null);
  const pickerRef = ref(null);
  const selectedValues = ref();
  const showPopup = ref(false);
  const resolveCallback = ref();
  function openPicker({ options = [], value = [], title = '', beforeSelect = null }) {
    popupOption.columns = options;
    popupOption.title = title;
    selectedValues.value = value;
    showPopup.value = true;
    beforeValidate.value = beforeSelect;
    return new Promise((resolve, reject) => {
      resolveCallback.value = resolve;
    });
  }
  // function getOptionSize(index: number) {
  //   const preIndex = Math.abs(index - selectIndex.value);
  //   const size = 20 - preIndex * 2;
  //   console.log(index, size);
  //   return size + 'px';
  // }
  function changeValue(item) {}
  function cancel() {
    showPopup.value = false;
  }
  async function submit() {
    if (beforeValidate.value) {
      await beforeValidate.value(selectedValues.value);
    }

    showPopup.value = false;
    resolveCallback.value({
      value: selectedValues.value,
      select: pickerRef.value ? (pickerRef.value.getSelectedOptions() as any[]) : [],
    });
  }
  defineExpose({ openPicker });
</script>
<style lang="less">
  .ios-popup {
    --van-border-color: #e0e3eb;

    width: 400px;
    overflow: hidden;
  }
</style>
