<template>
  <div class="p-label" :style="style">
    <div
      class="p-label_text"
      v-html="showText"
      :class="{ 'color-[#C3C3C3]': !props.text, 'is-empty': !props.text }"
      :data-placeholder="$t('sys.printDesigner.pleaseEnterRichText')"
    ></div>
  </div>
</template>
<script lang="ts" setup name="RICH_TEXT">
  import { computed, PropType } from 'vue';

  interface BorderItem {
    borderStyle: string;
    borderColor: string;
    borderWidth: number;
  }

  const props = defineProps({
    text: {
      type: String,
    },
    fontSize: {
      type: Number,
      // default: 18,
    },
    bgColor: {
      type: String,
    },
    borderTop: {
      type: Object as PropType<BorderItem>,
    },
    borderRight: {
      type: Object as PropType<BorderItem>,
    },
    borderBottom: {
      type: Object as PropType<BorderItem>,
    },
    borderLeft: {
      type: Object as PropType<BorderItem>,
    },
    borderTopLeftRadius: {
      type: Object as PropType<BorderItem>,
    },
    borderTopRightRadius: {
      type: Object as PropType<BorderItem>,
    },
    borderBottomLeftRadius: {
      type: Object as PropType<BorderItem>,
    },
    borderBottomRightRadius: {
      type: Object as PropType<BorderItem>,
    },
    type: {
      type: String,
    },
    label: {
      type: String,
    },
  });

  const showText = computed(() => {
    let text: any = '';
    if (props.type === 'VAR') {
      text = props.text ? props.label || props.text : '';
    } else {
      text = props.text;
    }
    return text;
  });

  const style = computed(() => {
    const obj: any = { fontSize: props.fontSize + 'px', backgroundColor: props.bgColor };
    if (props.borderTop) {
      obj.borderTop = `${props.borderTop.borderColor} ${props.borderTop.borderStyle} ${props.borderTop.borderWidth}px`;
    }
    if (props.borderRight) {
      obj.borderRight = `${props.borderRight.borderColor} ${props.borderRight.borderStyle} ${props.borderRight.borderWidth}px`;
    }
    if (props.borderBottom) {
      obj.borderBottom = `${props.borderBottom.borderColor} ${props.borderBottom.borderStyle} ${props.borderBottom.borderWidth}px`;
    }
    if (props.borderLeft) {
      obj.borderLeft = `${props.borderLeft.borderColor} ${props.borderLeft.borderStyle} ${props.borderLeft.borderWidth}px`;
    }
    obj.borderRadius = `${props.borderTopLeftRadius || '0'}px ${
      props.borderTopRightRadius || '0'
    }px ${props.borderBottomRightRadius || '0'}px ${props.borderBottomLeftRadius || '0'}px`;
    return obj;
  });
</script>

<style scoped lang="css">
  .p-label {
    box-sizing: border-box;

    /* display: table; */
    border: 1px dashed #e8ebf0;
    outline: none;

    /* overflow: hidden; */
    text-overflow: ellipsis;
    word-break: break-all; /* 任意字符处都可换行（包括单词中间） */
    overflow-wrap: break-word; /* 允许在单词内换行 */
  }

  .p-label_text {
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;

    /* height: 100%; */
    word-break: break-all; /* 任意字符处都可换行（包括单词中间） */
    overflow-wrap: break-word; /* 允许在单词内换行 */
  }

  .is-empty {
    &::before {
      content: attr(data-placeholder);
      width: 100%;
      height: 100%;
      color: #c3c3c3;
      font-size: 14px;
      pointer-events: none;
    }
  }
</style>
