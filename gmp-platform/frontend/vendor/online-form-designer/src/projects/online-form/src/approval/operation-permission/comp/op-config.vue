<template>
  <div :class="[ns.b()]">
    <div :class="[ns.e('title')]">{{ t('sys.appDesigner.approval.visibleButton') }}</div>
    <div :class="[ns.e('label')]">{{ t('sys.appDesigner.approval.builtinButton') }}</div>
    <template v-for="(item, i) in builtinButtons" :key="item.operate">
      <OpEditor
        :class="ns.e('item')"
        :value="builtinButtons[i]"
        :op-label="getOpLabel(item.type as any)"
        @config="configButtonStyle"
        :showOpinionConfig="showOpinionConfig"
      />
    </template>
    <template v-if="isShowCustomBtn">
      <div :class="[ns.e('label'), 'mt-8px']">{{ t('sys.appDesigner.approval.customButton') }}</div>
      <template v-for="item in customButtons" :key="item.operate">
        <CustomOpEditor
          :class="ns.e('item')"
          :value="item"
          :disabledFlowActions="disabledFlowActions"
          @remove="removeCustomButton"
          @config="configButtonStyle"
          :showOpinionConfig="showOpinionConfig"
        />
      </template>
      <a-button
        v-if="!bpmnReadonly"
        :class="[ns.e('add-btn')]"
        type="primary"
        ghost
        @click="addCustomButton"
        >{{ t('sys.add') + t('sys.appDesigner.approval.customButton') }}</a-button
      >
    </template>
  </div>
</template>

<script lang="ts" setup name="op-config">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { OperatePermissionConfig } from '../types';
  import OpEditor from '../ui/op-editor.vue';
  import CustomOpEditor from '../ui/custom-op-editor.vue';
  import {
    ButtonFlowAction,
    ButtonTypeEnum,
    SignatureTypeEnum,
  } from '@gct/flow/src/plugins/bpmn/enums';
  import { computed, inject } from 'vue';
  import { openButtonStyleModal } from '../logic';

  const bpmnReadonly = inject('bpmnReadonly', false);

  const ns = useNamespace('op-config');
  const { t } = useI18n() as any;

  const props = withDefaults(
    defineProps<{
      value?: OperatePermissionConfig[];
      editOps: Array<{
        operate: ButtonTypeEnum;
        label: string;
      }>;
      isShowCustomBtn: boolean;
      disabledFlowActions?: ButtonFlowAction[];
      showOpinionConfig?: boolean;
      noControlConfig?: boolean;
    }>(),
    {
      isShowCustomBtn: true,
      showOpinionConfig: false,
    },
  );

  const getOpLabel = (type: ButtonTypeEnum) => {
    return props.editOps.find((i) => i.operate === type)!.label;
  };

  const emit = defineEmits<{
    (e: 'update:value', value: OperatePermissionConfig[]): void;
  }>();

  const builtinButtons = computed(() => {
    return props.editOps
      .map((item) => {
        const find = props.value?.find((i) => i.type === item.operate);
        return find;
      })
      .filter(Boolean);
  });

  const customButtons = computed(() => {
    return props.value?.filter((i) => !!i.isCustom) || [];
  });

  const addCustomButton = () => {
    const cloneArr = [...props.value!];
    cloneArr.push({
      type: '',
      enable: true,
      isCustom: true,
      signatureType: SignatureTypeEnum.None,
    });
    emit('update:value', cloneArr);
  };

  // 删除自定义按钮
  const removeCustomButton = (item: OperatePermissionConfig) => {
    const cloneArr = [...props.value!];
    const index = cloneArr.findIndex((i) => i === item);
    cloneArr.splice(index, 1);
    emit('update:value', cloneArr);
  };

  const configButtonStyle = async (item: OperatePermissionConfig) => {
    const style = await openButtonStyleModal({...item, noControl: props.noControlConfig});
    if (style) {
      Object.assign(item, { style });
    }
  };
</script>

<style lang="scss" scoped>
  $op-config: (
    height: auto,
  );

  @include b(op-config) {
    @include set-component-css-var(op-config, $op-config);
    height: getCssVar(op-config, height);

    @include e(item) {
      margin-bottom: 4px;
    }

    @include e(add-btn) {
      width: 100%;
      &.ant-btn {
        font-size: 12px;
      }
    }

    @include e(label) {
      font-size: 12px;
      color: #797a7d;
      line-height: 18px;
      margin-bottom: 2px;
    }

    @include e(title) {
      margin-bottom: 12px;
      font-size: 12px;
      color: #252525;
      line-height: 18px;
    }
  }
</style>
