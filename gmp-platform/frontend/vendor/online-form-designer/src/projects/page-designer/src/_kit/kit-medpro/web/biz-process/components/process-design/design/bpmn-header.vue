<template>
  <div class="bpmn-header pl24px ks-row-middle relative">
    <!-- <i class="iconfont icon-a-Leftarrow text-[#ffffff] mr6px cursor-pointer" @click="onBack"></i> -->
    <LeftOutlined class="text-[#ffffff] mr6px cursor-pointer" @click="onBack()" />
    <div class="text-[#FFFFFF] ks-col">
      <template v-if="processInfo.categoryName">
        {{ processInfo.categoryName }}
        <span class="mx8px">/</span>
      </template>
      {{ processInfo.name }}
    </div>
    <div v-if="curVersionInfo.status === BpmnVersionStatusEnum.DRAFT" class="buttons">
      <div class="button ml-16px cursor-pointer btn-block" @click="saveProcess()">
        <i class="iconfont icon-baocun1"></i>
        {{ $t('sys.saveText') }}
      </div>
      <div class="button ml-16px cursor-pointer btn-block" @click="publishProcess()">
        <i class="iconfont icon-fasong"></i>
        {{ $t('sys.ipaas.saveAndPublish') }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { h } from 'vue';
  import { BpmnVersionStatusEnum } from '../constants';
  import { useProcess } from '../hook/useProcess';
  import { Modal } from 'ant-design-vue';

  const { processInfo, saveProcess, publishProcess, curVersionInfo, hasBeenUpdated } = useProcess();

  const emit = defineEmits(['on-back']);

  function onBack() {
    if (hasBeenUpdated()) {
      const cfg = Modal.confirm({
        title: $t('sys.hasNoSavedDataTitle'),
        content: h('div', { class: 'unsaved-modal' }, [
          h('span', $t('sys.hasNoSavedDataTips')),
          h('div', { class: 'continue-edit' }, [
            h(
              'button',
              {
                type: 'button',
                onClick: () => cfg.destroy(),
              },
              $t('sys.app.continueEdit'),
            ),
          ]),
        ]),
        okText: $t('sys.cardDesign.back_info.saveAndExit'),
        cancelText: $t('sys.cardDesign.back_info.notSave'),
        onOk: async () => {
          await saveProcess();
          emit('on-back');
        },
        onCancel: () => {
          cfg.destroy();
          emit('on-back');
        },
      });
      return;
    }
    emit('on-back');
  }
</script>
<style lang="less" scoped>
  .buttons {
    position: absolute;
    display: flex;
    align-items: center;
    height: 30px;
    margin: 12px 0;
    top: 0;
    right: 12px;
  }

  .button {
    height: 26px;
    background: transparent;
    // border: 1px solid #e8ebf0;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    line-height: 1em;
    transition: all 0.3s;
    i {
      margin-right: 6px;
      display: flex;
      font-size: 12px;
    }
    &:hover {
      border-color: #fff;
    }

    &.btn-block {
      background: #444444;
      border: 1px solid #444444;
      &:hover {
        background: var(--ant-primary-color-hover);
        border-color: var(--ant-primary-color-hover);
      }
    }
  }
</style>
