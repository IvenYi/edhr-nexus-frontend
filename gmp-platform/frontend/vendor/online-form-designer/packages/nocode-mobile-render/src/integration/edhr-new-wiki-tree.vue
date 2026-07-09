<template>
  <div class="edhr-new-wiki-tree-wrapper">
    <div
      class="edhr-new-wiki-tree-container"
      :class="{
        'edhr-new-wiki-tree--hidden': !treeVisible,
      }"
    >
      <!-- <div class="edhr-new-wiki-tree-toggle" @click="handleTreeToggle">
        <i class="iconfont icon-a-Leftarrow"></i>
      </div> -->
      <div class="edhr-new-wiki-tree-menu">
        <van-tabs v-model:activeKey="activeKey" border>
          <van-tab title="目录">
            <Scrollbar class="p-8px">
              <PureTree
                class="mobile-edhr-menu-tree"
                :nodes="treeNodes"
                @node-click="onNodeClick"
                @node-arrow-click="onArrowClick"
              >
              </PureTree>
            </Scrollbar>
          </van-tab>
          <van-tab title="附件">
            <Scrollbar class="px-4px pb-8px" v-if="computedAppendixList?.length">
              <div class="appendix-list">
                <div
                  class="appendix-item"
                  :class="treeSelectDocData.id === item.id && 'appendix-item--selected'"
                  v-for="item in computedAppendixList"
                  :key="item.id"
                  @click="onSelectAppendix(item)"
                >
                  <div class="appendix-item__title">{{ item.tmplName }}</div>
                </div>
              </div>
            </Scrollbar>
            <van-empty v-else />
          </van-tab>
          <van-tab title="文件">
            <Scrollbar class="px-4px pb-8px" v-if="docList?.length">
              <div class="appendix-list">
                <div
                  class="appendix-item"
                  v-for="item in docList"
                  :key="item.id_"
                  @click="onSelectDoc(item)"
                >
                  <div class="appendix-item__title">{{ item.name_ }}</div>
                </div>
              </div>
            </Scrollbar>
            <van-empty v-else />
          </van-tab>
        </van-tabs>
      </div>
      <div class="ebr-new-wiki-print-btn">
        <slot name="print"></slot>
      </div>
      <van-collapse
        v-if="isShowInstanceArea && computedDocInstancesList?.length"
        v-model="collapseActiveKey"
        :bordered="false"
      >
        <van-collapse-item name="1">
          <template #title>
            <div class="header-title">{{ $t('sys.edhr.formInstRecords') }}</div>
          </template>

          <div class="instance-content">
            <Scrollbar class="px-4px py-4px">
              <van-collapse
                v-model="collapseActiveKey_"
                :bordered="false"
                :accordion="true"
                class="edhr-new-wiki-instance-collapse-inner"
              >
                <van-collapse-item
                  v-for="(item, index) of computedDocInstancesList"
                  :key="item.id"
                  :class="{
                    'edhr-new-wiki-instance-item--selected': selectSelfInfo?.id === item.id,
                  }"
                  :name="item.id"
                >
                  <!-- <template #icon>
                    <van-icon name="play" color="#ccc" size="12px" />
                  </template>
                  <template #right-icon> </template> -->
                  <template #title>
                    <div class="header-title-content" @click.stop="onSelectInstanceItem(item)">
                      <span class="title">{{
                        `#${(computedDocInstancesList.length ?? 0) - index}
                        【${item.ext2 ?? item.tmplName}】
                        ${index === 0 ? '(' + $t('sys.edhr.latest') + ')' : ''}`
                      }}</span>
                      <div class="status">
                        <slot name="status" :item="item"> </slot>
                      </div>
                    </div>
                  </template>
                  <div class="content" @click.stop="onSelectInstanceItem(item)">
                    <div>
                      <span>{{ $t('sys.createTime') }}: </span>
                      <span>{{ item.createTime }}</span>
                    </div>
                    <div>
                      <span>{{ $t('sys.updateTime') }}: </span>
                      <span>{{ item.modifyTime }}</span>
                    </div>
                    <div>
                      <span>{{ $t('sys.updatePerson') }}: </span>
                      <span>{{ item.modifyUserName }}</span>
                    </div>
                  </div>
                </van-collapse-item>
              </van-collapse>
            </Scrollbar>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script setup lang="ts" name="edhr-new-wiki-tree">
  import { ref, nextTick, Ref, inject, computed, reactive } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { PureTree, IPureTreeNode, NodeTitle } from '../components/_common_/pure-tree';

  import type { IWikiTreeData } from '@gct/nocode-base';

  const props = defineProps<{
    /** wiki目录树 */
    wikiTreeData: Array<IWikiTreeData>;
    /** 附录列表 */
    appendixList?: Array<any>;
    /** 文件列表 */
    docList?: Array<any>;
    /** 在线表单实例列表 */
    docInstanceList: Array<OnlineFormInstanceResponse>;
    /** 选择的表单信息 */
    treeSelectDocData: any;
    /** 选择的实例信息 */
    selectSelfInfo: any;
    /** 隐藏生成实例区域 */
    hideInstanceArea?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:treeSelectDocData', value?: any): void;
    (e: 'update:selectSelfInfo', value?: any): void;
    (e: 'selectDoc', value?: any): void;
  }>();

  const treeNodes = computed(() => {
    return props.wikiTreeData.map(recursiveToNode);
  });

  const cacheExpanded = reactive({});

  const selectedId = computed(() => props.treeSelectDocData?.id || '');

  const onArrowClick = (node) => {
    console.log('onArrowClick', node);
    cacheExpanded[node.id] = !node.expanded;
  };

  function onNodeClick(node) {
    if (node.__origin.type === 'OUTLINE') {
      cacheExpanded[node.id] = !node.expanded;
      return;
    }
    console.log('onNodeClick', node);
    emit('update:treeSelectDocData', node.__origin);
    emit('update:selectSelfInfo', null);
  }

  function recursiveToNode(wikiNode: IWikiTreeData): IPureTreeNode & { __origin: IWikiTreeData } {
    return {
      id: wikiNode.id!,
      name: wikiNode.name!,
      expanded: cacheExpanded[wikiNode.id!] ?? true,
      selected: selectedId.value === wikiNode.id,
      __origin: wikiNode,
      children: wikiNode.children?.map(recursiveToNode),
    };
  }

  const treeVisible = ref<boolean>(true);
  const collapseActiveKey = ref(['1']);
  const collapseActiveKey_ = ref(['0']);

  const activeKey = ref('1');

  const isShowInstanceArea = computed(() => {
    return (
      !props?.hideInstanceArea &&
      [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(
        props.selectSelfInfo?.formType,
      )
    );
  });

  const computedDocInstancesList = computed(() => {
    return props.docInstanceList?.filter((item) => item.formType) ?? [];
  });

  const computedAppendixList = computed(() => {
    const seen = new Set();
    return (
      props.appendixList
        ?.filter((item) => item.formType)
        ?.filter((item) => {
          const key = item.tmplId;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }) ?? []
    );
  });

  //! 会出现点击以后 tooltip先变更 再动画的问题
  const handleTreeToggle = async () => {
    await nextTick();
    setTimeout(() => {
      treeVisible.value = !treeVisible.value;
    }, 1);
  };

  function onSelect(_, e: { node }) {
    const { dataRef } = e.node || {};
    if (props.treeSelectDocData && props.treeSelectDocData.id === dataRef.id) {
      return;
    }
    emit('update:treeSelectDocData', dataRef);
    emit('update:selectSelfInfo', null);
  }

  function onSelectAppendix(dataRef) {
    if (props.treeSelectDocData && props.treeSelectDocData.id === dataRef.id) {
      return;
    }
    emit('update:treeSelectDocData', dataRef);
    emit('update:selectSelfInfo', null);
  }

  function onSelectDoc(data) {
    emit('selectDoc', data);
  }

  function onSelectInstanceItem(data) {
    if (props.selectSelfInfo?.id === data.id) {
      return;
    }

    emit('update:selectSelfInfo', data);
  }
</script>

<style scoped lang="less">
  .edhr-new-wiki-tree-wrapper {
    position: relative;
    display: flex;
    height: 100%;
  }
  .edhr-new-wiki-tree-container {
    position: relative;
    color: rgba(0, 0, 0, 0.6);
    width: 240px;
    height: auto;
    display: block;
    background: #fff;
    display: flex;
    flex-shrink: 0;
    flex-direction: column;

    transition: all 0.3s;
    min-height: 200px;
    box-shadow: 4px 0px 4px 0px rgba(0, 0, 0, 0.08);
    z-index: 1;

    &.edhr-new-wiki-tree--hidden {
      width: 0;
      border-right: 0;
      padding-left: 0;
      padding-right: 0;
      visibility: hidden;

      .edhr-new-wiki-instance-collapse {
        display: none;
      }

      .edhr-new-wiki-tree-toggle {
        .iconfont {
          transform: rotateY(180deg);
        }
      }

      .ebr-new-wiki-action-btn {
      }
    }

    .edhr-new-wiki-tree-title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      // padding: 8px 8px 7px 16px;
      // border-bottom: 1px solid #e5e7eb;

      .edhr-new-wiki-tree-title {
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        line-height: 32px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
        cursor: default;
      }

      .ebr-new-wiki-action-btn {
        display: flex;
        align-items: center;
      }
    }

    .ebr-new-wiki-print-btn {
      width: 100%;
      padding: 8px;
    }

    .edhr-new-wiki-tree-menu {
      width: 100%;
      height: 100%;
      overflow: auto;
      flex: 1;

      .tree-node {
        display: flex;
        position: relative;
        align-items: center;

        &.type-doc {
          color: #242424;
        }

        &__title {
          flex: 1;
          width: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 12px 0 8px;
        }
      }

      .appendix-list {
        .appendix-item {
          display: flex;
          align-items: center;
          margin-bottom: 0;
          padding: 8px 12px;
          transition: all 0.3s;
          border-radius: 0;
          cursor: pointer;

          &:hover {
            background-color: #e3eafc;
          }

          &--selected {
            background-color: #e3eafc;
          }
        }
      }
    }
  }

  .edhr-new-wiki-tree-toggle {
    --bg: #b5bac3;
    position: absolute;
    right: 0;
    top: 50%;
    font-size: 12px;
    line-height: 1;
    width: 14px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translate3d(100%, -50%, 0);
    background: var(--bg);
    cursor: pointer;
    border-radius: 0 4px 4px 0;
    color: #fff;
    z-index: 999;
    visibility: visible;

    .iconfont {
      color: #fff;
      font-size: 10px;
      line-height: 1em;
    }

    &::before {
      content: '' !important;
      position: absolute;
      top: -12px;
      left: 0px;
      width: 12px;
      height: 12px;
      background-image: url('@/assets/svg/ebr-action.svg');
      background-repeat: no-repeat;
      background-size: contain;
    }

    &::after {
      content: '' !important;
      position: absolute;
      top: 32px;
      left: 0px;
      width: 12px;
      height: 12px;
      transform: rotate(90deg);
      background-image: url('@/assets/svg/ebr-action.svg');
      background-repeat: no-repeat;
      background-size: contain;
    }
  }
</style>
<style scoped lang="less">
  :deep(.van-collapse-item__content) {
    padding: 0 !important;
  }
  .edhr-new-wiki-instance-collapse-inner {
    .edhr-new-wiki-instance-item--selected {
      background: #e3eafc;
    }

    :deep(.van-cell__title) {
      overflow: hidden;
    }

    .content {
      padding: 8px 12px;
      font-size: 12px;
      line-height: 20px;
    }

    .header-title-content {
      width: 100%;
      display: flex;
      height: 24px;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      padding-left: 4px;
      padding-right: 8px;
      overflow: hidden;

      .title {
        color: #212528;
        flex: 1;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 4px;
      }

      .status {
      }
    }
  }
</style>
