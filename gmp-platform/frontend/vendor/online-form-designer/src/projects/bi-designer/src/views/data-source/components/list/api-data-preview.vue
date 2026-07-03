<template>
  <div :class="ns.b()">
    <div :class="ns.b('left')">
      <span :class="ns.e('title')">{{ $t('sys.bi.dataStructure') }}</span>
      <ApiDataTree
        :tree-data="treeData"
        v-model:checkedKeys="checkedKeys"
        @setCheckedNodes="setCheckedNodes"
      />
    </div>
    <div :class="ns.b('right')">
      <span :class="ns.e('title')">{{ $t('sys.bi.dataPreview') }}</span>
      <div :class="ns.be('right', 'con')">
        <vxe-grid
          ref="vxeTableRef"
          :scroll-x="true"
          :gridOptions="gridOptions"
          :columns="tableColumns"
          :data="dataSource"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="api-data-preview">
  import { ref, computed, watch, reactive } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import ApiDataTree from './api-data-tree.vue';
  import type { TreeProps } from 'ant-design-vue';
  import type { VxeGridProps } from 'vxe-table';
  import { isObject } from '/@/utils/is';
  // import { postDatabaseApiDataFlatten } from '/@/apis/gct-platform/DatabaseController';

  const props = defineProps<{
    treeData: TreeProps[];
    originData: string;
    selected: string;
  }>();

  const ns = useNamespace('api-data-preview');
  const checkedKeys = ref<string[]>([]);
  const tableColumns = ref([]);
  const vxeTableRef = ref();

  const gridOptions = reactive<VxeGridProps<any>>({
    autoResize: true,
    showOverflow: true,
    align: 'left',
  });

  /**
   * 递归寻找长度>1的数组作为主体数据
   * @param {Object} data - 待遍历数据
   * @returns {Array|null} 找到的主体数组（null表示未找到）
   */
  function findMainArray(data) {
    if (!data || typeof data !== 'object') return null;
    if (Array.isArray(data) && data.length > 1) return data;
    if (typeof data === 'object' && !Array.isArray(data)) {
      for (const key in data) {
        const result = findMainArray(data[key]);
        if (result) return result;
      }
    }
    return null;
  }

  /**
   * 递归平铺数组中的__CHILDREN__，并拼接键名
   * @param {Array} arr - 待处理数组
   * @param {String} parentKey - 父级键名（用于拼接）
   * @returns {Array} 平铺后的数组（每项为{ key: 拼接键名, value: 对应值 }）
   */
  function flattenChildrenWithKeys(arr, parentKey = '') {
    const result = [];
    arr.forEach((item, index) => {
      // 当前项的基础键名（数组项用索引拼接，如 parent.0）
      // const baseKey = parentKey ? `${parentKey}.${index}` : `${index}`;
      // 处理当前项的字段
      let itemData = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {
          const value = item[key];
          if (Array.isArray(value) && value.length == 1) {
            // 找到并处理嵌套数组
            const childrenKey = `${parentKey}.${key}`;
            itemData = { ...itemData, ...flattenChildrenWithKeys(item[key], childrenKey)?.[0] };
          } else if (isObject(value)) {
            // 处理嵌套对象
            const childrenKey = `${parentKey}.${key}`;
            itemData = { ...itemData, ...flattenChildrenWithKeys([item[key]], childrenKey)?.[0] };
          } else {
            // 顶层基本类型属性
            itemData[`${parentKey}.${key}`] = item[key];
          }
        }
      }
      result.push(itemData);
    });
    return result;
  }

  /**
   * 提取所有非主体数组的外层数据，并拼接键名
   * @param {Object} data - 原始数据
   * @param {Array} mainArray - 主体数组（用于排除）
   * @param {String} parentKey - 父级键名（用于拼接）
   * @returns {Object} 键名拼接后的外层数据
   */
  function extractOuterDataWithKeys(data, mainArray, parentKey = '') {
    const outerData = {};
    function recurse(currentData, currentKey) {
      if (!currentData || typeof currentData !== 'object') return;
      // 若为数组，且是主体数组则跳过
      if (Array.isArray(currentData)) {
        if (currentData !== mainArray) {
          // 非主体数组的键名拼接（如 extra.0）
          outerData[currentKey] = currentData;
        }
        return;
      }
      // 遍历对象字段，拼接键名
      for (const key in currentData) {
        const newKey = currentKey ? `${currentKey}.${key}` : key;
        const value = currentData[key];
        if (Array.isArray(value)) {
          recurse(value, newKey); // 数组单独处理
        } else if (typeof value === 'object' && value !== null) {
          recurse(value, newKey); // 对象递归
        } else {
          outerData[newKey] = value; // 基本类型直接拼接键名
        }
      }
    }
    recurse(data, parentKey);
    return outerData;
  }

  /**
   * 合并平铺后的主体数组项与外层数据
   * @param {Array} flattenedItems - 平铺后的主体数组项（带拼接键名）
   * @param {Object} outerData - 外层数据（带拼接键名）
   * @returns {Array} 最终合并后的一维数组
   */
  function mergeData(flattenedItems, outerData) {
    return flattenedItems.map((item) => ({
      ...outerData, // 合并外层数据（键名已拼接）
      ...item, // 合并当前项数据（键名已拼接，重名时以item为准）
    }));
  }

  /**
   * 主函数：处理数据并返回键名拼接后的平铺数组
   * @param {Object} data - 原始数据
   * @returns {Array} 处理后的一维数组
   */
  function processDataWithKeyJoin(data) {
    // 1. 找到主体数组
    const mainArray = findMainArray(data) || [];
    // 2. 定位主体数组的根键名（用于拼接）
    let mainArrayKey = '';
    function findMainArrayKey(currentData, currentKey = '') {
      if (!currentData || typeof currentData !== 'object') return;
      if (Array.isArray(currentData) && currentData === mainArray) {
        mainArrayKey = currentKey;
        return true;
      }
      if (typeof currentData === 'object' && !Array.isArray(currentData)) {
        for (const key in currentData) {
          const newKey = currentKey ? `${currentKey}.${key}` : key;
          if (findMainArrayKey(currentData[key], newKey)) return true;
        }
      }
      return false;
    }
    findMainArrayKey(data); // 获取主体数组的完整键名（如 'data.data'）
    // 3. 平铺主体数组的__CHILDREN__并拼接键名
    const flattenedItems = flattenChildrenWithKeys(mainArray, mainArrayKey);
    // 4. 提取外层数据并拼接键名
    const outerData = extractOuterDataWithKeys(data, mainArray);
    // 5. 合并数据
    return mergeData(flattenedItems, outerData);
  }

  const dataSource = computed(() => {
    const originData = JSON.parse(props.originData || '{}');
    const data = processDataWithKeyJoin(originData);
    return data?.length > 100 ? data?.slice(0, 100) : data;
  });

  const setCheckedNodes = (node) => {
    tableColumns.value = node.checkedNodes
      ?.filter((i) => !i.children?.length)
      ?.map((v) => {
        const dataIndex = v.key.replace('root.', '');
        return {
          field: dataIndex,
          title: dataIndex,
          width: 120,
        };
      });
  };

  watch(
    () => checkedKeys.value,
    async (val) => {
      console.log('checkedKeys', val);
      // const data = await postDatabaseApiDataFlatten({
      //   keys: checkedKeys.value?.map((i) => i.split('.').at(-1)) || [],
      //   apiDataStr: props.originData,
      // });
    },
    {
      deep: true,
    },
  );

  watch(
    () => props.selected,
    (val) => {
      const selectedArr = val?.split(',') || [];
      checkedKeys.value = selectedArr.map((i) => 'root.' + i);
      tableColumns.value = selectedArr.map((v) => {
        return {
          field: v,
          title: v,
          width: 120,
        };
      });
    },
    {
      immediate: true,
    },
  );

  const getCheckedKeys = () => {
    return tableColumns.value?.map((i) => i.field)?.join();
  };

  const resetPreview = () => {
    checkedKeys.value = [];
    tableColumns.value = [];
  };

  defineExpose({
    getCheckedKeys,
    resetPreview,
  });
</script>

<style lang="scss" scoped>
  @include b(api-data-preview) {
    width: 100%;
    padding: 0 20px;
    display: flex;
    @include e(title) {
      display: inline-block;
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 6px;
    }
  }
  @include b(api-data-preview-left) {
    width: 200px;
  }
  @include b(api-data-preview-right) {
    margin-left: 20px;
    width: calc(100% - 220px);
  }
</style>
