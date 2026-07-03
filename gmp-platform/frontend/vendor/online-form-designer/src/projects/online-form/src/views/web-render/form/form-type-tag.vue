<template>
  <span class="flex items-center" :class="[ns.b(), ns.m(styleType)]" :style="styleVars">
    <template v-if="styleType === 'default'">
      <img :src="svgUtils[value]" class="w18px h18px mr-4px" />
      {{ $t(`sys.onlineForm.formTypeEnum.${value}`) }}
    </template>
    <template v-else>
      {{ calcShortText($t(`sys.onlineForm.formTypeEnum.${value}`)) }}
    </template>
  </span>
</template>

<script lang="ts" setup name="form-type-tag">
  import { useNamespace } from '@gct/runtime';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormTypeEnum } from '@gct/nocode-base';
  import ViewOnlineForm from '/@web-render/assets/svg/view-online-form.svg';
  import TextOnlineForm from '/@web-render/assets/svg/text-online-form.svg';
  import ProccessOnlineForm from '/@web-render/assets/svg/proccess-online-form.svg';
  import BaseOnlineForm from '/@web-render/assets/svg/base-online-form.svg';
  import FileOnlineForm from '/@web-render/assets/svg/file-online-form.svg';
  import { computed } from 'vue';

  const { t } = useI18n();
  const ns = useNamespace('form-type-tag');

  const svgUtils = {
    [FormTypeEnum.TEXT]: TextOnlineForm,
    [FormTypeEnum.BASE]: BaseOnlineForm,
    [FormTypeEnum.PROCESS]: ProccessOnlineForm,
    [FormTypeEnum.VIEW]: ViewOnlineForm,
    [FormTypeEnum.FILE]: FileOnlineForm,
  };

  const props = withDefaults(
    defineProps<{
      value: FormTypeEnum;
      /** 样式显示的类型 */
      styleType?: 'default' | 'text-only';
    }>(),
    {
      styleType: 'default',
    },
  );

  const calcShortText = (text: string) => {
    return text.replace($t('sys.form'), '');
  };

  const Type2color = {
    [FormTypeEnum.TEXT]: '#39d58e',
    [FormTypeEnum.BASE]: '#51a2fc',
    [FormTypeEnum.PROCESS]: '#ffaf50',
    [FormTypeEnum.VIEW]: '#ff808c',
    [FormTypeEnum.FILE]: '#AC96FF',
  };

  const styleVars = computed(() => {
    return ns.cssVarBlock({
      'bg-color': Type2color[props.value],
    });
  });
</script>

<style lang="scss" scoped>
  $form-type-tag: (
    bg-color: grey,
  );

  @include b(form-type-tag) {
    @include set-component-css-var(form-type-tag, $form-type-tag);

    @include m(text-only) {
      display: block;
      background-color: getCssVar(form-type-tag, bg-color);
      padding: 2px 4px;
      color: white;
      font-size: 12px;
    }
  }
</style>
