<template>
  <div :class="ns.b()">
    <div :class="ns.e('row')">
      <div :class="[ns.e('col-1'), ns.e('title')]">
        {{ t('sys.keyOfSth', { sth: t('sys.field') }) }}
        <a-button :class="[ns.e('import-btn')]" v-if="enableImport && !readonly" @click="onImport"
          >{{ $t('sys.ipaas.importJson') }}</a-button
        >
      </div>
      <div :class="[ns.e('col-2'), ns.e('title')]"> {{ t('sys.type') }} </div>
      <div :class="[ns.e('col-3'), ns.e('title')]"> {{ t('sys.pageDesigner.required') }} </div>
      <div :class="[ns.e('col-4'), ns.e('title')]"> {{ t('sys.pageDesigner.fieldDesc') }} </div>
      <div v-show="!readonly" :class="[ns.e('col-5'), ns.e('title')]">
        {{ t('sys.operation') }}
      </div>
    </div>
    <JsonParamTree :class="[ns.e('tree')]" :value="value">
      <template #default="{ param, level, parent, index }">
        <div :class="[ns.e('row')]">
          <div :class="[ns.e('col-1'), 'flex']">
            <NodeIndent :param="param" :level="level" />
            <a-input
              class="flex-grow-1"
              :value="parent?.type === AuthKeyTypeEnum.Array ? t('sys.ipaas.arrayItem') : param.key"
              @update:value="(val) => (param.key = val)"
              :placeholder="
                t('sys.inputTextTip', { name: t('sys.keyOfSth', { sth: t('sys.field') }) })
              "
              :disabled="readonly || level === 0 || parent?.type === AuthKeyTypeEnum.Array"
            />
          </div>
          <TypeSelect
            :class="[ns.e('col-2')]"
            v-model:value="param.type"
            @change="(type) => handleValueTypeChange(param, type)"
            :available-types="level === 0 ? rootTypes : nodeTypes"
            :disabled="readonly"
          />
          <div :class="[ns.e('col-3'), 'flex justify-center items-center']">
            <a-checkbox
              v-if="level !== 0"
              class="mr-auto"
              v-model:checked="param.required"
              :disabled="readonly || parent?.type === AuthKeyTypeEnum.Array"
            />
          </div>
          <div :class="[ns.e('col-4')]">
            <a-input
              v-if="level !== 0"
              v-model:value="param.description"
              :placeholder="t('sys.pleaseInputSth', { sth: t('sys.pageDesigner.fieldDesc') })"
              :disabled="readonly || parent?.type === AuthKeyTypeEnum.Array"
            />
          </div>
          <NodeAction
            v-show="!readonly"
            :class="[ns.e('col-5')]"
            :param="param"
            :parent="parent"
            :index="index"
          />
        </div>
      </template>
    </JsonParamTree>
  </div>
</template>

<script lang="ts" setup name="json-param-editor">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import JsonParamTree from './json-param-tree/json-param-tree';
  import { ITreeJsonParam } from './types';
  import { computed } from 'vue';
  import { AuthKeyTypeEnum, ParameterPosition } from '/@ipaas/enums';
  import TypeSelect from './editor/type-select.vue';
  import NodeIndent from './editor/node-indent.vue';
  import NodeAction from './editor/node-action.vue';
  import { importParamDesc } from './import';

  const { t } = useI18n();
  const ns = useNamespace('json-param-editor');

  const props = withDefaults(
    defineProps<{
      value: ITreeJsonParam;
      position?: ParameterPosition;
      readonly?: boolean;
      enableImport?: boolean;
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
    return Object.values(AuthKeyTypeEnum).filter(
      (i) => ![AuthKeyTypeEnum.Object, AuthKeyTypeEnum.Array].includes(i),
    );
  });

  const handleValueTypeChange = (item: ITreeJsonParam, type) => {
    // 值类型变更的时候清空子集合
    item.children = undefined;
    if (type === AuthKeyTypeEnum.Array) {
      console.log('handleValueTypeChange', type, item);
      item.children = [
        {
          type: AuthKeyTypeEnum.String,
        },
      ];
    }
  };

  const onImport = async () => {
    const res = await importParamDesc();
    if (res.ok && res.data) {
      Object.assign(props.value, {}, res.data);
    }
  };
</script>

<style lang="scss" scoped>
  $json-param-editor: ();

  @include b(json-param-editor) {
    @include set-component-css-var(json-param-editor, $json-param-editor);

    @include e(row) {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    @include e(title) {
      padding-left: 8px;
      font-weight: bold;
    }

    // 列宽度定义
    @include e(col-1) {
      flex-grow: 1;
    }

    @include e(col-2) {
      flex-shrink: 0;
      width: 100px !important;
    }

    @include e(col-3) {
      flex-shrink: 0;
      width: 40px;
    }

    @include e(col-4) {
      flex-shrink: 0;
      width: 200px;
    }

    @include e(col-5) {
      flex-shrink: 0;
      width: 90px !important;
    }

    @include e(import-btn) {
      margin-left: 10px;
    }

    padding-right: 8px;
  }
</style>
