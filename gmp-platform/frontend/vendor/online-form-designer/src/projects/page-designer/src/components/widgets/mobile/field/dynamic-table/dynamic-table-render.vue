<template>
  <div class="gct-dynamic-table">
    <van-cell
      class="dynamic-table-title-area"
      center
      title-style="padding-left: 12px"
      :border="false"
      :required="required"
    >
      <template #title v-if="widget.props.displayLabelText">
        <div style="text-align: left">
          {{ widget.props.label || globFieldLabel }}
        </div>
      </template>
      <!-- <template #value v-if="!readonly">
        <slot :children="btnContainer"></slot>
      </template> -->
    </van-cell>

    <div class="dynamic-table-fields-list">
      <div class="dynamic-table-field-item" v-for="(data, index) in tableData" :key="data">
        <div class="dynamic-table-field-area">
          <div>{{ data.name_ }}</div>
          <fieldWidget v-for="i in data.__RENDER__" :widget="i" :index="index" :rowValue="data">
            <!-- <template #label> {{ data.name_ }} </template> -->
            <!-- <template #label> {{ i.props.fieldName }} </template> -->
          </fieldWidget>
          <!-- <van-form
            :ref="(elt) => (innerFormRefs[index] = elt)"
            style="height: 100%; min-height: inherit"
            class="dynamic-table-field-area-form"
            required="auto"
          >
            <vantField
              v-if="nameColumn.length"
              :props="nameColumn[0].props"
              :style="nameColumn[0].style"
              readonly
              :formData="data"
            >
              <template #input>
                <i
                  v-if="!nameColumn[0].props.displayLabelText && data.required_"
                  :style="{
                    color: 'var(--van-field-required-mark-color)',
                    marginRight: '2px',
                  }"
                  >*</i
                >
                {{ data.name_ }}
              </template>
            </vantField>
            <slot
              :formState="data"
              :children="cmptedTableColumns(data).filter((e) => e.props?.field !== 'name_')"
            ></slot>
          </van-form> -->
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
        <!-- <div v-if="dropFieldsWidget.children?.length && !readonly" class="gct-card-footer">
          <cardBtnRender
            :children="dropFieldsWidget.children"
            :data="{ ...data, idx: index }"
            :visibleButtons="visibleButtons"
            :rowDisabled="disabled"
            :clickMethod="(prop) => handleClick(prop, data, index)"
          />
        </div> -->
      </div>
    </div>
    <div v-if="btnContainer?.children?.length">
      <groupButtons
        :children="btnContainer.children"
        :rowDisabled="disabled"
        :visibleButtons="btnContainer.visibleButtons"
      />
    </div>
  </div>
  <add-table-data-modal ref="addModal" :modalInfo="widget.children[0]" :id="widget?.id" />
</template>

