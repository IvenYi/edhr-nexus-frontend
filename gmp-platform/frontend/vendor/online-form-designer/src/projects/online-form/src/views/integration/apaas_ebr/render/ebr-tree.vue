<template>
  <div class="ebr-tree-wrapper">
    <div
      class="ebr-tree-container"
      :class="{
        'ebr-tree--hidden': !treeVisible,
      }"
    >
      <div class="ebr-tree-toggle" @click="handleTreeToggle">
        <i class="iconfont icon-a-Leftarrow"></i>
      </div>
      <div class="ebr-tree-title-content">
        <div class="ebr-tree-title" :title="edhrInstance?.tmplName || $t('sys.edhr.catalog')">{{
          edhrInstance?.tmplName || $t('sys.edhr.catalog')
        }}</div>
        <div class="ebr-action-btn">
          <a-button type="primary" @click="openLinkList">
            {{ $t('sys.pageDesigner.refList') }}
          </a-button>
          <slot name="batch-print"></slot>
        </div>
      </div>

      <div class="ebr-tree-menu">
        <Scrollbar class="px-4px py-8px">
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
              <i v-if="data.type === 'DOC'" class="doc-icon">
                <img :src="InstanceStatusIconMap[data.instanceStatus]" alt="" srcset="" />
              </i>
            </template>
          </a-tree>
        </Scrollbar>
      </div>

      <a-collapse
        v-if="isShowInstanceArea && docInstanceList && docInstanceList.length"
        class="ebr-instance-collapse"
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
          <template #extra>
            <slot name="create-instance"></slot>
          </template>
          <div class="instance-content">
            <Scrollbar class="px-4px py-4px">
              <a-collapse :bordered="false" ghost class="ebr-instance-collapse-inner">
                <template #expandIcon="{ isActive }">
                  <CaretRightOutlined :rotate="isActive ? 90 : 0" />
                </template>

                <a-collapse-panel
                  v-for="(item, index) of docInstanceList"
                  :key="item.id"
                  :class="{
                    'ebr-instance-item--selected': selectSelfInfo?.id === item.id,
                  }"
                >
                  <template #header>
                    <div class="header-title-content" @click.stop="onSelectInstanceItem(item)">
                      <span
                        class="title"
                        :title="`${item.description || ''}${index === 0 ? `(${$t('sys.edhr.latest')})` : ''}`"
                        >{{
                          `${item.description || ''}${index === 0 ? `(${$t('sys.edhr.latest')})` : ''}`
                        }}</span
                      >
                      <instance-status-label
                        :form-type="item.formType!"
                        :data-status="item.dataStatus"
                        :instance-status="item.instanceStatus!"
                        use-dynamic-color
                      />
                    </div>
                  </template>
                  <div class="content" @click.stop="onSelectInstanceItem(item)">
                    <a-descriptions
                      :column="1"
                      :colon="true"
                      :labelStyle="{ color: '#666', fontSize: '12px' }"
                      :contentStyle="{ color: '#252525', fontSize: '12px' }"
                    >
                      <a-descriptions-item :label="t('sys.createTime')">
                        {{ item.createTime }}
                      </a-descriptions-item>
                      <a-descriptions-item :label="t('sys.updateTime')">
                        {{ item.modifyTime }}
                      </a-descriptions-item>
                      <a-descriptions-item :label="t('sys.updatePerson')">
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

