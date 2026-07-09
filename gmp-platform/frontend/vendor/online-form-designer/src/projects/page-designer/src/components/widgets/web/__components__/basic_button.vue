<template>
  <div class="inline-block align-middle">
    <div
      class="inline-block ant-btn-group"
      v-if="dropdown"
      :class="buttonStyle === buttonEnum.SQUARE ? 'squaref group' : ''"
    >
      <a-button
        :class="getButtonClass"
        :disabled="disabled"
        :type="buttonType"
        ant-click-animating-without-extra-node="false"
      >
        <template #default>
          <IconNext
            class="align-middle"
            :value="icon"
            v-if="icon"
            :size="buttonStyle === buttonEnum.SQUARE ? 20 : 14"
            :color="iconColor"
          />
          <div
            v-if="icon"
            :class="{
              'inline-block w2px': buttonStyle === buttonEnum.ORDINARY,
              'h-4px': buttonStyle === buttonEnum.SQUARE,
            }"
          ></div>
          <span class="align-middle leading-none"> <slot></slot></span>
        </template>
      </a-button>
      <a-button
        :disabled="disabled"
        :type="buttonType"
        :class="getDropdownClass"
        @click.stop="handel"
      >
        <template #icon>
          <slot name="icon"></slot>
        </template>
      </a-button>
    </div>
    <a-button v-else :disabled="disabled" :type="buttonType" :class="getButtonClass">
      <template #default>
        <IconNext
          class="align-middle"
          :value="icon"
          v-if="icon"
          :size="buttonStyle === buttonEnum.SQUARE ? 20 : 14"
          :color="iconColor"
        />
        <div
          v-if="icon"
          :class="{
            'inline-block w3px': buttonStyle === buttonEnum.ORDINARY,
            'h-4px': buttonStyle === buttonEnum.SQUARE,
          }"
        ></div>
        <span class="align-middle leading-none"> <slot></slot></span>
      </template>
    </a-button>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { PropType } from 'vue';
  import { ButtonStyle as buttonEnum, ButtonColorType } from '/@page-designer/enum';
  import { IconNext } from '/@/components/Icon';

  const emit = defineEmits(['dropdown']);

  const props = defineProps({
    buttonType: { type: String as PropType<ButtonColorType>, default: '' },
    buttonTheme: { type: String, default: '' },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: '',
    },
    iconColor: { type: String, default: '' },
    buttonStyle: { type: String as PropType<buttonEnum>, default: '' },
    dropdown: {
      type: Boolean,
      default: false,
    },
  });
  const getButtonClass = computed(() => {
    const { buttonTheme, buttonStyle } = props;
    const className = [`ant-btn-${buttonTheme}`];
    if (buttonStyle === buttonEnum.SQUARE) {
      className.push('square');
    } else {
      className.push('line');
    }
    return className;
  });
  const getDropdownClass = computed(() => {
    const { buttonTheme } = props;
    return `ant-btn-${buttonTheme}`;
  });
  function handel() {
    emit('dropdown');
  }
</script>
<style scoped lang="less">
  .square {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 72px;
    height: 72px;
    padding: 0;
  }

  .squaref {
    min-width: 72px;
    height: 72px;
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
    height: 0;
  }
</style>
