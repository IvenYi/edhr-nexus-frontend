<template>
  <div :class="ns.b()">
    <a-form ref="formIns" :model="formState" layout="vertical">
      <a-collapse
        ghost
        v-model:activeKey="activeKey"
        expand-icon-position="right"
        class="config-collapse"
      >
        <a-collapse-panel key="1" :header="$t('sys.developer.appCenter.basicInfoTitle')">
          <a-form-item
            :label="$t('sys.appDesigner.pageName')"
            name="name"
            :rules="[{ required: true }]"
          >
            <!-- <a-input v-model:value="formState.name" :maxLength="32" /> -->
            <i18n-select-input
              attr="name"
              v-model:i18nConfig="formState.i18n"
              @on-i18n-select="handleI18nSelect"
            >
              <template #i18n-input>
                <a-input
                  v-model:value="formState.name"
                  show-count
                  :maxlength="32"
                  autocomplete="off"
                  style="width: calc(100% - 32px); height: 32px"
                />
              </template>
            </i18n-select-input>
          </a-form-item>
          <a-form-item :label="$t('sys.appDesigner.icon')">
            <IconNextPicker
              show-color
              v-model:value="formState.icon"
              v-model:color="formState.color"
              :style="{
                '--box-size': '40px',
              }"
            />
          </a-form-item>
        </a-collapse-panel>

        <a-collapse-panel
          v-if="businessFields.length"
          key="2"
          :header="$t('sys.edhr.businessFilter')"
        >
          <a-row :gutter="16">
            <a-col v-for="field in businessFields" :key="field.id" :span="12">
              <a-form-item :label="field.props.label">
                <SearchFieldWidget
                  :widget="field"
                  :value="formState.queryFields[field.id]?.rawValue"
                  @update:value="(val) => onRawQueryChange(field.id, val)"
                  :modelCategory="modelCategory"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel v-if="numberFields.length" key="3" :header="$t('sys.edhr.numberFilter')">
          <a-row :gutter="16">
            <a-col v-for="field in numberFields" :key="field.id" :span="12">
              <a-form-item
                :label="field.props.label"
                :name="field.id"
                :rules="
                  [
                    SearchComponents.SearchStringNumberInput,
                    SearchComponents.SearchNumberInput,
                  ].includes(field.type)
                    ? [
                        {
                          validator: (rule, value) =>
                            validateLengthRange(rule, value, formState.queryFields),
                          message: $t('sys.edhr.leftNotMoreThanRight'),
                        },
                      ]
                    : null
                "
              >
                <SearchFieldWidget
                  :widget="field"
                  :value="formState.queryFields[field.id]?.rawValue"
                  @update:value="(val) => onRawQueryChange(field.id, val)"
                  :modelCategory="modelCategory"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-collapse-panel>
        <a-collapse-panel v-if="dateFields.length" key="4" :header="$t('sys.edhr.timeFilter')">
          <a-row
            :gutter="16"
            :class="ns.e('date-field')"
            v-for="field in dateFields"
            :key="field.id"
          >
            <a-col :span="8" :class="ns.e('label-switch')">
              <span :class="ns.e('label')" class="ell" :title="field.props.label">
                {{ field.props.label }}
              </span>
              <span :class="ns.e('switch')">
                <a-radio-group
                  size="small"
                  :value="getDataValueType(field.id)"
                  @change="(e) => onDateChange(field.id, e.target.value)"
                >
                  <a-radio :value="QueryValueType.RAW">
                    {{ $t('sys.edhr.fixedDate') }}
                  </a-radio>
                  <a-radio :value="QueryValueType.DYNAMIC_DATE">
                    {{ $t('sys.edhr.dynamicDate') }}
                  </a-radio>
                </a-radio-group>
              </span>
            </a-col>
            <a-col :span="14" :offset="2">
              <FormItem
                :isFirst="true"
                v-if="!getDateChecked(field.id)"
                :label="$t('sys.edhr.fixedDate')"
                :name="field.id"
                :rules="
                  [SearchComponents.SearchDateTime, SearchComponents.SearchDate].includes(
                    field.type,
                  )
                    ? [
                        {
                          validator: (rule, value) =>
                            validateDateRange(rule, value, formState.queryFields),
                          message: $t('sys.edhr.endTimeNotEarlyThanStartTime'),
                        },
                      ]
                    : null
                "
              >
                <SearchFieldWidget
                  :widget="field"
                  :value="formState.queryFields[field.id]?.rawValue"
                  @update:value="(val) => onRawQueryChange(field.id, val)"
                  :modelCategory="modelCategory"
                />
              </FormItem>
              <FormItem :isFirst="true" v-else :label="$t('sys.edhr.dynamicDate')">
                <a-select
                  class="w-full"
                  v-model:value="formState.queryFields[field.id].dynamicDateType"
                  :options="dynamicDateOptions"
                  :placeholder="$t('sys.edhr.selectDynamicDateType')"
                />
              </FormItem>
            </a-col>
          </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="query-tab-modal">
  import { computed, onMounted, reactive, ref, toRaw } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { EntityModelCategoryEnum, useModal, useNamespace } from '@gct/runtime';
  import { IQueryTab } from './types';
  import { cloneDeep, isEmpty } from 'lodash-es';
  import dayjs from 'dayjs';
  import { SearchComponents } from '/@page-designer/enum';
  import SearchFieldWidget from '/@page-designer/components/widgets/web/other/query/component/search_fields/index.vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import { SearchWidgets } from '/@page-designer/types/web';
  import { DynamicDateType, QueryValueType } from './constants';
  import { I18nSelectInput } from '/@/components/I18nSelect';

  const ns = useNamespace('query-tab-modal');

  const props = withDefaults(
    defineProps<{
      tab: IQueryTab;
      /** 分页配置的筛选项 */
      searchWidgets: SearchWidgets[];
      /** 模型的分类 */
      modelCategory: EntityModelCategoryEnum;
    }>(),
    {},
  );

  const fieldWidgets = computed(() => {
    return props.searchWidgets || [];
  });

  const numberSearchTypes = ['SearchNumberInput', 'SearchStringNumberInput'];
  const dateSearchTypes = ['SearchDateTime', 'SearchDate'];

  const numberFields = computed(() => {
    return fieldWidgets.value
      .filter((i) => numberSearchTypes.includes(i.type))
      ?.map((e) => {
        e.props.minValue = 0;
        return e;
      });
  });
  const dateFields = computed(() => {
    return fieldWidgets.value.filter((i) => dateSearchTypes.includes(i.type));
  });
  const businessFields = computed(() => {
    return fieldWidgets.value.filter(
      (i) => ![...dateSearchTypes, ...numberSearchTypes].includes(i.type),
    );
  });

  const dynamicDateOptions = [
    {
      value: DynamicDateType.DAY,
      label: $t('sys.edhr.today'),
    },
    {
      value: DynamicDateType.WEEK,
      label: $t('sys.edhr.thisWeek'),
    },
    {
      value: DynamicDateType.MONTH,
      label: $t('sys.edhr.thisMonth'),
    },
    {
      value: DynamicDateType.YEAR,
      label: $t('sys.edhr.thisYear'),
    },
  ];

  const activeKey = ref<any>(['1', '2', '3', '4']);
  const formIns = ref<FormInstance>();
  const formState = reactive<IQueryTab>(cloneDeep(props.tab));

  /** 禁止修改，查询组件的默认值会抛修改 */
  const forbidChange = ref(true);
  onMounted(() => {
    setTimeout(() => {
      forbidChange.value = false;
    }, 500);
  });

  const initQueryByKey = (key) => {
    if (!formState.queryFields[key]) {
      const fieldWiget = fieldWidgets.value.find((i) => i.id === key);
      formState.queryFields[key] = {
        valueType: QueryValueType.RAW,
        field: fieldWiget!.props.field,
        ope: fieldWiget!.props.ope,
      };
    }
  };
  const onRawQueryChange = (key: string, value: any) => {
    if (forbidChange.value) {
      return;
    }
    initQueryByKey(key);
    Object.assign(formState.queryFields[key], {
      valueType: QueryValueType.RAW,
      rawValue: value,
    });
  };

  const getDateChecked = (key: string) => {
    return formState.queryFields[key]?.valueType === QueryValueType.DYNAMIC_DATE;
  };
  const onDateCheck = (key: string, checked) => {
    initQueryByKey(key);
    formState.queryFields[key].valueType = checked
      ? QueryValueType.DYNAMIC_DATE
      : QueryValueType.RAW;
  };

  const getDataValueType = (key: string) => {
    return formState.queryFields[key]?.valueType ?? QueryValueType.RAW;
  };

  const onDateChange = (key: string, newValue: QueryValueType) => {
    initQueryByKey(key);
    formState.queryFields[key].valueType = newValue;
  };

  function validateLengthRange(rule, value, formData) {
    const [minValue, maxValue] = formData[rule.field]?.rawValue || [];
    if ((minValue || minValue === 0) && (maxValue || maxValue === 0) && minValue > maxValue) {
      return Promise.reject();
    } else return Promise.resolve();
  }

  function validateDateRange(rule, value, formData) {
    const [startValue, endValue] = formData[rule.field]?.rawValue || [];

    if (startValue && endValue) {
      const minDate = dayjs(startValue);
      const maxDate = dayjs(endValue);

      if (minDate.isValid() && maxDate.isValid() && minDate.isAfter(maxDate)) {
        return Promise.reject();
      }
    }
    return Promise.resolve();
  }

  const handleI18nSelect = (params) => {
    // formState!.i18n = params;
    console.log('i18n-----', params, formState);
  };

  useModal(async () => {
    await formIns.value?.validate();
    return {
      ok: true,
      data: [toRaw(formState)],
    };
  });
