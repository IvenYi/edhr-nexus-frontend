<template>
  <div :class="['dropdown-button', state.menuItems.length > 0 ? 'dropdown-button--has-menu' : '']">
    <template v-if="!hiddenMore">
      <baseButton
        :class="['dropdown-button__left']"
        :widget="widget"
        v-bind="widget.props"
        :loading="loading"
        :disabled="state.disabled"
        @click="onclick"
      />
      <a-dropdown
        overlayClassName="dropdown-button__dropdown"
        placement="bottomRight"
        v-if="state.menuItems.length > 0"
      >
        <baseButton
          :class="['dropdown-button__right']"
          :widget="widget"
          v-bind="iconProps"
          :style="iconStyleVars"
        />
        <template #overlay>
          <a-menu @click="onMenuClick">
            <a-menu-item v-for="item in state.menuItems" :key="item.key">
              {{ item.label }}
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </template>
    <a-dropdown v-else>
      <a class="ant-dropdown-link" @click.prevent>
        <baseButton
          :class="['dropdown-button__left']"
          :widget="widget"
          v-bind="widget.props"
          :loading="loading"
          :disabled="state.disabled"
          @click="onclick"
        />
        <!-- <DownOutlined /> -->
      </a>
      <template #overlay>
        <a-menu @click="onMenuClick">
          <a-menu-item v-for="item in state.menuItems" :key="item.key">
            {{ $t(item.label) }}
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts" name="gct-dropdown-button">
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { ref, computed, reactive, onBeforeUnmount, nextTick } from 'vue';
  import { IDropdownButton } from './schema';
  import {
    IDropdownButtonComponentExpose,
    IDropdownButtonState,
  } from '/@/projects/page-designer/src/interface/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{ widget: IDropdownButton; destroyVm?: Function; formData?: object }>();
  const loading = ref(false);

  const { list, hiddenMore } = props.widget.props;

  console.log('jso=========', list);
  const state = reactive<IDropdownButtonState>({
    disabled: false,
    menuItems: list ? JSON.parse(list) : [],
  });

  const Event = getPageEvent();

  const onclick = async () => {
    try {
      loading.value = true;
      await Event.runEventByName('onClick', props.widget.events);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  };

  const onMenuClick = async (item: any) => {
    const findItem = state.menuItems.find((menu) => menu.key === item.key);
    await Event.runEventByName('menuClick', props.widget.events, findItem, props.formData);
  };

  defineExpose<IDropdownButtonComponentExpose>({
    getState() {
      return state;
    },
    setState(newState) {
      Object.assign(state, newState);
    },
  });

  const iconProps = computed(() => {
    return {
      ...props.widget.props,
      hasText: false,
      hasIcon: true,
      icon: 'icon-xuanzeqi_xuanzebiaodanmoban',
      title: '',
    };
  });

  const whiteColor = ['#FFFFFF', '#ffffff', '#fff', '#FFF'];

  const lineBgColor = computed(() => {
    const { type, enableCustomColor, backgroundColor, fontColor } = props.widget.props;
    if (type === 'link') return !enableCustomColor ? 'var(--ant-primary-color)' : fontColor;
    else if (type === 'primary' || (enableCustomColor && !whiteColor.includes(backgroundColor!)))
      return '#fff';
    else if (enableCustomColor && whiteColor.includes(backgroundColor!)) return fontColor;
    else return '#E8EBF0';
  });

  const iconStyleVars = computed(() => {
    return {
      '--line-height':
        props.widget.props.type === 'link' ||
        (props.widget.props.enableCustomColor &&
          whiteColor.includes(props.widget.props.backgroundColor!))
          ? '16px'
          : '100%',
      '--download-border-color': lineBgColor.value,
    };
  });
</script>
<style scoped lang="less">
  .dropdown-button {
    display: inline-flex;

    &__left {
      vertical-align: middle;
    }

    &__right {
      position: relative;

      &::before {
        content: '';
        display: block;
        position: absolute;
        z-index: 1;
        top: 50%;
        left: 0;
        width: 1px;
        height: var(--line-height);
        transform: translateY(-50%);
        background-color: var(--download-border-color);
      }
    }

    &.dropdown-button--has-menu {
      .dropdown-button__left {
        :deep(.ant-btn) {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-right-color: transparent;
        }
      }

      .dropdown-button__right {
        :deep(.ant-btn) {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          border-left-color: transparent;
        }
      }
    }
  }
</style>
<style lang="less">
  .dropdown-button__dropdown {
    .ant-dropdown-content {
      max-height: 264px;
      overflow: auto;
    }

    .ant-dropdown-menu-item:hover,
    .ant-dropdown-menu-submenu-title:hover {
      background: #f2f5f8;
    }

    .ant-dropdown-menu-item,
    .ant-dropdown-menu-submenu-title {
      color: #1a1d23;
    }
  }
</style>
