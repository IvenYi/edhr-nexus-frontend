<template>
  <div class="w100% flex gct-biz-process">
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
      <a-button
        type="primary"
        ghost
        size="small"
        v-if="computedShowPreview"
        shape="circle"
        :title="t('sys.pageDesigner.showBizPreview')"
      >
        <template #icon>
          <i class="iconfont icon-jiedian"></i>
        </template>
      </a-button>
    </template>
  </div>
</template>
<script setup lang="ts" name="gct-biz-process">
  import { ref, toRefs, computed } from 'vue';
  import { BizProcess } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{ widget: BizProcess; rowReadonly?: boolean }>();
  const { placeholder, disabled, readonly, fieldType, showPreview } = toRefs(props.widget.props);
  const value = ref();

  const computedShowPreview = computed(() => {
    return showPreview?.value;
  });
</script>

<style lang="less" scoped>
  .gct-biz-process {
    align-items: center;

    :deep(.ant-select) {
      flex: 1;
      margin-right: 10px;
    }
  }
</style>
