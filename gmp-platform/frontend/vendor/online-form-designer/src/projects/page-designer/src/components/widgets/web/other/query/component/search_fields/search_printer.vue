<template>
  <div v-if="readonly">{{ fieldlabel || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
      <a-tree-select
        @change="emit('tableSearch')"
        show-search
        v-model:value="value"
        tree-node-filter-prop="label"
        treeNodeLabelProp="label"
        :tree-data="treeoptions"
        :disabled="disabled"
        tree-default-expand-all
        dropdown-class-name="gct-custom-select-dropdown"
        :getPopupContainer="PopupContainer"
        :dropdownMatchSelectWidth="false"
        style="width: 100%"
        allowClear
        showArrow
        :multiple="multiple"
        :placeholder="placeholder"
        :filter-tree-node="filterTreeNode"
        maxTagCount="gct-responsive"
      >
        <template #tagRender="item">
          <span
            class="ant-select-selection-item"
            :title="item?.option?.dftPrintInfo?.label || item.label || item.value"
          >
            <span class="ant-select-selection-item-content">
              {{ item?.option?.dftPrintInfo?.label || item.label || item.value }}</span
            >
            <span class="ant-select-selection-item-remove">
              <CloseOutlined @click="closetag(item)" />
            </span>
          </span>
        </template>
        <template #title="item">
          <!-- 由于tree-select的title插槽会被引用到选中项的回显中，所以只能在插槽中判断是下拉框还是选中项的回显 -->
          <taglabel
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
        <!-- <template #tagRender="{ label, closable, option }">
      <a-tag :closable="closable" style="margin-right: 3px; font-size: 14px">
        {{ label }}
        <a-tag v-if="!option.id" :bordered="false" color="#f2f3f5">(离线)</a-tag>
      </a-tag>
    </template> -->
      </a-tree-select>
    </div>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="emit('tableSearch')"
    />
  </div>
</template>

<script setup lang="ts" name="gct-printer">
  import { computed, toRefs, toRaw, reactive, onBeforeMount, toRef, ref, onMounted } from 'vue';
  import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchPrinter } from '/@page-designer/types/web';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import { cloneDeep } from 'lodash-es';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PrintResourceEnum } from '/@/projects/developer-center/src/views/integration/enum';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { SEARCH_SEVICE } from '/@/enums/designEnum';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import moreOption from '../more_option.vue';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchPrinter;
    formData: Object;
  }>();
  const {
    placeholder,
    defaultValue,
    fieldType,
    field,
    selectOption,
    // readonly,
    // ope,
    label,
    fieldName,
    moreOptions,
    ignoreOptions,
  } = reactive(props.widget.props);
  const { useMore, disabled, readonly, ope } = toRefs(props.widget.props);
  const multiple = !ope.value.includes(SEARCH_SEVICE.EQ) && !ope.value.includes(SEARCH_SEVICE.GE);
  const PopupContainer = getParentPopupContainer(props);

  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const isOrgin = ref(false);
  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const fieldlabel = toRef(() => {
    if (selectOption && selectOption.length) {
      return selectOption
        .map((item) => `${!item.active ? item.label + '(离线)' : item.label}`)
        .join(',');
    }
    return '';
  });
  const value = computed<any>({
    get() {
      let value = props.modelValue;
      if (props.modelValue && selectOption && selectOption.length && isOrgin.value) {
        isOrgin.value = false;
        return multiple
          ? selectOption.map((item) => `${item.active ? item.value : item.label + '(离线)'}`)
          : selectOption.map((item) => `${item.active ? item.value : item.label + '(离线)'}`)[0];
      }
      return value || undefined;
    },
    set(value: string | string[]) {
      emit('update:modelValue', value || '');
    },
  });
  function getExistPrinter() {
    if (selectOption && selectOption.length) {
      selectOption.forEach((item) => {
        item.active = 0;
      });
      selectOption.forEach((opt, idx) => {
        options.value.forEach((i) => {
          if (opt.value === i.value) {
            opt.active = 1;
          }
        });
      });
    }
    isOrgin.value = true;
  }
  onBeforeMount(async () => {
    value.value = value.value || defaultValue || '';
    await getAsyncOptions({ fieldKey: field });
    await getExistPrinter();
  });
  const judgeExist = (options) => {
    let onlineprint = [] as any;
    const select = selectOption?.map((item) => item.value) || [];
    options.map((i) => {
      if (i.children && i.children.length) {
        i.children.map((e) => {
          if (select.includes(e.printKey)) {
            // onlineprint.push(e.printKey);

            e.active = 0;
          }
        });
      }
    });
    if (!onlineprint.length) {
      selectOption?.map((p) => {
        // p.label = p.label.includes('(离线)') ? p.label : p.label + '(离线)';
        // options.unshift(p);
        p.active = 0;
      });
      return;
    }

    if (onlineprint.length < select.length) {
      const filter = select.filter((i) => {
        return !onlineprint.includes(i);
      });
      selectOption?.map((p) => {
        if (filter.includes(p.value)) {
          p.label = p.label.includes('(离线)') ? p.label : p.label + '(离线)';
          // p.active = 0;
          options.unshift(p);
        }
      });
    }
  };

  const treeoptions = computed(() => {
    const valueList = list_to_tree(
      cloneDeep(
        options.value?.map((i) => {
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
    judgeExist(valueList);
    return valueList;
  });

  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    let data = options.value.find((i) => i.value === v);
    return toRaw(data);
  }

  function closetag(i) {
    value.value = value.value.filter((item) => i.value !== item);
  }

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  const filterTreeNode = (inputValue, treeNode) => {
    if (!inputValue) return true;
    if (ignoreCase.value) {
      return treeNode.label?.toLowerCase().includes(inputValue.toLowerCase());
    }
    return treeNode.label?.includes(inputValue);
  };

  defineExpose({
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
<style lang="less" scoped>
  .search-select-box {
    flex: 1;
    &.use-more {
      width: calc(100% - 26px);
    }
  }
</style>
