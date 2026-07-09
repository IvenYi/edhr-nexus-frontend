<template>
  <div class="ebr-tree-menu">
    <!-- /*目录 > 目录树 * / -->
    <Scrollbar class="px-8px pt-8px pb-2px">
      <a-tree
        class="tree-instance"
        auto-expand-parent
        default-expand-all
        block-node
        show-icon
        :fieldNames="treeSettings"
        :tree-data="wikiTreeData"
        :selectedKeys="[selectedKey]"
        @select="onSelect"
      >
        <template #title="{ data }">
          <div
            :class="[
              'tree-node',
              data.type === 'DOC' && 'type-doc',
              data.formType,
              taggedOutline?.includes(data.id) && 'tagged-node',
            ]"
          >
            <span class="tree-node__title" :title="data[f_title]">{{ data[f_title] }}</span>
            <i
              v-if="data.type === 'DOC'"
              class="iconfont icon-Frame"
              :title="$t('sys.edhr.instList')"
              @click.stop="openInstance(data)"
            ></i>
          </div>
        </template>
        <template #icon="{ data }">
          <i v-if="data.type === 'DOC'" class="doc-icon">
            <img :src="InstanceStatusIconMap[data.instanceStatus]" alt="" />
          </i>
        </template>
      </a-tree>
    </Scrollbar>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Scrollbar } from '/@/components/Scrollbar';
  import { InstanceStatusIconMap } from '../../utils/instance-status/instance-status-icons';
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
    wikiTreeData: IWikiTreeData[];
    /** 目录下选择的表单信息 */
    treeSelectDocData?: any;
    taggedOutline?: Array<string>;
  }>();

  const emit = defineEmits<{
    (e: 'select', data: any): void;
    (e: 'openInstance', data: any): void;
  }>();

  const selectedKey = computed(() => props.treeSelectDocData?.id || '');

  function onSelect(_, e: { node }) {
    const dataRef = e.node?.dataRef;
    emit('select', dataRef);
  }

  function openInstance(data) {
    emit('openInstance', data);
  }

  const traceLabel = $t('sys.model.field_type_trace');
</script>

<style scoped lang="less">
  .ebr-tree-menu {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    flex: 1;

    :deep(.ant-tree) {
      color: #1a1d23;
      border-radius: 0;
      font-weight: bold;
    }

    .tree-node {
      display: flex;
      position: relative;
      align-items: center;

      &.type-doc {
        color: #333333;
        font-weight: 400;
      }

      &__title {
        flex: 1;
        width: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 4px 0 4px;
      }

      .icon-Frame {
        width: 24px;
        height: 24px;
        justify-content: center;
        align-items: center;
        color: #8b8b8b;
        line-height: 1;
        display: none;

        &:hover {
          color: var(--ant-primary-color);
        }
      }
    }

    :deep(.tree-instance) {
      .ant-tree-treenode {
        align-items: center;
        margin-bottom: 0;
        padding: 6px 4px;
        transition: all 0.3s;
        border-radius: 4px;

        &:hover {
          background: #f4f7ff;

          .tree-node {
            color: #474747;

            &.type-doc {
              color: #242424;

              &.BASE,
              &.PROCESS,
              &.FILE {
                .icon-Frame {
                  display: flex;
                }
              }
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
          background-color: #e3eafc !important;
          font-weight: 500;

          .tree-node.type-doc {
            color: var(--ant-primary-color) !important;

            &.BASE,
            &.PROCESS,
            &.FILE {
              .icon-Frame {
                display: flex;
                color: var(--ant-primary-color) !important;
              }
            }
          }

          .ant-tree-node-selected {
            background-color: transparent;
          }
        }

        &:has(.tagged-node) {
          background-color: #f9fafb;
          position: relative;
          overflow: hidden;

          &::before {
            color: #fff;
            font-size: 10px;
            text-align: center;
            content: '追溯';
            display: block;
            position: absolute;
            left: -14px;
            top: 4px;
            background-color: #026ac8;
            transform: rotate(-45deg);
            width: 50px;
          }
        }
      }
    }
  }
</style>
