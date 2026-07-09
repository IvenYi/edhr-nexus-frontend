<template>
  <div class="designer-modal">
    <div class="modal-btn-wrap">
      <a-button type="primary" @click="addModalName" style="flex: 1">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.pageDesigner.addModal') }}</a-button
      >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.pasteModal') }}</template>
        <a-button type="link" @click="pasteModal" style="width: 32px">
          <template #icon>
            <snippets-outlined />
          </template>
        </a-button>
      </a-tooltip>
    </div>
    <div
      class="designer-modal-item"
      v-for="(item, index) in pageJson.modals"
      @click="openModalDesign(item)"
      :style="{ cursor: 'pointer' }"
      :key="index"
    >
      <div class="designer-modal-item__name">
        {{ getModalInfo(item, 'modalName') }}
      </div>
      <div style="display: flex; align-items: center; justify-content: space-between">
        <div class="designer-modal-item__key">{{ getModalInfo(item, 'id') }}</div>
        <div class="designer-modal-item__key">
          <a-button type="link" @click.stop="copyModal(item)">
            <template #icon><copy-outlined /></template>
          </a-button>
          <a-button type="link" @click.stop="editModalName(item)">
            <template #icon><edit-outlined /></template>
          </a-button>
          <a-popconfirm
            :title="t('sys.sureToDeleteSth', { sth: item.modalName + t('sys.pageDesigner.modal') })"
            :ok-text="t('sys.ok')"
            :cancel-text="t('sys.cancel')"
            @confirm="deleteModal(index)"
          >
            <a-button type="link" danger @click.stop>
              <template #icon><delete-outlined /></template>
            </a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <modal-add-edit-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script lang="ts" setup name="toolkit-modal">
  import ModalAddEditModal from './modals/modal-add-edit-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { CopyOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { buildShortUUID } from '/@/utils/uuid';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { SCOPE, Platform, PanelEnum } from '/@page-designer/enum';
  import { widget } from '/@page-designer/schema/modal/modal';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { cloneDeep } from 'lodash-es';
  import { platform, togglePanel } from '/@page-designer/hooks/usePage';
  import { createLocalStorage } from '/@/utils/cache';
  import { COPY_MODAL_KEY } from '/@page-designer/constant/toolkit';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ref } from 'vue';

  const { createMessage } = useMessage();
  const ls = createLocalStorage();
  const { t } = useI18n();
  const {
    setModalDesignState,
    modalInfo,
    pageJson,
    setSubTableModalDesignState,
    modalDesignState,
    modalDesignId,
  } = useDesigner();
  const { resetSelectedWidget, setSelectedModal, resetSelectedModal } = useSelectedWidget();
  const [register, { openModal, closeModal }] = useModal();

  const openModalDesign = (modal) => {
    setSubTableModalDesignState(false);
    setModalDesignState(true, modal.id);
    resetSelectedWidget(SCOPE.MODAL);
    setSelectedModal(modalInfo.value);
  };
  const addModalName = () => {
    openModal();
  };
  const editModalName = (item) => {
    openModal(true, { modal: { ...item } });
  };
  const copyModal = (item) => {
    ls.set(COPY_MODAL_KEY, { ...cloneDeep(item), id: undefined });
    createMessage.success(t('sys.pageDesigner.copySuccess'));
    // openModal(true, { ...item, id: undefined });
  };
  const isCopyState = ref(false);
  const pasteModal = () => {
    const modal = ls.get(COPY_MODAL_KEY);
    //如果复制的平台不统一 则不能复制
    if (platform.value !== modal.platform) {
      createMessage.warning(t('sys.pageDesigner.notSamePlatform'));
      return;
    }
    isCopyState.value = true;
    openModal(true, { modal, isCopyState: isCopyState.value });
  };
  const deleteModal = (index) => {
    const deletedModal = pageJson.modals[index];
    // 如果删除的弹框是当前正在编辑的弹框，则关闭编辑状态
    if (modalDesignState.value && modalDesignId.value === deletedModal.id) {
      setModalDesignState(false);
      resetSelectedWidget(SCOPE.PAGE);
      resetSelectedModal();
      togglePanel(PanelEnum.PAGE);
    }
    pageJson.modals.splice(index, 1);
  };

  const handleOk = (modal: LowCodeModal.Modal) => {
    if (modal.id) {
      pageJson.modals.forEach((d) => {
        if (d.id === modal.id) {
          (d as LowCodeModal.Modal).modalName = modal.modalName;
        }
      });
    } else if (isCopyState.value) {
      const modalId = buildShortUUID('modal');
      pageJson.modals.push({
        ...modal,
        id: modalId,
      });
      isCopyState.value = false;
    } else {
      const modalId = buildShortUUID('modal');
      const modalJSON = cloneDeep(widget);
      //给body和footer设置ID
      modalJSON.children.map((d) => {
        d.id = buildShortUUID(d.type);
        return d;
      });
      if (platform.value === Platform.PAD) {
        modalJSON.props.unitType = '%';
        modalJSON.props.modalWidth = 60;

        modalJSON.style = {
          paddingAll: '0',
          paddingTop: '0',
          paddingRight: '0',
          paddingBottom: '0',
          paddingLeft: '0',
        };
      }
      pageJson.modals.push({
        ...modalJSON,
        modalName: modal.modalName,
        id: modalId,
        platform: platform.value,
      });
    }
    closeModal();
  };
  const getModalInfo = (modal, key) => {
    return modal[key];
  };
</script>

<style lang="less" scoped>
  .modal-btn-wrap {
    display: flex;
    margin: 12px 36px;
  }

  .designer-modal {
    &-item {
      padding: 14px 18px 10px;
      border-bottom: 1px solid #eaeaea;

      &:hover {
        background-color: #ebebeb;

        .designer-modal-item__name {
          color: var(--ant-primary-color);
        }
      }

      &__key {
        margin-top: 5px;
        color: #9d9da6;
      }
    }
  }

  .designer-modal-item__key .ant-btn-icon-only {
    width: 28px;
    height: 28px;
  }
</style>
