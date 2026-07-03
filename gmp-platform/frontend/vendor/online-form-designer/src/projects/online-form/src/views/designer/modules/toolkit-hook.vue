<template>
  <div class="toolkit-hook-wrapper">
    <div class="toolkit-blank" v-if="designMode === DesignMode.CollectView"></div>
    <toolkit v-bind="$attrs" v-else />
    <div class="guides">
      <div class="guide-item" v-for="config of configs" :key="config.icon">
        <a-tooltip v-if="config.isTooltip">
          <template #title>{{ config.title }}</template>
          <i :class="['iconfont', config.icon]" @click="config.onClick"></i>
        </a-tooltip>
        <i :class="['iconfont', config.icon]" @click="config.onClick" v-else></i>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="toolkit-hook">
  import { computed } from 'vue';
  import Toolkit from './toolkit.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { DesignMode } from '/@online-form/views/designer/enums';

  const { t } = useI18n();

  const { designMode, setDesignMode } = useSpreadSheet();

  const openHelpModal = async () => {
    const { default: HelpModal } = await import('./modals/help-modal.vue');
    gct.openUtil.modal(
      HelpModal,
      {},
      {
        title: t('sys.keyboardShortcut'),
        width: 'calc(100% - 320px)',
        height: 440,
        centered: false,
        footer: false,
        maskStyle: { background: 'transparent' },
        wrapClassName: 'help-modal-wrap',
      },
    );
  };

  const configs = computed(() => {
    const icons: any = [];

    if (designMode.value === DesignMode.Refer || designMode.value === DesignMode.Print) {
      return;
    }

    if (designMode.value === DesignMode.Collect) {
      icons.push({
        icon: 'icon-chakan1',
        title: t('sys.edhr.designMode.CollectView'),
        changeType: DesignMode.CollectView,
        isTooltip: true,
        onClick: () => setDesignMode(DesignMode.CollectView),
      });
    } else if (designMode.value === DesignMode.CollectView) {
      icons.push({
        icon: 'icon-gangbi',
        title: t('sys.edhr.designMode.Collect'),
        changeType: DesignMode.Collect,
        isTooltip: true,
        onClick: () => setDesignMode(DesignMode.Collect),
      });
    }

    icons.push({
      icon: 'icon-bangzhu',
      title: t('sys.keyboardShortcut'),
      isTooltip: true,
      onClick: openHelpModal,
    });

    return icons;
  });
</script>

<style scoped lang="less">
  .toolkit-hook-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    .toolkit-blank {
      background: #f2f4f7;
      border-left: 1px solid #e0e3ea;
      border-right: 1px solid #e0e3ea;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .guides {
      background: #f2f4f7;
      border-left: 1px solid #e0e3ea;
      border-right: 1px solid #e0e3ea;
      width: 100%;
      display: flex;
      align-items: center;
      flex-direction: column;
      padding-bottom: 26px;
      .guide-item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        cursor: pointer;
        margin-bottom: 18px;
        transition: all 0.3s;
        border-radius: 4px;
        .iconfont {
          line-height: 1;
          font-size: 20px;
          color: #212538;
        }

        &:hover {
          background: #e0e3ea;
        }
      }
    }
  }
</style>

<style lang="less">
  .help-modal-wrap {
    > .ant-modal {
      bottom: 0;
      right: 296px;
      top: unset;
      position: absolute;
      padding-bottom: 0;
    }
  }
</style>
