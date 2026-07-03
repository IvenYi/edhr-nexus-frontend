<template>
  <div :class="ns.b()">
    <div :class="ns.e('row')">
      <div :class="[ns.e('col-1'), ns.e('title')]">
        {{ t('sys.keyOfSth', { sth: t('sys.field') }) }}
      </div>
      <div :class="[ns.e('col-2'), ns.e('title')]"> {{ $t('sys.tableColumnType') }} </div>
      <div :class="[ns.e('col-3'), ns.e('title')]"> {{ $t('sys.pageDesigner.fieldDesc') }} </div>
      <div :class="[ns.e('col-4'), ns.e('title')]">
        {{ $t('sys.model.argument') }}{{ $t('sys.tableColumnType') }}
      </div>
      <div :class="[ns.e('col-5'), ns.e('title')]"> {{ $t('sys.model.argument') }}KEY </div>
    </div>
    <JsonParamTree :class="[ns.e('tree')]" :value="value">
      <template #default="{ param, level, parent, index }">
        <div :class="[ns.e('row')]">
          <div :class="[ns.e('col-1'), 'flex']">
            <NodeIndent :param="param" :level="level" />
            <a-input
              class="flex-grow-1 json-input"
              :value="
                parent?.type === AuthKeyTypeEnum.Array ? '数组项' : level === 0 ? 'root' : param.key
              "
              disabled
            />
          </div>
          <TypeSelect
            :class="[ns.e('col-2'), 'json-select']"
            v-model:value="param.type"
            :available-types="level === 0 ? rootTypes : nodeTypes"
            :showArrow="false"
            disabled
          />

          <div :class="[ns.e('col-3')]">
            <a-input
              v-if="level !== 0"
              class="json-input"
              v-model:value="param.description"
              disabled
            />
          </div>
          <div :class="[ns.e('col-4')]">
            <ParamSelect
              v-if="
                !(param.type === AuthKeyTypeEnum.Array || param.type === AuthKeyTypeEnum.Object)
              "
              :class="[ns.e('col-2')]"
              v-model:value="param.paramType"
              @change="
                () => {
                  param.paramKey = undefined;
                }
              "
            />
          </div>
          <div :class="[ns.e('col-5')]">
            <a-input
              v-if="
                !(param.type === AuthKeyTypeEnum.Array || param.type === AuthKeyTypeEnum.Object)
              "
              class="json-input"
              v-model:value="param.paramKey"
              :placeholder="t('sys.inputText')"
            />
          </div>
        </div>
      </template>
    </JsonParamTree>
  </div>
</template>

<script lang="ts" setup name="json-param-editor">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import JsonParamTree from '/@ipaas/comps/json-param/json-param-tree/json-param-tree';

  import { ITreeJsonParam } from '/@ipaas/comps/json-param/types';
  import { AuthKeyTypeEnum, ParameterPosition } from '/@ipaas/enums';
  import TypeSelect from '/@ipaas/comps/json-param/editor/type-select.vue';
  import ParamSelect from '/@ipaas/comps/json-param/editor/param-select.vue';
  import NodeIndent from '/@ipaas/comps/json-param/editor/node-indent.vue';

  const { t } = useI18n();
  const ns = useNamespace('json-param-editor');

  const props = withDefaults(
    defineProps<{
      value: ITreeJsonParam;
      position?: ParameterPosition;
    }>(),
    {
      position: ParameterPosition.BODY,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: ITreeJsonParam): void;
  }>();

  /** 根节点能选择的类型 */
  const rootTypes = computed(() => {
    if (props.position === ParameterPosition.BODY) {
      return [AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array];
    }
    return [AuthKeyTypeEnum.Object];
  });

  /** 节点可用类型 */
  const nodeTypes = computed(() => {
    if (props.position === ParameterPosition.BODY) {
      return Object.values(AuthKeyTypeEnum);
    }
    return [
      AuthKeyTypeEnum.Integer,
      AuthKeyTypeEnum.Long,
      AuthKeyTypeEnum.BigDecimal,
      AuthKeyTypeEnum.String,
      AuthKeyTypeEnum.Boolean,
    ];
  });
</script>

<style lang="scss" scoped>
  $json-param-editor: ();

  @include b(json-param-editor) {
    @include set-component-css-var(json-param-editor, $json-param-editor);

    @include e(key-input) {
      width: 100px;
      flex-grow: 1;
    }

    @include e(type-select) {
      width: 120px;
      :deep(.ant-select-selector) {
        background-color: #fff;
        cursor: default;
        color: #000;
      }
    }

    @include e(row) {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    @include e(title) {
      font-weight: bold;
      padding-left: 8px;
    }

    // 列宽度定义
    @include e(col-1) {
      flex-grow: 1;
    }

    @include e(col-2) {
      width: 120px !important;
    }

    @include e(col-3) {
      width: 200px !important;
    }

    @include e(col-4) {
      width: 120px !important;
    }

    @include e(col-5) {
      width: 100px !important;
    }
  }
</style>

<style lang="less" scoped>
  .json-input.ant-input-affix-wrapper-disabled {
    background-color: rgba(0, 0, 0, 0.04);
    cursor: default;
    :deep(.ant-input-disabled) {
      cursor: default;
      color: #000;
    }
  }

  :deep(.json-select.ant-select-disabled) {
    .ant-select-selector {
      background-color: rgba(0, 0, 0, 0.04);
      cursor: default;
      color: #000;
    }
  }
</style>
