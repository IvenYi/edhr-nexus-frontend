<template>
  <div class="w100% flex gct-approval-process">
    <tagelabel
      v-if="rowReadonly || readonly"
      :type="fieldType"
      :tagWidgetStyle="widget.style"
      isDesign
    />
    <template v-else>
      <a-select
        :disabled="disabled"
        v-model:value="value"
        :placeholder="placeholder"
        readonly
        mode="tags"
        style="width: calc(100%)"
        :showArrow="true"
      />
    </template>
  </div>
</template>
<script setup lang="ts" name="gct-approval-process">
  import { ref, toRefs } from 'vue';
  import { BizProcess } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: BizProcess; rowReadonly?: boolean }>();
  const { placeholder, disabled, readonly, fieldType } = toRefs(props.widget.props);
  const value = ref();
</script>

<style lang="less" scoped>
  .gct-approval-process {
    align-items: center;

    :deep(.ant-select) {
      flex: 1;
      margin-right: 10px;
    }
  }
</style>
