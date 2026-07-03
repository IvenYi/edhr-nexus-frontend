<template>
  <div class="bg-[#fff] px-4 py-3 border-rd">
    <a-form ref="searchRef" :model="searchFormState" class="w-full flex items-center">
      <div class="w-full flex items-center">
        <a-form-item
          style="width: 30%; margin-right: 10px"
          :label="t('sys.kit.medPro.packageSearch.workOrder')"
          name="workOrderId"
          required
        >
          <a-select
            v-model:value="searchFormState.workOrderId"
            show-search
            :options="workOrdersOpts"
            :filter-option="filterWorkOrdersOpts"
            :disabled="lockStatus"
            :placeholder="t('sys.chooseText')"
            allowClear
          />
        </a-form-item>
        <a-form-item
          v-if="searchFormState.workOrderId"
          style="width: 30%; margin-right: 10px"
          :label="t('sys.kit.medPro.packageSearch.rulesName')"
          required
          name="ruleId"
          :placeholder="t('sys.chooseText')"
        >
          <a-select
            v-model:value="searchFormState.ruleId"
            show-search
            :options="packageRulesOpts"
            :filter-option="filterPackageRulesOpts"
            :disabled="lockStatus"
            :placeholder="t('sys.chooseText')"
            allowClear
            @change="handleChangeRule"
          />
        </a-form-item>
        <a-button type="primary" v-if="!lockStatus" ghost @click="_handleLock(!lockStatus)">
          <template #icon>
            <LockOutlined />
          </template>
          {{ t('sys.kit.medPro.packageSearch.lock') }}
        </a-button>
      </div>
    </a-form>

    <div class="results-field-container px-2 mt10px">
      <form-render
        :id="containerId"
        class="results-field-form"
        ref="formRef"
        :widget="widget.children[1]"
        v-slot="{ formState }"
      >
        <div class="grid" :style="{ 'grid-template-columns': `repeat(${rowLength ?? 5}, 1fr)` }">
          <widgetItem
            v-for="widget in showFields"
            :key="widget.id"
            :widget="widget"
            :formData="formState"
          >
            <div class="flex results-field__custom">
              <span class="mr-2">{{ widget.alias }}：</span>
              <a-tooltip>
                <template #title> {{ formateFiled(formState, widget) }}</template>
                <div class="max-w-full">{{ formateFiled(formState, widget) }}</div>
              </a-tooltip>
            </div>
          </widgetItem>
        </div>
      </form-render>

      <div
        class="results-field__trigger cursor-pointer"
        v-if="showTrigger"
        @click="showMore = !showMore"
      >
        <span class="mr-1">{{ showMore ? t('sys.collapse') : t('sys.unfold') }}</span>
        <up-outlined v-if="showMore" />
        <down-outlined v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="gct-container-search">
  import { uniqueId } from 'lodash-es';
  import { ref, reactive, nextTick, computed, onMounted, toRaw, watch } from 'vue';
  import { LockOutlined } from '@ant-design/icons-vue';
  import { IPackageSearch } from './schema';
  import widgetItem from '../../component/web/container-form-item.vue';
  // @ts-ignore
  import FormRender from '/@page-designer/components/widgets/web/basic/form/form-render.vue';
  // @ts-ignore
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  // @ts-ignore
  import { useI18n } from '/@/hooks/web/useI18n';
  import { insetDep } from '/@/projects/web-render/src/render/Event/Dependency/controller';
  import { ReturnTypeEnum } from '/@/components/Expression/types';
  import { FormComponents } from '@gct/runtime';

  const { t } = useI18n();
  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IPackageSearch }>();
  const formRef = ref();
  const searchRef = ref();
  const searchFormState = reactive<{ [key: string]: any }>({
    workOrderId: undefined,
    ruleId: undefined,
  });
  const showMore = ref<boolean>(false);
  const containerId = uniqueId('results-field-form-package');

  const workOrdersOpts = ref([]);

  const filterWorkOrdersOpts = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const packageRulesOpts = ref([]);

  const filterPackageRulesOpts = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };

  const lockStatus = ref<boolean>(false);

  const { maxLength, rowLength } = toRaw(defProps.widget.props);

  const fieldWidgets = computed(() => {
    return defProps.widget.children![1]?.children ?? [];
  });

  const showTrigger = computed(() => {
    const maxNum = Math.min(rowLength, maxLength);
    return computedFields.value.length > maxNum;
  });

  const computedFields = computed(() => {
    let fields = fieldWidgets.value?.slice() ?? [];
    const data = formRef.value?.getValue();
    let filterFields: string[] = [];
    if (data?.package_type_ === 'split') {
      filterFields = ['from_expansion_id_', 'to_expansion_id_'];
    } else if (data?.package_type_ === 'association') {
      filterFields = ['from_expansion_id_', 'to_expansion_id_', 'single_package_qty_'];
    } else if (data?.package_type_ === 'expansion') {
      filterFields = data?.association_to_expansion_
        ? ['from_expansion_id_', 'to_container_modality_id_', 'single_package_qty_']
        : ['from_container_modality_id_', 'to_container_modality_id_', 'single_package_qty_'];
    }
    return fields.filter((field) => {
      return field?.props?.field && !filterFields.includes(field.props.field);
    });
  });

  const showFields = computed(() => {
    const maxNum = Math.min(rowLength, maxLength);
    return showTrigger.value && !showMore.value
      ? computedFields.value.slice(0, maxNum)
      : computedFields.value.slice();
  });

  function formateFiled(formState, field) {
    const fieldKey = field?.props.field;
    const fieldId = formState[fieldKey];
    if (field.type === FormComponents.DataTableFormula) {
      insetDep({ expression: field?.props?.formula, rowData: formState }, (res) => {
        if (res === undefined || res === null) {
          res = '';
        }
        if (field.props.fieldType === ReturnTypeEnum.Boolen) {
          res = res ? defProps.widget.props?.truelabel : defProps.widget.props?.falselabel;
        }
        formState[fieldKey] = res + '';
      });
    }
    const fieldValue = formState?._DICT?.[fieldKey]?.[fieldId] || fieldId;
    return fieldValue?.toString() || '';
  }

  const handleChangeRule = (value, opt) => {
    if (value && opt) {
      formRef.value?.setValue({ ...opt }, opt?._DICT);
    } else {
      formRef.value?.setValue({});
    }
  };

  const _handleLock = async (status) => {
    await searchRef.value.validate();
    const data = formRef.value?.getValue();
    if (!lockStatus.value) {
      Event.runEventByName('beforeLock', defProps.widget.events, data);
    }
    lockStatus.value = status;
    Event.runEventByName(
      !lockStatus.value ? 'afterUnlock' : 'afterLock',
      defProps.widget.events,
      data,
    );
  };

  watch(
    () => searchFormState.workOrderId,
    async (val) => {
      if (val) {
        const res = await Event.context.$httpBizService(
          {
            key: 'em_order_package_rule_entry',
            action: 'listAll',
          },
          {
            query: {
              ref_master_id_: val,
            },
            sorts: [
              {
                sortField: 'create_time_',
                sortType: 'desc',
              },
            ],
          },
        );
        if (res?.data?.length) {
          packageRulesOpts.value = res.data.map((item) => {
            return {
              ...item,
              label: item.name_,
              value: item.id_,
              _DICT: res.dict,
            };
          });
        }
      } else {
        packageRulesOpts.value = [];
      }
      searchFormState.ruleId = undefined;
      formRef.value?.setValue({});
    },
  );

  onMounted(async () => {
    const res = await Event.context.$httpBizService(
      {
        key: 'em_mfg_order',
        action: 'listAll',
      },
      {
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
      },
    );
    if (res?.data?.length) {
      workOrdersOpts.value = res.data.map((item) => {
        return {
          label: item.name_,
          value: item.id_,
        };
      });
    }
    await nextTick();
    if (formRef.value) {
      const formWidget = defProps.widget.children![1];
      const { id, type } = formWidget;
      Event.initNode(id, { elRef: formRef.value, type });
    }
  });

  defineExpose({
    lockStatus,
    getValue: () => {
      return formRef.value?.getValue();
    },
    handleLock: () => {
      return _handleLock(true);
    },
    handleUnlock: () => {
      return _handleLock(false);
    },
    reset: async () => {
      await nextTick();
      formRef.value?.setValue({});
      formRef.value?.reset();
      searchRef.value?.resetFields();
    },
  });
</script>

<style lang="less" scoped>
  .results-field-container {
    background: #f7f8fa;
    border-radius: 4px;
    position: relative;
    overflow: hidden;

    :deep(.ant-form .readonly-field-item.ant-form-item) {
      box-sizing: border-box !important;
      padding: 6px 4px;
      height: 34px !important;
      overflow: hidden;
      .ant-form-item-control-input {
        min-height: auto !important;
      }
    }
    :deep(.ant-form-item-control-input-content) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :deep(.tag-text) {
      display: inline-block;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      vertical-align: middle;
    }
    .results-field {
      &__custom {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      &__trigger {
        position: absolute;
        right: 10px;
        top: 8px;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
