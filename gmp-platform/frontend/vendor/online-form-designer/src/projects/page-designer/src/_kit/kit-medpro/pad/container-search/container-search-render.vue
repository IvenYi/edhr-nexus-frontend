<template>
  <div v-if="justScan" class="container-search-render just-scan" :style="containerStyle">
    <van-search
      ref="searchRef"
      v-model="searchValue"
      class="quick-search"
      :placeholder="placeholder"
      @search="handleSearch"
      @clear="handleClear"
    >
      <template #left-icon> </template>
      <template #right-icon>
        <div class="flex flex-items-center">
          <van-icon name="search" color="#000" @click="handleSearch" />
          <span class="px2">|</span>
          <van-icon name="scan" color="var(--van-primary-color)" @click="openScan" />
        </div>
      </template>
    </van-search>
  </div>

  <div v-else class="container-search-render" :style="containerStyle">
    <van-search
      ref="searchRef"
      v-model="searchValue"
      class="quick-search"
      :placeholder="placeholder"
      :background="styleWrap.backgroundColor"
      @search="handleSearch"
      @clear="handleClear"
    >
      <template #left-icon>
        <van-icon
          name="scan"
          color="var(--van-primary-color)"
          v-if="widget.props.scan && scanLeft"
          @click="openScan"
        />
      </template>
      <template #right-icon>
        <div class="flex flex-items-center">
          <van-icon name="search" color="#000" @click="handleSearch" />
          <span v-if="widget.props.scan && !scanLeft" class="px2">|</span>
          <van-icon
            name="scan"
            color="var(--van-primary-color)"
            v-if="widget.props.scan && !scanLeft"
            @click="openScan"
          />
        </div>
      </template>
    </van-search>

    <div class="results-field-container">
      <form-render
        :id="containerId"
        class="results-field-form"
        ref="formRef"
        :widget="widget.children[0]"
        v-slot="{ formState }"
      >
        <div v-if="containerVisible" class="grid p-2" :style="styleWrap">
          <div
            class="results-field-form__item"
            v-for="field in showFields"
            :key="field.id"
            @click="showMessage(formState, field)"
          >
            <span class="mr-2">{{ field.alias }}</span>
            <span class="font-bold">{{ formateFiled(formState, field) }}</span>
          </div>
        </div>
      </form-render>
      <div
        v-if="showTrigger && containerVisible"
        class="results-field__trigger pb-2 cursor-pointer"
        @click="showMore = !showMore"
        :style="styleWrap"
      >
        <van-icon name="arrow-up" v-if="showMore" />
        <van-icon name="arrow-down" v-else />
      </div>
    </div>
  </div>

  <van-empty
    v-if="!containerVisible && !justScan"
    class="mt40px"
    :image="emptyPng"
    description="暂无数据"
  />
</template>

