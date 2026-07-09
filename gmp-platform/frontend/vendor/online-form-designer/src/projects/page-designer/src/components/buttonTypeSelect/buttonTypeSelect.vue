<template>
  <a-select
    ref="selectRef"
    id="button-type-select"
    v-model:value="selectedVal"
    optionLabelProp="showTitle"
    @change="handleSelectedChange"
    :options="options"
    :size="size"
    :open="open"
    :dropdownMatchSelectWidth="false"
    :listHeight="265"
    :getPopupContainer="getPopupContainer"
    @click="open = !open"
  >
    <template #dropdownRender="{ menuNode: menu }">
      <div class="dropDownRender">
        <a-tabs v-model:activeKey="activeTab" centered @change="handleTabChange">
          <a-tab-pane
            v-for="e in ButtonTypeGroup"
            :key="e"
            :tab="t(`sys.pageDesigner.button_${e}`)"
          >
            <v-nodes :vnodes="menu" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </template>
    <template #option="option">
      <a-button :type="option.type" :danger="Boolean(option.danger)" class="option-btn">
        <template #icon>
          <span v-if="Boolean(option.hasIcon)" class="iconfont icon-icon"></span>
        </template>
        {{ Boolean(option.hasText) ? t(`${option.label}`) : '' }}
      </a-button>
    </template>
    <template #menuItemSelectedIcon>
      <check-outlined style="line-height: 32px" />
    </template>
  </a-select>
</template>
<script setup lang="ts" name="button-type-editor">
  import { ButtonTypeGroup, ButtonGroupType, ButtonType } from '/@page-designer/enum';
  import { useI18n } from 'vue-i18n';
  import { ref, computed, h } from 'vue';
  import { Button } from 'ant-design-vue';
  import { onClickOutside } from '@vueuse/core';

  const VNodes = (_, options) => {
    return options.attrs.vnodes;
  };
  const emit = defineEmits([
    'update:hasText',
    'update:hasIcon',
    'update:type',
    'update:danger',
    'change',
  ]);
  const { t } = useI18n();
  const selectRef = ref();
  const open = ref(false);
  const defProps = defineProps({
    hasText: {
      type: Boolean,
      default: true,
    },
    hasIcon: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: ButtonType.PRIMARY,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    // 暂时不用
    icon: {
      type: String,
      default: 'icon-park:all-application',
    },
    size: {
      type: String,
      default: 'default',
    },
  });

  const activeTab = computed(() => {
    if (defProps.hasIcon && defProps.hasText) return ButtonTypeGroup.ICON_TEXT;
    else if (defProps.hasIcon) return ButtonTypeGroup.ICON;
    else return ButtonTypeGroup.TEXT;
  });

  const selectedVal = computed({
    get() {
      return ButtonGroupType[activeTab.value].findIndex(
        (e) => e.type === defProps.type && Boolean(e.danger) === Boolean(defProps.danger),
      );
    },
    set(val) {
      emit('update:type', options.value[val].type);
      emit('update:danger', Boolean(options.value[val].danger));
    },
  });

  const options = computed(() => {
    return ButtonGroupType[activeTab.value || ButtonTypeGroup.TEXT].map((e, i) => {
      return {
        ...e,
        value: i,
        label: t(`${e.label}`),
        showTitle: h(
          Button,
          {
            type: e.type,
            danger: Boolean(e.danger),
            size: 'small',
            icon: e.hasIcon ? h('span', { class: 'iconfont icon-icon' }) : '',
            class: ['selected-btn', defProps.size === 'small' ? 'mini-btn' : ''],
          },
          { default: () => [t(`${e.label || ''}`)] },
        ),
      };
    });
  });
  const handleSelectedChange = (val) => {
    const cur = ButtonGroupType[activeTab.value][val];
    emit('change', {
      hasIcon: 'hasIcon' in cur && cur.hasIcon ? true : false,
      hasText: 'hasText' in cur && cur.hasText ? true : false,
      type: cur.type,
      danger: Boolean(cur.danger),
    });
  };
  const handleTabChange = (val) => {
    const cur = ButtonGroupType[val][selectedVal.value];
    emit('update:hasText', val === ButtonTypeGroup.ICON ? false : true);
    emit('update:hasIcon', val === ButtonTypeGroup.TEXT ? false : true);
    emit('change', {
      hasIcon: 'hasIcon' in cur && cur.hasIcon ? true : false,
      hasText: 'hasText' in cur && cur.hasText ? true : false,
      type: cur.type,
      danger: 'danger' in cur && cur.danger ? true : false,
    });
  };

  const getPopupContainer = (triggerNode) => {
    return triggerNode.parentNode;
  };
  onClickOutside(selectRef, () => {
    open.value = false;
  });
</script>
<style lang="less" scoped>
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin-bottom: 0 !important;
  }
  :deep(.ant-tabs-tab) {
    padding: 0;
    .ant-tabs-tab-btn {
      padding: 8px 15px;
    }
  }
  :deep(.ant-tabs-content) {
    padding: 15px 8px;
    .ant-select-item {
      padding: 6px;
      border-radius: 4px;
    }
    .ant-select-item-option-selected {
      background-color: rgba(from var(--ant-primary-color) r g b / 5%) !important;
    }
  }
  :deep(.ant-tabs-tab + .ant-tabs-tab) {
    margin-left: 0;
  }
  // .button-item {
  //   padding: 5px 18px;
  //   cursor: pointer;

  //   &:hover {
  //     background-color: #f5f5f5;
  //   }
  //   &.active {
  //     background-color: var(--ant-primary-1);
  //   }
  // }
  :deep(.ant-btn) {
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    .icon-icon {
      // position: relative;
      // top: 1px;
      margin-right: 4px;
    }
  }
  :deep(.ant-btn-icon-only) {
    vertical-align: 0;
    padding: 0 !important;
    .icon-icon {
      line-height: unset;
      margin-right: 0;
    }
  }
  .ant-btn-sm {
    height: 26px;
  }
  .mini-btn {
    height: 20px;
    padding: 0 8px;
    position: relative;
    top: 1px;
    .icon-icon {
      // line-height: 19px;
    }
  }
  .selected-btn {
    position: absolute;
    top: 3px;
  }
</style>
