<template>
  <div v-for="(item, index) in list" :key="index" class="relative">
    <template v-if="level > 0">
      <div
        class="w-20px h-1px top-32px left-0px bg-[#c3c3c3] absolute"
        :class="{
          'important-top-24px ': index === list.length - 1 && [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(item.keyType as any)
        }"
        :style="{
          transform: `translateX(${level * 60 - 20}px)`,
        }"
      ></div>
      <div
        class="w-1px top-0px left-0px bg-[#c3c3c3] absolute h-32px"
        :class="{
          'important-h-full': index < list.length - 1,
          'important-h-24px ': index === list.length - 1 && [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(item.keyType as any)
        }"
        :style="{
          transform: `translateX(${level * 60 - 20}px)`,
        }"
      ></div>
    </template>

    <div class="flex items-center pt-8px">
      <div
        class="flex-1 flex items-center"
        :style="{
          paddingLeft: level * 60 + 'px',
        }"
      >
        <!-- key -->
        <div class="flex items-center w-full">
          <div
            class="h-20px w-20px flex-none"
            v-if="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(item.keyType as any)"
            :size="16"
            @click="handleToggle(item)"
          >
            <plus-square-outlined v-if="item.collapse" />
            <minus-square-outlined v-else />
          </div>

          <div
            class="flex-1 rounded-bl-4px rounded-tl-4px"
            :class="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            ) ? '':'pt-8px pb-8px pl-8px bg-[#F2F4F7]'"
          >
            <div
              v-if="level === 0"
              class="rounded-4px pl-10px pr-10px color-primary ell top-level-bg h-32px lh-32px"
            >
              {{ item.key }}
            </div>

            <a-input
              v-else
              class="w-full"
              v-model:value="item.key"
              :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
              :disabled="parent.keyType === AuthKeyTypeEnum.Array"
            />
          </div>
        </div>
      </div>

      <div
        class="w-70% flex-none flex rounded-br-4px rounded-tr-4px"
        :class="[AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            ) ? '':'pt-8px pb-8px bg-[#F2F4F7]'"
      >
        <!-- keyType -->
        <a-select
          v-model:value="item.keyType"
          class="w-24% flex-none important-ml-10px"
          :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
          @change="handleKeyTypeChange(item, $event)"
          :disabled="level === 0 && position !== 'body'"
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
        <div class="w-24% ml-10px flex-none">
          <div
            v-if="
            [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            )
          "
          ></div>

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
        <div class="w-10px ml-10px flex-1">
          <div
            v-if="
            [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(
              item.keyType as any,
            )
          "
          ></div>

          <template v-else>
            <a-input
              v-if="item.valueType === AuthValueTypeEnum.FUNC"
              v-model:value="item.value"
              :allow-clear="false"
              :placeholder="$t('sys.ipaas.pleaseSelectAuthFunc')"
            >
              <template #addonAfter>
                <div class="cursor-pointer" @click="() => handleFormulaEdit(index)">
                  <setting-outlined />
                </div>
              </template>
            </a-input>

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
        <div class="w-80px flex flex-none items-center justify-end">
          <a-button
            title="$t('sys.ipaas.addChildNode')"
            v-if="item.keyType === AuthKeyTypeEnum.Object"
            @click="handleAddProperty(item)"
            type="primary"
            ghost
            :class="{
              'mr-20px': level > 0,
            }"
          >
            <template #icon>
              <plus-outlined />
            </template>
            {{ $t('sys.ipaas.childParam') }}
          </a-button>

          <a-button
            title="$t('sys.ipaas.addChildNode')"
            v-if="item.keyType === AuthKeyTypeEnum.Array"
            @click="handleAddItem(item)"
            type="primary"
            ghost
            :class="{
              'mr-20px': level > 0,
            }"
          >
            <template #icon>
              <plus-outlined />
            </template>
            {{ $t('sys.ipaas.childParam') }}
          </a-button>

          <template v-if="level > 0">
            <div title="$t('sys.delete')" class="mr-10px p-2px cursor-pointer" @click="handleDelete(index)"
              ><delete-outlined
            /></div>
            <div title="$t('sys.ipaas.addSiblingNode')" class="mr-10px p-2px cursor-pointer" @click="handleAdd(index)"
              ><plus-outlined
            /></div>
          </template>
        </div>
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
  import type { AppAuthParamConfig } from '/@/apis/gct-ipaas2/model';
  import { PropType, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import useExpression, {
    ExpressionModeEnum,
    ExpressionTabEnum,
  } from '/@/components/Expression/index';

  const { t } = useI18n();
  const { openModal } = useExpression(false);

  type NodeDataItem = AppAuthParamConfig & {
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
      return props.level === 0 ? [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array] : AuthKeyTypeEnum;
    } else {
      return props.level === 0
        ? [AuthKeyTypeEnum.Object]
        : [
            AuthKeyTypeEnum.Integer,
            AuthKeyTypeEnum.Long,
            AuthKeyTypeEnum.BigDecimal,
            AuthKeyTypeEnum.String,
            AuthKeyTypeEnum.Boolean,
          ];
    }
  });

  const ValueTypeAvailable = [AuthValueTypeEnum.INPUT, AuthValueTypeEnum.FUNC];

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

  const handleFormulaEdit = (index: number) => {
    openModal({
      expr: props.list[index].value ?? '',
      mode: ExpressionModeEnum.IPAAS_BACK,
      identifiers: {
        [ExpressionTabEnum.FIELD]: undefined,
        [ExpressionTabEnum.VARIABLE]: undefined,
      },
      callback: (arg1, arg2, other) => {
        props.list[index].value = other?.expr ?? '';
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

  .color-primary {
    color: var(--ant-primary-color);
  }

  .top-level-bg {
    background-color: rgba(from var(--ant-primary-color) r g b / 8%);
  }
</style>
