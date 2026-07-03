<template>
  <I18nSelectTextarea
    v-model:i18nText="text"
    v-model:i18nConfig="i18n"
    :placeholderText="$t('sys.pageDesigner.pleaseInputText')"
    :style="style"
    attr="text"
    :inputExtraProps="{
      autosize: true,
    }"
    @on-i18n-select="handleI18nSelect"
  />
</template>
<script setup lang="ts" name="gct-text">
  import { toRefs, computed } from 'vue';
  import { Text } from '/@page-designer/types/web';
  import { I18nSelectTextarea } from '/@/components/I18nSelect';
  import { isEmpty, omit } from 'lodash-es';

  const defProps = defineProps<{ widget: Text }>();
  const { text } = toRefs(defProps.widget.props);

  const i18n = computed(() => {
    return JSON.stringify(defProps.widget.i18n ?? {});
  });

  const style = computed(() => {
    const styleProp = defProps.widget.style;
    return {
      wordBreak: 'break-word',
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
      fontWeight: styleProp.contentFont?.bold ? 'bold' : 'normal',
      fontStyle: styleProp.contentFont?.italic ? 'italic' : 'normal',
      fontSize: (styleProp.contentFont?.fontSize || 14) + 'px',
      textDecoration: styleProp.contentFont?.textDecoration || 'normal',
      color: styleProp.contentFont?.color || 'rgba(0,0,0,.85)',
      paddingTop: (styleProp.paddingTop || 0) + 'px',
      paddingBottom: (styleProp.paddingBottom || 0) + 'px',
      paddingLeft: (styleProp.paddingLeft || 0) + 'px',
      paddingRight: (styleProp.paddingRight || 0) + 'px',
      borderLeft: `${styleProp.borderLeft?.borderWidth}px ${styleProp.borderLeft?.borderStyle} ${styleProp.borderLeft?.borderColor} !important`,
      borderRight: `${styleProp.borderRight?.borderWidth}px ${styleProp.borderRight?.borderStyle} ${styleProp.borderRight?.borderColor} !important`,
      borderBottom: `${styleProp.borderBottom?.borderWidth}px ${styleProp.borderBottom?.borderStyle} ${styleProp.borderBottom?.borderColor} !important`,
      borderTop: `${styleProp.borderTop?.borderWidth}px ${styleProp.borderTop?.borderStyle} ${styleProp.borderTop?.borderColor} !important`,
      borderTopRightRadius: `${styleProp.borderTopRightRadius}px !important`,
      borderTopLeftRadius: `${styleProp.borderTopLeftRadius}px !important`,
      borderBottomRightRadius: `${styleProp.borderBottomRightRadius}px !important`,
      borderBottomLeftRadius: `${styleProp.borderBottomLeftRadius}px !important`,
      backgroundColor: styleProp.backgroundColor,
    };
  });

  const handleI18nSelect = (params) => {
    if (isEmpty(params)) {
      // eslint-disable-next-line vue/no-mutating-props
      defProps.widget.i18n = omit(defProps.widget.i18n, 'text');
    } else {
      // eslint-disable-next-line vue/no-mutating-props
      defProps.widget.i18n = { ...defProps.widget.i18n, text: params.i18nKey };
    }
  };
</script>
<style lang="less" scoped></style>
