<template>
  <div class="pt50px flex flex-col h-full">
    <div class="text-left text-16px font-bold p12px absolute title">{{ title }}</div>
    <van-search
      v-if="showSearch"
      v-model="searchValue"
      :class="{ 'border-all': searchValue }"
      shape="round"
      :left-icon="searchValue ? '' : 'search'"
      @update:model-value="onSearch"
      placeholder="请输入"
    />
    <div class="overflow-y-auto flex-1" @scroll="onScrollDebounce">
      <div class="tree-box" v-show="!searchValue.length">
        <treeItem
          :treeData="treeData"
          :type="type"
          :scrollTop="scrollTop"
          @setTreeData="setTreeData"
          @treeToggle="treeToggle"
        />
        <!-- <div v-if="clientHeight + scrollTop >= tOffsetHeight" class="text-center text-sm p-5px"
          >数据加载中...</div
        > -->
      </div>
      <selectList
        v-show="searchValue.length"
        ref="selectListRef"
        :selectData="selectData"
        :type="type"
        @setSelectData="setSelVal"
      />
    </div>
    <div class="w-full p-12px flex flex-col footer-box" v-show="!searchValue.length">
      <div
        class="mb-12px w-full flex-1 overflow-y-auto"
        :class="{ 'toggle-box': isExpand }"
        v-if="type === SelectType.MULTIPLE && multipleKeys.length"
      >
        <span class="pr-8px text-sm mr-8px border-r">
          已选
          <span style="color: var(--van-primary-color)">
            {{ multipleKeys.length }}
            <van-icon @click="toggle" :name="isExpand ? 'arrow-up' : 'arrow-down'" />
          </span>
        </span>
        <van-tag
          v-for="(item, index) in multipleKeys"
          :key="item.label + '_' + index"
          class="mx-2px px-2px tag-wrap"
          size="medium"
          round
          color="color-mix(in oklch, var(--van-primary-color), transparent 92%)"
          text-color="var(--van-primary-color)"
          closeable
          @close="close(item)"
          ><span>{{ handleLabel(item.labels || item.label) }}</span></van-tag
        >
      </div>
      <van-button class="w-full px-4px" type="primary" @click="setVal">完成</van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch, nextTick, ref } from 'vue';
  import { debounce, cloneDeep } from 'lodash-es';
  import treeItem from './components/treeItem.vue';
  import selectList from './components/selectList.vue';
  import { SelectType, type optionType, type TreeOptions } from './typing';

  const props = defineProps<{
    options: optionType[];
    activeKey: string | any[];
    title: string;
    type: SelectType;
    showSearch: Boolean;
    remote?: Boolean; // 开启远程搜索
    ignoreCase?: number;
    maxTagTextLength?: number;
  }>();
  const searchValue = ref('');
  const multipleKeys = ref<any>([]);
  const selectData = ref<optionType[]>([]);
  const scrollTop = ref(0);
  const clientHeight = ref(0);
  const tOffsetHeight = ref(0);
  const checkeMap = new Map();
  const isInit = ref<Boolean>(true);
  const isSearch = ref<Boolean>(false);
  const isExpand = ref<Boolean>(false);

  const emit = defineEmits(['checked', 'refresh', 'handleSearch']);

  // 将数组转为树结构
  const trans2treeData = (arr: any) => {
    let treeOptions: TreeOptions[] = [];
    // 深拷贝
    const arrClone = JSON.parse(JSON.stringify(arr));
    // 映射表 => 快速找到上级
    const mapInfo = arrClone.reduce((obj: any, item: any) => {
      if (
        isInit.value &&
        props.activeKey.includes(item.value) &&
        !multipleKeys.value.map((i: any) => i.value).includes(item.value)
      ) {
        multipleKeys.value.push(item);
      }
      item.checked = multipleKeys.value.map((i: any) => i.value).includes(item.value);
      item.labels = getLabels(arr, item);
      item.expand =
        isSearch.value || (props.activeKey && props.activeKey.length)
          ? true
          : checkeMap.has(item.value)
            ? checkeMap.get(item.value)
            : false;
      item.children = [];
      obj[item.value] = item;
      return obj;
    }, {});
    // 转树
    arrClone.forEach((i: any) => {
      const parent = mapInfo[i.pId];
      // 如果父节点存在，push到父级的children数组中
      // 如果父级不存在，直接push到treeData数组
      parent ? parent.children.push(i) : treeOptions.push(i);
    });
    isInit.value = false;
    return treeOptions;
  };

  const treeData = ref<TreeOptions[]>([]);

  watch(
    () => props.options,
    () => {
      const treeList: any = cloneDeep(props.options);
      treeList?.forEach((i: any) => {
        const isRoot = !treeList.find((o: any) => o.value === i.pId);
        isRoot && (i.pId = 'ROOT');
      });
      searchValue.value && setSearchOpts(searchValue.value);
      treeData.value = trans2treeData(treeList);
    },
    { immediate: true, deep: true },
  );

  onMounted(() => {});

  const onScroll = (e: any) => {
    // console.log('onScroll', e, e.target.scrollTop, e.target.firstChild.getBoundingClientRect());
    scrollTop.value = e.target.scrollTop;
    clientHeight.value = e.target.clientHeight;
    tOffsetHeight.value = e.target.firstChild?.offsetHeight - 30;
    // if (clientHeight.value + scrollTop.value >= tOffsetHeight.value) {
    //   emit('refresh');
    // }
  };

  const onScrollDebounce = debounce(onScroll, 200);

  // 输入选择选择组件返回操作
  function setSelVal(val: any) {
    searchValue.value = '';
    isSearch.value = false;
    if (props.type === SelectType.SINGLE) {
      setTreeCheck(treeData.value, val, true);
    } else {
      for (const i of val) {
        setTreeCheck(treeData.value, i, i.checked);
      }
    }
  }

  function setAllCheckFalse(arr: any) {
    for (const item of arr) {
      item.checked = false;
      if (item.children?.length) setAllCheckFalse(item.children);
    }
  }

  // 多选递归查找设置目标checked,
  async function setTreeCheck(arr: any, value: any, checked: Boolean) {
    for (const val of arr) {
      if (val.value === value.value) {
        if (props.type === SelectType.SINGLE) setAllCheckFalse(treeData.value);
        await nextTick();
        val.checked = checked;
        if (val.checked) {
          props.type === SelectType.SINGLE && (multipleKeys.value = [val]);
          props.type === SelectType.MULTIPLE && multipleKeys.value.unshift(val);
        } else {
          props.type === SelectType.MULTIPLE &&
            (multipleKeys.value = multipleKeys.value.filter(
              (val: any) => val.value !== value.value,
            ));
        }
        return;
      } else {
        if (val.children?.length) setTreeCheck(val.children, value, checked);
      }
    }
  }

  function setTreeData(val: any, checked: Boolean) {
    setTreeCheck(treeData.value, val, checked);
  }

  // 多选递归查找设置目标expand
  function setToggle(arr: any, value: any) {
    for (const val of arr) {
      if (val.value === value.value) {
        val.expand = !val.expand;
        checkeMap.set(val.value, val.expand);
        return;
      } else {
        if (val.children?.length) setToggle(val.children, value);
      }
    }
  }

  async function treeToggle(val: any) {
    setToggle(treeData.value, val);
    await nextTick();
    if (!val.children?.length && !val.isLeaf) {
      emit('refresh', val);
    }
  }

  // 多选底部标签删除操作
  function close(value: any) {
    setTreeCheck(treeData.value, value, false);
  }

  function getLabels(arr: any, item: any) {
    const paths = item._item?.full_path_.split('/');
    const labelList = paths.map((i: any) => {
      const findItem: any = arr.find((val: any) => val.id === i);
      return findItem?.label || '';
    });
    return labelList.join('/');
  }
  /**
   * 多选操作结束---------------------------------------------------------------------------
   */
  function setVal() {
    if (props.type === SelectType.SINGLE) {
      emit('checked', multipleKeys.value[0]);
    } else if (props.type === SelectType.MULTIPLE) {
      const valueArr = multipleKeys.value.map((item: any) => item.value);
      emit('checked', valueArr);
    }
  }

  function getParentLabels(item: any) {
    const arr = item._item?.full_path_.split('/') || [];
    const list = props.options.filter((i) => arr.includes(i.value)).map((val) => val.label);
    return list;
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
    searchValue.value = val.trim();
    if (val.trim() || val == '') {
      isSearch.value = true;
      if (props.remote) {
        emit('handleSearch', val ? val.trim() : '');
      } else {
        setSearchOpts(searchValue.value);
      }
    } else {
      selectData.value = [];
      isSearch.value = false;
      return;
    }
  };

  function setSearchOpts(val: any) {
    let options: any = [];
    options = props.options?.filter((i) => {
      if (props.ignoreCase) {
        return i.label?.toLowerCase().indexOf(val.toLowerCase()) !== -1;
      }
      return i.label?.indexOf(val) !== -1;
    });
    // options = props.options.filter((i) => i.label && i.label?.indexOf(val) !== -1) || [];
    for (const item of options) {
      if (item.pId && item.pId === 'ROOT') {
        item.labels = item.label;
        continue;
      }
      const labels = getParentLabels(item) || [];
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
      //   ?.trim()
      //   .replace(val, val ? `<span style='color: var(--van-primary-color);'>${val}</span>` : '');
    });
  }

  const toggle = () => {
    isExpand.value = !isExpand.value;
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
  .footer-box {
    box-shadow: 0px -1px 4px 0px rgba(0, 0, 0, 0.12);
    max-height: 200px;
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
  .tag-wrap {
    max-width: calc(100% - 4px);
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .toggle-box {
    flex: none;
    height: 48px;
    overflow: hidden;
  }
</style>
