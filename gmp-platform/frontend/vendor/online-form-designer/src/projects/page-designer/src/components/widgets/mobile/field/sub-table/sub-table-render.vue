<template>
  <vantField
    v-model="tableData"
    class="gct-sub-table"
    :props="widget.props"
    :formData="formData"
    :required="widget.props.required && displayLabelText"
  >
    <template #label>
      <div class="ks-row w100%">
        <span class="w6.6em gct-sub-table--label" v-if="displayLabelText">{{
          widget.props.label || globFieldLabel
        }}</span>
        <!-- <div class="ks-col"> <slot :children="btnContainer.children"></slot> </div> -->
      </div>
    </template>
    <template #input>
      <div class="w100%">
        <VueDraggable
          v-if="rowDragSort"
          :animation="200"
          ghost-class="sub-table-item-ghost"
          choose-class="sub-table-item-choose"
          handle=".drag-item-handle"
          v-model="sorts"
          @choose="choose"
          @unchoose="unchoose"
          @change="onChange"
        >
          <template #item="{ element, index }">
            <div
              v-if="!element.deleted_"
              :key="element._X_ROW_KEY + index"
              class="gct-sub-table-render-item bg-[#F6F7F9] mb14px p10px"
              :class="isChoose(index) ? 'is-choose' : ''"
            >
              <div class="gct-sub-table-render-item__choose-content" v-show="isChoose(index)">
                <div class="gct-sub-table-render-item__choose-content--title">
                  <template v-if="serialNumber"> 序号： {{ index + 1 }} </template>
                  <template v-else>
                    {{ tableColumns[0].alias }}: {{ element[tableColumns[0].props.field] }}
                  </template>
                </div>
                <div class="gct-sub-table-render-item__choose-content--action">
                  <van-icon name="wap-nav" />
                </div>
              </div>
              <div class="ks-row">
                <div class="ks-col">
                  <template v-if="serialNumber"> 序号： {{ index + 1 }} </template>
                </div>
                <span v-if="rowDragSort" class="drag-item-handle">
                  <van-icon name="wap-nav" />
                </span>
              </div>
              <fieldWidget
                v-show="!isChoose(index)"
                v-for="i in tableColumns"
                :key="element._X_ROW_KEY"
                :widget="i"
                :index="index"
                :rowValue="element"
                class="p0"
              />
              <div
                v-show="!isChoose(index)"
                v-if="(dropFieldsWidget.children?.length && !readonly) || rowDragSort"
                class="mt5px text-right"
                :key="element._X_ROW_KEY + index"
              >
                <tableButtons
                  v-if="dropFieldsWidget.children?.length && !readonly"
                  :children="dropFieldsWidget.children"
                  :rowValue="element"
                  :visibleButtons="dropFieldsWidget.props.visibleButtons"
                  :rowDisabled="disabled"
                  :index="index"
                />
              </div>
            </div>
          </template>
        </VueDraggable>
        <template v-else>
          <div
            v-for="(data, index) in sorts"
            :key="data._X_ROW_KEY + index"
            class="gct-sub-table-render-item bg-[#F6F7F9] mb14px p10px"
            v-show="!data.deleted_"
          >
            <div v-if="serialNumber"> 序号： {{ index + 1 }} </div>
            <fieldWidget
              :key="data._X_ROW_KEY + index"
              v-for="i in tableColumns"
              :widget="i"
              :index="index"
              :rowValue="data"
              class="p0"
            />

            <div
              v-if="dropFieldsWidget.children?.length && !readonly"
              class="mt5px"
              :key="data._X_ROW_KEY + index"
            >
              <tableButtons
                :children="dropFieldsWidget.children"
                :rowValue="data"
                :rowDisabled="disabled"
                :visibleButtons="dropFieldsWidget.props.visibleButtons"
                :index="index"
              />
            </div>
          </div>
        </template>
        <div v-if="btnContainer?.children?.length">
          <groupButtons
            :children="btnContainer.children"
            :rowDisabled="disabled"
            :visibleButtons="btnContainer.visibleButtons"
          />
        </div>
      </div>
    </template>
  </vantField>
  <add-table-data-modal ref="addModal" :modalInfo="widget.children[0]" :id="widget?.id" />
</template>

