# eDHR Field Tree Select 组件

这是一个带有层级限制的树形选择组件，支持多级表头配置。

## 功能特性

- ✅ 支持拖拽排序
- ✅ 可配置最大层级数（默认3层）
- ✅ 拖拽时自动验证层级限制
- ✅ 添加分组时自动检查层级限制
- ✅ 友好的用户提示
- ✅ 禁用状态的视觉反馈

## Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| fieldMap | 字段映射对象 | Object | {} |
| groupOptions | 多级表头数据 | Array | [] |
| fieldNames | 字段名称映射 | Object | { children: 'children', title: 'title', key: 'key' } |
| maxLevel | 最大层级数 | Number | 3 |
| getLabelByFun | 获取标签的函数 | Function | - |
| getFieldTypeByFun | 获取字段类型的函数 | Function | - |
| setLabelByFun | 设置标签的函数 | Function | - |

## Events

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| change | 数据变化时触发 | - |

## 使用示例

```vue
<template>
  <gct-field-tree-select
    :fieldMap="fieldMap"
    :groupOptions="groupOptions"
    :maxLevel="4"
    :getLabelByFun="getLabelByFun"
    :getFieldTypeByFun="getFieldTypeByFun"
    :setLabelByFun="setLabelByFun"
    @change="handleChange"
  />
</template>

<script setup>
import { ref } from 'vue';

const fieldMap = ref({
  field1: { label: '字段1', type: 'text' },
  field2: { label: '字段2', type: 'number' },
});

const groupOptions = ref([
  {
    title: '分组1',
    key: 'group1',
    isGroup: true,
    groupLevel: 1,
    children: [
      {
        title: '子分组1',
        key: 'subgroup1',
        isGroup: true,
        groupLevel: 2,
        children: [
          { key: 'field1', isGroup: false }
        ]
      }
    ]
  }
]);

const getLabelByFun = (field) => field?.label || '';
const getFieldTypeByFun = (field) => field?.type || '';
const setLabelByFun = (key, label) => {
  if (fieldMap.value[key]) {
    fieldMap.value[key].label = label;
  }
};

const handleChange = () => {
  console.log('数据已更新');
};
</script>
```

## 层级限制说明

1. **最大层级**: 通过 `maxLevel` 属性控制，默认为3层
2. **拖拽验证**: 拖拽节点时会自动计算目标位置的层级，如果超过限制则禁止拖拽
3. **添加分组验证**: 添加子分组时会检查是否超过层级限制
4. **视觉反馈**: 超过限制的操作按钮会显示为禁用状态，并提供相应的提示信息

## 注意事项

- 层级计算从1开始（根级为第1层）
- 拖拽验证会考虑被拖拽节点的整个子树深度
- 当操作被禁止时，会显示相应的警告消息
