<template>
  <a-form
    :class="['prop-wrap', selectedRef.type]"
    :model="propState"
    labelAlign="left"
    layout="vertical"
    :colon="false"
    validateTrigger="onSubmit"
  >
    <ScrollContainer>
      <a-collapse v-model:activeKey="activeKey" :bordered="false" expandIconPosition="right" ghost>
        <template #expandIcon>
          <down-outlined class="collapse-icon-down" />
        </template>
        <!-- 因为基础属性增加了组件类型和组件key等固有属性 所以单独拿出来写死即可 -->
        <a-collapse-panel :key="PropGroup.BASIC" :header="t(`sys.pageDesigner.basicProp`)">
          <baseProps />
          <template v-for="editor in groupProps[PropGroup.BASIC]" :key="editor.name">
            <props-show
              v-if="isKitInclude(editor)"
              :editor="editor"
              :label="t(`${editor.label}`)"
              :prop="editor.name"
              :config="editor._config"
              :rules="
                buildItemRules({
                  required: editor.required,
                  validateFn: editor.validate,
                })
              "
              :style="editor.formItemStyle"
              :widget="selectedRef"
              :dependentProps="editor.dependentProps"
            >
              <template #prop>
                <component
                  :disabled="editor._config?.disabled"
                  :is="propEditors[editor.component]"
                  :prop-name="editor.name"
                  :prop-config="editor._config"
                  :changeCallback="editor.changeCallback"
                  :widget="selectedRef"
                />
              </template>
            </props-show>
          </template>
        </a-collapse-panel>
        <template v-for="group in propSort" :key="group">
          <a-collapse-panel
            :key="group"
            :header="t(`sys.pageDesigner.${group}Prop`)"
            v-if="groupProps[group] && groupProps[group].length"
          >
            <template v-for="editor in groupProps[group]" :key="editor.name">
              <props-show
                v-if="isKitInclude(editor)"
                :editor="editor"
                :label="t(`${editor.label}`)"
                :prop="editor.name"
                :config="editor._config"
                :rules="
                  buildItemRules({
                    required: editor.required,
                    validateFn: editor.validate,
                  })
                "
                :style="editor.formItemStyle"
                :class="editor.formItemClass"
                :widget="selectedRef"
                :dependentProps="editor.dependentProps"
              >
                <template #label v-if="getLabelButtonDisplay(editor)">
                  <div class="custom-label-container">
                    <div class="label-left-title">
                      {{ t(`${editor._config?.labelButton.label}`) }}
                    </div>
                    <div
                      v-if="editor._config?.labelButton.icon"
                      :class="{
                        'label-right-icon': true,
                        primary: getLabelButtonType(editor) === 'primary',
                      }"
                    >
                      <IconNext
                        :title="t(editor._config?.labelButton.tooltip)"
                        :size="editor._config?.labelButton.size || 18"
                        :value="editor._config?.labelButton.icon"
                        :color="editor._config?.labelButton.color || 'currentcolor'"
                        @click="editor._config?.labelButton.clickFn(selectedRef)"
                      />
                    </div>
                  </div>
                </template>
                <template #prop>
                  <component
                    :disabled="editor._config?.disabled"
                    :is="propEditors[editor.component]"
                    :prop-name="editor.name"
                    :prop-config="editor._config"
                    :changeCallback="editor.changeCallback"
                    :widget="selectedRef"
                  />
                </template>
              </props-show>

              <div
                class="tooltip"
                v-if="editor._config?.tips && inRowEditor.includes(editor!.component)"
              >
                {{ editor._config?.tips }}
              </div>
            </template>
          </a-collapse-panel>
        </template>
      </a-collapse>
    </ScrollContainer>
  </a-form>
</template>

