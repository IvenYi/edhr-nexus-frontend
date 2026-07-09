<template>
  <Split :class="[ns.b()]" v-model:value="width">
    <template #left>
      <div :class="[ns.e('left')]">
        <div :class="[ns.e('left-toolbar')]">
          <div>
            <template v-if="isEdit">
              <Dropdown
                :trigger="['hover']"
                :drop-menu-list="NodeAddMenus"
                @menu-event="(e) => doAction(e.event)"
              >
                <a-button type="link">{{ $t('sys.new') }}</a-button>
              </Dropdown>
              <!-- <a-button type="link" @click="onAddOutline">{{ $t('sys.new') }}目录</a-button> -->
              <a-button :class="[ns.e('remove')]" type="text" @click="onRemove">{{
                $t('sys.delText')
              }}</a-button>
            </template>
            <a-button v-else @click="onCollapseOrExpand" type="link"
              >{{ $t('sys.pageDesigner.foldAll') }}/{{ $t('sys.unfold') }}</a-button
            >
          </div>
          <a-button
            v-if="!readonly && form2dhrUsePerms[BasicAction.Update]"
            type="link"
            @click="onToggle"
            :class="[ns.e('toggle')]"
          >
            {{ !isEdit ? $t('sys.editInfo') : $t('sys.onlineForm.exitEditMode') }}
          </a-button>
        </div>
        <a-input
          :class="[ns.e('search-input')]"
          v-model:value="searchKey"
          :placeholder="$t('sys.pageDesigner.pleaseEnterSearchContent')"
          allowClear
        >
          <template #suffix>
            <i class="iconfont icon-sousuo1"></i>
          </template>
        </a-input>
        <EdhrOutlineToggleTree
          ref="toggleTreeRef"
          :class="[ns.e('tree')]"
          :is-edit="isEdit"
          @select="handleTreeSelect"
          :filter="searchKey"
        />
      </div>
    </template>
    <template #right>
      <div :class="[ns.e('right')]">
        <!-- <div
          v-if="!readonly && selectedNode?.type === OutlineType.DOC"
          :class="[ns.e('right-toolbar')]"
        >
          <a-button
            v-if="userActions[BasicAction.Design]"
            type="primary"
            @click="() => designDoc(selectedNode!)"
            ><i class="iconfont icon-Custom"></i>设计</a-button
          >
        </div> -->
        <div :class="[ns.e('preview-container')]">
          <FormTmplDetail
            :class="[ns.e('preview-doc')]"
            v-if="previewDocId"
            :tmpl-id="previewDocId"
            :key="previewDocId"
          />
          <a-empty v-else :description="$t('sys.noData')" :image="EmptyImg" />
        </div>
      </div>
    </template>
  </Split>
</template>

<script setup lang="ts" name="edhr-content">
  import { computed, ref, watch } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import {
    OutlineTreeNode,
    OutlineType,
    useEDHRWiki,
  } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
  import { EdhrOutlineToggleTree } from './edhr-outline';
  import EmptyImg from '@/assets/images/edhr-empty.png';

  import { BasicAction } from '/@/enums/authActionEnum';
  import { useEdhrVersion } from '../../web-render';
  import Split from '/@/components/Split/split.vue';
  import { FormTmplDetail } from '/@online-form/views/web-render/components';
  import { Dropdown } from '/@/components/Dropdown/index';
  import { OutlineActionType, NodeAddMenus } from './edhr-outline/constants';

  const ns = useNamespace('edhr-content');
  const { form2dhrUsePerms } = useEdhrVersion();

  const props = withDefaults(
    defineProps<{
      edhrId: string;
      defaultEdit?: boolean;
      readonly?: boolean;
      requestOutLine?: (payload: any) => Promise<any>;
    }>(),
    {
      defaultEdit: false,
    },
  );

  const { initialize, designDoc } = useEDHRWiki({
    requestOutLine: props.requestOutLine,
  });

  const width = ref(309);

  const emit = defineEmits<{}>();

  const selectedNode = ref<OutlineTreeNode>();
  const previewDocId = computed(() => {
    if (selectedNode.value?.type === OutlineType.DOC) {
      return selectedNode.value.refId || selectedNode.value.key;
    } else {
      return undefined;
    }
  });
  const searchKey = ref<string>();
  const isEdit = ref(props.defaultEdit);
  const toggleTreeRef = ref<IData>();

  watch(
    () => props.edhrId,
    () => {
      if (props.edhrId) {
        initialize(props.edhrId);
        selectedNode.value = undefined;
      }
    },
    {
      immediate: true,
    },
  );

  /** 切换编辑状态 */
  const onToggle = () => {
    isEdit.value = !isEdit.value;
  };

  /** 切换折叠/展开状态 */
  const onCollapseOrExpand = () => {
    // TODO:
    toggleTreeRef.value!.expandToggle();
  };
  /** 添加目录 */
  const onAddOutline = () => {
    // TODO:
    toggleTreeRef.value!.newOutline();
  };
  /** 删除 */
  const onRemove = () => {
    // TODO:
    toggleTreeRef.value!.remove();
  };

  const handleTreeSelect = (node: OutlineTreeNode | undefined) => {
    selectedNode.value = node;
  };

  const doAction = async (actionKey: OutlineActionType) => {
    console.log('执行行为:', actionKey);
    switch (actionKey) {
      case OutlineActionType.NEW_OUTLINE:
        toggleTreeRef.value!.addOutline();
        break;
      case OutlineActionType.NEW_DOC:
        toggleTreeRef.value!.addDoc();
        break;
    }
  };
</script>

<style lang="scss" scoped>
  $edhr-content: ();

  @include b(edhr-content) {
    @include set-component-css-var(edhr-content, $edhr-content);

    @include e(left) {
      padding-right: 16px;
      height: 100%;
      width: 100%;
      :deep(.ant-btn) {
        height: 36px;
        padding: 4px 0;
        &.ant-btn-text {
          border-color: transparent;
        }
      }
    }

    @include e(left-toolbar) {
      display: flex;
      justify-content: space-between;
    }

    @include e(search-input) {
      padding: 1px 11px;
      font-size: 12px;
      margin: 8px 0;
    }

    @include e(preview-container) {
      flex-grow: 1;
      height: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      :deep(.ant-empty-description) {
        color: #666666;
        font-size: 16px;
        font-weight: 400;
      }
    }

    @include e(remove) {
      margin-left: 12px;
      color: #212528;
    }

    @include e(right) {
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    @include e(right-toolbar) {
      padding-bottom: 12px;
      text-align: right;

      :deep(.ant-btn) {
        height: 28px;
        padding: 1px 12px;
        > i {
          margin-right: 8px;
        }
      }
    }

    @include e(preview-doc) {
      height: 100%;
      width: 100%;
    }

    @include e(tree) {
      height: calc(100% - 80px);
    }
  }
</style>
