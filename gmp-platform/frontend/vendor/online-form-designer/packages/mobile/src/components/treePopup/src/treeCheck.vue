<template>
  <div class="pt50px flex flex-col h-full">
    <div class="text-left text-16px font-bold p12px absolute title">{{ props.title }}</div>
    <van-search
      v-model="searchValue"
      :class="{ 'border-all': searchValue }"
      shape="round"
      :left-icon="searchValue ? '' : 'search'"
      @update:model-value="onSearch"
      placeholder="请输入"
    />
    <div class="overflow-y-auto flex-1">
      <treeList
        ref="treeListRef"
        v-show="type === SelectType.SINGLE && !searchValue.length"
        :checkedSingleData="checkedSingleData"
        :treeSingleData="treeSingleData"
        :activeKey="activeKey"
        :type="type"
        @checkTreeData="checkTreeData"
        @getBackData="getBackData"
      />
      <div v-show="type === SelectType.MULTIPLE && !searchValue.length">
        <treeItem :treeData="treeData" @setMulTreeData="setMulTreeData" @mulToggle="mulToggle" />
      </div>
      <selectList
        v-show="searchValue.length"
        ref="selectListRef"
        :selectData="selectData"
        :type="type"
        @setSelectData="setSelVal"
      />
    </div>
    <div class="w-full p-12px shadow-top" v-show="!searchValue.length">
      <div class="pb-12px" v-if="type === SelectType.MULTIPLE && multipleKeys.length">
        <span class="pr-8px text-sm mr-8px border-r">
          已选
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
          >{{ handleLabel(item.label) }}</van-tag
        >
      </div>
      <van-button class="w-full px-4px" type="primary" :disabled="isDisabled" @click="setVal"
        >完成</van-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted, computed } from 'vue';
  import treeList from './components/treeList.vue';
  import treeItem from './components/treeItem.vue';
  import selectList from './components/selectList.vue';
  import { SelectType, type optionType } from './typing';

  const props = defineProps<{
    options: optionType[];
    activeKey: string;
    activeKeys: any[];
    title: string;
    type: string;
    hasNoLabels?: boolean;
    ignoreCase?: number;
    maxTagTextLength?: number;
  }>();
  const searchValue = ref('');
  const multipleKeys = ref<any>([]);
  const treeSingleData = ref<any>([]);
  const checkedSingleData = ref<any>([]);
  const treeListRef = ref();
  const selectData = ref<optionType[]>([]);
  const emit = defineEmits(['checked']);

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
  const optionList: any = reactive(tree2list(props.options));

  const addKey = (arr: any) =>
    arr.map((item: any) => {
      if (props.activeKeys.includes(item.value)) multipleKeys.value.push(item);
      return {
        label: item.label,
        value: item.value,
        parentId: item.parentId,
        _item: item._item,
        checked: !!props.activeKeys.includes(item.value),
        expand: true,
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
    } else {
      tree = arrClone;
    }
    return tree;
  };
  const treeData: any = reactive(addAttr2TreeData(props.options));

  onMounted(() => {
    // 单选-初始化单选树数据
    if (props.type === SelectType.SINGLE) {
      const findItem: any = optionList.find((i: any) => i.value === props.activeKey);
      if (props.activeKey && findItem && findItem?.parentId !== 'ROOT') {
        getfatherData(treeData, findItem, findItem?.parentId);
        checkedSingleData.value = getFatherChecked(findItem.parentId, []) || [];
      } else {
        treeSingleData.value = treeData;
        checkedSingleData.value = [];
      }
    }
  });

  const isDisabled = computed(() => {
    if (props.type === SelectType.SINGLE) {
      if (!treeListRef.value?.active) {
        return optionList.some((i) => i?.noSelectable);
      } else {
        const findItem = optionList.find((i) => i.value === treeListRef.value?.active);
        return !!findItem?.noSelectable;
      }
    }
    return false;
  });

  /**
   * 单选操作开始-------------------------------------------------------------------
   */
  //单选-获取父节点完整路径
  function getFatherChecked(pid: any, fathers: any) {
    const fatherItem: any = optionList.find((i: any) => i.value === pid);
    fathers.unshift(fatherItem);
    if (fatherItem.parentId === 'ROOT') {
      return fathers;
    } else {
      const options: any[] = getFatherChecked(fatherItem.parentId, fathers);
      if (options) return options;
    }
  }

  // 单选-设置单选树的数据及选中节点的父节点路径
  const checkTreeData = (value: optionType[], pid: any) => {
    treeSingleData.value = value;
    if (pid && pid !== 'ROOT') {
      checkedSingleData.value = getFatherChecked(pid, []) || [];
    }
  };

  // 单选-获取父级children
  const getfatherData = (arr: any, value: any, pid: any) => {
    for (const val of arr) {
      if (pid && val.value === pid) {
        treeSingleData.value = val.children;
        return;
      } else {
        getfatherData(val.children, value, pid);
      }
    }
  };

  // 单选-顶部返回操作
  const getBackData = (value: any, pid: any) => {
    if (pid && pid === 'ROOT') {
      checkedSingleData.value = [];
      treeSingleData.value = treeData;
    } else {
      getfatherData(treeData, value, pid);
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
        setMulTreeCheck(treeData, i, i.checked);
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
        if (val.checked) {
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
    setMulTreeCheck(treeData, val, checked);
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
    setMulToggle(treeData, val);
  }

  // 多选底部标签删除操作
  function close(value: any) {
    setMulTreeCheck(treeData, value, false);
  }
  /**
   * 多选操作结束---------------------------------------------------------------------------
   */
  function setVal() {
    if (props.type === SelectType.SINGLE) {
      emit('checked', treeListRef.value?.active);
    } else if (props.type === SelectType.MULTIPLE) {
      const valueArr = multipleKeys.value.map((item: any) => item.value);
      emit('checked', valueArr);
    }
  }

  function getParentLabels(arr: any, pid: any, labels: any) {
    for (const item of arr) {
      if (pid === item.value) {
        labels.push(item.label);
        return labels;
      } else {
        const options: any[] = item.children.length && getParentLabels(item.children, pid, labels);
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

  const onSearch = (val: any) => {
    let options: any = [];
    if (props.type == SelectType.SINGLE) {
      if (props.ignoreCase) {
        options =
          optionList.filter((i) => i.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1) || [];
      } else {
        options = optionList.filter((i) => i.label.indexOf(val) !== -1) || [];
      }
    } else {
      options =
        treeFilter(
          treeData,
          (data: any) => {
            if (props.ignoreCase) {
              return data.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1;
            }
            return data.label?.indexOf(val) !== -1;
          },
          [],
        ) || [];
    }
    for (const item of options) {
      if (item.parentId && item.parentId === 'ROOT') {
        item.labels = '';
        continue;
      }
      if (props.hasNoLabels) {
        item.labels = '';
      } else {
        const labels = getParentLabels(treeData, item.parentId, []);
        item.labels = labels.join('/');
      }
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
  }
  .shadow-top {
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.12);
  }
  .border-r {
    border-right: 1px solid #eaeaea;
  }

  :deep(.van-search) {
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