</script>

<style lang="scss" scoped>
  $query-tab-modal: (
    form-item-mb: 16px,
  );

  @include b(query-tab-modal) {
    @include set-component-css-var(query-tab-modal, $query-tab-modal);

    @include e(label-switch) {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    @include e(label) {
      margin-right: 16px;
      font-size: 14px;
      line-height: 32px;
    }

    @include e(switch) {
      white-space: nowrap;
      // margin-left: 20px;

      .ant-switch {
        margin-bottom: 3px;
      }
    }

    padding: 16px 24px;

    :deep(.ant-collapse-header) {
      padding: 0;
      padding-bottom: 16px;
      color: #000;
      font-size: 16px;
      font-weight: 500;

      &::before {
        content: '';
        display: inline-block;
        position: relative;
        top: 6px;
        width: 3px;
        height: 14px;
        margin-right: 8px;
        border-radius: 10px;
        background-color: var(--ant-primary-color);
      }
    }

    :deep(.ant-collapse-content > .ant-collapse-content-box) {
      padding: 0;
    }

    :deep(
      .ant-collapse-ghost > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box
    ) {
      padding: 0;
    }

    :deep(
      .ant-collapse-icon-position-right
        > .ant-collapse-item
        > .ant-collapse-header
        .ant-collapse-arrow
    ) {
      top: 14px;
      right: 0;
    }

    :deep(.form-item__label) {
      margin-right: 12px;
      font-size: 14px;
    }
    :deep(.ant-form .ant-form-item) {
      margin-bottom: getCssVar(query-tab-modal, form-item-mb);
    }

    @include e(date-field) {
      margin-bottom: getCssVar(query-tab-modal, form-item-mb);
      :deep(.ant-row.ant-form-item.form-item__content) {
        margin-bottom: 0;
      }
    }
  }
</style>
