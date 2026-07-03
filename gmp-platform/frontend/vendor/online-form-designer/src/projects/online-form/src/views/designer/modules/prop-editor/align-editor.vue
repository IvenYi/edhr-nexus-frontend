<template>
  <div class="align-group-box">
    <div
      v-for="item in opts[type]"
      :key="item.value"
      class="icon-box"
      :class="values.includes(item.value) ? 'selected' : null"
      @click="changeValue(item.value, item)"
    >
      <a-tooltip>
        <template #title>{{ item.label }}</template>
        <span class="iconfont" :class="item.icon"></span>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    /** 类型 */
    type: 'horizontal' | 'vertical' | 'fontStyle';
    /** 值 */
    value: string | object;
    disabled?: boolean;
  }>();

  const emit = defineEmits(['update:value']);

  const opts = {
    horizontal: [
      {
        label: $t('sys.pageDesigner.leftAlign'),
        value: 'flex-start',
        icon: 'icon-zuoduiqi2',
      },
      {
        label: $t('sys.platform.center'),
        value: 'center',
        icon: 'icon-juzhong',
      },
      {
        label: $t('sys.pageDesigner.rightAlign'),
        value: 'flex-end',
        icon: 'icon-youduiqi2',
      },
    ],
    vertical: [
      {
        label: $t('sys.onlineForm.topAlign'),
        value: 'flex-start',
        icon: 'icon-dingduanduiqi',
      },
      {
        label: $t('sys.platform.center'),
        value: 'center',
        icon: 'icon-juzhong1',
      },
      {
        label: $t('sys.onlineForm.bottomAlign'),
        value: 'flex-end',
        icon: 'icon-diduanduiqi',
      },
    ],
    fontStyle: [
      {
        label: $t('sys.pageDesigner.bold'),
        value: 'bold',
        attr: 'fontWeight',
        icon: 'icon-Bold',
      },
      {
        label: $t('sys.pageDesigner.italic'),
        value: 'italic',
        attr: 'fontStyle',
        icon: 'icon-Italic',
      },
      {
        label: $t('sys.pageDesigner.underline'),
        value: 'underline',
        attr: 'textDecoration',
        icon: 'icon-Underline',
      },
      {
        label: $t('sys.pageDesigner.linethrough'),
        value: 'line-through',
        attr: 'textDecoration',
        icon: 'icon-Strikethrough',
      },
    ],
  };

  const values = computed(() => {
    if (props.type === 'fontStyle') {
      return Object.values(props.value);
    }
    return [props.value];
  });

  const changeValue = (val, item) => {
    if (props.disabled) return;
    if (props.type === 'fontStyle') {
      emit('update:value', item.attr, val);
    } else {
      emit('update:value', val);
    }
  };
</script>

<style scoped>
  .icon-box {
    flex: 1;
    height: 22px;
    line-height: 22px;
    text-align: center;
    cursor: pointer;
    border-radius: 2px;

    .iconfont {
      padding: 3px 4px;
      border-radius: 2px;
    }

    &:not(&.selected) {
      .iconfont {
        &:hover {
          background-color: #e6e9ef;
        }
      }
    }
  }

  .selected {
    background-color: #ffffff;
  }

  .align-group-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 26px;
    background-color: #f2f4f7;
    border-radius: 4px;
    padding: 2px;
  }
</style>
