<template>
  <div class="edhr-new-wiki-tree-wrapper">
    <div
      class="edhr-new-wiki-tree-container"
      :class="{
        'edhr-new-wiki-tree--hidden': !treeVisible,
      }"
    >
      <div class="edhr-new-wiki-tree-toggle" @click="handleTreeToggle">
        <i class="iconfont icon-a-Leftarrow"></i>
      </div>
      <div class="edhr-new-wiki-tree-menu">
        <a-tabs v-model:activeKey="activeKey" centered>
          <a-tab-pane key="1" :tab="$t('sys.edhr.ebr.category.catalogue')">
            <Scrollbar class="px-4px pb-8px">
              <a-tree
                class="tree-instance"
                auto-expand-parent
                default-expand-all
                block-node
                showIcon
                :fieldNames="treeSettings"
                :tree-data="wikiTreeData"
                :selectedKeys="[treeSelectDocData.id]"
                @select="onSelect"
              >
                <template #title="{ data }">
                  <div :class="['tree-node', data.type === 'DOC' && 'type-doc']">
                    <span class="tree-node__title" :title="data[f_title]">{{ data[f_title] }}</span>
                  </div>
                </template>
                <template #icon="{ data }">
                  <i v-if="data.type === 'DOC'" class="doc-icon"> </i>
                </template>
              </a-tree>
            </Scrollbar>
          </a-tab-pane>
          <a-tab-pane key="2" :tab="$t('sys.edhr.ebr.subModule.appendix')">
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
            <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </a-tab-pane>
          <a-tab-pane key="3" :tab="$t('sys.file')">
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
            <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" />
          </a-tab-pane>
        </a-tabs>
      </div>
      <div class="ebr-new-wiki-print-btn">
        <slot name="print"></slot>
      </div>
      <a-collapse
        v-if="isShowInstanceArea && computedDocInstancesList?.length"
        class="edhr-new-wiki-instance-collapse"
        v-model:activeKey="collapseActiveKey"
        :bordered="false"
        expandIconPosition="right"
        ghost
      >
        <template #expandIcon="{ isActive }">
          <UpOutlined :rotate="isActive ? 180 : 0" />
        </template>

        <a-collapse-panel key="1">
          <template #header>
            <div class="header-title">{{ $t('sys.edhr.formInstRecords') }}</div>
          </template>
          <div class="instance-content">
            <Scrollbar class="px-4px py-4px">
              <a-collapse :bordered="false" ghost class="edhr-new-wiki-instance-collapse-inner">
                <template #expandIcon="{ isActive }">
                  <CaretRightOutlined :rotate="isActive ? 90 : 0" />
                </template>

                <a-collapse-panel
                  v-for="(item, index) of computedDocInstancesList"
                  :key="item.id"
                  :class="{
                    'edhr-new-wiki-instance-item--selected': selectSelfInfo?.id === item.id,
                  }"
                >
                  <template #header>
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
                    <a-descriptions
                      :column="1"
                      :colon="true"
                      :labelStyle="{ color: '#666', fontSize: '12px' }"
                      :contentStyle="{ color: '#252525', fontSize: '12px' }"
                    >
                      <a-descriptions-item :label="$t('sys.createTime')">
                        {{ item.createTime }}
                      </a-descriptions-item>
                      <a-descriptions-item :label="$t('sys.updateTime')">
                        {{ item.modifyTime }}
                      </a-descriptions-item>
                      <a-descriptions-item :label="$t('sys.updatePerson')">
                        {{ item.modifyUserName }}
                      </a-descriptions-item>
                    </a-descriptions>
                  </div>
                </a-collapse-panel>
              </a-collapse>
            </Scrollbar>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>

