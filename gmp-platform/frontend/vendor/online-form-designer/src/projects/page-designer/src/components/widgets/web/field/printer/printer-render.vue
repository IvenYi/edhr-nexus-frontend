<template>
  <FieldReadonly
    v-if="readonly"
    :label="tagValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-tree-select
    v-else
    show-search
    v-model:value="value"
    v-bind="treeSelectAtrr"
    tree-node-filter-prop="label"
    treeNodeLabelProp="label"
    :tree-data="treeoptions"
    :disabled="disabled"
    tree-default-expand-all
    dropdown-class-name="gct-custom-select-dropdown vxe-table--ignore-clear"
    :listHeight="310"
    :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
    :getPopupContainer="PopupContainer"
    :dropdownMatchSelectWidth="false"
    style="width: 100%"
    @change="changeSelect"
  >
    <template #title="item">
      <!-- 由于tree-select的title插槽会被引用到选中项的回显中，所以只能在插槽中判断是下拉框还是选中项的回显 -->
      <FieldReadonly
        v-if="item.label && !Object.prototype.hasOwnProperty.call(item, 'selected')"
        :label="item.dftPrintInfo?.label || item.label"
        :type="fieldType"
        :tagWidgetStyle="widget.style"
        :isDesign="false"
      />
      <a-row v-else-if="item.label">
        <a-col
          :span="item.defaultPrint === '是' ? 18 : 24"
          class="gct-text-overflow"
          :title="item.label"
        >
          {{ item.label }}
        </a-col>
        <a-col v-if="item.defaultPrint === '是'" :span="6" class="text-right">
          <a-tag color="processing">{{ t('sys.default') }}</a-tag>
        </a-col>
      </a-row>
      <span v-else>{{ value }}</span>
    </template>
  </a-tree-select>
</template>

<script setup lang="ts" name="gct-printer">
  import { computed, toRefs, toRaw, nextTick, reactive, onBeforeMount, ref } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Printer } from '/@page-designer/types/web';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import { cloneDeep } from 'lodash-es';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import FieldReadonly from '../../__components__/formcomponent/field-readonly.vue';
  import { IPrinterComponentExpose } from '/@/projects/page-designer/src/interface/web';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: Printer;
    formData: Object;
  }>();
  const { formData } = toRefs(props);
  const { placeholder, isFieldModel, bindFieldLink, fieldType, field, selectOption, modelKey } =
    reactive(props.widget.props);
  const isOrgin = ref(false);
  const { readonly, disabled } = toRefs(props.widget.props);
  const PopupContainer = getParentPopupContainer(props);
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);

  const treeSelectAtrr = computed(() => {
    let attr: TreeSelectProps = {
      placeholder: placeholder,
      allowClear: true,
    };
    return attr;
  });

  const Event = getPageEvent();

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const value = computed<any>({
    get() {
      let value = props.modelValue;
      if (selectOption && selectOption.length && isOrgin.value) {
        isOrgin.value = false;
        return selectOption.map((item) => `${item.active ? item.value : item.label + '(离线)'}`)[0];
      }
      return value || undefined;
    },
    set(value: string | string[]) {
      emit('update:modelValue', value || '');
    },
  });
  onBeforeMount(async () => {
    await nextTick();
    await getAsyncOptions({ fieldKey: field });
    await getExistPrinter();
  });

  async function getExistPrinter() {
    // 如果有前端默认值判断前端默认值离线
    if (selectOption && selectOption.length) {
      selectOption.forEach((item) => {
        item.active = 0;
      });

      options.value.forEach((i) => {
        if (selectOption[0].value === i.value) {
          selectOption[0].active = 1;
        }
      });
      isOrgin.value = true;
      return;
    }
    // if (props.modelValue) {
    //   const filter = options.value.filter((i) => {
    //     return i.value == props.modelValue;
    //   });
    //   if (!filter.length) {
    //     const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
    //     emit('update:modelValue', fieldInfo.defaultValueTips[0] + '(离线)' || '');
    //   }
    //   return;
    // }
  }

  const treeoptions = computed(() => {
    const valueList = list_to_tree(
      cloneDeep(
        options.value.map((i) => {
          return {
            ...i,
            id: i.printKey,
          };
        }),
      ),
      (node) => {
        return {
          ...node,
          disabled: node.parentId === 'ROOT' && node.type === PrintResourceEnum.INTERNET_PRINT,
        };
      },
    );
    return valueList;
  });

  async function changeSelect(v) {
    const data = await changeValue(v);
    if (!v) {
      deselect(value.value);
    }
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  /**值发生变化 */
  async function changeValue(v) {
    await nextTick();
    let data = getOptionValue(v);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = { [value.value]: data.label };
    }
    return data;
  }
  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.find((i) => i.value === v);
    return toRaw(data);
  }
  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._DICT[field] = undefined;
  }
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const tagValue = computed(() => {
    return formData.value._DICT?.[fieldKey]?.[value.value];
  });

  defineExpose<IPrinterComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
  });
</script>
<style scoped lang="less"></style>
