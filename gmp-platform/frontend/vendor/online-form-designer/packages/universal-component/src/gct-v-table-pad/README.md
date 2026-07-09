# Pad 表格单独使用文档

## 介绍

基于 VTable 实现的 Pad 端表格组件，可使用 Vant UI 组件库的表单组件作为行内编辑项渲染组件。

## 使用示例

```vue
<template>
  <GctVTablePad :config="config">
    <!-- 行编辑列绘制插槽必须以: gct_v_table_row_edit_render_ 开头，拼接 column.editor.type 类型 -->
    <template #gct_v_table_row_edit_render_input="{ col, record }">
      <van-field
        :key="col.name"
        :name="col.name"
        :rules="[{ required: true, message: '请输入' + col.title }]"
        v-model="record[col.name]"
      />
    </template>
  </GctVTablePad>
</template>
<script lang="ts" setup>
  import { defineComponent } from 'vue';
  import {
    GCT_V_TABLE_ROW_EDIT_RENDER_PREFIX,
    type IDataVTable,
    type IVTableDataItem,
    type IVTableActionItem,
  } from '@gct/universal-component/gct-v-table';
  import { GctVTablePad } from '@gct/universal-component/gct-v-table-pad';

  const config: IDataVTable = {
    key: 'id_',
    columns: [
      // 普通列
      {
        type: 'default',
        name: 'appName',
        title: '应用名称',
      },
      // 可编辑列
      {
        type: 'edit',
        name: 'modifyUserName',
        title: '用户名',
        required: true,
        editor: {
          type: 'input',
        },
      },
      // 操作列
      {
        type: 'actions',
        name: 'actions',
        title: '操作',
        fixed: 'right',
        visibleButtons: 3,
        actions: [
          {
            size: 'small',
            tag: 'test',
            text: '操作1',
            type: 'default',
          },
        ] as IVTableActionItem[],
        action(action: IVTableActionItem, row: IData, rowIndex?: number): Promise<void> {
          console.debug('点击了操作按钮', action, row, rowIndex);
          return Promise.resolve();
        },
      },
    ],
    async load() {
      return { items: [], total: 0 };
    },
  };
</script>
```
