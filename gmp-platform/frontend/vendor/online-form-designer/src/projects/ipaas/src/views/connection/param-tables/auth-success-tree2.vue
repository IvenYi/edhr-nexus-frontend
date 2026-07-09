<template>
  <div class="pl-20px lh-[1em] mb-10px">
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
          :disabled="parent.keyType === AuthKeyTypeEnum.Array"
        />
      </div>

      <!-- keyType -->
      <a-select
        v-model:value="item.keyType"
        class="w-100px flex-none"
        :placeholder="t('sys.typeOfSth', { sth: t('sys.field') })"
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

      <!-- operator -->
      <div class="w-120px ml-10px flex-none">
        <a-select class="w-full" v-model:value="item.operator">
          <a-select-option
            v-for="ope in KeyTypeOperatorMap[item.keyType as any] ?? []"
            :key="ope.operator"
            >{{ t(ope.i18nKey) }}</a-select-option
          >
        </a-select>
      </div>

      <!-- value -->
      <div class="w-180px ml-10px flex-none">
        <!-- 数值 -->
        <a-input-number
          v-if="
            [AuthKeyTypeEnum.Integer, AuthKeyTypeEnum.Long, AuthKeyTypeEnum.BigDecimal].includes(
              item.keyType as AuthKeyTypeEnum,
            )
          "
          v-model:value="item.value"
        />
        <!-- 文本 -->
        <a-input
          v-else-if="
            item.keyType === AuthKeyTypeEnum.String &&
            [
              AuthSuccessOperator.EQ,
              AuthSuccessOperator.CONTAINS,
              AuthSuccessOperator.NOT_CONTAINS,
            ].includes(item.operator as AuthSuccessOperator )
          "
          v-model:value="item.value"
        />
        <!-- 布尔 -->
        <a-radio-group
          v-else-if="
            item.keyType === AuthKeyTypeEnum.Boolean &&
            [
              AuthSuccessOperator.EQ
            ].includes(item.operator as AuthSuccessOperator )
          "
          v-model:value="item.value"
        >
          <a-radio :value="true">{{ t('sys.real') }}</a-radio>
          <a-radio :value="false">{{ t('sys.fake') }}</a-radio>
        </a-radio-group>

        <div v-else class="text-center">/</div>
      </div>

      <!-- actions -->
      <div class="w-80px ml-10px flex-1 flex">
        <a-button :title="$t('sys.ipaas.addSiblingNode')" class="mr-10px" type="link" @click="handleAdd(index)"
          ><plus-circle-outlined
        /></a-button>
        <a-button :title="$t('sys.delete')" class="mr-10px" type="link" danger @click="handleDelete(index)"
          ><minus-circle-outlined
        /></a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="json-tree-editor">
  import { AuthKeyTypeEnum } from '/@ipaas/enums';
  import type { AppAuthSuccessExpression } from '/@/apis/gct-ipaas2/model';
  import { PropType, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  /**
   * 条件运算符
   */
  enum AuthSuccessOperator {
    EQ = '==',
    GT = '>',
    GE = '>=',
    LT = '<',
    LE = '<=',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'notContains',
    IS_NULL = 'isNull',
    IS_NOT_NULL = 'isNotNull',
  }

  const AuthSuccessOperatorOptions = Object.entries(AuthSuccessOperator).map(([key, value]) => {
    return {
      operator: value,
      i18nKey: 'sys.ipaas.successOperator.' + key,
    };
  });

  const { t } = useI18n();

  type NodeDataItem = AppAuthSuccessExpression & {
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
  });

  /**
   * 数值支持的操作符
   */
  const NumberOperators = AuthSuccessOperatorOptions.filter((item) =>
    [
      AuthSuccessOperator.EQ,
      AuthSuccessOperator.GT,
      AuthSuccessOperator.GE,
      AuthSuccessOperator.LT,
      AuthSuccessOperator.LE,
    ].includes(item.operator),
  );

  /**
   * 字符串支持的操作符
   */
  const StringOperators = AuthSuccessOperatorOptions.filter((item) =>
    [
      AuthSuccessOperator.EQ,
      AuthSuccessOperator.CONTAINS,
      AuthSuccessOperator.NOT_CONTAINS,
      AuthSuccessOperator.IS_NULL,
      AuthSuccessOperator.IS_NOT_NULL,
    ].includes(item.operator),
  );

  /**
   * 布尔支持的操作符
   */
  const BooleanOperators = AuthSuccessOperatorOptions.filter((item) =>
    [AuthSuccessOperator.EQ].includes(item.operator),
  );

  /**
   * 字段类型 - 操作符映射
   */
  const KeyTypeOperatorMap = {
    [AuthKeyTypeEnum.Integer]: NumberOperators,
    [AuthKeyTypeEnum.Long]: NumberOperators,
    [AuthKeyTypeEnum.BigDecimal]: NumberOperators,
    [AuthKeyTypeEnum.String]: StringOperators,
    [AuthKeyTypeEnum.Boolean]: BooleanOperators,
  };

  /**
   * 可用字段类型
   */
  const KeyTypeAvailable = computed(() => {
    return [
      AuthKeyTypeEnum.Integer,
      AuthKeyTypeEnum.Long,
      AuthKeyTypeEnum.BigDecimal,
      AuthKeyTypeEnum.String,
      AuthKeyTypeEnum.Boolean,
    ];
  });

  const handleToggle = (item) => {
    item.collapse = !item.collapse;
  };

  const _getNewItem = () => {
    const data: NodeDataItem = {};
    data.keyType = AuthKeyTypeEnum.String;
    data.operator = AuthSuccessOperator.EQ;
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

  const handleDelete = (index) => {
    props.list.splice(index, 1);
    // 自动更新array的索引值
    if (props.parent.keyType === AuthKeyTypeEnum.Array) {
      props.list.forEach((item, index) => {
        item.key = index;
      });
    }
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
