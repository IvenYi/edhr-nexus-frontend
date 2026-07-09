<template>
  <div v-for="(item, index) in list" :key="index">
    <div class="flex items-center mb-20px">
      <div style="width: 20px; height: 20px" class="flex justify-center items-center flex-none">
        <div v-if="['object', 'array'].includes(item?.type)" :size="16" @click="handleToggle(item)">
          <caret-right-outlined class="json-editor__node-arrow" :class="{ show: !item.collapse }" />
        </div>
      </div>

      <div class="mr-10px flex-none">
        <a-input
          :style="{
            width: `${240 - level * 20}px`,
          }"
          v-model:value="item.key"
          placeholder="请输入KEY"
          :disabled="parent.type === 'array' || level === 0"
        />
      </div>

      <a-select
        v-model:value="item.type"
        class="w-100px flex-none"
        :disabled="level === 0"
        @change="handleValueTypeChange(item, $event)"
      >
        <a-select-option value="string">字符串</a-select-option>
        <a-select-option value="number">数值</a-select-option>
        <a-select-option value="boolean">布尔值</a-select-option>
        <a-select-option value="object">对象</a-select-option>
        <a-select-option value="array">数组</a-select-option>
      </a-select>

      <div class="w-250px ml-10px flex-none">
        <a-input v-model:value="item.desc" placeholder="描述" />
      </div>

      <a-button
        class="ml-12px"
        type="link"
        v-if="item.type === 'object'"
        @click="handleAddProperty(item)"
        >添加下级</a-button
      >
      <a-button
        class="ml-12px"
        type="link"
        v-if="item.type === 'array'"
        @click="handleAddItem(item)"
        >添加下级</a-button
      >
      <template v-if="level > 0">
        <a-button class="ml-12px" type="link" @click="handleAdd(index)"
          ><plus-circle-outlined
        /></a-button>
        <a-button class="ml-12px" type="link" danger @click="handleDelete(index)"
          ><minus-circle-outlined
        /></a-button>
      </template>
    </div>
    <div v-if="['object', 'array'].includes(item.type)" v-show="!item.collapse" class="pl-20px">
      <json-editor
        v-if="item.children && item.children.length > 0"
        :list="item.children"
        :indexInParent="index"
        :level="level + 1"
        :parent="item"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="json-editor">
  import { ParameterStructItem, ParameterStruct } from '../../types';
  import { PropType } from 'vue';

  const props = defineProps({
    parent: {
      type: Object as PropType<ParameterStructItem>,
      default: () => ({}),
    },
    indexInParent: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array as PropType<ParameterStruct>,
      default: () => [],
    },
    level: {
      type: Number,
      default: 0,
    },
  });

  const handleToggle = (item) => {
    console.log(item, item.collapse);
    item.collapse = !item.collapse;
  };

  const handleAdd = (index) => {
    props.list.splice(index + 1, 0, {
      key: '',
      type: 'string',
    });

    // 自动更新array的索引值
    if (props.parent.type === 'array') {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  const handleDelete = (index) => {
    props.list.splice(index, 1);
    // 自动更新array的索引值
    if (props.parent.type === 'array') {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  const handleAddProperty = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.unshift({
      key: '',
      type: 'string',
    });
  };

  const handleAddItem = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.unshift({
      key: '',
      type: 'string',
    });
    item.children.forEach((item, index) => {
      item.key = index;
    });
  };

  const handleValueTypeChange = (item, value) => {
    console.log(item, value);
    // if(ivalue)
  };
</script>

<style lang="less" scoped>
  .json-editor__node-arrow {
    transition: all 0.3s;
    cursor: pointer;
  }

  .show {
    transform: rotate(90deg);
  }

  .ant-btn {
    padding-left: 0;
    padding-right: 0;
  }
</style>
