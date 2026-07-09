<template>
  <div v-if="position !== 'body' && level === 0" class="pl-20px lh-[1em] mb-10px">
    <a :title="$t('sys.add')" @click.prevent="() => handleAdd()"><branches-outlined class="mr-5px" />{{ $t('sys.add') }}</a>
  </div>
  <div v-for="(item, index) in list" :key="index">
    <div class="flex items-center mb-10px">
      <!-- icon -->
      <div style="width: 20px; height: 20px" class="flex justify-center items-center flex-none">
        <div
          v-if="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(item.keyType as any)"
          :size="16"
          @click="handleToggle(item)"
        >
          <caret-right-outlined
            class="json-tree-editor__node-arrow"
            :class="{ show: !item.collapse }"
          />
        </div>
      </div>

      <!-- key -->
      <div class="mr-10px flex-none">
        <a-input
          :style="{
            width: `${200 - level * 20}px`,
          }"
          v-model:value="item.key"
          :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
          :disabled="
            parent.keyType === AuthKeyTypeEnum.Array || (level === 0 && position === 'body')
          "
        />
      </div>

      <!-- keyType -->
      <a-select
        v-model:value="item.keyType"
        class="w-100px flex-none"
        :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
        @change="handleKeyTypeChange(item, $event)"
      >
        <a-select-option
          v-for="ele in KeyTypeAvailable"
          :key="ele"
          :value="ele"
          :title="t(`sys.ipaas.keyType.${ele}`)"
        >
          {{ t(`sys.ipaas.keyType.${ele}`) }}
        </a-select-option>
      </a-select>

      <!-- valueType -->
      <div class="w-120px ml-10px flex-none">
        <div
          v-if="
            [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            )
          "
          class="text-center"
          >/</div
        >

        <a-select
          v-else
          v-model:value="item.valueType"
          class="w-full"
          @change="handleValueTypeChange(item, $event)"
        >
          <a-select-option v-for="ele in ValueTypeAvailable" :key="ele" :value="ele">
            {{ t(`sys.ipaas.valueType.${ele}`) }}
          </a-select-option>
        </a-select>
      </div>

      <!-- value -->
      <div class="w-180px ml-10px flex-none">
        <div
          v-if="
            [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            )
          "
          class="text-center"
          >/</div
        >

        <template v-else>
          <div v-if="item.valueType === AuthValueTypeEnum.FUNC">
            <a-input :placeholder="$t('sys.ipaas.inputThirdSourceField')" v-model:value="item.value" />
          </div>
          <template v-else>
            <a-input-number
              v-if="
            [AuthKeyTypeEnum.Integer, AuthKeyTypeEnum.Long, AuthKeyTypeEnum.BigDecimal].includes(
              item.keyType as any,
            )
          "
              v-model:value="item.value"
              :placeholder="$t('sys.ipaas.pleaseEnterValue')"
            />
            <!-- 文本 -->
            <a-input
              v-else-if="item.keyType === AuthKeyTypeEnum.String"
              v-model:value="item.value"
              :placeholder="$t('sys.ipaas.pleaseEnterValue')"
            />

            <!-- 布尔 -->
            <a-radio-group
              v-else-if="item.keyType === AuthKeyTypeEnum.Boolean"
              v-model:value="item.value"
            >
              <a-radio :value="true">{{ t('sys.real') }}</a-radio>
              <a-radio :value="false">{{ t('sys.fake') }}</a-radio>
            </a-radio-group>
          </template>
        </template>
      </div>

      <!-- actions -->
      <div class="w-80px ml-10px flex-1 flex">
        <template v-if="!(position === 'body' && level === 0)">
          <a-button :title="$t('sys.ipaas.addSiblingNode')" class="mr-10px" type="link" @click="handleAdd(index)"
            ><plus-circle-outlined
          /></a-button>
          <a-button :title="$t('sys.delete')" class="mr-10px" type="link" danger @click="handleDelete(index)"
            ><minus-circle-outlined
          /></a-button>
        </template>

        <a-button
          :title="$t('sys.ipaas.addChildNode')"
          v-if="item.keyType === AuthKeyTypeEnum.Object"
          class="mr-10px"
          type="link"
          @click="handleAddProperty(item)"
          ><branches-outlined
        /></a-button>

        <a-button
          :title="$t('sys.ipaas.addChildNode')"
          v-if="item.keyType === AuthKeyTypeEnum.Array"
          class="mr-10px"
          type="link"
          @click="handleAddItem(item)"
          ><branches-outlined
        /></a-button>
      </div>
    </div>
    <div
      v-if="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(item.keyType as any)"
      v-show="!item.collapse"
      class="pl-20px"
    >
      <json-tree-editor
        v-if="item.children && item.children.length > 0"
        :list="item.children"
        :indexInParent="index"
        :level="level + 1"
        :parent="item"
        :position="position"
      />
    </div>
  </div>
