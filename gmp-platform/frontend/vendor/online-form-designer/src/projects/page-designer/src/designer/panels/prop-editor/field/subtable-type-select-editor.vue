<template>
  <div class="subtable-type-select-area">
    <div class="title-area">
      <span class="title-title">{{ t('sys.pageDesigner.widgetType') }}</span>
      <div
        class="action-area"
        @click.stop="onAction"
        v-if="propValue === SUB_TABLE_EDIT_MODE.MODAL"
      >
        <!-- <i class="iconfont icon-a-Single-linetext"></i> -->
        <span>{{ t('sys.pageDesigner.editModal') }}</span>
      </div>
    </div>
    <a-select v-model:value="propValue" style="width: 100%" size="small">
      <a-select-option v-for="option in options" :value="option.value" :key="option.value">{{
        t(option.label)
      }}</a-select-option>
    </a-select>
  </div>
</template>

<script setup lang="ts" name="subtable-type-select-editor">
  import { computed } from 'vue';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { SUB_TABLE_EDIT_MODE, SCOPE } from '/@page-designer/enum';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);

  const options = computed<any>(() => defProps.propConfig.options ?? []);

  const { setSubTableModalDesignState } = useDesigner();
  const { setSelectedWidget } = useSelectedWidget();
  const { setFieldToolkit } = useToolkit();

  const btnGroupWidget = computed(() => {
    return defProps?.widget?.children![0];
  });

  const onAction = () => {
    setSubTableModalDesignState(true, defProps?.widget?.id);
    setSelectedWidget(btnGroupWidget.value);

    const formInfo = defProps?.widget?.children![0].children[0].children[0];
    if (formInfo) {
      //**refParentModelkey 可能为空导致关闭 时候 无法定位字段*/
      setFieldToolkit({
        modelKey: formInfo.props.model,
        formId: formInfo.id,
        childParentModelKey: formInfo.props.refParentModelkey,
      });
    }
  };
</script>

<style lang="less" scoped>
  .subtable-type-select-area {
    position: relative;

    .title-area {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      line-height: 22px;

      span {
        display: inline-block;
        line-height: 22px;

        &.title-title {
          color: #333;
        }
      }

      .action-area {
        display: flex;
        color: var(--ant-primary-color);
        cursor: pointer;
      }

      .iconfont {
        margin-right: 4px;
      }
    }
  }
</style>
