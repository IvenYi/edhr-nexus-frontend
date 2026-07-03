<template>
  <div :title="label" class="w100% ell flex items-center">
    <FieldLabel
      v-bind="$attrs"
      :label="label"
      @mouseenter="onMouseenter"
      @mouseleave="onMouseleave"
    />
    <span v-if="props.modelValue && !props.modelValue?.includes(':')" class="gct-custom-tag ml8px">
      默认
    </span>
  </div>
</template>
<script setup lang="ts">
  import { ref, onMounted, useAttrs, computed, h } from 'vue';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { FIELD_TYPE } from '@gct/runtime';

  const props = defineProps<{
    label?: string | Array<string | number>;
    type?: string;
    modelValue?: string;
  }>();

  const FieldLabel = computed(() => {
    return taglabel;
  });
</script>
