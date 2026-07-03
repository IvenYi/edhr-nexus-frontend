<template>
  <div class="p-label" :style="style">
    <div
      v-if="!showEdit"
      class="p-label_text"
      v-html="formattedText"
      :class="{ 'is-empty': !showText }"
      :data-placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.text') })"
    ></div>
    <a-textarea
      v-model:value="showText"
      autoSize
      :maxlength="1000"
      :style="style"
      :placeholder="$t('sys.pleaseInputSth', { sth: $t('sys.text') })"
      v-else
    />
  </div>
</template>
<script lang="ts" setup name="TEXT">
  import { computed, PropType } from 'vue';
  import { useProp } from '../../hooks/useProp';
  import { useDesigner } from '../../hooks/useDesigner';

  const { selectedItem } = useProp();

  const { updateEgglement } = useDesigner();
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
      default: 18,
    },
    fontFamily: {
      type: String,
      default: '微软雅黑',
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
    isEdit: {
      type: Boolean,
    },
    styles: {
      type: Object,
    },
  });

  const showText = computed({
    get() {
      let text: any = '';
      if (props.type === 'VAR') {
        text = props.text ? props.label || props.text : '';
      } else {
        text = props.text;
      }
      return text;
    },
    set(v) {
      updateEgglement({
        egglement: selectedItem.value,
        attrs: {
          ...selectedItem.value.attrs,
          text: {
            ...selectedItem.value.attrs.text,
            value: v,
          },
        },
      });
    },
  });

  const formattedText = computed(() => {
    return showText.value.replace(/\n/g, '<br>');
  });

  const showEdit = computed(() => {
    return props.isEdit;
  });

  const style = computed(() => {
    const obj: any = {
      fontSize: props.fontSize + 'px',
      backgroundColor: props.bgColor,
      fontFamily: props.fontFamily,
      lineHeight: Math.round(props.fontSize * 1.5) + 'px',
    };
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
    if (props.styles['text-decoration']) {
      obj.textDecoration = props.styles['text-decoration'];
    }
    if (props.styles['text-align']) {
      obj.textAlign = props.styles['text-align'];
    }

    if (props.styles['font-weight']) {
      obj.fontWeight = props.styles['font-weight'];
    }
    if (props.styles['font-style']) {
      obj.fontStyle = props.styles['font-style'];
    }
    return obj;
  });
</script>

<style scoped lang="css">
  .p-label {
    box-sizing: border-box;

    /* display: table; */
    width: 100%;
    border: 1px dashed #e8ebf0;
    outline: none;

    /* overflow: hidden; */
    text-overflow: ellipsis;
    word-break: break-all; /* 任意字符处都可换行（包括单词中间） */
    overflow-wrap: break-word; /* 允许在单词内换行 */
  }

  .p-label_text {
    box-sizing: border-box;
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

  :deep(.ant-input) {
    padding: 0;
  }
</style>
