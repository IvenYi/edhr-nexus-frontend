<template>
  <div>
    <div class="text-12px text-[#797A7D]" v-if="title">{{ title }}</div>
    <div class="ks-row-middle">
      <a-select v-model:value="foldtype" class="ks-col" size="small" @change="changeFold">
        <a-select-option :value="i" v-for="i in types" :key="i">{{
          $t('sys.pageDesigner.' + i)
        }}</a-select-option>
      </a-select>
      <a-auto-complete
        v-if="foldtype === buttonShowType.FOLD_PART"
        v-model:value="visibleButtons"
        :options="options"
        style="width: 70px"
      >
        <a-input-number
          v-model:value="visibleButtons"
          size="small"
          :min="1"
          :max="maxNumber"
          :precision="0"
          controls
        />
      </a-auto-complete>
      <span class="ml4px" v-if="foldtype === buttonShowType.FOLD_PART">个</span>
    </div>
    <div class="text-[#C3C3C3] text-12px" v-if="foldtype === buttonShowType.FOLD_PART">
      {{ $t('_kit.pageDesigner.rdoTableButtonAddDesc', { max: maxNumber }) }}
    </div>
    <div class="text-[#C3C3C3] text-12px" v-else>
      {{ $t('_kit.pageDesigner.rdoTableButtonDesc') }}
    </div>
    <draggableButtonList :children="children" class="mt10px" />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch } from 'vue';
  import { buttonShowType } from '/@page-designer/enum';
  import draggableButtonList from './draggable-button-list.vue';
  const defProps = defineProps<{
    title?: string;
    children: object[];
    visibleButtons: number;
    defaultNumber: number;
    maxValue: number;
  }>();
  const maxNumber = defProps.maxValue || 5;
  let cacheVisibleButtons = defProps.visibleButtons || defProps.defaultNumber;
  const emit = defineEmits(['update:visibleButtons']);
  const visibleButtons = computed({
    get() {
      return defProps.visibleButtons;
    },
    set(v) {
      emit('update:visibleButtons', v);
    },
  });
  if (visibleButtons.value === undefined) {
    visibleButtons.value = defProps.defaultNumber;
  }
  const options = [
    {
      label: '1',
      value: 1,
    },
    {
      label: '2',
      value: 2,
    },
    {
      label: '3',
      value: 3,
    },
    {
      label: '4',
      value: 4,
    },
    {
      label: '5',
      value: 5,
    },
  ].filter((i, index) => index < maxNumber);
  const types = [buttonShowType.FOLD_ALL, buttonShowType.FOLD_PART];
  const foldtype = ref(buttonShowType.FOLD_PART);
  if (defProps.visibleButtons === 0) {
    foldtype.value = buttonShowType.FOLD_ALL;
  }
  function changeFold(f) {
    if (f === buttonShowType.FOLD_ALL) {
      cacheVisibleButtons = visibleButtons.value;
      visibleButtons.value = 0;
    } else {
      visibleButtons.value = cacheVisibleButtons || defProps.defaultNumber;
    }
  }
</script>

<style lang="less" scoped></style>
