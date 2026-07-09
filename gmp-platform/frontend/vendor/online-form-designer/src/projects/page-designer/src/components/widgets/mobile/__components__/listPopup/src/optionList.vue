<template>
  <div class="pt50px flex flex-col h-full">
    <div class="text-left text-16px font-bold p12px absolute title">{{ title }}</div>
    <van-search
      v-if="showSearch"
      v-model="searchValue"
      :class="['border-b', { 'border-all': searchValue }]"
      @update:model-value="onSearch"
      @clear="onSearch('')"
      placeholder="请输入"
    >
      <template #left-icon>
        <!-- <van-icon name="scan" /> -->
      </template>
      <template #right-icon>
        <div class="flex flex-items-center">
          <van-icon name="search" />
          <i v-if="scan" class="px2 color-[#dddddd]" style="font-style: normal">|</i>
          <van-icon name="scan" v-if="scan" color="var(--van-primary-color)" @click="openScan" />
        </div>
        <!-- <van-icon :name="searchValue ? '' : 'search'" /> -->
      </template>
    </van-search>
    <div class="overflow-y-auto flex-1 mx-14px">
      <van-list :loading="loading" :finished="finished" finished-text="" @load="onLoad">
        <van-cell
          :border="false"
          @click="setVal(i)"
          class="mt-8px"
          :class="{
            'is-active':
              selectedKeys[0] === i.value ||
              selectedItems.map((item) => item?.value).includes(i.value),
          }"
          v-for="(i, index) in computedOptions"
          :key="index"
        >
          <template #title>
            <iconNodeHtml v-if="iconNode && i._item['icon']" :labelName="i.label" :item="i._item" />
            <span
              class="text-color"
              :style="{
                '--text-color': i?._item?.['textColor'],
              }"
              v-html="i[optionLabelProp] || i.label"
            ></span>
          </template>
          <template #right-icon>
            <div class="ks-row-middle">
              <van-icon
                name="success"
                class="text-18px primary-color"
                v-if="selectedItems.map((item) => item?.value).includes(i.value)"
              />
            </div>
          </template>
        </van-cell>
      </van-list>
    </div>
    <div class="w-full p-12px mt-4px shadow-top" v-show="type === SelectType.MULTIPLE">
      <div
        class="mb-12px w-full flex-1 overflow-y-auto"
        :class="{ 'toggle-box': isExpand }"
        v-if="selectedItems.length"
      >
        <span class="pr-8px text-sm mr-8px border-r">
          已选
          <span style="color: var(--van-primary-color)">
            {{ selectedItems.length }}
            <van-icon @click="toggle" :name="isExpand ? 'arrow-up' : 'arrow-down'" />
          </span>
        </span>
        <van-tag
          v-for="(item, index) in selectedItems"
          :key="item?.label + '_' + index"
          class="mx-2px px-2px tag-wrap"
          size="medium"
          round
          color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
          text-color="var(--van-primary-color)"
          closeable
          @close="close(item)"
          >{{ handleLabel(item?.label) }}</van-tag
        >
      </div>
      <van-button class="w-full px-4px" type="primary" @click="setMulVal">完成</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { h, toRef, watch, ref, computed } from 'vue';
  import { SelectType, type optionType } from './typing';
  import IconNext from '@/components/Icon/src/IconNext.vue';
  import { cloneDeep, debounce } from 'lodash-es';
  import { JSSDK } from '@mobile/utils/sdkAdapter';
  import { showToast } from 'vant';

  const props = defineProps<{
    api: Function;
    options: optionType[];
    activeKey: any[];
    title: string;
    type: SelectType;
    showSearch: Boolean;
    lazy?: Boolean;
    selectedOptions?: optionType[];
    remote?: Boolean; // 是否远程搜索
    iconNode?: Boolean; // 需要渲染图标
    onloadMore?: Function; // 分页加载的方法
    scan?: Boolean; // 是否支持扫码
    optionLabelProp?: String; // 下拉框中显示的字段，默认取得是label，可用此属性配置显示其他的字段。
    customSearch?: Function;
    filterFn?: Function;
    ignoreCase?: number;
    maxTagTextLength?: number;
  }>();
  const emit = defineEmits(['checked', 'handleSearch', 'update:activeKey']);
  const searchValue = ref('');
  const orgOptions = ref<optionType[]>([]);
  const isSearch = ref<Boolean>(false);
  const isExpand = ref<Boolean>(false);
  const loading = ref<Boolean>(false);
  const finished = ref(!props.lazy);
  const allOpts = ref(cloneDeep(props.options));
  const customOptions = ref([]);

  const optionList = computed(() => {
    return isSearch.value ? orgOptions.value : props.options;
  });

  const computedOptions = computed(() => {
    return customOptions.value.length ? customOptions.value : optionList.value;
  });

  const selectedItems = computed(() => {
    if (props.selectedOptions?.length) {
      props.selectedOptions.forEach((e) => {
        if (!allOpts.value.some((f) => f.value === e.value)) {
          allOpts.value.push(e);
        }
      });
    }
    return selectedKeys.value.map((e) => {
      return allOpts.value.find((f) => f.value === e);
    });
  });

  const selectedKeys = computed({
    get() {
      if (props.activeKey && typeof props.activeKey === 'string') {
        return props.activeKey.split(',');
      } else {
        return props.activeKey || [];
      }
    },
    set(val) {
      emit('update:activeKey', val);
    },
  });

  watch(
    () => props.options,
    () => {
      if (props.remote && props.options.length) {
        setSearchOpts(searchValue.value);
      } else {
        isSearch.value = false;
      }
    },
    { deep: true },
  );

  const iconNodeHtml = {
    render: ({ $attrs }) => {
      if ($attrs.labelName) {
        const { iconColor, icon } = $attrs.item || {};
        const iconAttrs: any = { iconColor, icon };
        if (!iconAttrs?.icon) return;
        return h(IconNext, {
          size: 16,
          value: iconAttrs?.icon,
          color: iconAttrs?.iconColor,
          style: 'vertical-align: text-bottom; margin-right: 4px',
        });
      }
    },
  };

  async function openScan() {
    const scanValue = await JSSDK.run('openScan');
    if (props.customSearch) {
      const item = allOpts.value.find((i) => i.value == scanValue);
      if (item) {
        setVal(item);
      } else {
        showToast('没有相关数据');
      }
    } else {
      const list = optionList.value.filter((i) => i.value == scanValue);
      if (list?.length) {
        scanValue && setVal(scanValue);
      } else {
        showToast('没有相关数据');
      }
    }
  }

  function setVal(value: any) {
    if (props.type === 'single') {
      emit('checked', value);
    } else if (props.type === 'multiple') {
      const idx = selectedKeys.value.findIndex((e) => e === value.value);
      if (idx > -1) {
        selectedKeys.value.splice(idx, 1);
      } else {
        const val = value?.value ?? value;
        selectedKeys.value.unshift(val);
      }
    }
  }

  function setMulVal() {
    emit('checked', selectedItems.value);
  }

  function close(value: any) {
    const val = value?.value ?? value;
    const idx = selectedKeys.value.findIndex((e) => e === val);
    selectedKeys.value.splice(idx, 1);
  }

  const pageNo = ref<number>(1);

  /**防抖处理搜索 */
  const onSearch = debounce(async (val: any) => {
    val = val && val.trim();
    if (props.remote) {
      if (val || val == '') {
        pageNo.value = 2;
        // emit('handleSearch', val);
        await requestFunc({ keyword: val.trim(), pageNo: 1 });
      } else {
        orgOptions.value = [];
        isSearch.value = true;
        return;
      }
    } else {
      if (val == '') {
        isSearch.value = false;
        return;
      }
      setSearchOpts(val);
    }
  }, 300);

  const setSearchOpts = (val: any) => {
    isSearch.value = true;
    // if (!props.showSearch) {

    const options = props.options.filter((item) => {
      if (props.filterFn) {
        return props.filterFn(val, item);
      }
      if (props.ignoreCase) {
        return item.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1;
      }
      return item.label?.indexOf(val) !== -1;
    });
    orgOptions.value = JSON.parse(JSON.stringify(options));
    // } else {
    //   orgOptions.value = JSON.parse(JSON.stringify(props.options));
    // }
    orgOptions.value.forEach((i) => {
      const parts = i.label?.split(new RegExp(`(${val})`, 'gi'));
      const list = parts?.map((part, index) =>
        part.toLowerCase() === val.toLowerCase()
          ? `<span key=${index} style='color: var(--van-primary-color);'>${part}</span>`
          : part,
      );
      i.label = list?.join('');
      // i.label = i.label
      //   ?.trim()
      //   .replace(val, val ? `<span style='color: var(--van-primary-color);'>${val}</span>` : '');
    });
  };

  const toggle = () => {
    isExpand.value = !isExpand.value;
  };

  const onLoad = async () => {
    if (props.lazy) {
      requestFunc({ keyword: searchValue.value, pageNo: pageNo.value++ });
    }
  };

  const originSearchKey = ref();

  async function requestFunc({ keyword, pageNo = 1 }) {
    const requestApi =
      props.onloadMore && typeof props.onloadMore === 'function' && pageNo > 1
        ? props.onloadMore
        : props.api;
    loading.value = true;
    if (props.customSearch) {
      if (originSearchKey.value !== keyword) {
        customOptions.value = [];
      }
      originSearchKey.value = keyword;
      const res = await props.customSearch({
        keyword,
        pageNo: pageNo,
      });
      allOpts.value = res.allOpts;
      customOptions.value = customOptions.value.concat(res.data);
      finished.value = res.finished;
    } else {
      const res = await requestApi({
        keyword,
        pageNo: pageNo,
      });
      props.options.forEach((e) => {
        if (!allOpts.value.find((f) => f.value === e.value)) allOpts.value.push(e);
      });
      finished.value = res === false ? false : true;
    }
    loading.value = false;
  }

  const handleLabel = (label) => {
    if (props.maxTagTextLength && label.length > props.maxTagTextLength) {
      return label.slice(0, props.maxTagTextLength) + '...';
    }
    return label;
  };