<script setup lang="ts" name="gct-dynamic-table">
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
  } from 'vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { SubTable } from '/@page-designer/types/web';
  import { useDisplayRuleOptions } from '/@web-render/render/Event/utils/displayRule';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SUB_TABLE_EDIT_MODE, SUB_TABLE_OPE_EVENT_TYPE } from '/@page-designer/enum';
  import { showDialog, showToast } from 'vant';
  import { useI18n } from '@mobile/utils/useI18n';
  import AddTableDataModal from './modals/add-table-data-modal.vue';
  import { cloneDeep } from 'lodash-es';
  import cardBtnRender from '/@page-designer/components/widgets/mobile/data/card-list/component/card-btn-render.vue';
  import vantField from '../../__components__/vantField.vue';
  import fieldWidget from '../../__components__/fieldByList/index.vue';
  import { IMobDynamicTableComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import tableButtons from '/@page-designer/components/widgets/mobile/__components__/table-buttons/table-buttons-render.vue';
  import groupButtons from '/@page-designer/components/widgets/mobile/__components__/group-buttons/group-buttons-render.vue';
  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{ modelValue: Array<any>; widget: SubTable; formData }>();
  const { label, modelKey, field, customdataSource, datasourceConfig } = reactive(
    props.widget.props,
  );

  const { editMode, rowLimitOpen, rowLimit, visibleButtons, required, readonly, disabled } = toRefs(
    props.widget.props,
  );

  provide('editMode', editMode.value);
  provide('subTableReadonly', readonly);
  provide('subTableDisabled', disabled);

  const emit = defineEmits(['update:modelValue']);

  const globFieldLabel = ref();
  const loading = ref(false);
  const addModal = ref();
  const innerFormRefs = ref({});

  const btnContainer = toRef(() => {
    props.widget?.children[2].children.forEach((btn) => {
      btn.props.disabled = disabled.value;
    });
    return props.widget?.children[2];
  });

  const tableColumns = toRef(() => {
    // console.log(
    //   'rable====',
    //   props.widget.children![3].children,
    //   useDisplayRuleOptions(props.widget.children![3].children).value,
    // );
    //显示字段
    return useDisplayRuleOptions(props.widget.children![3].children).value || [];
  });

  const cmptedTableColumns = (data) => {
    return tableColumns.value
      ?.map((e) => {
        return {
          ...e,
          props: {
            ...e.props,
            required: data.required_,
          },
        };
      })
      .filter((e) => e.props?.field !== 'name_');
  };

  const nameColumn = computed(() => {
    return tableColumns.value.filter((e) => e.props?.field === 'name_');
  });

  const tableData = computed(() => {
    return (
      props.modelValue
        ?.filter((d) => !d.deleted_)
        .map((i) => {
          i.__RENDER__ = cmptedTableColumns(i);
          return i;
        }) || []
    );
  });
  const dropFieldsWidget = computed(() => {
    return props.widget.children![1];
  });

  onBeforeMount(async () => {
    if (!label) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      // console.log('fieldInfo', fieldInfo);
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
    const queryData = { query: { [querykey + '.eq']: id } };
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

  /**删除事件 */
  // const afterDelete = (data, index) => {
  //   console.log('click', data, index);
  //   props.modelValue.splice(index, 1);
  //   // total.value--;
  // };

  // 校验内部所有表单
  const handleValidateInnerForms = async () => {
    const promises = Object.values(innerFormRefs.value).map((ref: any) => {
      return new Promise((resolve) => {
        ref
          .validate()
          .then((res) => {
            resolve(true);
          })
          .catch((err) => {
            const { message, name } = err[0];
            showToast(message);
            resolve(Promise.reject(err));
          });
      });
    });
    const results = await Promise.all(promises);
    return results.every((valid) => valid);
  };

  // const handleClick = async (prop, rowData, index) => {
  //   if (
  //     prop.subTableEventType === SUB_TABLE_OPE_EVENT_TYPE.DELETE ||
  //     prop.sysMethedType === SUB_TABLE_OPE_EVENT_TYPE.DELETE
  //   ) {
  //     if (rowData.id_) {
  //       rowData.deleted_ = true;
  //     } else {
  //       props.modelValue.splice(index, 1);
  //     }
  //   } else if (
  //     prop.subTableEventType === SUB_TABLE_OPE_EVENT_TYPE.EDIT ||
  //     prop.sysMethedType === SUB_TABLE_OPE_EVENT_TYPE.EDIT
  //   ) {
  //     const data = await addModal.value!.open(toRaw(rowData), 'edit', false);
  //     props.modelValue[index] = { ...data };
  //   } else if (!prop.innerEvent && !Array.isArray(prop.eventName)) {
  //     Event.runExportByName(prop.eventName, rowData, index);
  //   } else if (!prop.innerEvent) {
  //     Event.runEventByName('onClick', prop.events);
  //   }
  // };
  provide('tableEvent', {
    edit: async (rowData, index) => {
      const data = await addModal.value!.open(cloneDeep(rowData), 'edit', false);
      props.modelValue[index] = cloneDeep(data);
    },
    copy: (rowData) => {
      const data = cloneDeep(rowData);
      data.id_ = undefined;
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
      props.modelValue.push({});
    } else {
      const data = await addModal.value!.open({}, 'create');
      props.modelValue.push({ ...data });
    }
    console.log(tableData.value, tableColumns.value);
  });
  defineExpose<IMobDynamicTableComponentExpose>({
    getValue() {
      return cloneDeep(props.modelValue);
    },
    setValue(arr: any[]) {
      emit('update:modelValue', arr);
    },
    addValue(data: any[]) {
      emit('update:modelValue', [...(props.modelValue || []), ...data]);
    },
    reload() {
      getTableData();
    },
    async validateInnerForms() {
      return await handleValidateInnerForms();
    },
  });
</script>

<style lang="less" scoped>
  .gct-dynamic-table {
    width: 100%;

    .dynamic-table-title-area.van-cell {
      padding: 0;

      :deep(> .van-cell__title) {
        box-sizing: border-box;
        flex: none;
        width: 6.2em;
        margin-right: 12px;
        color: #333;
        text-align: left;
        word-wrap: break-word;
      }

      :deep(> .van-cell__value) {
        padding: 1px;
      }
    }

    .dynamic-table-fields-list {
      /* padding-top: 6px; */

      .dynamic-table-field-item {
        /* padding-top: 6px; */

        /* background-color: #f5f5f5; */

        .dynamic-table-field-area {
          /* background-color: #fff; */

          :deep(.van-cell) {
            padding: 4px 0;
          }
        }

        .gct-card-footer {
          display: flex;
          padding: 8px 12px;

          /* background-color: #fff; */

          .footer-btn-wrap {
            display: flex;
            flex: 1;
            flex-direction: row-reverse;
          }

          .btn-more {
            margin-left: 8px;
            line-height: 32px;
          }
        }
      }
    }
  }

  :deep(.van-cell) {
    padding: 8px 0;
  }
  // .dyn-form-value {
  //   background-color: #f7f8fa;
  // }

  :deep(.van-field__body) {
    padding: 10px 0;

    .van-field__control {
      padding-left: 12px;
    }
  }
</style>
