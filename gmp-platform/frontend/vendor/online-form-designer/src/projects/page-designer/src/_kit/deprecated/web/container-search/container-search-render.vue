<template>
  <div class="bg-[#fff] px-4 py-3 border-rd">
    <div class="flex items-center">
      <label>{{ widget.props.title }}：</label>
      <SelectSearchRender
        ref="selectSelectRender"
        class="flex-1"
        :widget="widget"
        :extra="{
          dropdownMatchSelectWidth: true,
          props: defProps.widget.props,
          maxHeight: webRenderHeight,
        }"
        @selected="selectRow"
        @clear="handleClear"
        @afterQuery="handleAfterQuery"
      />
    </div>

    <div class="results-field-container mt-2 px-2" :style="{ height: containerHeight + 'px' }">
      <form-render
        :id="containerId"
        class="results-field-form"
        ref="formRef"
        :widget="widget.props.form"
        v-slot="{ formState }"
      >
        <div class="grid grid-cols-5">
          <widget-item
            v-for="widget in widgetList"
            :key="widget.id"
            :widget="widget"
            :formData="formState"
          ></widget-item>
        </div>
      </form-render>

      <div class="results-field__trigger cursor-pointer" v-if="showTrigger">
        <div v-if="!showMore" @click="expand">
          <span class="mr-1">展开</span>
          <DownOutlined />
        </div>
        <div v-else>
          <span class="mr-1" @click="collapse">收起</span>
          <UpOutlined />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="gct-container-search">
  import { uniqueId } from 'lodash-es';
  import { ref, nextTick, computed, onMounted } from 'vue';
  import SelectSearchRender from '/@page-designer/components/widgets/web/other/select-search/select-search-render.vue';
  import FormRender from '/@page-designer/components/widgets/web/basic/form/form-render.vue';
  import Widget from '/@web-render/render/widget/index.vue';
  import WidgetItem from './container-form-item.vue';
  import { IContainerSearch } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const Event = getPageEvent();
  const defProps = defineProps<{ widget: IContainerSearch }>();
  const formRef = ref();
  const selectSelectRender = ref();
  const showMore = ref<boolean>(false);
  const containerHeight = ref<number>(34);
  const containerId = uniqueId('results-field-form');
  const webRenderHeight = ref<number>(400);

  const showTrigger = computed(() => {
    return Number(defProps.widget.props.form.children?.length) > 5;
  });

  const widgetList = computed(() => {
    return defProps.widget.props?.form?.children ?? [];
  });

  function selectRow(record) {
    formRef.value?.setValue({});
    formRef.value?.setValue({ ...record }, record?._DICT);
    Event.runEventByName('afterSelect', defProps.widget.events, record);
    // 执行绑定到组件上的对应组件的回调方法
    Event.runTableBySearch(defProps.widget.id, record);
  }

  function handleClear() {
    // 清空搜索框,下方展示信息同步清空
    formRef.value?.setValue({});
    selectSelectRender.value?.reload();
  }

  function handleAfterQuery(data, query) {
    if (data && data.length === 1 && query) {
      selectSelectRender.value.selectRow(data[0]);
    }
  }

  function expand() {
    showMore.value = true;
    initContainerHeight();
  }

  function collapse() {
    showMore.value = false;
    containerHeight.value = 34;
  }

  async function initContainerHeight() {
    await nextTick();
    const height = document.getElementById(containerId)?.getBoundingClientRect()?.height as number;
    containerHeight.value = height;
  }

  onMounted(async () => {
    await nextTick();
    const renderContent = document.querySelector('.web-render-content');
    const renderHeight = (renderContent?.getBoundingClientRect?.()?.height as number) || 300;
    webRenderHeight.value = renderHeight - 120 > 300 ? 300 : renderHeight - 120;
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
    reload: async () => {
      await nextTick();
      formRef.value?.reset();
      selectSelectRender.value?.reload();
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
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .results-field {
      &__item {}

      &__trigger {
        position: absolute;
        right: 10px;
        top: 8px;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
