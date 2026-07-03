<template>
  <div class="flex flex-col h-full">
    <div class="text-16px px-16px py-12px title">
      <div class="gct-text-overflow ks-col font-bold">{{ title }}</div>
    </div>
    <van-search
      v-if="showSearch"
      v-model="searchValue"
      :class="{ 'border-all': searchValue }"
      shape="round"
      :left-icon="searchValue ? '' : 'search'"
      :placeholder="t('sys.inputText')"
      @update:model-value="onSearch"
    />
    <div class="ks-col" style="overflow: hidden">
      <treeList
        ref="treeListRef"
        v-show="type === SelectType.SINGLE && !searchValue.length"
        v-bind="$props"
        :checkedSingleData="checkedSingleData"
        :treeSingleData="treeSingleData"
        @checkTreeData="checkTreeData"
        @getBackData="getBackData"
      />
      <div v-show="type === SelectType.MULTIPLE && !searchValue.length">
        <treeItem
          v-if="treeData"
          :treeData="treeData"
          @setMulTreeData="setMulTreeData"
          @mulToggle="mulToggle"
        />
      </div>
      <selectList
        v-show="searchValue.length"
        ref="selectListRef"
        :selectData="selectData"
        :type="type"
        @setSelectData="setSelVal"
      />
    </div>
    <div class="w-full px-12px pb16px">
      <div class="pb-12px" v-if="type === SelectType.MULTIPLE && multipleKeys.length">
        <span class="pr-8px text-sm mr-8px border-r">
          {{ t('sys.component.fieldTransfer.select') }}
          <span style="color: var(--van-primary-color)">
            {{ multipleKeys.length }}
            <van-icon name="arrow-up" />
          </span>
        </span>
        <van-tag
          v-for="(item, index) in multipleKeys"
          :key="item.label + '_' + index"
          class="mx-2px px-2px"
          size="medium"
          round
          color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
          text-color="var(--van-primary-color)"
          closeable
          @close="close(item)"
          >{{ item.label }}</van-tag
        >
      </div>
      <div v-if="showBtn || multipleKeys.length > 0" class="ks-row" style="gap: 16px">
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
  import { onMounted, ref, computed, watch } from 'vue';
  import treeList from './components/treeList.vue';
  import treeItem from './components/treeItem.vue';
  import selectList from './components/selectList.vue';
  import { SelectType, type optionType } from './typing';
  import { i18n } from '@mobile/locales/setupI18n';
  import { isFunction } from '/@/utils/is';

  const props = defineProps<{
    asyncApi?: (IData) => Promise<Boolean | undefined>;
    options: optionType[];
    activeKey: any;
    activeKeys: any[];
    title: string;
    type: string;
    disabledOk?: boolean | Function;
    showCancel?: boolean | Function;
    showTag?: boolean | Function;
    lazy?: boolean;
    async?: boolean;
    showSearch?: boolean;
    showBtnArea?: (IData) => boolean;
    onloadMore?: Function;
    selectedOptions?: optionType[];
    customSearch?: Function;
    ignoreCase?: number;
  }>();
  const { t } = i18n.global;
  const searchValue = ref('');
  const multipleKeys = ref<any>([]);
  const checkedSingleData = ref<any>([]);
  const treeListRef = ref();
  const selectData = ref<optionType[]>([]);
  const emit = defineEmits(['checked', 'cancel', 'getAsyncData', 'saved']);
  const isInital = ref(true);
  const treeData = ref();

  const tree2list = (arr: any) => {
    let cloneTree = JSON.parse(JSON.stringify(arr));
    function iteration(tree: any, level: any) {
      let temp: any = [];
      for (const i of tree) {
        i.level = level;
        temp.push(i);
        if (i.children?.length) {
          temp = [...temp, ...iteration(i.children, level + 1)];
        }
      }
      return temp;
    }
    return iteration(cloneTree, 1);
  };
  const optionList: any = computed(() => {
    return tree2list(props.options);
  });

  const treeSingleData = computed(() => {
    const selected = checkedSingleData.value.slice(-1)[0];
    return selected
      ? optionList.value.find((e) => e.value === selected.value)?.children
      : treeData.value;
  });

  const addKey = (arr: any) =>
    arr.map((item: any) => {
      if (props.activeKeys.includes(item.value) && isInital.value) {
        multipleKeys.value.push(item);
      }

      return {
        label: item.label,
        value: item.value,
        parentId: item.parentId,
        checked: !!props.activeKeys.includes(item.value),
        expand: true,
        disabled: item.disabled,
        children: item.children?.length ? addKey(item.children) : [],
      };
    });

  // 在树结构每一层添加新属性（多选）
  const addAttr2TreeData = (arr: any) => {
    let tree: any = [];
    // 深拷贝
    const arrClone = JSON.parse(JSON.stringify(arr));
    if (props.type === SelectType.MULTIPLE) {
      tree = addKey(arrClone);
      isInital.value = false;
    } else {
      tree = arrClone;
    }
    return tree;
  };

  onMounted(() => {
    // 单选-初始化单选树数据
    if (props.type === SelectType.SINGLE) {
      const findItem: any = [...optionList.value, ...(props.selectedOptions?.value || [])].find(
        (i: any) => i.value === props.activeKey,
      );
      if (props.activeKey && findItem && findItem?.parentId !== 'ROOT') {
        checkedSingleData.value = getFatherChecked(findItem.parentId, []) || [];
      } else {
        checkedSingleData.value = [];
      }
    }
    // treeData.value = addAttr2TreeData(props.options);
  });

  watch(
    () => props.options,
    () => {
      treeData.value = addAttr2TreeData(props.options);
    },
    {
      deep: true,
      immediate: true,
    },
  );
  /**
   * 单选操作开始-------------------------------------------------------------------
   */
  //单选-获取父节点完整路径
  function getFatherChecked(pid: any, fathers: any) {
    const fatherItem: any = [...optionList.value, ...(props.selectedOptions?.value || [])].find(
      (i: any) => i.value === pid,
    );
    fathers.unshift(fatherItem);
    if (fatherItem.parentId === 'ROOT') {
      return fathers;
    } else {
      const options: any[] = getFatherChecked(fatherItem.parentId, fathers);
      if (options) return options;
    }
  }

  // 单选-设置单选树的数据及选中节点的父节点路径
  const checkTreeData = async (pid: any, node) => {
    handleChecked(node);
    if (!node.children.length && !node.hasChild) return;
    if (pid && pid !== 'ROOT') {
      checkedSingleData.value = getFatherChecked(pid, []) || [];
    }
  };

  // 单选-顶部返回操作
  const getBackData = (value: any, pid: any) => {
    if (pid && pid === 'ROOT') {
      checkedSingleData.value = [];
    } else {
      checkedSingleData.value = getFatherChecked(value.parentId, []) || [];
    }
  };

  // 输入选择选择组件返回操作
  function setSelVal(val: any) {
    searchValue.value = '';
    if (props.type === SelectType.SINGLE) {
      getBackData(val, val.parentId);
      const findItem = treeSingleData.value.find((item: any) => item.value === val.value);
      treeListRef.value?.setVal(findItem);
    } else {
      for (const i of val) {
        setMulTreeCheck(treeData.value, i, i.checked);
      }
    }
  }
  /**
   * 单选操作结束----------------------------------------------------------------------------
   * 多选操作开始----------------------------------------------------------------------------
   */
  // 多选递归查找设置目标checked,
  function setMulTreeCheck(arr: any, value: any, checked: Boolean) {
    for (const val of arr) {
      if (val.value === value.value) {
        val.checked = checked;
        if (checked) {
          multipleKeys.value.push(val);
        } else {
          multipleKeys.value = multipleKeys.value.filter((val: any) => val.value !== value.value);
        }
        return;
      } else {
        if (val.children?.length) setMulTreeCheck(val.children, value, checked);
      }
    }
  }

  function setMulTreeData(val: any, checked: Boolean) {
    setMulTreeCheck(treeData.value, val, checked);
  }

  // 多选递归查找设置目标expand
  function setMulToggle(arr: any, value: any) {
    for (const val of arr) {
      if (val.value === value.value) {
        val.expand = !val.expand;
        return;
      } else {
        if (val.children?.length) setMulToggle(val.children, value);
      }
    }
  }

  function mulToggle(val: any) {
    setMulToggle(treeData.value, val);
  }

  // 多选底部标签删除操作
  function close(value: any) {
    setMulTreeCheck(treeData.value, value, false);
  }
  /**
   * 多选操作结束---------------------------------------------------------------------------
   */
  // 选中事件
  function handleChecked(node) {
    emit('checked', node.value);
  }

  // 保存事件
  function handleSave() {
    emit('saved', selectedIds.value, selectedData.value);
  }

  // 取消
  const handleCancel = () => {
    emit('cancel');
  };

  function getParentLabels(arr: any, pid: any, labels: any) {
    for (const item of arr) {
      if (pid === item.value) {
        labels.push(item.label);
        return labels;
      } else {
        const options: any[] = getParentLabels(item.children, pid, labels);
        if (options) return options;
      }
    }
  }

  function treeFilter(tree: any, func: any, list: any) {
    for (const item of tree) {
      if (func(item)) {
        list.push(item);
      }
      if (item.children?.length) treeFilter(item.children, func, list);
    }
    return list;
  }

  const onSearch = async (val: any) => {
    let options: any = [];
    if (props.customSearch && isFunction(props.customSearch)) {
      const func = props.customSearch;
      options = await func(optionList.value, val);
    } else {
      if (props.type == SelectType.SINGLE) {
        if (props.ignoreCase) {
          options =
            optionList.value.filter(
              (i) => i.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1,
            ) || [];
        } else {
          options = optionList.value.filter((i) => i.label.indexOf(val) !== -1) || [];
        }
      } else {
        options =
          treeFilter(
            treeData.value,
            (data: any) => {
              if (props.ignoreCase) {
                return data.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1;
              }
              return data.label?.indexOf(val) !== -1;
            },
            [],
          ) || [];
      }
    }
    for (const item of options) {
      if (item.parentId && item.parentId === 'ROOT') {
        item.labels = '';
        continue;
      }
      const labels = getParentLabels(treeData.value, item.parentId, []);
      item.labels = labels.join('/');
    }
    selectData.value = JSON.parse(JSON.stringify(options));
    selectData.value.forEach((i: any) => {
      const parts = i.label?.split(new RegExp(`(${val})`, 'gi'));
      const list = parts?.map((part, index) =>
        part.toLowerCase() === val.toLowerCase()
          ? `<span key=${index} style='color: var(--van-primary-color);'>${part}</span>`
          : part,
      );
      i.label = list?.join('');
      // i.label = i.label
      //   .trim()
      //   .replace(val, val ? `<span style='color: var(--van-primary-color);'>${val}</span>` : '');
    });
  };

  // 当前选中项的value
  const selectedIds = computed(() => {
    if (props.type === SelectType.SINGLE) {
      return treeListRef.value?.active;
    } else {
      return multipleKeys.value.map((item: any) => item.value);
    }
  });
  // 当前的选中项
  const selectedData = computed(() => {
    if (props.type === SelectType.SINGLE) {
      return [...optionList.value, ...(props.selectedOptions?.value || [])].find(
        (e) => e.value === selectedIds.value,
      );
    } else {
      return multipleKeys.value;
    }
  });

  // 确认按钮是否可用
  const disabledOkBtn = computed(() => {
    if (typeof props.disabledOk === 'boolean') {
      return props.disabledOk;
    } else if (typeof props.disabledOk === 'function') {
      return props.disabledOk({ checkedId: selectedIds.value, checkedData: selectedData.value });
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

  // 是否显示按钮区
  const showBtn = computed(() => {
    if (!props.showBtnArea) return true;
    else if (selectedIds.value && props.showBtnArea) {
      return props.showBtnArea({ checkedId: selectedIds.value, checkedData: selectedData.value });
    } else return false;
  });
</script>

<style scoped lang="less">
  .title {
    width: 100%;
    position: relative;
    display: flex;
    &:after {
      position: absolute;
      box-sizing: border-box;
      content: ' ';
      pointer-events: none;
      right: 0;
      bottom: 0;
      left: 0;
      border-bottom: 1px solid var(--van-cell-border-color);
    }
    .gct-text-overflow {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-break: break-all;
    }
  }
  .shadow-top {
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.12);
  }
  .border-r {
    border-right: 1px solid #eaeaea;
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
</style>