<script setup lang="ts">
  import { computed, ref, onBeforeMount, reactive, provide } from 'vue';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { groupBy, get, has } from 'lodash-es';
  import { PropGroup } from '/@page-designer/enum';
  import propEditors from '/@page-designer/designer/panels/prop-editor';
  import PropsShow from '/@page-designer/designer/panels/prop-editor/props-show.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { buildItemRules } from '/@/utils/lowcode/validate';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { isFormFieldType } from '/@page-designer/schema/utils';
  import baseProps from './component/base-props.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { ScrollContainer } from '/@/components/Container';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { IconNext } from '/@/components/Icon';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { inRowEditor } from '/@page-designer/constant/editor';

  const { allFormWidget } = useDesigner();

  // suiteKey
  const { appInfo } = useAppInfoStore();

  function isKitInclude(editor: LowCodeWidget.PropEditor): boolean {
    if (editor.kit && editor.kit.length > 0) {
      return editor.kit.includes(appInfo.suiteKey);
    }
    return true;
  }

  const { t } = useI18n();
  const { selectedAllPropEditors, selectedProps, selectedRef } = useSelectedWidget();

  const globFieldInfo = reactive<any>({});

  const propState = ref(selectedProps);
  /**暂时写死顺序 后续会增加editor的分组配置页面需要改成读取那个页面的顺序 */
  const propSort = [
    PropGroup.OPTIONS,
    PropGroup.SEARCH,
    PropGroup.INPUT_CONFIG,
    PropGroup.Table,
    PropGroup.Vue3,
    PropGroup.SUBMIT_RULE,
    PropGroup.TABLESELECT_CONFIG,
    PropGroup.QUERY,
    PropGroup.LIST,
    PropGroup.DATA,
    PropGroup.FIELD_CONFIG,
    PropGroup.FORM_CONFIG,
    PropGroup.LABEL,
    PropGroup.FIELD,
    PropGroup.MODAL,
    PropGroup.MODALWIDTH,
    PropGroup.MODALHEIGHT,
    PropGroup.MODALTITLECONFIG,
    PropGroup.GENRADIO,
    PropGroup.GENCHECKBOX,
    PropGroup.GENSWITCH,
    PropGroup.GENIMAGE,
    PropGroup.COLLAPSE,
    PropGroup.CARDLIST,
    PropGroup.FIELD_LAYOUT,
    PropGroup.TREE_CONFIG,
    PropGroup.SHOW,
    PropGroup.BUTTON,
    PropGroup.LISTBUTTON,
    PropGroup.Button,
    PropGroup.IFRAME,
    PropGroup.FILECOLLECT,
    PropGroup.ButtonShow,
    PropGroup.ButtonStyle,
    PropGroup.TEXT,
    PropGroup.PERMISSION,
    PropGroup.ADVANCED,
    PropGroup.OPERATOR_CONFIG,
    PropGroup.LISTDATA,
    PropGroup.DATALINKAGE,
    PropGroup.DATASOURCE,
    PropGroup.VALIDATERULE,
    PropGroup.GRID_CONFIG,
    PropGroup.COL_CONFIG,
    PropGroup.SPACE_OCCUPATION,
    PropGroup.DIVIDER,
    PropGroup.LEFT_RIGHT_COLUMNS,
    PropGroup.DISPLAY,
    PropGroup.OTHER,
    PropGroup.DATARANGE,
    PropGroup.BUSINESS_CONFIG,
    PropGroup.COMPONENTDEPENDENCY,
    PropGroup.CARDDISPLAY,
  ];
  const showEditor = (editor: LowCodeWidget.PropEditor) => {
    let showByHide = true;
    let showByProp = true;
    let showByLocation = true;
    let showByKit = true;

    if (editor.dependentProps) {
      showByProp = editor.dependentProps
        .map((key) => selectedRef.value?.props?.[key])
        .every((i) => i);
    }

    if (!!editor.hidden && typeof editor.hidden === 'function') {
      // false 表示需要过滤
      showByHide = !editor.hidden(
        selectedRef.value as LowCodeWidget.BasicSchema | LowCodeModal.Modal,
      );
    }

    if (has(editor, 'formField') && editor.formField) {
      // 一些属性配置在非表单类型模式下需要隐藏
      showByLocation = isFormFieldType(selectedRef.value);
    }

    showByKit = isKitInclude(editor);

    return showByProp && showByHide && showByLocation && showByKit;
  };
  const getLabelButtonType = (editor) => {
    return typeof editor._config?.labelButton.type === 'function'
      ? editor._config?.labelButton.type(selectedRef.value)
      : editor._config?.labelButton.type;
  };

  const getLabelButtonDisplay = (editor) => {
    return (
      editor._config?.labelButton &&
      (typeof editor._config?.labelButton.hidden === 'function'
        ? !editor._config?.labelButton.hidden(selectedRef.value)
        : !editor._config?.labelButton.hidden)
    );
  };

  onBeforeMount(async () => {
    if (selectedRef.value.isField) {
      const fieldInfo = selectedRef.value?.props?.isCustomField
        ? getFormCustomFieldInfo(selectedRef.value, selectedRef.value?.props?.field)
        : await FieldSchema.getConfigByField(
            selectedRef.value?.props?.modelKey,
            selectedRef.value?.props?.field,
          );

      globFieldInfo.label = fieldInfo.name;

      if (
        [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI, FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(
          selectedRef.value?.props?.fieldType,
        ) &&
        get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.SYS_VAR
      ) {
        globFieldInfo.defaultMain = get(fieldInfo, 'defaultValue.value');
      } else if (
        [FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME, FIELD_TYPE.TIME].includes(
          selectedRef.value?.props?.fieldType,
        ) &&
        get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.SYS_VAR
      ) {
        globFieldInfo.defaultSysDate = get(fieldInfo, 'defaultValue.value');
      } else if (get(fieldInfo, 'defaultValue.type') === FieldDefaultValueTypeEnum.FIXED) {
        globFieldInfo.defaultValue = get(fieldInfo, 'defaultValue.value');
      }
    } else if (selectedRef.value.isSearchField!) {
      const fieldInfo = await FieldSchema.getConfigByField(
        selectedRef.value?.props?.modelKey,
        selectedRef.value?.props?.field,
      );
      globFieldInfo.label = fieldInfo.name;
    }
  });

  provide('globFieldInfo', globFieldInfo);

  /**将propList按照group分组 */
  const groupProps = computed(() => {
    const editor = selectedAllPropEditors.value?.filter(showEditor) || [];
    return groupBy(editor, 'group');
  });
  const activeKey = ref([
    PropGroup.BASIC,
    ...Object.keys(groupBy(selectedAllPropEditors.value, 'group')),
  ]);

  // 从当前表单scheme中获取自定义字段信息列表
  const getFormCustomFieldInfo = (widget, fieldKey) => {
    const selectedForm = allFormWidget.value.filter((e) => e.id === widget.preLocation)[0];
    const customFieldList = selectedForm?.props.customFieldList || [];
    return customFieldList.filter((e) => e.key === fieldKey)[0] || {};
  };
</script>

<style lang="less" scoped>
  .prop-wrap {
    position: absolute;
    inset: 37px 0 0;
    // overflow-x: hidden;
    // overflow-y: auto;

    &.modal {
      inset: 37px 0 0;
    }
  }

  :deep(.ant-collapse-item:first-child .ant-collapse-header) {
    border-top: 0;
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

  .in-row-editor-new {
    display: flex;
    flex-direction: row;

    :deep(.ant-form-item-label) {
      flex-grow: 0;
      flex-shrink: 0;
      margin-right: 6px;
      padding: 0 !important;
      white-space: nowrap;
    }

    :deep(.ant-form-item-control) {
      flex: 1 1 0;
    }
  }

  .in-row-float-right {
    :deep(.ant-form-item-control) {
      .ant-form-item-control-input-content {
        display: flex;

        & > label {
          margin-left: auto;
        }
      }
    }
  }

  .in-row-editor,
  .in-row-reverse-editor {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;

    :deep(.ant-form-item-label) {
      padding: 0 !important;
    }

    :deep(.ant-form-item-control) {
      flex-grow: 0;
    }
  }

  .in-row-reverse-editor {
    flex-direction: row;

    &.mb0 {
      margin-bottom: 0 !important;
    }

    :deep(.ant-form-item-label) {
      // margin-left: 4px;
    }
  }

  .in-row-editor {
    flex-direction: row;
    justify-content: space-between;

    :deep(.ant-form-item-label) {
      flex-shrink: 0;
      margin-right: 16px;
      margin-left: 0;
    }
  }

  .primary {
    color: var(--ant-primary-color);
  }

  :deep(.ant-form-item) {
    margin-bottom: 16px;
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

  .custom-label-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .label-right-icon {
      margin-right: 4px;
      cursor: pointer;
    }
  }

  .tooltip {
    color: #c3c3c3;
    font-size: 12px;
  }
</style>