<script setup lang="ts" name="gct-sub-table">
  import {
    provide,
    ref,
    onBeforeMount,
    reactive,
    toRef,
    toRefs,
    onMounted,
    computed,
    watch,
    toRaw,
    nextTick,
  } from 'vue';
  import VueDraggable from 'vuedraggable';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { SubTable } from '/@page-designer/types/web';
  import { useDisplayRuleOptions } from '/@web-render/render/Event/utils/displayRule';
  import fieldWidget from '../../__components__/fieldByList/index.vue';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import {
    SUB_TABLE_EDIT_MODE,
    SUB_TABLE_OPE_EVENT_TYPE,
    sortTypeEnum,
  } from '/@page-designer/enum';
  import { showDialog, showToast } from 'vant';
  import { useI18n } from '@mobile/utils/useI18n';
  import AddTableDataModal from './modals/add-table-data-modal.vue';
  import cardBtnRender from '/@page-designer/components/widgets/mobile/data/card-list/component/card-btn-render.vue';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { cloneDeep, differenceBy, orderBy } from 'lodash-es';
  import { isObject } from '/@/utils/is';
  import vantField from '../../__components__/vantField.vue';
  import { IMobSubTableComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { uuid } from '@jsplumb/browser-ui';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import tableButtons from '/@page-designer/components/widgets/mobile/__components__/table-buttons/table-buttons-render.vue';
  import groupButtons from '/@page-designer/components/widgets/mobile/__components__/group-buttons/group-buttons-render.vue';

  const chooseIndex = ref<number>(-1);

  function onChange({ moved }): void {
    if (moved && moved.newIndex !== moved.oldIndex) {
      showToast({ type: 'success', message: `操作成功` });
    }
  }

  const isChoose = (i): boolean => {
    return chooseIndex.value === i;
  };

  const choose = (e) => {
    const { oldIndex } = e;
    chooseIndex.value = oldIndex;
  };

  const unchoose = () => {
    chooseIndex.value = -1;
  };

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{ modelValue: Array<any>; widget: SubTable; formData: any }>();

  const { labelFont } = useStyle(props.widget);

  const subLabelLayout = toRef(() => {
    const width =
      props.widget.props.layout?.label === 'left' && !!props.widget.props.hasLabelWidth
        ? props.widget.props.labelWidth + (props.widget.props.labelType == 'percent' ? '%' : 'px')
        : '';

    return {
      width,
      layout: props.widget.props.layout,
      hasLabelWidth: props.widget.props.hasLabelWidth,
      overLabelDisplay: props.widget.props.overLabelDisplay,
    };
  });
  provide('subLabelLayout', subLabelLayout);

  const {
    label,
    modelKey,
    field,
    customdataSource,
    datasourceConfig,
    collation,
    displayLabelText,
    rowDragSort,
    serialNumber,
  } = reactive(props.widget.props);

  const {
    editMode,
    rowLimitOpen,
    rowLimit,
    readonly,
    disabled,
    validateRule,
    layout,
    hasLabelWidth,
    labelType,
    labelWidth,
    overLabelDisplay,
  } = toRefs(props.widget.props);

  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!hasLabelWidth?.value
        ? labelWidth?.value + (labelType?.value == 'percent' ? '%' : 'px')
        : '';
    return {
      width,
      layout: layout?.value,
      hasLabelWidth: hasLabelWidth?.value,
      overLabelDisplay: overLabelDisplay?.value,
    };
  });
  provide('labelLayout', labelLayout);
  provide('editMode', editMode.value);
  provide('subTableReadonly', readonly);
  provide('subTableDisabled', disabled);
  provide('subTableValidateRule', validateRule.value);

  const emit = defineEmits(['update:modelValue']);

  const globFieldLabel = ref();
  const loading = ref(false);
  const addModal = ref();

  /**排序字段 */
  const querySort = getQuerySort(
    rowDragSort
      ? {
          collationField: 'sort_num_',
          collationSort: sortTypeEnum.ASC,
        }
      : {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
          collation: collation,
        },
  );

  const btnContainer = toRef(() => {
    props.widget?.children[2].children.forEach((btn) => {
      btn.props.disabled = disabled.value;
    });
    return props.widget?.children[2];
  });
  const tableColumns = toRef(() => {
    //显示字段
    return useDisplayRuleOptions(props.widget.children![3].children).value;
  });

  const dropFieldsWidget = computed(() => {
    return props.widget.children![1];
  });

  onBeforeMount(async () => {
    if (!label) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      globFieldLabel.value = fieldInfo.name;
    }
  });
  onMounted(async () => {
    await getTableData();
  });
  /**
   * 支持自定义数据源
   */
  async function getDataSourceByType(id) {
    const querykey = 'ref_master_id_';
    const queryData = {
      query: { [querykey + '.eq']: id },
      sorts: [...querySort],
      includeSubModel: 1,
    };
    if (customdataSource && datasourceConfig?.name) {
      return Event.runExportByName(datasourceConfig?.name, queryData, datasourceConfig.extraParams);
    } else {
      return Event.context.$httpBizService(
        { action: 'listAll', key: props.widget.props.bindModelKey },
        queryData,
      );
    }
  }
  const getTableData = async () => {
    loading.value = true;
    if (props.formData.id_) {
      let res = await getDataSourceByType(props.formData.id_);
      emit('update:modelValue', res?.data);
    } else {
      emit('update:modelValue', []);
    }
    loading.value = false;
  };

  const tableData = computed(() => {
    props.modelValue?.forEach((i) => {
      if (!i._X_ROW_KEY) {
        i._X_ROW_KEY = uuid();
      }
    });
    return props.modelValue?.filter((d) => !d.deleted_) || [];
  });
  const deleteData = computed(() => {
    return props.modelValue?.filter((d) => !!d.deleted_) || [];
  });

  const sorts = computed({
    get() {
      return props.modelValue;
    },
    set(items) {
      emit('update:modelValue', items);
    },
  });

  watch(
    () => tableData.value?.length,
    (n, o) => {
      emit('update:modelValue', [...tableData.value, ...deleteData.value]);
    },
  );
  watch(
    () => props.modelValue,
    () => {
      if (props.modelValue === null || props.modelValue === undefined) {
        if (props.formData.id_) {
          getTableData();
        } else {
          emit('update:modelValue', []);
        }
      }
    },
  );

  watch(
    () => props.formData.id_,
    () => {
      if (props.formData.id_) {
        getTableData();
      }
    },
  );
  provide('tableEvent', {
    edit: async (rowData, index) => {
      const data = await addModal.value!.open(cloneDeep(rowData), 'edit', false);
      data._X_ROW_KEY = uuid();
      props.modelValue[index] = cloneDeep(data);
    },
    copy: (rowData) => {
      const data = cloneDeep(rowData);
      data.id_ = undefined;
      data._X_ROW_KEY = uuid();
      props.modelValue.push(data);
      showToast($t('sys.operatingTitle'));
    },
    delete: (rowData, index) => {
      if (rowData.id_) {
        rowData.deleted_ = true;
      } else {
        props.modelValue.splice(index, 1);
      }
    },
  });
  provide('sub-table-add-method', async (widget) => {
    if (rowLimitOpen.value && props.modelValue.length === rowLimit.value) {
      showDialog({
        title: t('sys.tip'),
        message: t('sys.pageDesigner.subTableRowLimit'),
      }).then(() => {
        // on close
      });
      return;
    }

    if (editMode.value === SUB_TABLE_EDIT_MODE.INLINE) {
      props.modelValue.push({ _X_ROW_KEY: uuid() });
    } else {
      const data = await addModal.value!.open({}, 'create');
      data._X_ROW_KEY = uuid();
      props.modelValue.push({ ...data });
    }
  });
  defineExpose<IMobSubTableComponentExpose>({
    getValue() {
      return cloneDeep(props.modelValue);
    },
    async setValue(data: any[], dict?: object) {
      const options = transformSourceData(data, dict);
      const diff = differenceBy(props.modelValue, options, 'id_').map((i) => {
        return { ...i, deleted_: true };
      });
      //子表刷新
      emit('update:modelValue', []);
      await nextTick();
      emit('update:modelValue', [...options, ...diff]);
    },
    addValue(data: any[], dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      emit('update:modelValue', [...(props.modelValue || []), ...options]);
    },
    reload() {
      getTableData();
    },
  });
</script>

<style lang="less" scoped>
  .gct-sub-table-render-item {
    --van-cell-font-size: 14px;

    transition: height 0.5s ease-in-out;
    border-radius: 4px;
    // background-color: #fff;
    color: #797a7d;

    .van-icon {
      font-size: 18px;
    }
  }

  .gct-sub-table-render-item.is-choose {
    height: 44px;
    padding: 0 16px;
    overflow: hidden;
    border: 1px solid #3168ec;
    border-radius: 4px;
    background-color: #d6e1fb;
    font-size: 14px;

    .van-icon {
      color: #3168ec;
    }
  }

  .sub-table-item-ghost {
    opacity: 0;
  }

  .gct-sub-table-render-item__choose-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .gct-sub-table-drag-action {
    font-size: 16px;
    cursor: pointer;
  }

  .gct-sub-table {
    width: 100%;

    .gct-sub-table--label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont?.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
  }

  :deep(.van-dialog) {
    margin: 0;
    padding: 0;
  }

  :deep(.van-cell) {
    padding: 8px 0;
    background-color: transparent;
  }
</style>
