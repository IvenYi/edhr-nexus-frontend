<template>
  <div v-for="(item, index) in list" :key="index">
    <div class="flex items-center mb-10px">
      <div
        class="flex-1 flex items-center"
        :style="{
          paddingLeft: level * 20 + 'px',
        }"
      >
        <div style="width: 20px; height: 20px" class="flex justify-center items-center flex-none">
          <div
            v-if="[ParameterTypeEnum.Object, ParameterTypeEnum.Array].includes(item?.keyType)"
            :size="16"
            @click="handleToggle(item)"
          >
            <caret-right-outlined
              class="json-editor__node-arrow"
              :class="{ show: !item.collapse }"
            />
          </div>
        </div>

        <a-input
          class="flex-1"
          v-model:value="item.key"
          :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
          :disabled="parent.keyType === ParameterTypeEnum.Array || level === 0 || disabled"
        />
      </div>

      <a-select
        v-model:value="item.keyType"
        class="w-15% flex-none important-ml-10px"
        :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
        @change="handleValueTypeChange(item, $event)"
        :disabled="disabled"
      >
        <a-select-option
          v-for="ele in level === 0
            ? [ParameterTypeEnum.Object, ParameterTypeEnum.Array]
            : ParameterTypeEnum"
          :key="ele"
          :value="ele"
          :title="t(`sys.ipaas.${ele}`)"
        >
          {{ t(`sys.ipaas.${ele}`) }}
        </a-select-option>
      </a-select>

      <div class="w-30% ml-10px flex-none">
        <a-input
          v-if="type === 'input'"
          v-model:value="item.description"
          :placeholder="t('sys.descriptionOfSth', { sth: t('sys.field') })"
          :disabled="
            (parent.keyType === ParameterTypeEnum.Array &&
              [ParameterTypeEnum.Array, ParameterTypeEnum.Object].includes(item.keyType)) ||
            disabled
          "
        />
        <a-input
          v-else-if="type === 'output'"
          v-model:value="item.value"
          :placeholder="$t('sys.pageDesigner.fieldValue')"
          :disabled="
            (parent.keyType === ParameterTypeEnum.Array &&
              [ParameterTypeEnum.Array, ParameterTypeEnum.Object].includes(item.keyType)) ||
            disabled
          "
        />
      </div>

      <!-- actions -->
      <div class="w-100px ml-10px flex flex-none" v-if="!disabled">
        <template v-if="level > 0">
          <a-button :title="$t('sys.ipaas.addSiblingNode')" class="mr-10px" type="link" @click="handleAdd(index)"
            ><plus-circle-outlined
          /></a-button>
          <a-button :title="$t('sys.delete')" class="mr-10px" type="link" danger @click="handleDelete(index)"
            ><minus-circle-outlined
          /></a-button>
        </template>

        <a-button
          :title="$t('sys.ipaas.addChildNode')"
          class="mr-10px"
          type="link"
          v-if="item.keyType === ParameterTypeEnum.Object"
          @click="handleAddProperty(item)"
          ><branches-outlined
        /></a-button>
        <a-button
          :title="$t('sys.ipaas.addChildNode')"
          class="mr-10px"
          type="link"
          v-if="item.keyType === ParameterTypeEnum.Array"
          @click="handleAddItem(item)"
          ><branches-outlined
        /></a-button>
      </div>
    </div>

    <div
      v-if="[ParameterTypeEnum.Object, ParameterTypeEnum.Array].includes(item.keyType)"
      v-show="!item.collapse"
    >
      <json-editor
        v-if="item.children && item.children.length > 0"
        :list="item.children"
        :indexInParent="index"
        :level="level + 1"
        :parent="item"
        :type="type"
        :disabled="disabled"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="json-editor">
  import { ParameterStructItem, ParameterStruct, ParameterTypeEnum } from './type';
  import { PropType } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

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
    type: {
      type: String as PropType<'input' | 'output'>,
      default: 'input',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  });

  const handleToggle = (item) => {
    item.collapse = !item.collapse;
  };

  const handleAdd = (index) => {
    props.list.splice(index + 1, 0, {
      key: '',
      keyType: ParameterTypeEnum.String,
      value: '',
    });

    // 自动更新array的索引值
    if (props.parent.keyType === ParameterTypeEnum.Array) {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  const handleDelete = (index) => {
    props.list.splice(index, 1);
    // 自动更新array的索引值
    if (props.parent.keyType === ParameterTypeEnum.Array) {
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
      keyType: ParameterTypeEnum.String,
      value: '',
    });
  };

  const handleAddItem = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.unshift({
      key: '',
      keyType: ParameterTypeEnum.String,
      value: '',
      inArray: true,
    });
    item.children.forEach((item, index) => {
      item.key = index;
    });
  };

  const handleValueTypeChange = (item, value) => {
    if (item.children) item.children = [];
    if (value === ParameterTypeEnum.Array && (!item.children || item.children.length <= 0)) {
      handleAddItem(item);
    }
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
    padding-right: 0;
    padding-left: 0;
  }
</style>