</template>

<script lang="ts" setup name="json-tree-editor">
  import { AuthKeyTypeEnum, AuthValueTypeEnum } from '/@ipaas/enums';
  import type { AppAuthRequestConfig } from '/@/apis/gct-ipaas2/model';
  import { PropType, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  type NodeDataItem = AppAuthRequestConfig & {
    collapse?: boolean;
    children?: NodeDataItem[];
  };

  const props = defineProps({
    parent: {
      type: Object as PropType<NodeDataItem>,
      default: () => ({}),
    },
    indexInParent: {
      type: Number,
      default: 0,
    },
    list: {
      type: Array as PropType<NodeDataItem[]>,
      default: () => [],
    },
    level: {
      type: Number,
      default: 0,
    },
    position: {
      type: String as PropType<'header' | 'path' | 'query' | 'body'>,
    },
  });

  /**
   * 可用字段类型
   */
  const KeyTypeAvailable = computed(() => {
    if (props.position !== 'body') {
      return [
        AuthKeyTypeEnum.Integer,
        AuthKeyTypeEnum.Long,
        AuthKeyTypeEnum.BigDecimal,
        AuthKeyTypeEnum.String,
        AuthKeyTypeEnum.Boolean,
      ];
    }

    if (props.level === 0 && props.position === 'body') {
      return [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array];
    }
    return AuthKeyTypeEnum;
  });

  const ValueTypeAvailable = [AuthValueTypeEnum.INPUT, AuthValueTypeEnum.EXPRESSION];

  const handleToggle = (item) => {
    item.collapse = !item.collapse;
  };

  const _getNewItem = () => {
    const data: NodeDataItem = {};
    data.keyType = AuthKeyTypeEnum.String;
    data.valueType = AuthValueTypeEnum.INPUT;
    data.paramType = props.position;
    return data;
  };
  /**
   * 添加同级节点
   */
  const handleAdd = (index?: number) => {
    if (index === undefined) {
      props.list.push(_getNewItem());
    } else {
      props.list.splice(index + 1, 0, _getNewItem());
    }
    // 自动更新array的索引值
    if (props.parent.keyType === AuthKeyTypeEnum.Array) {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  /**
   * 添加子节点 object
   */
  const handleAddProperty = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.push(_getNewItem());
  };

  /**
   * 添加子节点 array
   * @param item
   */
  const handleAddItem = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.push(_getNewItem());
    item.children.forEach((item, index) => {
      item.key = index;
    });
  };

  const handleDelete = (index) => {
    props.list.splice(index, 1);
    // 自动更新array的索引值
    if (props.parent.keyType === AuthKeyTypeEnum.Array) {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  const handleKeyTypeChange = (item, value) => {
    if (item.children) item.children = [];
    if (value === AuthKeyTypeEnum.Array && (!item.children || item.children.length <= 0)) {
      handleAddItem(item);
    }
  };

  const handleValueTypeChange = (item, value) => {
    item.value = '';
  };
</script>

<style lang="less" scoped>
  .json-tree-editor__node-arrow {
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
