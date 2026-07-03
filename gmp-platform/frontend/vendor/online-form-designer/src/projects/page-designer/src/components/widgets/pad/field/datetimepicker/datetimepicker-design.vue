<template>
  <taglabel v-if="rowReadonly || readonly" v-bind="separatorAttr" />
  <van-field v-else class="app-design-select" :placeholder="placeholder" :border="false" is-link />
</template>

<script setup lang="ts" name="gct-datetimepicker">
  import { toRefs, ref, computed } from 'vue';
  import { DateTimepicker } from '/@page-designer/types/mobile';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: DateTimepicker; rowReadonly?: boolean }>();

  const { fieldType, readonly, disabled, placeholder } = toRefs(props.widget.props);

  const separatorAttr = computed(() => {
    return {
      isDesign: true,
      type: fieldType.value,
      tagWidgetStyle: props.widget.style,
      disabled: disabled.value,
    };
  });
</script>
<style scoped lang="less"></style>
