<template>
  <div v-if="text">
    <a-textarea
      v-model:value="showText"
      :style="style"
      :autosize="true"
      :bordered="false"
      readonly
    />
  </div>
</template>
<script setup lang="ts" name="text-render">
  import { toRefs, computed } from 'vue';
  import { Text } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps<{ widget: Text }>();
  const { text } = toRefs(defProps.widget.props);

  const showText = computed(() => {
    if (defProps.widget.i18n && JSON.stringify(defProps.widget.i18n) !== '{}') {
      const i18n = defProps.widget.i18n ?? {};
      return t(i18n.text);
    }
    return text.value;
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
      borderLeft: `${styleProp.borderLeft?.borderWidth || 0}px ${
        styleProp.borderLeft?.borderStyle
      } ${styleProp.borderLeft?.borderColor} !important`,
      borderRight: `${styleProp.borderRight?.borderWidth || 0}px ${
        styleProp.borderRight?.borderStyle
      } ${styleProp.borderRight?.borderColor} !important`,
      borderBottom: `${styleProp.borderBottom?.borderWidth || 0}px ${
        styleProp.borderBottom?.borderStyle
      } ${styleProp.borderBottom?.borderColor} !important`,
      borderTop: `${styleProp.borderTop?.borderWidth || 0}px ${styleProp.borderTop?.borderStyle} ${
        styleProp.borderTop?.borderColor
      } !important`,
      borderTopRightRadius: `${styleProp.borderTopRightRadius}px !important`,
      borderTopLeftRadius: `${styleProp.borderTopLeftRadius}px !important`,
      borderBottomRightRadius: `${styleProp.borderBottomRightRadius}px !important`,
      borderBottomLeftRadius: `${styleProp.borderBottomLeftRadius}px !important`,
      backgroundColor: styleProp.backgroundColor,
    };
  });
</script>
<style lang="less" scoped></style>