<script lang="ts" setup name="gct-container-search">
  import { uniqueId, trimStart } from 'lodash-es';
  import { ref, nextTick, computed, toRaw, onMounted } from 'vue';
  import { showToast } from 'vant';
  import { IContainerSearch } from './schema';
  import emptyPng from './empty.png';
  import FormRender from '/@page-designer/components/widgets/mobile/basic/form/form-render.vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  // import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  // import { i18n } from '@mobile/locales/setupI18n';
  import { insetDep } from '/@web-render/render/Event/Dependency/controller';
  import { FormComponents } from '@gct/runtime';
  import { ReturnTypeEnum } from '/@/components/Expression/types';
  import { useFormWidget } from '/@page-designer/components/widgets/hooks/formhook';
  import { JSSDK } from '@mobile/utils/sdkAdapter';

  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IContainerSearch }>();
  const formRef = ref();
  const searchRef = ref();
  const showMore = ref<boolean>(false);
  const containerId = uniqueId('results-field-form');
  const loading = ref<boolean>(false);
  const formData = ref<any>({});
  const searchValue = ref<string>();
  const { setInputFocus } = useFormWidget(defProps);

  const {
    maxLength,
    rowLength,
    placeholder,
    scanSite,
    defaultModelKey,
    modelData,
    notGoodContainer,
    getFocus,
    justScan,
  } = toRaw(defProps.widget.props);

  const fieldWidgets = computed(() => {
    return defProps.widget.children![0]?.children ?? [];
  });

  const scanLeft = computed(() => {
    return scanSite === 'left';
  });

  const showTrigger = computed(() => {
    return Number(fieldWidgets.value?.length) > maxLength;
  });

  const showFields = computed(() => {
    return showTrigger.value && !showMore.value
      ? fieldWidgets.value.slice(0, maxLength)
      : fieldWidgets.value.slice();
  });

  const containerStyle = computed(() => {
    const style = defProps.widget.style;
    const { marginBottom, marginLeft, marginRight, marginTop } = style as any;
    return {
      marginBottom: marginBottom + 'px' || '0px',
      marginLeft: marginLeft + 'px' || '0px',
      marginRight: marginRight + 'px' || '0px',
      marginTop: marginTop + 'px' || '0px',
    };
  });

  const styleWrap = computed(() => {
    const style = defProps.widget.style;
    const { enableBGColor, bgColor, color, fontSize } = style as any;
    return {
      fontSize: fontSize ? `${fontSize}px` : '14px',
      color,
      backgroundColor: enableBGColor
        ? 'var(--van-primary-color)'
        : bgColor || 'var(--van-primary-color)',
      gridTemplateColumns: `repeat(${rowLength ?? 5}, 1fr)`,
    };
  });

  const containerVisible = computed(() => {
    return formData.value && formData.value.id_;
  });

  function formateFiled(formState, field) {
    const fieldKey = field?.props.field;
    const fieldId = formState[fieldKey];
    if (field.type === FormComponents.DataTableFormula) {
      insetDep({ expression: field?.props?.formula, rowData: formData.value }, (res) => {
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

  function showMessage(formState, field) {
    const message = formateFiled(formState, field);
    if (!message) return;
    return showToast(message);
  }

  async function getDataSource() {
    if (!trimStart(searchValue.value)) {
      formData.value = {};
      return;
    }
    loading.value = true;
    try {
      let res: any = {};
      let query = {
        'name_.eq': searchValue.value,
      };
      const exp = 'OR(name_.eq)';
      if (notGoodContainer) {
        query['not_good_'] = true;
      }
      const beforeSearchResult = await Event.runEventByName(
        'beforeSearch',
        defProps.widget.events,
        searchValue.value,
      );
      if (beforeSearchResult?.query) {
        query = beforeSearchResult.query;
      }
      res = await Event.context.$httpBizService(
        {
          action: defProps.widget.props.txnType ? 'biz_search' : 'listByPage',
          key: defProps.widget.props.txnType || defaultModelKey,
          modelCategory: modelData!.modelCategory,
        },
        {
          query,
          exp,
        },
      );
      if (res && res.data) {
        const dataSource = transformSourceData(res?.data, res?.dict) as any;
        formData.value = dataSource?.[0];
      } else {
        formData.value = {};
        showToast('批次信息为空，不支持当前操作');
      }
      Event.runEventByName('afterSearch', defProps.widget.events, formData.value);
    } finally {
      loading.value = false;
    }
  }

  async function handleSearch() {
    if (justScan) {
      Event.runEventByName('afterScan', defProps.widget.events, searchValue.value);
      return;
    }
    await getDataSource();
    formRef.value?.setValue?.(formData.value, formData.value?._DICT);
  }

  function handleClear() {
    formData.value = {};
    formRef.value.reset();
    formRef.value.setValue({});
    Event.runEventByName('afterClear', defProps.widget.events);
  }

  async function openScan() {
    searchValue.value = await JSSDK.run('openScan');
    handleSearch();
  }

  async function search(key?: string) {
    const query = {
      'name_.eq': key ?? searchValue.value,
    };
    const exp = 'OR(name_.eq)';
    if (notGoodContainer) {
      query['not_good_'] = true;
    }
    const res = await Event.context.$httpBizService(
      {
        action: defProps.widget.props.txnType ? 'biz_search' : 'listByPage',
        key: defProps.widget.props.txnType || defaultModelKey,
        modelCategory: modelData!.modelCategory,
      },
      {
        query,
        exp,
      },
    );
    return res;
  }

  onMounted(() => {
    nextTick(() => {
      searchRef.value && setInputFocus(searchRef, getFocus);
      if (formRef.value) {
        const formWidget = defProps.widget.children[0];
        const { id, type } = formWidget;
        Event.initNode(id, { elRef: formRef.value, type });
      }
    });
  });

  defineExpose({
    getValue: () => {
      return formRef.value?.getValue();
    },
    setValue: (value = {}) => {
      return formRef.value?.setValue?.(value);
    },
    addValue: (value = {}) => {
      return formRef.value?.addValue?.(value);
    },
    reset: async () => {
      await nextTick();
      searchValue.value = '';
      formRef.value?.reset();
      formRef.value?.setValue({});
      formData.value = {};
    },
    setSearchFocus() {
      searchRef.value && setInputFocus(searchRef, true);
    },
    search,
  });
</script>

<style lang="less" scoped>
  .just-scan {
    .van-search {
      :deep(.van-search__field) {
        padding: 0 !important;
        padding-right: var(--van-padding-xs) !important;
        align-items: center !important;
        height: 24px;
      }

      :deep(.van-field__control) {
        text-align: left !important;
        font-size: 14px;
      }

      :deep(.van-search__content) {
        background: #f7f7f7;
        padding: 11px 12px;
        font-size: 12px;
        border-radius: 4px;
      }
    }
  }
  .container-search-render {
    .van-search {
      :deep(.van-search__field) {
        padding: 0 !important;
        padding-right: var(--van-padding-xs) !important;
        align-items: center !important;
      }

      :deep(.van-field__control) {
        text-align: left !important;
      }
    }
  }

  .results-field-container {
    position: relative;
    margin: 10px 0 0;
    overflow: hidden;

    .results-field__trigger {
      display: flex;
      position: relative;
      z-index: 20;
      align-items: center;
      justify-content: center;
    }

    .results-field-form {
      :deep(.van-field__label),
      :deep(.van-field__control) {
        color: #fff !important;
      }

      :deep(.van-cell) {
        padding-top: 4px;
        padding-bottom: 4px;
      }

      &__item {
        padding: 4px 12px;
        overflow: hidden;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
</style>
