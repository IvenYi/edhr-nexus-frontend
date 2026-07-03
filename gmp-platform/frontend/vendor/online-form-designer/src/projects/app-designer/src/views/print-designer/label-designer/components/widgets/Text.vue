<template>
  <div class="p-label">
    <div class="p-label_text" v-text="showText" :style="style"></div>
  </div>
</template>
<script lang="ts" setup name="TEXT">
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
      default: 18,
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
    return obj;
  });
</script>

<style scoped lang="css">
  .p-label {
    overflow: hidden;
    text-overflow: ellipsis;
    outline: none;
    display: table;
    border: 1px dashed #e8ebf0;
  }

  .p-label_text {
    width: 100%;
    display: table-cell;
    vertical-align: inherit;
  }
</style>
