<template>
  <div class="button-group-editor">
    <a-checkbox-group v-model:value="value" name="checkboxgroup" :options="btnOptions" />
  </div>
</template>

<script setup lang="ts" name="button-group-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { btnGroupData } from '/@page-designer/_kit/deprecated/web/button-group/type';
  import { useI18n } from 'vue-i18n';
  // import { message } from 'ant-design-vue';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const value = computed({
    get() {
      return propValue.value;
    },
    set(val: string[]) {
      if (val.length == 0) {
        // message.success(t('sys.delSuccess'));
        return;
      }
      propValue.value = val;
    },
  });

  const btnOptions = computed(() => {
    return btnGroupData.map((item) => ({ label: t(item.name), value: item.type }));
  });
</script>

<style lang="less" scoped>
  .button-group-editor {
    :deep(.ant-checkbox-group) {
      .ant-checkbox-group-item {
        display: flex;
      }
    }
  }
</style>
