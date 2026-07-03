<template>
  <div
    :class="[ns.b(), ns.e(`node-${node.type.toLowerCase()}`)]"
    :draggable="isEdit"
    @dragstart="preventDefault"
    @drag="preventDefault"
    @dragleave="preventDefault"
    @drop="preventDefault"
    @dragend="preventDefault"
  >
    <a-input
      v-if="node.isEdit"
      v-model:value="nodeData.title"
      ref="inputRef"
      @blur="saveData"
      @keyup.enter="onEnter"
      @click="$event.stopPropagation()"
      :maxlength="64"
    />
    <template v-else>
      <i :class="[ns.e('doc-icon')]"></i>
      <span :class="ns.e('title')" :title="node.title"> {{ node.no }}{{ node.title }} </span>
      <div v-if="isEdit" :class="[ns.e('actions')]" @click="(e) => e.stopPropagation()">
        <Dropdown
          v-if="props.node.type === OutlineType.OUTLINE"
          :trigger="['hover']"
          :drop-menu-list="NodeAddMenus"
          @menu-event="(e) => doAction(e.event)"
        >
          <i :class="['iconfont', 'icon-tianjia']"></i>
        </Dropdown>
        <Dropdown
          :overlayClassName="ns.e('more-dropdown')"
          :trigger="['hover']"
          :drop-menu-list="nodeMoreMenus"
          @menu-event="(e) => doAction(e.event)"
        >
          <i :class="['iconfont', 'icon-gengduo1']"></i>
        </Dropdown>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup name="edhr-outline-toggle-tree-node">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { OutlineConfigureTreeNode } from '../type';
  import { message, Modal } from 'ant-design-vue';
  import { Dropdown } from '/@/components/Dropdown/index';
  import { NodeMoreMenus, OutlineActionType, NodeAddMenus } from '../constants';
  import {
    useEDHRWiki,
    OutlineType,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();

  const ns = useNamespace('edhr-outline-toggle-tree-node');
  const { deleteOutline, saveOutline, refresh, createDoc, editDoc, designDoc } = useEDHRWiki();

  const props = withDefaults(
    defineProps<{
      node: OutlineConfigureTreeNode;
      isEdit: boolean;
    }>(),
    {},
  );
  const emit = defineEmits<{
    (e: 'new-outline'): void;
    (e: 'new-doc'): void;
  }>();

  const nodeData = computed(() => props.node);
  const inputRef = ref();

  const nodeMoreMenus = computed(() => {
    return NodeMoreMenus.filter((item) => {
      return item.include.includes(props.node.type);
    });
  });

  const focus = debounce(() => {
    inputRef.value?.input.focus();
  }, 500);

  // 自动聚焦
  watch(
    () => inputRef.value,
    (v) => {
      if (props.node.isEdit && v.input.focus) {
        console.log('[ 聚焦 ] >', v);
        focus();
      }
    },
  );

  // 输入框回车触发失焦
  const onEnter = () => {
    if (!nodeData.value.title) {
      // 名称为空拦截保存,不恢复正常态
      message.error($t('sys.onlineForm.nameCannotBeEmpty'));
      return;
    }
    inputRef.value.input.blur();
  };
  // 失焦执行保存
  const saveData = async () => {
    if (!nodeData.value.title) {
      refresh();
      return;
    }
    // 保存
    try {
      await saveOutline(nodeData.value);
      nodeData.value.isEdit = false;
      refresh();
    } catch (error) {
      console.log('[ 保存报错 ] >');
    }
  };

  const doAction = async (actionKey: OutlineActionType) => {
    console.log('执行行为:', actionKey);
    switch (actionKey) {
      case OutlineActionType.NEW_OUTLINE:
        emit('new-outline');
        break;
      case OutlineActionType.NEW_DOC:
        emit('new-doc');
        break;
      case OutlineActionType.EDIT_DOC:
        editDoc(nodeData.value);
        break;
      case OutlineActionType.DESIGN_DOC:
        designDoc(nodeData.value);
        break;
      case OutlineActionType.RENAME_OUTLINE:
        nodeData.value.isEdit = true;
        break;
      case OutlineActionType.DELETE:
        Modal.confirm({
          title: $t('sys.edhr.confirmToDelete'),
          okText: $t('sys.okText'),
          cancelText: $t('sys.cancelText'),
          closable: false,
          onOk: async () => {
            await deleteOutline(nodeData.value);
            refresh();
          },
          onCancel: () => {},
        });

        break;
      default:
        break;
    }
  };

  const preventDefault = (e: MouseEvent) => {
    if (props.node.isEdit) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
</script>

<style lang="scss" scoped>
  @include b(edhr-outline-toggle-tree-node) {
    display: flex;
    align-items: center;
    position: relative;

    @include e(title) {
      flex-grow: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
      width: 1px;
    }

    // 表单前的点图标
    @include e(doc-icon) {
      display: inline-block;
      width: 20px;
      height: 20px;
      padding: 8px;
      &::after {
        display: block;
        content: '';
        width: 4px;
        height: 4px;
        background: var(--ant-primary-color);
        border-radius: 50%;
      }
    }

    @include e(actions) {
      display: none;
      flex-shrink: 0;
      :deep(.ant-dropdown-trigger) {
        text-align: center;
        width: 16px;
        margin-left: 8px;
        display: inline-block;
      }
    }

    &:hover {
      @include e(actions) {
        display: block;
      }
      @include e(title) {
      }
    }

    @include e(node-outline) {
      .#{bem(edhr-outline-toggle-tree-node,doc-icon)} {
        display: none;
      }
    }
    @include e(node-doc) {
      color: #242424;
      > * {
        vertical-align: middle;
      }
    }
  }
</style>

<style lang="scss">
  .ant-tree-node-selected {
    .#{bem(edhr-outline-toggle-tree-node,actions)} {
      display: block;
    }
  }

  .#{bem(edhr-outline-toggle-tree-node,more-dropdown)} {
    .delete-icon {
      .icon-shanchu {
        color: #f5222d;
      }
    }
  }
</style>
