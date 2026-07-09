<template>
  <div
    :class="[ns.b()]"
    :draggable="true"
    @click="onClick"
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
    />
    <template v-else>
      <span :class="ns.e('title')" :title="node.title">
        <i style="vertical-align: middle" class="iconfont icon-drag"></i>
        {{ node.title }}
      </span>
      <div :class="[ns.e('field')]">
        <div :class="ns.e('field-dot')"></div>
        <div :class="ns.e('field-info')"> {{ node[showField] }}</div>
      </div>
      <div :class="[ns.e('actions')]" @click="(e) => e.stopPropagation()">
        <Dropdown
          v-if="props.node.type === OutlineType.OUTLINE"
          :trigger="['click']"
          :drop-menu-list="NodeAddMenus"
          @menu-event="(e) => doAction(e.event)"
        >
          <i :class="['iconfont', 'icon-tianjia']"></i>
        </Dropdown>
        <Dropdown
          :overlayClassName="ns.e('more-dropdown')"
          :trigger="['click']"
          :drop-menu-list="nodeMoreMenus"
          @menu-event="(e) => doAction(e.event)"
        >
          <i :class="['iconfont', 'icon-gengduo1']"></i>
        </Dropdown>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup name="edhr-outline-configure-tree-node">
  import { computed, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { OutlineConfigureTreeNode } from './type';
  import { message } from 'ant-design-vue';
  import { Dropdown } from '/@/components/Dropdown/index';
  import { NodeMoreMenus, OutlineActionType, NodeAddMenus } from './constants';
  import {
    useEDHRWiki,
    OutlineType,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();

  const ns = useNamespace('edhr-outline-configure-tree-node');
  const { deleteOutline, saveOutline, refresh, createDoc, editDoc, designDoc } = useEDHRWiki();

  const props = withDefaults(
    defineProps<{
      node: OutlineConfigureTreeNode;
      showField: string;
    }>(),
    {},
  );
  const emit = defineEmits<{
    (e: 'new-outline'): void;
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

  const onClick = (e: MouseEvent) => {
    if (props.node.isEdit) {
      e.stopPropagation();
    }
  };

  // 输入框回车触发失焦
  const onEnter = () => {
    inputRef.value.input.blur();
  };
  // 失焦执行保存
  const saveData = async () => {
    if (!nodeData.value.title) {
      // 名称为空拦截保存,不恢复正常态
      message.error($t('sys.onlineForm.nameCannotBeEmpty'));
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
        createDoc(nodeData.value.key);
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
        await deleteOutline(nodeData.value);
        refresh();
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
  @include b(edhr-outline-configure-tree-node) {
    display: flex;
    position: relative;

    @include e(title) {
      flex-grow: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      text-wrap: nowrap;
    }

    @include e(field) {
      flex-grow: 1;
      flex-shrink: 0;
      text-align: right;
      display: inline-flex;
      color: #95989c;
    }

    @include e(field-dot) {
      padding: 0 16px;
      flex-grow: 1;
      flex-shrink: 1;
      &::after {
        content: '';
        display: inline-block;
        vertical-align: middle;
        height: 0px;
        width: 100%;
        border-top: 1px #95989c dotted;
      }
    }

    @include e(field-info) {
      flex-shrink: 0;
      flex-grow: 0;
    }

    @include e(actions) {
      display: none;
      position: absolute;
      right: 0;
      // width: 60px;
      // flex-shrink: 0;
      // flex-grow: 0;
      // text-align: right;
      :deep(.ant-dropdown-trigger) {
        text-align: center;
        width: 25px;
        display: inline-block;
      }
    }

    &:hover {
      @include e(actions) {
        display: block;
      }
      @include e(field) {
        display: none;
      }
      @include e(title) {
        margin-right: 60px;
      }
    }
  }
</style>

<style lang="scss">
  .ant-tree-node-selected {
    .#{bem(edhr-outline-configure-tree-node,title)} {
      margin-right: 60px;
    }
    .#{bem(edhr-outline-configure-tree-node,actions)} {
      display: block;
    }
    .#{bem(edhr-outline-configure-tree-node,field)} {
      display: none;
    }
  }

  .#{bem(edhr-outline-configure-tree-node,more-dropdown)} {
    .delete-icon {
      .icon-shanchu {
        color: #f5222d;
      }
    }
  }
</style>
