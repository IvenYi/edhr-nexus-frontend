<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.moveTo')"
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @visible-change="handleShow"
  >
    <a-tree
      ref="treeRef"
      block-node
      showIcon
      :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
      :selectedKeys="selectedTreeKey"
      :defaultExpandAll="true"
      :tree-data="getFilterTreeData(selectTreeNode.node)"
      @select="onTreeSelect"
    >
      <template #icon="props">
        <i v-if="icons[props.type]" :class="['iconfont', icons[props.type]]"></i>
      </template>
    </a-tree>
    <template #footer>
      <a-button @click="closeModal">{{ t('sys.cancelText') }}</a-button>
      <a-button
        type="primary"
        @click="handleOk"
        :disabled="!selectedTreeKey || !selectedTreeKey.length"
      >
        {{ t('sys.okText') }}
      </a-button>
    </template>
  </BasicModal>
</template>
<script setup lang="ts" name="user-move-modal">
  import { ref, reactive, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import useTreeList from '/@backend-management/hooks/useTreeList';

  import type { FormInstance } from 'ant-design-vue';
  import { TypeReqEnum } from '../../constant/treeInterface';

  const icons = {
    [TypeReqEnum.GROUP]: 'icon-jituan',
    [TypeReqEnum.COMPANY]: 'icon-gongsi',
  };

  const { t } = useI18n();

  const { selectTreeNode, getFilterTreeData } = useTreeList();

  const emit = defineEmits(['ok', 'register']);

  interface FormState {
    /** 移出组织id */
    fromOrgId: string;
    /** 移入组织id */
    toOrgId: string;
    /** 用户id集合 */
    userIds: string[];
  }

  const onTreeSelect = (selectIds) => {
    selectedTreeKey.value = selectIds;
  };

  const selectedTreeKey = ref();

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    fromOrgId: '',
    toOrgId: '',
    userIds: [],
  });

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.userIds = data.userIds;
    }
  });

  // 弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    console.warn('visible', visible);
    if (visible) {
      formState.fromOrgId = selectTreeNode.node.id;
    }
  };

  const handleClose = () => {
    formRef.value?.resetFields();
    formState.fromOrgId = '';
    formState.toOrgId = '';
    formState.userIds = [];
    selectedTreeKey.value = '';
  };

  const handleOk = () => {
    formState.toOrgId = selectedTreeKey.value[0];
    emit('ok', { ...toRaw(formState) });
    closeModal();
  };
</script>
<style lang="less" scoped>
  .iconfont {
    font-size: 20px;

    &.icon-gongsi {
      color: #3b9312;
      margin-left: 4px;
    }
    &.icon-jituan {
      color: #3168ec;
      margin-left: 4px;
    }
  }
</style>
