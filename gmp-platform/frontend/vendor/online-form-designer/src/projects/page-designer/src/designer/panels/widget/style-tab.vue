<template>
  <!-- 此处用form 其实并无实际意义 只是为了样式 form-item的name也无实际意义 因为不需要做校验-->
  <a-form labelAlign="left" :colon="false" class="style-wrap">
    <ScrollContainer>
      <a-collapse v-model:activeKey="activeKey" :bordered="false" expandIconPosition="right" ghost>
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <template v-for="group in styleSort" :key="group">
          <a-collapse-panel
            v-if="filterStyleByGroup(group).length"
            :key="group"
            :header="t(`sys.pageDesigner.${group}`)"
          >
            <div v-for="(editor, index) in groupStyles[group]" :key="index">
              <a-form-item
                v-if="showEditor(editor)"
                :label="editor.label ? t(editor.label) : ''"
                :style="{ 'margin-bottom': index < groupStyles[group].length - 1 ? '16px' : 0 }"
              >
                <component
                  :is="styleEditors[editor.component]"
                  :editor="editor"
                  :widget="selectedRef"
                  :prop-config="editor._config"
                />
              </a-form-item>
            </div>
          </a-collapse-panel>
        </template>
      </a-collapse>
    </ScrollContainer>
  </a-form>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { StyleGroup } from '/@page-designer/enum';
  import { groupBy } from 'lodash-es';
  import styleEditors from '/@page-designer/designer/panels/style-editor';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { ScrollContainer } from '/@/components/Container';

  const { selectedAllStyleEditors, selectedRef } = useSelectedWidget();
  const { t } = useI18n();
  const styleSort = [
    StyleGroup.SHOW_PROP,
    StyleGroup.LAYOUT,
    StyleGroup.STYLE,
    StyleGroup.BACKGROUND,
    StyleGroup.MARGIN,
    StyleGroup.BORDER,
  ];
  /**根据group过滤 style editor*/
  const filterStyleByGroup = (group) => {
    if (!selectedAllStyleEditors.value) {
      return [];
    }
    return selectedAllStyleEditors.value.filter((editor) => {
      let showByHide = true;
      if (!!editor.hidden && typeof editor.hidden === 'function') {
        showByHide = !editor.hidden(selectedRef.value);
      }
      return editor.group === group && showByHide;
    });
  };
  /**将styleEditorList按照group分组 */
  const groupStyles = computed(() => {
    return groupBy(selectedAllStyleEditors.value, 'group');
  });
  const activeKey = ref(Object.keys(groupStyles.value));
  const showEditor = (editor: LowCodeWidget.StyleEditor) => {
    if (!!editor.hidden && typeof editor.hidden === 'function') {
      return !editor.hidden(selectedRef.value as LowCodeWidget.BasicSchema);
    }
    return true;
  };
</script>

<style lang="less" scoped>
  .style-wrap {
    position: absolute;
    inset: 37px 0 0;
    // overflow-x: hidden;
    // overflow-y: auto;
  }

  :deep(.ant-collapse-item) {
    &:first-child {
      .ant-collapse-header {
        border-top: 0;
      }
    }
  }

  :deep(.ant-collapse-header) {
    margin-right: -12px;
    margin-left: -12px;
    padding: 8px 12px !important;
    border-top: 1px solid @gct-modal-border-color;
    background-color: #f2f4f7;
    color: #212528 !important;
    font-size: 14px;
    font-weight: 500;
  }

  :deep(.ant-collapse-content-box) {
    padding-top: 12px !important;
    padding-bottom: 4px !important;
  }

  :deep(.ant-input-suffix) {
    color: #999;
  }

  .collapse-icon-down {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%) rotateX(0) scale(0.8, 0.6) !important;
    font-size: 16px !important;
  }

  .ant-collapse-item-active {
    .collapse-icon-down {
      transform: translateY(-50%) rotateX(180deg) scale(0.8, 0.6) !important;
    }
  }

  :deep(.ant-form-item) {
    margin-bottom: 8px !important;
  }
</style>
