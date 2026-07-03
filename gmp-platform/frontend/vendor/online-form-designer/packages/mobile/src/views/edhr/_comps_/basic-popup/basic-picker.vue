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
    <div class="p-1px" :class="context.isTree ? 'tree-picker' : ''">
      <van-picker
        v-model="pickerValue"
        :title="context.title"
        :columns="context.options"
        @confirm="onConfirm"
        @cancel="show = false"
      >
        <template #option="option">
          <span v-if="context.isTree" :style="`width:${option.indent * 1}em;`"></span>
          <span>{{ option.text }}</span>
        </template>
      </van-picker>
    </div>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { options } from 'marked';

  const props = defineProps<{
    popupProps: any;
    context: {
      value?: string[] | number[];
      title: string;
      isTree: boolean;
      options: Array<{
        text: string;
        value: string;
        indent?: number;
      }>;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);

  const pickerValue = ref(props.context.value);

  const onConfirm = ({ selectedValues }) => {
    if (props.onOk && typeof props.onOk === 'function') {
      props.onOk(selectedValues);
    }
    show.value = false;
  };
</script>

<style scoped lang="less">
  :deep(.van-picker-column__item) {
    > span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .tree-picker {
    :deep(.van-picker-column__item) {
      justify-content: flex-start;
      padding: 1em;
    }
  }
</style>