<script setup lang="ts" name="ebr-tree">
  import { ref, nextTick, Ref, inject, computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { EdhrInstanceResponse, OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import { EBR_PROVIDE_ENUM } from '/@online-form/views/integration/utils/enum';
  import { InstanceStatusIconMap } from '../utils/instance-status/instance-status-icons';
  import InstanceStatusLabel from '../utils/instance-status/instance-status-label.vue';
  import { useApaasEbr } from '/@online-form/views/integration/apaas_ebr/index';

  import type { IWikiTreeData } from '@gct/nocode-base';

  /** 权限控制 */
  const roleEdhrButtonPerm = inject<
    Ref<{
      Annotate: Boolean;
      Cancel: Boolean;
      Update: Boolean;
    }>
  >(
    EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION,
    ref({
      archived2EdhrInstance: false, //edhr实例是否已经归档
      EDHRRelate: false, // 关联EDHR按钮权限控制
      Annotate: false, // 变更记录按钮权限控制
      Cancel: false, // 表单作废 重新提交按钮权限控制
      Update: false, // 表单变更按钮权限控制
    }),
  );

  const { t } = useI18n();

  const f_key = 'id';
  const f_title = 'name';
  const f_children = 'children';

  const treeSettings = {
    children: f_children,
    title: f_title,
    key: f_key,
  };

  const props = defineProps<{
    /** edhr实例 */
    edhrInstance?: EdhrInstanceResponse;
    /** wiki目录树 */
    wikiTreeData: Array<IWikiTreeData>;
    /** 在线表单实例列表 */
    docInstanceList: Array<OnlineFormInstanceResponse>;
    /** 选择的表单信息 */
    treeSelectDocData: any;
    /** 选择的实例信息 */
    selectSelfInfo: any;
  }>();

  const emit = defineEmits<{
    (e: 'update:treeSelectDocData', value?: any): void;
    (e: 'update:selectSelfInfo', value?: any): void;
  }>();

  const treeVisible = ref<boolean>(true);
  const collapseActiveKey = ref(['1']);

  const { openLinkList: openLinkModal } = useApaasEbr();

  const isShowInstanceArea = computed(() => {
    return [FormTypeEnum.BASE, FormTypeEnum.PROCESS, FormTypeEnum.FILE].includes(
      props.selectSelfInfo?.formType,
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

  function openLinkList() {
    openLinkModal(props.edhrInstance?.materialNo, props.edhrInstance?.id, roleEdhrButtonPerm.value);
  }

  function onSelectInstanceItem(data) {
    if (props.selectSelfInfo?.id === data.id) {
      return;
    }

    emit('update:selectSelfInfo', data);
  }
</script>

<style scoped lang="less">
  .ebr-tree-wrapper {
    position: relative;
    display: flex;
  }
  .ebr-tree-container {
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

    &.ebr-tree--hidden {
      width: 0;
      border-right: 0;
      padding-left: 0;
      padding-right: 0;
      visibility: hidden;

      .ebr-action-btn {
        .ant-btn {
          display: none;
        }
      }
      .ebr-instance-collapse {
        display: none;
      }

      .batch-print {
        display: none !important;
      }

      .ebr-tree-toggle {
        .iconfont {
          transform: rotateY(180deg);
        }
      }
    }

    .ebr-tree-title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 8px 7px 16px;
      border-bottom: 1px solid #e5e7eb;

      .ebr-tree-title {
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

      .ebr-action-btn {
        display: flex;
        align-items: center;
        .batch-print {
          height: 32px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 4px;
          cursor: pointer;
          color: var(--ant-primary-color);
        }
      }
    }

    .ebr-tree-menu {
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
                width: 16px;
                height: 16px;
                line-height: 1;
                display: block;

                // border-radius: 50%;
                // background: #8f8f8f;
                // &.is-wried {
                //   background: var(--ant-primary-color);
                // }
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
    }
  }

  .ebr-tree-toggle {
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
  .ant-collapse.ebr-instance-collapse {
    background: #f8f8f8;
    // &.show-create-instance-btn {
    //   :deep(> .ant-collapse-item) {
    //     > .ant-collapse-header {
    //       > div:first-child {
    //         .anticon {
    //           right: 48px;
    //         }
    //       }
    //     }
    //   }
    // }
    :deep(> .ant-collapse-item) {
      > .ant-collapse-header {
        border-top: 1px solid #e8ecf0;

        padding: 16px 12px;
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

        .create-instance-btn {
          justify-content: center;
          line-height: 1;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          border-radius: 2px;
          cursor: pointer;
          background: #3168ec;
          color: #fff;
          font-size: 14px;
        }
      }
      > .ant-collapse-content {
        > .ant-collapse-content-box {
          display: flex;
          padding: 0;
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

          .ant-collapse.ebr-instance-collapse-inner {
            .ant-collapse-item {
              margin-bottom: 4px;
              &:hover {
                background: #f4f7ff;
              }

              &.ebr-instance-item--selected {
                background: #e3eafc;
              }
            }
            .ant-collapse-header {
              padding: 8px;
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
              }
            }
            .ant-collapse-content-box {
              padding: 0;

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

  .ebr-tree-wrapper.show-create-instance-btn {
    :deep(.ant-collapse.ebr-instance-collapse) {
      > .ant-collapse-item > .ant-collapse-header {
        > div:first-child {
          .anticon {
            right: 48px !important;
          }
        }
      }
    }
  }
</style>
