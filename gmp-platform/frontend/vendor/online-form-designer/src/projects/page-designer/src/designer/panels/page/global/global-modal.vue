<template>
  <div class="designer-modal">
    <div style="width: 200px; margin-bottom: 12px">
      <a-input-search
        v-model:value="searchInfo"
        @search="searchModal"
        style="margin-bottom: 10px"
      />
      <a-button type="primary" block @click="addGlobalModal">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.pageDesigner.addModal') }}</a-button
      >
    </div>
    <div class="designer-modal-item" v-for="item in modals" @click="openModalDesign(item.id)">
      <div class="designer-modal-item__name">{{ item.name }}</div>
      <div style="display: flex; justify-content: space-between; align-items: center">
        <div class="designer-modal-item__key">{{ item.key }}</div>
        <div class="designer-modal-item__key">
          <a-button
            type="link"
            @click.stop="copyToPage(item)"
            :title="t('sys.pageDesigner.copyToLocal')"
          >
            <template #icon><copy-outlined /></template>
          </a-button>
          <a-button type="link" @click.stop="editModalName(item)">
            <template #icon><edit-outlined /></template>
          </a-button>
          <a-popconfirm
            :title="
              t('sys.sureToDeleteSth', {
                sth: item.name + t('sys.pageDesigner.modal'),
              })
            "
            :ok-text="t('sys.ok')"
            :cancel-text="t('sys.cancel')"
            @confirm="deleteModal(item)"
          >
            <a-button type="link" danger @click.stop>
              <template #icon><delete-outlined /></template>
            </a-button>
          </a-popconfirm>
        </div>
      </div>
    </div>
    <global-modal-modal @register="register" @ok="handleOk" />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';
  import { useModal } from '/@/components/Modal';
  import GlobalModalModal from '../modals/global-modal-modal.vue';
  import { buildShortUUID } from '/@/utils/uuid';
  import { widget } from '/@page-designer/schema/modal/modal';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { GLOBAL_TYPE, Platform, SCOPE, ToolkitEnum } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { cloneDeep } from 'lodash-es';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { ref, watchEffect } from 'vue';
  import { platform } from '/@page-designer/hooks/usePage';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { message } from 'ant-design-vue';

  const { keyPad } = useKeyParser('g_modal');

  const { toggleToolkit } = useToolkit();
  const { t } = useI18n();
  const { gModal, queryGModal, queryInfo, updateInfo, addInfo, deleteInfo } = useGlobal();
  const [register, { openModal, closeModal }] = useModal();
  const { setModalDesignState, modalInfo, pageJson } = useDesigner();
  const { resetSelectedWidget, setSelectedModal } = useSelectedWidget();

  const Ch_Platform = {
    [Platform.WEB]: t('sys.portal.deviceWeb'),
    [Platform.MOBILE]: t('sys.portal.deviceMobile'),
  };

  const addGlobalModal = () => {
    openModal();
  };
  const openModalDesign = async (modalId) => {
    //查询远程模态框
    const data = (await queryInfo(modalId)) || [];
    if (data?.length) {
      const modalInfo = JSON.parse(data![0].configJson!);
      if (modalInfo.platform !== platform.value) {
        message.error(
          t('sys.pageDesigner.openGlobalModalError', {
            s1: Ch_Platform[platform.value],
            s2: Ch_Platform[modalInfo.platform],
          }),
        );
        return;
      }
    }

    await setModalDesignState(true, modalId, true);
    resetSelectedWidget(SCOPE.MODAL);
    setSelectedModal(modalInfo.value);
  };
  const copyToPage = async (modal) => {
    //查询远程模态框
    const data = (await queryInfo(modal.id)) || [];
    if (data?.length) {
      const modalInfo = JSON.parse(data![0].configJson!);
      pageJson.modals.push({ ...modalInfo, id: buildShortUUID('modal') });
      toggleToolkit(ToolkitEnum.MODAL, true);
    }
  };
  const editModalName = async (modal) => {
    //查询远程模态框
    const data = (await queryInfo(modal.id)) || [];
    if (data?.length) {
      const modalInfo = JSON.parse(data![0].configJson!);
      openModal(true, { id: modal.id, modalInfo });
    }
  };
  const deleteModal = async (modal) => {
    await deleteInfo(modal.id);
    await queryGModal();
    modals.value = gModal.value;
    searchInfo.value = '';
  };
  const handleOk = async (modal) => {
    if (modal.id) {
      await updateInfo(modal.id, {
        name: modal.modalInfo.modalName,
        configJson: JSON.stringify(modal.modalInfo),
      });
    } else {
      const modalId = keyPad(buildShortUUID().replace('_', ''));
      const modalJSON = cloneDeep(widget);
      //给body和footer设置ID
      modalJSON.children.map((d) => {
        d.id = buildShortUUID(d.type);
        return d;
      });
      await addInfo({
        type: GLOBAL_TYPE.MODAL,
        name: modal.modalInfo.modalName,
        key: modalId,
        configJson: JSON.stringify({
          ...modalJSON,
          modalName: modal.modalInfo.modalName,
          id: modalId,
          platform: platform.value,
        }),
      });
    }
    await queryGModal();
    closeModal();
    modals.value = gModal.value;
    searchInfo.value = '';
  };
  const searchInfo = ref('');
  const modals = ref<{ id: string; key: string; name: string; modalInfo: LowCodeModal.Modal }[]>(
    [],
  );
  watchEffect(() => {
    modals.value = gModal.value;
  });
  const searchModal = (searchValue) => {
    modals.value = gModal.value.filter((modal) => {
      return modal.name.includes(searchValue) || modal.key.includes(searchValue);
    });
  };
</script>

<style lang="less" scoped>
  .designer-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    &-item {
      padding: 14px 18px 10px;
      border-bottom: 1px solid @gct-modal-border-color;
      cursor: pointer;
      width: 100%;
      &:hover {
        background-color: #ebebeb;
        .designer-modal-item__name {
          color: var(--ant-primary-color);
        }
      }
      &__key {
        color: #9d9da6;
        margin-top: 5px;
      }
    }
  }
</style>
