<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :tagWidgetStyle="widget.style"
    :type="fieldType"
    :isDesign="true"
  />
  <div v-else class="ks-row">
    <a-input-group compact class="ks-col">
      <a-input style="width: calc(100% - 120px)" :placeholder="placeholder" :disabled="disabled" />
      <a-input style="width: 120px" :placeholder="t('版本')" :disabled="disabled" />
    </a-input-group>
    <div class="checkbox-wrap">
      <a-checkbox :disabled="disabled" />
      <span class="ml6px">{{ t('sys.setDefault') }}</span>
    </div>
    <!-- <a-button type="link">
      <template #icon> <a-checkbox :disabled="disabled" /></template>
      <span class="ml6px">{{ t('sys.setDefault') }}</span>
    </a-button> -->
  </div>
</template>

<script name="gct-rdo-input" setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { inject, toRefs } from 'vue';
  import { Input } from '/@page-designer/types/web';

  const { t } = useI18n();
  const props = defineProps<{ widget: Input; rowReadonly?: boolean }>();
  const { placeholder, disabled, readonly, fieldType } = toRefs(props.widget.props);
</script>

<style lang="less" scoped>
  .checkbox-wrap {
    height: 32px;
    margin-left: 8px;
    color: #3d3d3e;
    line-height: 32px;
  }
</style>
