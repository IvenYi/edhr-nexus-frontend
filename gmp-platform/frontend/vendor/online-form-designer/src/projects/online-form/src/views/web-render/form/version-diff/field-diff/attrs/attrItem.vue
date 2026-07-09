<template>
  <div class="attr-self">
    <div class="attr-self-label">
      <slot v-if="$slots?.label" name="label"></slot>
      <div v-else>{{ label || $t(`sys.webRender.DiffedAttrMaps.${data.compType}`) }}</div>
    </div>
    <div class="attr-self-value">
      <template v-if="data?.value.old || isUpdate">
        <div class="mb-4px"
          >{{ `${$t('sys.webRender.diffValueType.old')}：` }}{{ calcOldVal || '--' }}</div
        >
        <div>{{ `${$t('sys.webRender.diffValueType.new')}：` }}{{ calcNewVal || '--' }}</div>
      </template>
      <template v-else>
        {{ calcNewVal || '--' }}
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { computed } from 'vue';
  import { DiffedAttrMaps, NeedI18nAttrs } from '../../index/types';

  const props = defineProps<{
    data?: any;
    label: string;
    oldVal?: string;
    newVal?: string;
    isUpdate?: boolean;
  }>();

  const calcOldVal = computed(() => {
    if (props.oldVal) return props.oldVal;
    const val = props.data?.value?.old
      ? props.data?.value?.old[DiffedAttrMaps[props.data?.compType][0]]
      : '';
    if (!val) return '--';
    return val && NeedI18nAttrs.includes(props.data?.compType)
      ? $t(`sys.webRender.DiffedAttrMaps.${val}`)
      : val;
  });

  const calcNewVal = computed(() => {
    if (props.newVal) return props.newVal;
    const val = props.data?.value?.new
      ? props.data?.value?.new[DiffedAttrMaps[props.data?.compType][0]]
      : '';
    if (!val) return '--';
    return val && NeedI18nAttrs.includes(props.data?.compType)
      ? $t(`sys.webRender.DiffedAttrMaps.${val}`)
      : val;
  });
</script>
<style lang="scss" scoped>
  .attr-self {
    display: flex;
    flex-direction: column;
    row-gap: 4px;
    padding: 8px 12px;
    background-color: #f6f8fa;
    border-radius: 4px;

    .attr-self-label {
      color: #8b8b8b;
    }
  }
</style>
