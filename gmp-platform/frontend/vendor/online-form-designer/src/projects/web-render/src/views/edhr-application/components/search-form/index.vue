<template>
  <div class="content-top" :class="{ 'is-transparent': transparent }">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <div class="search-wrapper">
        <div
          v-for="(item, index) in searchList"
          :key="item.id || index"
          class="search-item"
          :style="{
            '--drag-item-width': `${itemWidth}%`,
            display: !expand && index > maxLength - 1 ? 'none' : 'inline-block',
          }"
        >
          <div class="inline-block box-border search-item-area">
            <a-form-item :name="item.id" :label="item.label" :required="item.required">
              <a-input
                v-if="item.type === 'input'"
                v-model:value="formState[item.model]"
                :max-length="item.maxLength"
                allow-clear
                :placeholder="item.placeholder || t('sys.inputTextTip')"
              />
              <a-select
                v-else-if="item.type === 'select'"
                v-model:value="formState[item.model]"
                allow-clear
                showSearch
                optionFilterProp="label"
                :placeholder="item.placeholder || t('sys.pleaseSelectSth')"
                :options="item.options"
                @change="item.onChange"
              />

              <lot-table-select
                v-else-if="item.type === 'lotTableSelect'"
                v-model:value="formState[item.model]"
                v-bind="item.selectAttrs || {}"
              />

              <RdoTableSelect
                v-else-if="item.type === 'treeTableSelect'"
                v-model:modelValue="formState[item.model]"
                :placeholder="item.placeholder || t('sys.pleaseSelectSth')"
                :model-key="item.modelKey"
                :parent-to-default="item.parentToDefault"
                :hide-single-version="item.hideSingleVersion"
              />

              <GrantUserSelect
                v-else-if="item.type === 'userSelect'"
                v-model:value="formState[item.model]"
                :placeholder="item.placeholder || t('sys.chooseTextTip')"
              />

              <DateRangePicker
                v-else-if="item.type === 'dateRange'"
                v-model:start="formState[item.startModel]"
                v-model:end="formState[item.endModel]"
                :start-name="item.startModel"
                :end-name="item.endModel"
                :format="item.format || 'YYYY-MM-DD HH:mm:ss'"
              />

              <a-range-picker
                v-else-if="item.type === 'dateRange2'"
                v-model:value="formState[item.model]"
                :valueFormat="item.format || 'YYYY-MM-DD HH:mm:ss'"
                :format="item.format || 'YYYY-MM-DD HH:mm:ss'"
                :show-time="item.showTime"
                :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              />

              <EdhrTemplateSelect
                v-else-if="item.type === 'edhrTmplSelect'"
                v-model:modelValue="formState[item.model]"
                :placeholder="item.placeholder || t('sys.chooseTextTip')"
                :disabled-parent="item.disabledParent"
              />

              <TraceSelect
                v-else-if="item.type === 'traceSelect'"
                v-model:modelValue="formState[item.model]"
                :placeholder="item.placeholder || t('sys.pleaseSelectSth')"
                :model-key="item.modelKey"
                :field-type="item.fieldType"
              />
              <VersionSelect
                v-else-if="item.type === 'versionSelect'"
                v-model:value="formState[item.model]"
                :notEmitParent="false"
                :type="item.tmplType || FormDesignEnum.ONLINE_FORM"
                :enable-control="true"
                :placeholder="item.placeholder || t('sys.pleaseSelectSth')"
              />
              <template v-else-if="item.type === 'categoryTreeSelect'">
                <slot name="custom_comp" v-bind="{ item, formState }"></slot>
              </template>
            </a-form-item>
          </div>
        </div>

        <div
          class="search-item search-item-search-btn inline-block"
          :style="{ width: btnItemWidth }"
        >
          <div :style="{ 'justify-content': 'right' }" class="box-border button-area">
            <a-button class="mr8px" @click="handleReset">{{ t('sys.reset') }}</a-button>
            <a-button type="primary" @click="handleQuery">{{ t('sys.query') }}</a-button>

            <div class="button-toggle ml-8px" v-if="isShowExpand" @click="expand = !expand">
              {{ expand ? t('sys.collapse') : t('sys.unfold') }}
              <up-outlined v-if="expand" />
              <down-outlined v-else />
            </div>
          </div>
        </div>
      </div>
    </a-form>
  </div>
</template>

<script setup lang="ts" name="search-form">
  import { ref, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import RdoTableSelect from '../rdo-table-select/rdo-table-select.vue';
  import DateRangePicker from '../date-range-picker/date-range-picker.vue';
  import GrantUserSelect from '../../render/user-granted/components/grant-user-select.vue';
  import TraceSelect from '../trace-select/trace-select.vue';
  import EdhrTemplateSelect from '../edhr-template-select';
  import LotTableSelect from '../lot-table-select/lot-table-select.vue';
  import { VersionSelect } from '/@online-form/views/web-render/components';
  import { clear } from 'xe-utils';
  import type { FormInstance } from 'ant-design-vue';
  import { FormDesignEnum } from '/@/layouts/tree-sider-page/enum';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      formData: any;
      initData: any[];
      maxLength: number;
      rowLength: number;
      /** 是否透明 */
      transparent?: boolean;
    }>(),
    {
      maxLength: 2,
      rowLength: 3,
      transparent: false,
    },
  );

  const emit = defineEmits(['on-query', 'on-reset']);

  const expand = ref(false);
  const formRef = ref<FormInstance>();

  const searchList = computed(() => props.initData.slice());

  const formState = computed({
    get() {
      return props.formData;
    },
    set(value) {
      Object.assign(props.formData, value);
    },
  });

  const isShowExpand = computed(() => {
    return searchList.value.length > props.maxLength;
  });

  const itemWidth = computed(() => 100 / props.rowLength);

  const filterListLength = computed(() => {
    const list =
      isShowExpand.value && !expand.value
        ? searchList.value.slice(0, props.maxLength)
        : searchList.value.slice();
    return list.length;
  });

  const btnItemWidth = computed(() => {
    return (
      (filterListLength.value
        ? (props.rowLength - (filterListLength.value % props.rowLength)) * itemWidth.value
        : 100) + '%'
    );
  });

  const handleReset = () => {
    formRef.value?.resetFields();
    clear(formState.value);
    emit('on-reset');
    emit('on-query');
  };

  const handleQuery = () => {
    formRef.value?.validate().then(() => {
      emit('on-query');
    });
  };
</script>

<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }

  .content-top {
    background-color: rgb(247, 248, 250) !important;
    padding: 8px 16px;
    margin-bottom: 16px;

    &.is-transparent {
      background-color: #fff !important;
      padding: 0;
    }
  }

  .search-wrapper {
    margin-right: -5px;
    margin-left: -5px;
    background-color: transparent;

    .search-item,
    .search-item-search-btn {
      display: inline-block;
      box-sizing: border-box;
      padding-right: 5px;
      padding-left: 5px;
    }

    .search-item {
      width: var(--drag-item-width);
    }
  }

  .search-item-area {
    position: relative;
    width: 100%;
    padding: 8px 0;
  }

  .button-area {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    width: 100%;
    height: 100%;
    margin-top: 8px;
    margin-bottom: 8px;

    .button-toggle {
      position: relative;
      transition: all 0.3s;
      color: var(--ant-primary-color);
      cursor: pointer;
    }
  }
</style>
