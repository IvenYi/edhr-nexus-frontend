<template>
  <div :class="ns.b()">
    <div :class="[ns.b('header')]">
      <div :class="ns.e('actions')">
        <a-button class="ml-8px mr-8px" type="primary" @click="newOutline">{{
          $t('sys.onlineForm.createNewDirectory')
        }}</a-button>
        <a-button class="mr-8px" type="primary" danger @click="remove">{{
          $t('sys.delText')
        }}</a-button>
        <a-button
          v-if="expandStatus !== 'all-collapse'"
          type="text"
          :icon="h(MenuUnfoldOutlined)"
          @click="collapseAll"
          >{{ $t('sys.pageDesigner.foldAll') }}</a-button
        >
        <a-button
          v-if="expandStatus !== 'all-expanded'"
          type="text"
          :icon="h(MenuFoldOutlined)"
          @click="expandAll"
          >{{ $t('sys.onlineForm.expandAll') }}</a-button
        >
      </div>
      <div :class="ns.e('dropdown')">
        <a-select class="w-full" v-model:value="showField" size="small" :options="showFieldOptions"
      /></div>
    </div>
    <div :class="[ns.b('body')]">
      <EdhrOutlineConfigureTree
        ref="treeRef"
        :showField="showField"
        @expand-status="onExpandedStatusChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="edhr-configure-drawer">
  import { h, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModal, useNamespace } from '@gct/runtime';
  import { EdhrOutlineConfigureTree, EdhrOutlineConfigureTreeInstance } from './edhr-outline';
  import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons-vue';
  import { useEDHRWiki } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';

  const ns = useNamespace('edhr-configure-drawer');

  const { t } = useI18n();

  const showFieldOptions = [
    { label: $t('sys.updateTime'), value: 'modifyTime' },
    { label: $t('sys.createTime'), value: 'createTime' },
    { label: $t('sys.createName'), value: 'createUserName' },
  ];
  const showField = ref('modifyTime');
  const treeRef = ref<EdhrOutlineConfigureTreeInstance>();
  /** 是否修改过 */
  const isModified = ref(false);

  const { initialize } = useEDHRWiki();

  const props = defineProps<{
    edhrId: string;
  }>();

  watch(
    () => props.edhrId,
    () => {
      if (props.edhrId) {
        initialize(props.edhrId);
      }
    },
    {
      immediate: true,
    },
  );

  useModal(async () => {
    return {
      // 修改过后返回ok,外面刷新数据
      ok: isModified.value,
    };
  });

  const newOutline = () => {
    treeRef.value!.newOutline();
    // todo 添加需要看是否有选中节点,没有加在最后,表单下面不能添加目录
  };
  const remove = () => {
    treeRef.value!.remove();
    // todo, 分删除目录和表单,删除父子要不要处理看后台
  };
  const collapseAll = () => {
    treeRef.value!.collapseAll();
  };
  const expandAll = () => {
    treeRef.value!.expandAll();
  };

  const expandStatus = ref<'all-collapse' | 'all-expanded' | 'normal'>();
  const onExpandedStatusChange = (v) => {
    expandStatus.value = v;
  };
</script>

<style lang="scss" scoped>
  @include b(edhr-configure-drawer) {
    padding-top: 12px;
    background-color: #fff;
    height: 100%;

    @include e(dropdown) {
      width: 100px;
      height: 24px;
      margin-right: 8px;
      :deep(.ant-select) {
        color: #95989c;
        .ant-select-selector {
          border: none;
        }
        .ant-select-item-option-content {
          color: #95989c;
        }
      }
    }
  }
  @include b(edhr-configure-drawer-header) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d9d9d9;
    padding-bottom: 12px;
  }
  @include b(edhr-configure-drawer-body) {
    height: calc(100% - 45px);
    padding: 8px;
  }
  .ant-btn.ant-btn-text {
    border-color: transparent;
    color: #95989c;
    padding: 2px 6px;
  }
</style>