<script setup lang="ts" name="edhr-new-wiki-tree">
  import { ref, nextTick, Ref, inject, computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';

  import type { IWikiTreeData } from '@gct/nocode-base';

  const f_key = 'id';
  const f_title = 'name';
  const f_children = 'children';

  const treeSettings = {
    children: f_children,
    title: f_title,
    key: f_key,
  };

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

  const treeVisible = ref<boolean>(true);
  const collapseActiveKey = ref(['1']);

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
        .ant-btn {
          display: none;
        }
      }
    }

    .edhr-new-wiki-tree-title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 8px 7px 16px;
      border-bottom: 1px solid #e5e7eb;

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

      :deep(.ant-tree) {
        color: #8f8f8f;
        border-radius: 0;
      }

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

      :deep(.tree-instance) {
        .ant-tree-treenode {
          align-items: center;
          margin-bottom: 0;
          padding: 8px 12px;
          transition: all 0.3s;
          border-radius: 0;

          &:hover {
            background-color: hsl(from var(--ant-primary-color) h s 98%);

            .tree-node {
              color: #474747;

              &.type-doc {
                color: #242424;
              }
            }
          }

          .ant-tree-node-content-wrapper {
            padding: 0;
            display: flex;
            width: 100%;
            transition: none;

            .ant-tree-icon__customize {
              flex-shrink: 0;
              justify-content: center;
              align-items: center;
              display: flex;
              width: auto;
              .doc-icon {
                width: 4px;
                height: 4px;
                display: block;
                background: var(--ant-primary-color);
                border-radius: 50%;
              }
            }

            &:hover {
              background: transparent;
            }
          }

          .ant-tree-indent {
            .ant-tree-indent-unit {
              width: 16px;
            }
          }

          .ant-tree-title {
            width: 100%;
          }

          .ant-tree-switcher {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            height: 24px;
            padding-right: 0;
            line-height: 24px;

            .ant-tree-switcher-icon {
              color: #8f8f8f;
              font-size: 16px;
            }
          }

          &-selected {
            background-color: transparent !important;

            .tree-node.type-doc {
              color: var(--ant-primary-color) !important;
            }

            .ant-tree-node-selected {
              background-color: transparent;
            }
          }
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
            background-color: hsl(from var(--ant-primary-color) h s 98%);
          }

          &--selected {
            color: var(--ant-primary-color) !important;
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
  .ant-collapse.edhr-new-wiki-instance-collapse {
    background: #f8f8f8;

    :deep(> .ant-collapse-item) {
      > .ant-collapse-header {
        border-top: 1px solid #e8ecf0;

        padding: 16px 12px !important;
        line-height: 24px;
        > div:first-child {
          display: flex;
          align-items: center;
          justify-content: center;
          .anticon {
            font-size: 14px;
            color: #3168ec;
            right: 16px;
          }
        }

        .header-title {
          height: 24px;
          align-items: center;
          line-height: 24px;
          padding-right: 32px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
      > .ant-collapse-content {
        > .ant-collapse-content-box {
          display: flex;
          padding: 0 !important;
          max-height: 300px;
          overflow: hidden;
          width: 100%;
          height: 100%;
          overflow: hidden;
          border-top: 1px solid #e8ecf0;

          .instance-content {
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
            background-color: #fff;
          }

          .ant-collapse.edhr-new-wiki-instance-collapse-inner {
            .ant-collapse-item {
              margin-bottom: 4px;
              &:hover {
                background: #f4f7ff;
              }

              &.edhr-new-wiki-instance-item--selected {
                background: #e3eafc;
              }
            }
            .ant-collapse-header {
              padding: 8px !important;
              > div:first-child {
                display: flex;
                align-items: center;
                height: 24px;
                width: 24px;
                justify-content: center;
                .anticon {
                  font-size: 16px;
                  margin-right: 0;
                  color: #8f8f8f;
                }
              }

              .header-title-content {
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
            .ant-collapse-content-box {
              padding: 0 !important;

              .content {
                padding: 8px 16px;
                cursor: pointer;

                .ant-descriptions-item {
                  padding-bottom: 4px !important;
                }
              }
            }
          }
        }
      }
    }
  }
</style>
