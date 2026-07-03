<template>
  <div class="flex flex-col h-full">
    <div class="text-16px px-16px py-12px title border-b">
      <div class="gct-text-overflow ks-col font-bold">{{ title }}</div>
    </div>
    <van-search
      v-if="showSearch"
      v-model="searchValue"
      :class="{ 'border-all': searchValue }"
      shape="round"
      :placeholder="t('sys.inputText')"
      @update:model-value="onSearch"
    />
    <div v-show="!searchValue" class="ks-col overflow-hidden">
      <List v-if="!isTree" v-bind="$props" :active-keys="compActiveKeys" @onload="onloadList" />
      <Tree v-else v-bind="$props" :active-keys="compActiveKeys" />
    </div>
    <div v-if="searchValue" class="ks-col">
      <SearchList :multiple="multiple" :options="searchOptions" />
    </div>
    <div class="w-full px-12px pb16px">
      <div
        class="pb-12px"
        :class="{ 'toggle-box': isExpand }"
        v-if="multiple && selectedOpts.length"
      >
        <span class="pr-8px text-sm mr-8px border-r">
          {{ t('sys.component.fieldTransfer.select') }}
          <span style="color: var(--van-primary-color)">
            {{ selectedOpts.length }}
            <van-icon @click="isExpand = !isExpand" :name="isExpand ? 'arrow-up' : 'arrow-down'" />
          </span>
        </span>
        <van-tag
          v-for="(item, index) in selectedOpts"
          :key="item.label + '_' + index"
          class="mx-2px px-2px"
          size="medium"
          round
          color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
          text-color="var(--van-primary-color)"
          closeable
          @close="deleteTag(item)"
          >{{ item.label }}</van-tag
        >
      </div>
      <div v-if="showBtn" class="ks-row" style="gap: 16px">
        <van-button v-show="showCancelBtn" type="default" class="flex-1" @click="handleCancel">
          {{ t('sys.cancelText') }}
        </van-button>
        <van-button :disabled="disabledOkBtn" type="primary" @click="handleSave" style="flex: 2">
          {{ t('sys.okText') }}
        </van-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Options, optionType } from '../typing';
  import { i18n } from '@mobile/locales/setupI18n';
  import { cloneDeep, debounce } from 'lodash-es';
  import List from './list.vue';
  import Tree from './tree.vue';
  import SearchList from './searchList.vue';

  interface Props extends Options {
    title: string;
    activeKeys: Array<string | number>;
  }

  const props = defineProps<Props>();

  const { t } = i18n.global;
  const emit = defineEmits(['checked', 'onCancel', 'getAsyncData', 'onSave', 'update:activeKeys']);
  const searchValue = ref();
  const pageNo = ref(1);
  const searchOptions = ref<optionType[]>([]);
  const isExpand = ref<Boolean>(false);

  const compActiveKeys = computed({
    get() {
      return props.activeKeys;
    },
    set(v) {
      emit('update:activeKeys', v);
    },
  });

  const selectedOpts = computed(() => {
    const opts = cloneDeep(props.options) || [];
    props.selectedOptions?.value.forEach((e) => {
      if (!opts.find((f) => f.value === e.value)) {
        opts.push(e);
      }
    });
    return props.activeKeys.map((e) => {
      return opts.find((f) => f.value === e) || {};
    });
  });

  // 是否显示按钮区
  const showBtn = computed(() => {
    if (typeof props.showBtnArea === 'boolean' && props.showBtnArea === false) return false;
    else if (
      compActiveKeys.value.length &&
      props.showBtnArea &&
      typeof props.showBtnArea === 'function'
    ) {
      return props.showBtnArea({
        checkedId: props.multiple ? compActiveKeys.value : compActiveKeys.value[0],
        checkedData: props.multiple ? selectedOpts.value : selectedOpts.value[0],
      });
    } else return true;
  });

  // 确认按钮是否可用
  const disabledOkBtn = computed(() => {
    if (typeof props.disabledOk === 'boolean') {
      return props.disabledOk;
    } else if (typeof props.disabledOk === 'function') {
      return props.disabledOk({
        checkedId: props.multiple ? compActiveKeys.value : compActiveKeys.value[0],
        checkedData: props.multiple ? selectedOpts.value : selectedOpts.value[0],
      });
    } else return false;
  });
  // 是否显示取消按钮
  const showCancelBtn = computed(() => {
    if (typeof props.showCancel === 'boolean') {
      return props.showCancel;
    } else if (typeof props.showCancel === 'function') {
      return props.showCancel();
    } else return true;
  });

  // 搜索
  const onSearch = debounce(async (val: any) => {
    val = val && val.trim();
    if (props.remote) {
      if (val || val == '') {
        pageNo.value = 1;
        await requestFunc({ keyword: val, pageNo: 1 });
      }
    } else {
      val && setSearchOpts(val);
    }
  }, 300);

  const setSearchOpts = (val: any) => {
    searchOptions.value =
      cloneDeep(props.options)?.filter((item) => item.label?.indexOf(val) !== -1) || [];
    searchOptions.value.forEach((i) => {
      i.label = i.label
        ?.trim()
        .replace(val, val ? `<span style='color: var(--van-primary-color);'>${val}</span>` : '');
    });
  };

  // 加载下一页
  const onloadList = async (callback) => {
    if (props.lazy) {
      const res = await requestFunc({ keyword: searchValue.value, pageNo: pageNo.value++ });
      callback(res);
    }
  };

  const handleCancel = () => {
    emit('onCancel');
  };
  // 保存事件
  function handleSave() {
    emit('onSave');
  }
  // 删除选中项
  const deleteTag = (item) => {
    const idx = compActiveKeys.value.findIndex((e) => e === item.value);
    compActiveKeys.value.splice(idx, 1);
  };

  async function requestFunc({ keyword = '', pageNo = 1 }) {
    const requestApi =
      props.onloadMore && typeof props.onloadMore === 'function' && pageNo > 1
        ? props.onloadMore
        : props.asyncApi;
    const res =
      requestApi &&
      (await requestApi({
        keyword,
        pageNo: pageNo,
      }));
    // props.options?.value.forEach((e) => {
    //   if (!allOpts.value.find((f) => f.value === e.value)) allOpts.value.push(e);
    // });
    return res === false ? false : true;
  }
</script>
<style lang="less" scoped>
  .border-b {
    border-bottom: 1px solid #eaeaea;
  }

  :deep(.van-search) {
    padding: 8px 16px;
    &.border-all {
      .van-search__content {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
    .van-search__content {
      &:focus {
        border: 1px solid var(--van-primary-color);
        background: transparent;
      }
    }
  }
  .toggle-box {
    height: 60px;
    overflow: hidden;
  }
</style>
