<template>
  <div v-if="text">
    <van-field v-model="showText" autosize type="textarea" :readonly="true" style="padding: 0">
      <template #input>
        <span style="display: inline-block; width: 100%" :style="style"> {{ showText }}</span>
      </template>
    </van-field>
  </div>
</template>
<script setup lang="ts" name="text-render">
  import { toRefs, computed } from 'vue';
  import { Text } from '/@page-designer/types/web';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;
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
      paddingTop: (styleProp.paddingTop ? styleProp.paddingTop + 7 : 7) + 'px',
      paddingBottom: (styleProp.paddingBottom ? styleProp.paddingBottom + 7 : 7) + 'px',
      paddingLeft: (styleProp.paddingLeft ? styleProp.paddingLeft + 16 : 16) + 'px',
      paddingRight: (styleProp.paddingRight ? styleProp.paddingRight + 16 : 16) + 'px',
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
<style lang="less" scoped>
  :deep(.van-cell) {
    background: transparent;
  }
</style>
