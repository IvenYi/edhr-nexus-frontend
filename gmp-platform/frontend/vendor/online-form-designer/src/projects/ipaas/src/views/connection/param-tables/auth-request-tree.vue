<template>
  <div v-for="(item, index) in list" :key="index">
    <div class="flex items-center mb-10px">
      <div
        class="flex-1 flex items-center"
        :style="{
          paddingLeft: level * 20 + 'px',
        }"
      >
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
        <a-input
          class="flex-1"
          v-model:value="item.key"
          :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
          :disabled="parent.keyType === AuthKeyTypeEnum.Array || level === 0"
        />
      </div>

      <!-- valueType -->
      <div class="w-12% pl-10px flex-none" v-if="level !== 0">
        <a-select
          v-model:value="item.valueType"
          class="w-full"
          @change="handleValueTypeChange(item, $event)"
        >
          <a-select-option v-for="ele in ValueTypeAvailable" :key="ele" :value="ele">
            {{ t(`sys.ipaas.valueType.${ele}`) }}
          </a-select-option>
        </a-select>
      </div>

      <!-- keyType -->
      <TypeSelect
        v-if="item.valueType === AuthValueTypeEnum.INPUT || level === 0"
        v-model:value="item.keyType"
        class="flex-none important-pl-10px"
        :style="{ width: '12%' }"
        :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
        @change="handleKeyTypeChange(item, $event)"
        :disabled="level === 0 && position !== 'body'"
        :available-types="KeyTypeAvailable"
      />

      <!-- value -->
      <div
        class="pl-10px flex-none"
        :class="item.valueType !== AuthValueTypeEnum.INPUT ? 'w-38%' : 'w-26%'"
      >
        <div
          v-if="
            [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            )
          "
          class="text-center"
        ></div>

        <template v-else>
          <div v-if="item.valueType === AuthValueTypeEnum.FUNC">
            <a-input :placeholder="$t('sys.ipaas.inputThirdSourceField')" v-model:value="item.value" />
          </div>
          <div v-else-if="item.valueType === AuthValueTypeEnum.EXPRESSION">
            <a-input :placeholder="$t('sys.ipaas.pleaseEnterExp')" v-model:value="item.value" />
          </div>
          <div v-else-if="item.valueType === AuthValueTypeEnum.SCRIPT">
            <a-input
              readonly
              @click="() => editScript(item)"
              :placeholder="$t('sys.ipaas.clickToCreateScript')"
              :value="item.value ? $t('sys.ipaas.clickToEditScript') : undefined"
            />
          </div>
          <template v-else>
            <a-input-number
              v-if="
            [AuthKeyTypeEnum.Integer, AuthKeyTypeEnum.Long, AuthKeyTypeEnum.BigDecimal,AuthKeyTypeEnum.Number].includes(
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
      <div class="w-100px pl-10px flex flex-none">
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
  import { GctDialog } from '/@/utils/Dialog';
  import AuthRequestScriptModal from './auth-request-script-modal.vue';
  import TypeSelect from '/@ipaas/comps/json-param/editor/type-select.vue';

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
    if (props.position === 'body') {
      return props.level === 0
        ? [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array]
        : Object.values(AuthKeyTypeEnum);
    } else {
      return props.level === 0
        ? [AuthKeyTypeEnum.Object]
        : [AuthKeyTypeEnum.Number, AuthKeyTypeEnum.String, AuthKeyTypeEnum.Boolean];
    }
  });

  const ValueTypeAvailable = [
    AuthValueTypeEnum.INPUT,
    AuthValueTypeEnum.EXPRESSION,
    AuthValueTypeEnum.SCRIPT,
  ];

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
    // 值类型变更的时候清空其他字段数据
    item.value = undefined;
    item.keyType = undefined;
    item.children = undefined;
  };

  const editScript = (item) => {
    GctDialog.open(AuthRequestScriptModal, {
      value: item.value,
      onOk: (jsCode: string) => {
        item.value = jsCode;
      },
    });
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
