<template>
  <taglabel v-if="showReadonly" v-bind="separatorAttr" />
  <van-field
    v-else
    class="app-design-select"
    v-model="value"
    is-link
    readonly
    :placeholder="widget.props.placeholder"
  />
</template>
<script name="gct-dynamic-form-type" setup lang="ts">
  import { inject, ref, toRefs, computed } from 'vue';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { Select } from '/@page-designer/types/web';
  import { useReadyonly } from '../../../hooks/useReadyonly';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const { readonly, fieldType, bindFieldKey } = toRefs(props.widget.props);
  const value = ref();

  const showReadonly = computed(() => useReadyonly(readonly?.value, bindFieldKey?.value));

  const separatorAttr = computed(() => {
    return {
      type: fieldType?.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
    };
  });
</script>

<style lang="less" scoped></style>
