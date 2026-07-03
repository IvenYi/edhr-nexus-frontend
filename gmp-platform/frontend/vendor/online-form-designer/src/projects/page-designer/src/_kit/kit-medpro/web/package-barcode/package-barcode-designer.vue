<template>
  <a-form :layout="widget.props.layout">
    <div
      class="w-full flex"
      :style="styleWrap"
    >
      <a-form-item
        :style="formItemStyle"
        :label="t('sys.kit.medPro.packageBarcode.title')"
        required
        :layout="widget.props.layout"
      >
        <a-select :options="[]" />
      </a-form-item>
      <a-button v-if="!defProps.widget.props.hiddenBtn" type="primary" class="mt12px mb12px">
        {{ t('sys.pageDesigner.query') }}
      </a-button>
    </div>
  </a-form>
</template>

<script lang="ts" setup name="gct-package-barcode-design">
  import { computed } from 'vue';
import { IPackageBarcode } from './schema';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps<{ widget: IPackageBarcode }>();

  const styleWrap = computed(() => {
    return {
      'align-items': defProps.widget.props.layout  === 'vertical' ? 'flex-end' : 'center'
    };
  });

  const formItemStyle = computed(() => {
    return {
      'margin-right': !defProps.widget.props.hiddenBtn ? '10px' : "0px",
      // 'width': !defProps.widget.props.hiddenBtn ? '33%' : '100%',
      'flex': 1,
    };
  });
</script>

<style lang="less" scoped>
</style>
