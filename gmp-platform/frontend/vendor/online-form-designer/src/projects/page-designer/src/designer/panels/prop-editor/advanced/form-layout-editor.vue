<template>
  <div>
    <span v-if="!hiddenLayoutTip" style="color: #666; line-height: 20px">{{
      t('sys.pageDesigner.formLayoutDesc')
    }}</span>
    <div
      style="display: flex; justify-content: space-between; margin-top: 10px; margin-bottom: 10px"
    >
      <div @click="propValue = 'vertical'" class="cursor-pointer">
        <div class="bg vertical-bg mb5px" :class="{ selected: propValue === 'vertical' }"></div>
        <a-radio :checked="propValue === 'vertical'">{{ t('sys.pageDesigner.vertical') }}</a-radio>
      </div>
      <div @click="propValue = 'horizontal'" class="cursor-pointer">
        <div class="bg horizontal-bg mb5px" :class="{ selected: propValue === 'horizontal' }"></div>
        <a-radio :checked="propValue === 'horizontal'">
          {{ t('sys.pageDesigner.horizontal') }}
        </a-radio>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="form-layout-editor">
  import { unref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const hiddenLayoutTip = computed(() => {
    return defProps.widget?.props?.hiddenLayoutTip;
  });
</script>

<style lang="less" scoped>
  .horizontal-bg {
    background: url('../../../../assets/horizontal.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/horizontal-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/horizontal-selected.svg') no-repeat;
    }
  }

  .vertical-bg {
    background: url('../../../../assets/vertical.svg') no-repeat;

    &:hover {
      background: url('../../../../assets/vertical-hover.svg') no-repeat;
    }

    &.selected {
      background: url('../../../../assets/vertical-selected.svg') no-repeat;
    }
  }

  .bg {
    width: 103px;
    height: 56px;
  }
</style>
