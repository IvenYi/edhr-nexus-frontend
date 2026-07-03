<template>
  <a-switch
    :class="[ns.b()]"
    v-model:checked="fieldValue"
    :disabled="disabled"
    @change="onChangeOperatingState"
  />
</template>

<script lang="ts" setup name="control-status-tag">
  import { computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { debounce } from 'lodash-es';
  import { message as Message } from 'ant-design-vue';
  import { putEdhrTmplUpdateOperatingStateById } from '/@/apis/gct-apaas/EdhrTmplController';
  import { putOnlineFormTmplUpdateOperatingStateById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { FormRelateDTO } from '/@/apis/gct-apaas/model';
  import {
    ApprovalControlStatusEnum,
    ControlStatusEnum,
  } from '/@/projects/app-designer/src/views/online-form/constants';
  import { isEnableDocControl } from '../../hooks/useControl';

  const enableDocControl = isEnableDocControl();

  const ns = useNamespace('operating-state');

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      value: boolean;
      rowData: FormRelateDTO | any;
      modelKey?: string;
    }>(),
    {
      value: false,
      modelKey: 'em_form_tmpl',
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: boolean): void;
  }>();

  const fieldValue = computed(() => props.value);

  const disabled = computed(() => {
    if (enableDocControl) {
      // 开启审核（文控）后，默认版本不允许禁用
      if (!!props.rowData.default && !!fieldValue.value) {
        return true;
      }

      // 审核通过后才允许切换状态
      return (
        props.rowData.approveStatus !== ApprovalControlStatusEnum.EFFECTIVE ||
        props.rowData.controlStatus !== ControlStatusEnum.CONTROLLED
      );
    }
    return false;
  });

  const handleOperatingStateChange = async () => {
    const updateApi =
      props.modelKey === 'em_form_tmpl'
        ? putOnlineFormTmplUpdateOperatingStateById
        : putEdhrTmplUpdateOperatingStateById;

    const operatingState = !fieldValue.value;

    try {
      await updateApi(
        {
          id: props.rowData.id,
        },
        {
          operatingState,
        },
      );

      Message.success(
        t('sys.edhr.successOfSth', {
          sth: operatingState
            ? t('sys.appDesigner.fieldEnable')
            : t('sys.appDesigner.fieldUnEnable'),
        }),
      );
      emit('update:value', operatingState);
    } catch (error) {
      console.error(error);
      Message.error(
        t('sys.edhr.failOfSth', {
          sth: operatingState
            ? t('sys.appDesigner.fieldEnable')
            : t('sys.appDesigner.fieldUnEnable'),
        }),
      );
    }
  };
  const onChangeOperatingState = debounce(handleOperatingStateChange, 500);
</script>

<style lang="scss" scoped>
  $operating-state: ();

  @include b(operating-state) {
    @include set-component-css-var(operating-state, $operating-state);
  }
</style>
