<template>
  <div class="absolute z-0 inset-0 flex flex-col">
    <!-- search -->
    <div
      v-if="searchable"
      class="flex-shrink-0 px-4 pt-3"
      :class="{ 'pb-3': !displayFields || displayFields.length <= 1 }"
    >
      <div class="bg-[#F2F5F8] rounded-md overflow-hidden">
        <van-field
          v-model="searchValue"
          placeholder="搜索"
          style="padding: 6px 8px 6px 14px; background-color: transparent"
          :clearable="true"
          @update:model-value="handleSearchChange"
        >
          <template #left-icon>
            <i class="iconfont icon-sousuoMedpro mr6px text-[12px] lh-14px"></i>
          </template>
        </van-field>
      </div>
    </div>

    <!-- list -->
    <div class="flex-grow relative z-0 pb-2 overflow-y-auto">
      <component
        :is="listComponent"
        v-bind="{
          options: visibleOptions,
          selectedValues,
          isLoading,
          isFinished,
          multiple,
          allOptions,
          searchValue,
          refVersion,
          displayFields,
          ignoreCase,
        }"
        @load="handleQueryPagedOptions"
        @change="handleSelectChange"
      />
      <div
        v-if="!visibleOptions.length && !isLoading && showEmpty !== false"
        class="flex justify-center items-center absolute z-0 inset-0"
      >
        <!-- <van-loading v-if="isLoading" /> -->
        <Empty
          :iconType="searchValue ? 'search' : undefined"
          :tip="searchValue ? '暂无搜索结果' : undefined"
        />
      </div>
    </div>

    <!-- selected list -->
    <div
      v-if="multiple && selectedOptionList.length"
      class="flex-shrink-0 flex flex-wrap max-h-[138px] px-4 pt-3 pb-1 border-t-solid border-b-solid border-zinc-100 overflow-y-auto"
    >
      <div
        v-for="o in selectedOptionList"
        :key="o.value"
        class="flex items-center mr-2 mb-2 pl-3 pr-2 py-1 bg-[#F2F5F8] rounded-full"
      >
        <!-- icon -->
        <div v-if="o.icon" class="flex-shrink-0"> </div>
        <!-- label -->
        <div class="flex-shrink-0 leading-none">
          {{ truncateString(o.__LABEL__ || o.label, 12) }}
          <van-tag
            color="#E0E3EB"
            plain
            class="ml6px bg-[#F9FAFB]!"
            v-if="
              o.children?.length &&
              ['label_template_ref', 'printer', 'rdo'].includes(props.listType)
            "
          >
            <span class="text-[#5A5F6B] p2px"> 默认 </span>
          </van-tag>
        </div>
        <!-- remove -->
        <div
          class="flex-shrink-0 flex justify-center items-center ml-2 w-4 h-4 bg-[#A6A6A6] text-white rounded-full"
          @click="handleRemoveOption(o.value)"
        >
          <i class="icon gct-iconfont icon-guanbi-danchuang text-[10px]"></i>
        </div>
      </div>
    </div>

    <!-- bottom buttons -->
    <div class="flex-shrink-0 flex items-center px-4 py-3">
      <van-button class="flex-shrink-0 w-32 h-10" @click="emit('cancel')">取消</van-button>
      <van-button
        type="primary"
        class="ml-3! w-full h-10"
        :disabled="!selectedOptionList.length"
        @click="handleConfirmClick"
      >
        确认
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { Option, ListType } from './types';
  import {
    EnumList,
    OrgSelect,
    RdoSelect,
    UserSelect,
    PrinterSelect,
    LabelSelect,
  } from './components';
  import { Empty } from '../common';
  import { throttle } from 'lodash-es';
  import { getQueryDateByKeyWord } from '/@/projects/page-designer/src/components/widgets/hooks/listhook';
  import { FIELD_TYPE } from '@gct/runtime';

  const emit = defineEmits(['cancel', 'confirm']);

  const props = withDefaults(
    defineProps<{
      // 列表展示类型
      listType: ListType;
      // 选中值
      value: (string | number)[];
      // 选项接口
      getOptions: (params?: {
        pageNumber?: number;
        pageSize?: number;
        searchValue?: string;
        query?: object;
      }) => {
        options: Option[];
        total?: number; // 启用分页时提供
      };
      // 是否多选
      multiple?: boolean;
      // 是否显示搜索框
      searchable?: boolean;
      // 是否启用分页查询
      paged?: boolean;
      // 是否显示暂无数据
      showEmpty?: boolean;
      // 根据 ids 获取对应选项（启用分页时提供，用于回显数据）
      getOptionsByIds?: (ids: string[]) => Option[];
      /**打开模态框的时候需要临时添加的查询条件 */
      queryData: Object;
      config: Object;
      refVersion?: boolean;
      displayFields?: object[];
      /** 忽略大小写 */
      ignoreCase?: number;
    }>(),
    {
      searchable: true,
      showEmpty: true,
      queryData: () => ({}),
      config: () => ({}),
    },
  );

  // 分页当前页
  const pageNumber = ref(1);
  // 是否加载中
  const isLoading = ref(false);
  // 是否加载完毕
  const isFinished = ref(false);
  // 搜索值
  const searchValue = ref('');
  // 所有选项（无分页筛选用）
  const allOptions = ref<Option[]>([]);
  // 可见的选项（无分页前端筛选，有分页接口查询）
  const visibleOptions = ref<Option[]>([]);
  // 已选中的选项列表
  const selectedOptionList = ref<Option[]>([]);

  const listComponent = computed(() => {
    // TODO: jsw, more list
    return {
      enum: EnumList,
      user: UserSelect,
      org: OrgSelect,
      rdo: RdoSelect,
      printer: PrinterSelect,
      label_template_ref: LabelSelect,
    }[props.listType];
  });

  const selectedValues = computed(() => {
    return selectedOptionList.value.map((o) => o.value);
  });

  const handleQueryPagedOptions = async () => {
    if (!props.paged) return;

    const isFirstPage = pageNumber.value === 1;

    isLoading.value = true;

    if (isFirstPage) {
      isFinished.value = false;
    }
    const _query = getQueryDateByKeyWord({
      searchField: props.config?.searchField,
      keyword: searchValue.value,
    });
    const _queryData = {
      exp: props.queryData?.exp,
      query: { ..._query, ...props.queryData?.query },
    };
    const { options, total = 0 } = await props.getOptions(
      {
        pageNumber: pageNumber.value,
        pageSize: 30,
        searchValue: searchValue.value,
        query: _queryData,
        ignoreCase: props.ignoreCase,
      },
      props.config,
    );
    // 如果没有总条数，则表示不分页
    if (!total) {
      visibleOptions.value = options;
      isFinished.value = true;
      return;
    }
    if (isFirstPage) {
      visibleOptions.value = options;
      handleInitData();
    } else {
      visibleOptions.value.push(...options);
    }

    isLoading.value = false;

    if (visibleOptions.value.length >= total) {
      isFinished.value = true;
    }

    pageNumber.value++;
  };

  const throttledQuery = throttle(handleQueryPagedOptions, 200);

  const handleSearchChange = (value: string) => {
    if (props.paged) {
      // 有分页：接口查询
      pageNumber.value = 1;
      isFinished.value = false;
      visibleOptions.value = [];
      setTimeout(throttledQuery, 1);
    } else {
      // 无分页：前端筛选
      filterTreeOptions(value);
    }
  };

  /** 筛选多层结构数据 */
  const filterTreeOptions = (value) => {
    let val = value;
    if (props.ignoreCase) {
      val = value.toLocaleLowerCase();
    }
    // const val = value.toLocaleLowerCase();

    if (!val) {
      visibleOptions.value = allOptions.value;
      return;
    }

    // 先找出所有匹配的节点路径
    const findMatchingNodes = () => {
      const matchingPaths = new Set();

      const traverse = (nodes, path = []) => {
        for (const node of nodes) {
          const currentPath = [...path, node.value];
          let currentMatch = node.label.includes(val);
          if (props.ignoreCase) {
            currentMatch = node.label.toLocaleLowerCase().includes(val);
          }

          if (currentMatch) {
            // 当前节点匹配，记录完整路径
            for (let i = 0; i < currentPath.length; i++) {
              matchingPaths.add(currentPath.slice(0, i + 1).join('/'));
            }

            // 特殊规则处理
            if (path.length === 0) {
              // 顶层匹配：添加所有子孙节点
              const addAllDescendants = (children, currentPath) => {
                children.forEach((child) => {
                  const childPath = [...currentPath, child.value];
                  matchingPaths.add(childPath.join('/'));
                  if (child.children) addAllDescendants(child.children, childPath);
                });
              };
              if (node.children) addAllDescendants(node.children, currentPath);
            } else if (path.length === 1) {
              // 中层匹配：添加所有底层子节点
              if (node.children) {
                node.children.forEach((child) => {
                  const childPath = [...currentPath, child.value];
                  matchingPaths.add(childPath.join('/'));
                });
              }
            }
          }

          // 继续遍历子节点
          if (node.children) {
            traverse(node.children, currentPath);
          }
        }
      };

      traverse(allOptions.value);
      return matchingPaths;
    };

    const matchingPaths = findMatchingNodes();

    // 根据匹配路径重建树
    const buildFilteredTree = (options, currentPath = []) => {
      return options
        .map((option) => {
          const path = [...currentPath, option.value].join('/');

          if (matchingPaths.has(path)) {
            const newNode = { ...option };

            if (option.children && option.children.length > 0) {
              newNode.children = buildFilteredTree(option.children, [...currentPath, option.value]);
            }

            return newNode;
          }
          return null;
        })
        .filter(Boolean);
    };

    visibleOptions.value = buildFilteredTree(allOptions.value);
  };

  const handleSelectChange = (value: string, option: Option) => {
    if (props.multiple) {
      if (selectedValues.value.includes(value)) {
        selectedOptionList.value = selectedOptionList.value.filter((o) => o.value !== value);
      } else {
        selectedOptionList.value.push(option);
      }
    } else {
      selectedOptionList.value = [option];
    }
  };
  function truncateString(str, maxTagTextLength) {
    // 如果字符串长度不超过最大长度，直接返回
    if (str.length <= maxTagTextLength) {
      return str;
    }

    // 截取字符串并添加省略号
    return str.substring(0, maxTagTextLength) + '...';
  }
  const handleRemoveOption = (value: string) => {
    selectedOptionList.value = selectedOptionList.value.filter((o) => o.value !== value);
  };

  const handleConfirmClick = () => {
    const { multiple } = props;
    const _val = multiple ? selectedValues.value : selectedValues.value[0];
    const _opt = multiple ? selectedOptionList.value : selectedOptionList.value[0];
    emit('confirm', _val, _opt);
  };

  // 递归查找所有层级选中的 Option
  function findOptionsByValues(options: Option[], values: (string | number)[]): Option[] {
    const result: Option[] = [];
    function traverse(list: Option[]) {
      for (const o of list) {
        if (values.includes(o.value)) {
          result.push(o);
        }
        if (o.children && Array.isArray(o.children) && o.children.length) {
          traverse(o.children);
        }
      }
    }
    traverse(options);
    return result;
  }

  const handleInitData = async () => {
    if (selectedOptionList.value.length > 0) {
      return;
    }
    const { value, getOptions, multiple, paged, getOptionsByIds } = props;
    const isValueEmpty = multiple ? !value?.length : [null, undefined, ''].includes(value);

    if (paged) {
      // 有分页：第一次 load 由 van-list 触发
      // await handleQueryPagedOptions();

      if (isValueEmpty) return;

      // 接口查询回显值
      const list = await getOptionsByIds(multiple ? value : [value]);

      if (list.length) {
        selectedOptionList.value = list;
      } else {
        // 递归查找 visibleOptions 所有层级
        selectedOptionList.value = findOptionsByValues(
          visibleOptions.value,
          multiple ? value : [value],
        );
      }
    } else {
      // 无分页：手动调
      const { options } = await getOptions({ query: props.queryData });

      allOptions.value = options;
      visibleOptions.value = options;

      // 强制加载完毕
      isFinished.value = true;

      if (isValueEmpty) return;

      // 递归查找所有层级选中的 Option
      selectedOptionList.value = findOptionsByValues(options, multiple ? value : [value]);
    }
  };

  onMounted(() => {
    handleInitData();
  });
</script>
