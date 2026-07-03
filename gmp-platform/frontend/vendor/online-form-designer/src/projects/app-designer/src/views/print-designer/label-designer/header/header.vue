<template>
  <div class="designer-header">
    <a-breadcrumb>
      <a-breadcrumb-item>{{ labelInfo?.categoryResponse?.name }}</a-breadcrumb-item>
      <a-breadcrumb-item> {{ labelInfo?.name }}</a-breadcrumb-item>
    </a-breadcrumb>

    <div class="designer-header__actions">
      <!-- <a-button @click="print">
        <printer-outlined />
        {{ t('sys.print') }}
      </a-button> -->
      <a-button type="primary" @click="save">
        <i class="iconfont icon-baocun1"></i>
        {{ t('sys.saveText') }}
      </a-button>
    </div>
    <test-var-modal @register="register" />
  </div>
</template>

<script lang="ts" setup>
  import { useI18n } from '/@/hooks/web/useI18n';
  import { labelInfo, usePage } from '../hooks/usePage';
  import { putLabelUpdateDesigner } from '/@/apis/gct-apaas/LabelController';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { usePrinter } from '/@/hooks/develop/usePrinter';
  import { useDesigner } from '../hooks/useDesigner';
  import { isEmpty } from 'lodash-es';
  import TestVarModal from './test-var-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { DATA_TYPE, PRINT_ELE_TYPE } from '../constants/CommonPrintElems';

  const [register, { openModal }] = useModal();

  const { printLabelKey } = usePrinter();
  const { createMessage } = useMessage();
  const { project, loadLabelDesignHistoryList } = usePage();
  const { selectedPage } = useDesigner();
  const { t } = useI18n();

  const print = async () => {
    const varMap = isHaveVar();
    if (isEmpty(varMap)) {
      printLabelKey(
        labelInfo.value?.key,
        {},
        {
          printType: labelInfo.value?.printType,
        },
      );
    } else {
      openModal(true, { ...varMap });
    }
  };
  const save = async () => {
    if (isHaveEmptyImg()) {
      createMessage.warning(t('sys.printDesigner.imgNotNull'));
      return;
    }
    await putLabelUpdateDesigner({
      designerJson: JSON.stringify(project.value),
      id: labelInfo.value?.id!,
    });
    loadLabelDesignHistoryList();
    createMessage.success(t('sys.saveSuccess'));
  };
  const isHaveVar = () => {
    const varMap = {};
    selectedPage.value.forEach((w) => {
      if (w.type === PRINT_ELE_TYPE.TEXT && w.attrs.text.type === DATA_TYPE.VAR) {
        varMap[w.attrs.text.value] = '';
      } else if (
        (w.type === PRINT_ELE_TYPE.BAR_CODE || w.type === PRINT_ELE_TYPE.QR_CODE) &&
        w.attrs.content.type === DATA_TYPE.VAR
      ) {
        varMap[w.attrs.content.value] = '';
      }
    });
    return varMap;
  };
  const isHaveEmptyImg = () => {
    let flag = false;
    selectedPage.value.forEach((w) => {
      if (w.type === PRINT_ELE_TYPE.IMAGE && isEmpty(w.attrs.src.value)) {
        flag = true;
      }
    });
    return flag;
  };
</script>

<style lang="less" scoped>
  .designer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    &__lock-info {
      margin-left: auto;

      > span {
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }

    &__divider {
      height: 24px;
      margin: 0 15px;
      border-left: 1px solid #e3e3e3;
    }

    &__actions {
      .ant-btn {
        .iconfont {
          position: relative;
          top: 1px;
          margin-right: 5px;
          line-height: 1em;
        }
      }

      .ant-btn:not(:last-child) {
        margin-right: 10px;
      }
    }
  }
</style>
