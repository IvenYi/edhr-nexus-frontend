<template>
  <div class="inline-block align-middle">
    <a-button
      @click="clickEvent"
      :size="size"
      :type="type"
      :danger="danger"
      :loading="loading"
      :block="block"
      :disabled="disabled"
      :class="[
        enableCustomColor && fontColor ? 'btn-font-color' : '',
        enableCustomColor && backgroundColor ? 'btn-bg-style' : '',
        { square: buttonStyle === ButtonStyle.SQUARE },
      ]"
      :title="buttonTitle"
    >
      <template #icon>
        <IconNext
          v-if="hasIcon"
          :size="buttonStyle === ButtonStyle.SQUARE ? 20 : 16"
          :value="icon"
          :style="{
            '--color': 'inherit',
            lineHeight: '1',
            verticalAlign: getVertivalAlign,
          }"
        />
        <div
          v-if="icon && hasText"
          :class="{
            'h-6px':
              hasIcon && hasText && buttonStyle === ButtonStyle.SQUARE && size !== ButtonSize.SMALL,
            'h-4px':
              hasIcon && hasText && buttonStyle === ButtonStyle.SQUARE && size === ButtonSize.SMALL,
            'w-6px':
              hasIcon &&
              hasText &&
              buttonStyle === ButtonStyle.ORDINARY &&
              size !== ButtonSize.SMALL,
            'w-4px':
              hasIcon &&
              hasText &&
              buttonStyle === ButtonStyle.ORDINARY &&
              size === ButtonSize.SMALL,
          }"
        ></div>
      </template>
      <!-- {{ hasText ? (i18nConfig ? $t(JSON.parse(i18nConfig)) : title) : '' }} -->
      <span v-if="hasText" class="btn-title gct-text-overflow whitespace-nowrap">
        <!-- :class="[
          { 'gct-text-overflow': hasText && hasIcon },
          { 'gct-text-overflow-2': hasText && !hasIcon },
        ]" -->
        {{ hasText ? buttonTitle : '' }}
      </span>
    </a-button>
  </div>
</template>
<script setup lang="ts">
  import { computed, onMounted, reactive } from 'vue';
  import { IconNext } from '/@/components/Icon';
  import { ButtonStyle, ButtonSize } from '/@page-designer/enum';
  import { Modal } from 'ant-design-vue';
  import { debounce } from 'lodash-es';
  import { BaseButton } from '/@page-designer/types/web';

  const props = defineProps({
    block: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'default',
    },
    icon: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    hasIcon: {
      type: Boolean,
      default: false,
    },
    hasText: {
      type: Boolean,
      default: true,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    buttonStyle: {
      type: String as PropType<ButtonStyle>,
      default: '',
    },
    i18nConfig: {
      type: String,
      default: '',
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    confirm: {
      type: Boolean,
      default: false,
    },
    confirmText: {
      type: String,
      default: '',
    },
    enableCustomColor: {
      type: Boolean,
      default: false,
    },
    backgroundColor: {
      type: String,
      default: '',
    },
    fontColor: {
      type: String,
      default: '',
    },
    widget: {
      type: Object as PropType<BaseButton>,
    },
  });
  const emit = defineEmits(['click']);
  const getVertivalAlign = computed(() => {
    if (!props.hasText) return 'text-top';
    else return 'text-top';
  });
  const isAppRun = /\/web-render|\/web\/|web-single\/|dev-single\/|test-single\//.test(
    location.pathname,
  );

  const debonceClick = debounce(function () {
    emit('click');
  }, 300);

  const clickEvent = async (evt) => {
    // 移除按钮的focus状态
    let target = evt.target;
    if (target.nodeName == 'SPAN') {
      target = evt.target.parentNode;
    }
    target.blur();
    if (props.confirm && isAppRun) {
      await new Promise((res, rej) => {
        Modal.confirm({
          content: props.confirmText || $t('sys.pageDesigner.confirmTodo'),
          onOk() {
            res('onOk');
          },
          onCancel() {
            rej('onCancel');
          },
        });
      });
      emit('click');
      return;
    }
    debonceClick();
  };

  const comWidget = reactive(props.widget as BaseButton);
  onMounted(() => {
    /**应用国际化 */
    if (comWidget && comWidget.i18n && isAppRun) {
      let i18n = comWidget.i18n;
      for (let k in i18n) {
        let i18nKey = i18n[k];
        i18nKey && (comWidget.props[k] = window.$t(i18nKey));
      }
    }
  });

  const buttonTitle = computed(
    () => props.title || $t(props.widget?.displayName || props.widget?.name || ''),
  );
</script>
<style scoped lang="less">
  .ant-btn {
    display: flex;
    align-items: center;
    justify-content: center;

    &.btn-font-color {
      color: v-bind('props.fontColor') !important;
    }

    &.btn-bg-style {
      border-color: v-bind('props.backgroundColor') !important;
      background: v-bind(
        "props.type === 'primary' ? props.backgroundColor : 'transparent'"
      ) !important;
    }
  }

  .square {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    padding: 0;
    border-radius: 4px;

    .icon-next {
      margin: 0 !important;
    }

    .btn-title {
      width: inherit;
      padding: 0 8px;
    }

    &.ant-btn-sm {
      width: 72px;
      height: 64px;
      font-size: 14px;

      .btn-title {
        padding: 0 4px;
      }
    }

    &.ant-btn-lg {
      width: 80px;
      height: 88px;
    }
  }

  .squaref {
    min-width: 72px;
    height: 56px;
    padding: 0;
  }

  .line {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.group .ant-btn) {
    height: 100%;
  }

  :deep(.ant-btn-loading-icon) {
    width: 0;
    height: 0;
    line-height: 0;
  }

  :deep(.ant-btn-icon-only) {
    vertical-align: -2px;
  }

  .gct-text-overflow-2 {
    display: -webkit-inline-box;
    display: -moz-inline-box;
    display: inline-flexbox;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    -moz-box-orient: vertical;
    box-orient: 2;
  }
</style>