</script>

<style scoped lang="less">
  .title {
    z-index: 1;
    top: 0;
    width: 100%;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      border-bottom: 1px solid var(--van-cell-border-color);
      pointer-events: none;
    }
  }

  .shadow-top {
    box-shadow: 0 -1px 4px 0 rgb(0 0 0 / 12%);
  }

  .is-active {
    background: rgba(from var(--van-primary-color) r g b / 5%) !important;

    .text-color {
      max-width: 100%;
      overflow: hidden;
      color: var(--van-primary-color);
      text-overflow: ellipsis;
      // white-space: nowrap;
    }
  }

  .border-r {
    border-right: 1px solid var(--van-cell-border-color);
  }

  .border-b {
    position: relative;

    &::after {
      content: ' ';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      box-sizing: border-box;
      pointer-events: none;
      // border-bottom: 1px solid var(--van-cell-border-color);
    }
  }

  :deep(.van-list .van-cell) {
    padding: 6px 14px;
    border-radius: 4px;

    &::after {
      right: 0;
      left: 0;
    }
  }

  :deep(.van-search) {
    padding: 14px 14px 0;

    &.border-all {
      //   .van-search__content {
      //     border: 1px solid var(--van-primary-color);
      //     background: inherit;
      //   }
    }

    .van-search__content {
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      background: inherit;
      // &:focus {
      //   border: 1px solid var(--van-primary-color);
      //   background: inherit;
      // }
    }
  }

  .tag-wrap {
    max-width: calc(100% - 4px);

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .text-color {
    color: var(--text-color);
  }

  .toggle-box {
    height: 60px;
    overflow: hidden;
  }

  :deep(.van-tag--round) {
    border-radius: 4px;
  }
</style>
