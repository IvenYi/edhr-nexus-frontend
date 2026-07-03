<template>
  <div class="h100% ks-column">
    <div class="ks-col overflow-auto">
      <div v-for="(item, index) in list" :key="index">
        <div class="flex items-center mb-10px">
          <div
            class="flex items-center"
            :class="[level > 0 ? 'w180px' : 'w80px']"
            :style="{
              paddingLeft: level * 20 + 'px',
            }"
          >
            <div
              style="width: 20px; height: 20px"
              class="flex justify-center items-center flex-none"
            >
              <div
                v-if="
                  [ParameterTypeEnum.STRUCTURES, ParameterTypeEnum.TABLES].includes(
                    item?.keyType,
                  ) && item.valueType === ValueTypeEnum.INPUT
                "
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
              v-if="level > 0"
              class="flex-1"
              v-model:value="item.key"
              :placeholder="t('sys.keyOfSth', { sth: t('sys.field') })"
              :disabled="parent.keyType === ParameterTypeEnum.TABLES || level === 0 || disabled"
            />
            <div v-else>
              <span class="text-16px">{{ title }}</span>
            </div>
          </div>
          <a-select
            v-show="!isDebugMode"
            v-model:value="item.valueType"
            :disabled="disabled"
            class="flex-none important-ml-10px"
            style="width: 90px"
            @change="(val) => handleChildTypeChange(val, item)"
          >
            <a-select-option v-for="el in valueTypes ?? ValueTypeEnum" :key="el" :value="el">
              {{ t(`sys.ipaas.valueType.${el}`) }}
            </a-select-option>
          </a-select>
          <a-select
            v-show="item.valueType === ValueTypeEnum.INPUT || isChild"
            v-model:value="item.keyType"
            class="w-140px flex-none important-ml-10px"
            :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
            @change="handleValueTypeChange(item, $event)"
            :disabled="disabled || level === 0"
          >
            <a-select-option
              v-for="ele in level === 0
                ? [ParameterTypeEnum.STRUCTURES, ParameterTypeEnum.TABLES]
                : ParameterTypeEnum"
              :key="ele"
              :value="ele"
              :title="t(`sys.ipaas.sapFieldTypeEnum.${ele}`)"
            >
              {{ t(`${ele.toUpperCase()}`) }}
            </a-select-option>
          </a-select>
          <div v-show="isDebugMode && level > 0" class="w50px ml10px">
            <span class="mr3px">{{ $t('sys.pageDesigner.required') }}</span><a-checkbox v-model:checked="item.required" disabled />
          </div>
          <div class="flex-1 ml-10px">
            <!-- 根据字段类型显示不同的组件 -->
            <a-input-number
              v-if="
                item.keyType === ParameterTypeEnum.QUAN || item.keyType === ParameterTypeEnum.DEC
              "
              v-model:value="item.value"
              :placeholder="item.description || t('sys.inputText')"
              :disabled="disabled"
            />
            <a-input-number
              v-else-if="item.keyType === ParameterTypeEnum.NUMC"
              :precision="0"
              :stringMode="true"
              v-model:value="item.value"
              :disabled="disabled"
            />
            <a-time-picker
              v-else-if="item.keyType === ParameterTypeEnum.TIMS"
              value-format="HHmmss"
              v-model:value="item.value"
              :disabled="disabled"
            />
            <a-date-picker
              v-else-if="item.keyType === ParameterTypeEnum.DATS"
              value-format="YYYYMMDD"
              v-model:value="item.value"
              :disabled="disabled"
            />
            <a-input
              v-else-if="
                level === 0 && rootType === 'tables' && item.valueType === ValueTypeEnum.INPUT
              "
              v-model:value="item.key"
              :placeholder="$t('sys.ipaas.tableTypeKey')"
              :disabled="disabled"
            />
            <a-input
              v-else
              v-model:value="item.value"
              :placeholder="item.description || t('sys.inputText')"
              :disabled="
                (item.valueType === ValueTypeEnum.INPUT &&
                  [ParameterTypeEnum.TABLES, ParameterTypeEnum.STRUCTURES].includes(
                    item.keyType,
                  )) ||
                disabled
              "
            />
          </div>

          <!-- actions -->
          <div class="w-80px ml-10px flex flex-none">
            <template v-if="!disabled">
              <template v-if="level > 0">
                <a-button
                  v-show="item.valueType === ValueTypeEnum.INPUT"
                  :title="$t('sys.ipaas.addSiblingNode')"
                  class="mr-10px"
                  type="link"
                  @click="handleAdd(index)"
                  ><plus-circle-outlined
                /></a-button>
                <a-button
                  :title="$t('sys.delText')"
                  class="mr-10px"
                  type="link"
                  danger
                  @click="handleDelete(index)"
                  ><minus-circle-outlined
                /></a-button>
              </template>
              <template v-if="item.valueType === ValueTypeEnum.INPUT">
                <a-button
                  :title="$t('sys.ipaas.addChildNode')"
                  class="mr-10px"
                  type="link"
                  v-if="item.keyType === ParameterTypeEnum.STRUCTURES"
                  @click="handleAddProperty(item)"
                  ><branches-outlined
                /></a-button>
                <a-button
                  fv
                  :title="$t('sys.ipaas.addChildNode')"
                  class="mr-10px"
                  type="link"
                  v-if="item.keyType === ParameterTypeEnum.TABLES"
                  @click="handleAddItem(item)"
                  ><branches-outlined
                /></a-button>
              </template>
            </template>
          </div>
        </div>

        <div
          v-if="[ParameterTypeEnum.STRUCTURES, ParameterTypeEnum.TABLES].includes(item.keyType)"
          v-show="!item.collapse"
        >
          <rfc-json-editor
            v-if="item.children && item.children.length > 0"
            :list="item.children"
            :indexInParent="index"
            :level="level + 1"
            :parent="item"
            :type="type"
            :disabled="disabled"
            :isChild="true"
            :isDebugMode="isDebugMode"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="rfc-json-editor">
  import { ParameterStructItem, ParameterStruct, ParameterTypeEnum, ValueTypeEnum } from './type';
  import { onMounted, PropType } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  // const emit = defineEmits(['update:list']);
  const props = defineProps({
    /** 根节点的标题 */
    title: {
      type: String,
      default: '',
    },
    /** 根节点类型 */
    rootType: {
      type: String as PropType<'import' | 'tables'>,
      default: 'import',
    },
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
    isChild: {
      type: Boolean,
      default: false,
    },
    valueTypes: {
      type: Array<ValueTypeEnum>,
      default: () => [ValueTypeEnum.EXPRESSION, ValueTypeEnum.INPUT],
    },
    isDebugMode: {
      type: Boolean,
      default: false,
    },
  });

  const handleToggle = (item) => {
    item.collapse = !item.collapse;
  };

  const handleAdd = (index) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.list.splice(index + 1, 0, {
      key: '',
      keyType: ParameterTypeEnum.CHAR,
      valueType: ValueTypeEnum.INPUT,
      value: '',
    });

    // 自动更新array的索引值
    if (props.parent.keyType === ParameterTypeEnum.TABLES) {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
  };

  const handleDelete = (index) => {
    // eslint-disable-next-line vue/no-mutating-props
    props.list.splice(index, 1);
    // 自动更新array的索引值
    if (props.parent.keyType === ParameterTypeEnum.TABLES) {
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
      keyType: ParameterTypeEnum.CHAR,
      valueType: ValueTypeEnum.INPUT,
      value: '',
    });
  };

  const handleAddItem = (item) => {
    if (!item.children) {
      item.children = [];
    }
    item.children.unshift({
      key: '',
      keyType: ParameterTypeEnum.CHAR,
      valueType: ValueTypeEnum.INPUT,
      value: '',
      inArray: true,
    });
    item.children.forEach((item, index) => {
      item.key = index;
    });
  };

  const handleValueTypeChange = (item, value) => {
    item.value = '';
    if (item.children) item.children = [];
    if (
      value === ParameterTypeEnum.TABLES &&
      (!item.children || item.children.length <= 0) &&
      item.valueType === ValueTypeEnum.INPUT
    ) {
      handleAddItem(item);
    }
  };

  const handleChildTypeChange = (type, item) => {
    item.valueType = type;
    item.children = undefined;
    item.value = '';
    if (type === ValueTypeEnum.EXPRESSION) {
      // 表达式格式要求
      if (props.level === 0) {
        item.key = '*';
      }
      item.keyType = ParameterTypeEnum.STRUCTURES;
    } else if (!props.isChild) {
      item.key = props.level === 0 && props.rootType === 'tables' ? '' : item.key;
      item.keyType =
        type === ValueTypeEnum.INPUT
          ? props.level === 0 && props.rootType === 'tables'
            ? ParameterTypeEnum.TABLES
            : ParameterTypeEnum.STRUCTURES
          : '';
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

  .ant-btn-link {
    padding-right: 0;
    padding-left: 0;
  }
</style>
