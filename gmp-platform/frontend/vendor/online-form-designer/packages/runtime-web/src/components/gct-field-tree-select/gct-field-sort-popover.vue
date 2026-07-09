<template>
  <a-popover
    trigger="click"
    placement="bottom"
    :getPopupContainer="(element) => element.parentNode"
    :overlayStyle="{ paddingTop: 0 }"
  >
    <slot></slot>
    <template #content>
      <div class="w230px m--14px pb16px">
        <div class="popover-title"> 显示字段</div>
        <a-tree
          defaultExpandAll
          v-if="groupOptions.length"
          :fieldNames="fieldNames"
          :height="300"
          draggable
          :tree-data="groupOptions"
          show-icon
          class="tree-field"
          :class="{ 'gct-no-drop': !selectedDrop }"
          :selectable="false"
          @drop="onDrop"
          @dragstart="dragend"
          :allowDrop="allowDrop"
          :virtual="false"
        >
          <template #icon="{ isGroup, key }">
            <SvgIcon v-if="isGroup" class="folder" size="20" name="folder" />
            <span
              v-else-if="getFieldTypeByKey(key)"
              class="iconfont primary-gct"
              :class="FieldIconMap[getFieldTypeByKey(key)]"
            ></span>
          </template>
          <template #title="{ noDrag, data, key, isGroup }">
            <div class="ks-row" :key="key">
              <div class="ks-col ell">
                {{ getFieldTitle(data) }}
              </div>

              <span
                class="iconfont mr-4px"
                v-if="!isGroup"
                @click="hiddenField(key)"
                :class="getFieldVisible(key) ? 'icon-yulan' : 'icon-baomi'"
              ></span>

              <a-tooltip title="拖动排序" v-if="!noDrag">
                <span class="icon-drag iconfont"></span>
              </a-tooltip>
            </div>
          </template>
        </a-tree>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, computed, reactive } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { cloneDeep } from 'lodash-es';
  import { FieldIconMap } from '@gct/runtime';

  const props = defineProps({
    /**字段map */
    fieldMap: {
      type: Object,
      default: () => ({}),
    },
    /**多级表头数据 */
    groupOptions: {
      type: Array,
      default: () => [],
    },
    fieldNames: {
      type: Object,
      default: () => ({
        children: 'children',
        title: 'title',
        key: 'key',
      }),
    },
    getLabelByFun: {
      type: Function,
      default: () => {},
    },
    getFieldTypeByFun: {
      type: Function,
      default: () => {},
    },
    getFieldHiddenByFun: {
      type: Function,
      default: (data) => data.visible,
    },
    changeFieldHiddenByFun: {
      type: Function,
      default: (data, v) => {
        data.visible = v;
      },
    },
  });
  /**记录能否拖拽成功开关  标记线的颜色 */
  const selectedDrop = ref(true);
  /**拖拽后需要收起的节点 */
  const dropExpandedKey = ref();
  const emit = defineEmits(['change']);
  const {
    fieldNames,
    getLabelByFun,
    fieldMap,
    getFieldTypeByFun,
    getFieldHiddenByFun,
    changeFieldHiddenByFun,
  } = props;
  const groupOptions = reactive(props.groupOptions);
  function getFieldTitle(data) {
    if (data.isGroup) {
      return data[fieldNames.title];
    } else {
      return getLabelByFun(fieldMap[data[fieldNames.key]]);
    }
  }
  function getFieldVisible(key) {
    return getFieldHiddenByFun(fieldMap[key]);
  }
  function getFieldTypeByKey(key): string {
    return getFieldTypeByFun(fieldMap[key]);
  }

  /**拖拽前记录被拖拽文件夹状态  */
  function dragend({ node }) {
    if (!node.isGroup) return;
    const dropClassKey = node.expanded ? 'gct-' + node.key : undefined;
    dropExpandedKey.value = dropClassKey;
    node.dataRef.class = dropClassKey;
    // console.log(dropExpandedKey.value, node.expanded, node.key);
  }
  /**
   * 拖拽后的节点恢复展开 模拟点击
   */
  async function closeDragNodeByClass() {
    // console.log('closeDragNodeByClass', dropExpandedKey.value);
    if (!dropExpandedKey.value) return;
    await nextTick();
    const dragNode = document.querySelector(`.${dropExpandedKey.value}`);
    dragNode && dragNode.childNodes[2] && dragNode.childNodes[2].click();
  }
  const onDrop = async (info) => {
    if (!selectedDrop.value) return;
    const { dropToGap, dragNode, node } = info;
    const dropPosition = info.dropPosition;
    //获取被拖拽的节点
    const _dNode = await new Promise((resolve) => {
      loop(groupOptions, dragNode.key, (value, index, children) => {
        const node = children.splice(index, 1);
        resolve(cloneDeep(node[0]));
      });
    });
    loop(groupOptions, node.key, (value, index, children) => {
      if (node.isGroup && !dropToGap) {
        value.children.unshift(_dNode);
      } else {
        children.splice(dropPosition === -1 ? index : index + 1, 0, _dNode);
      }
    });
    emit('change', cloneDeep(groupOptions));
    closeDragNodeByClass();
  };

  const loop = (data: any[], key: string, callback: any, parent?: object) => {
    const length = data.length;
    for (let i = 0; i < length; i++) {
      const item = data[i];
      if (item[fieldNames.key] === key) {
        callback(item, i, data, parent);
        break;
      }
      if (item.children) {
        loop(item.children, key, callback, item);
      }
    }
  };

  /**计算是否可以拖拽 */
  function getAllowDrop({ dragNode, dropNode, dropPosition }) {
    // if (dragNode.dataRef.noDrag) return false;
    // if (dropPosition === 0) {
    //   return dragNode.parent?.key === dropNode.key;
    // }
    let sameLevel = false;
    loop(groupOptions, dropNode.key, (value, index, children, parent) => {
      sameLevel = dragNode.parent?.key === parent?.key;
    });
    return sameLevel;
  }

  /**
   * 同级拖拽
   */
  function allowDrop({ dragNode, dropNode, dropPosition }) {
    // console.log(dragNode, dropNode, dropPosition);
    if (dragNode.dataRef.noDrag || (dragNode.parent && dropPosition === -1)) return false;
    if (dropPosition === 0) {
      //嵌套场景不给拖拽
      return dragNode.parent?.key === dropNode.key;
    }
    /**记录不可拖拽状态  改变线条样式 */
    selectedDrop.value = getAllowDrop({ dragNode, dropNode, dropPosition });

    return true;
  }

  function hiddenField(key) {
    const visible = getFieldVisible(key);
    changeFieldHiddenByFun(fieldMap[key], !visible);
    emit('change', cloneDeep(groupOptions));
  }
</script>
<style lang="scss" scoped>
  .popover-title {
    padding: 8px;
    border-bottom: 1px solid #e0e3eb;
    color: #212528;
    font-weight: 500;
  }

  :deep(.gct-no-drop) {
    color: red;

    .ant-tree-drop-indicator {
      background-color: #8e8e8e !important;
    }
  }

  :deep(.tree-field) {
    padding-top: 8px;

    .ant-tree-title {
      .iconfont {
        font-size: 12px;
      }
    }

    .ant-tree-icon__customize {
      width: 20px;
      text-align: left;
    }

    .ant-tree-list-holder > div {
      margin: 0 6px;
    }

    .ant-tree-treenode {
      display: flex;
      position: relative;
      box-sizing: border-box;
      align-items: center;
      width: 100%;
      padding: 6px 2px;
      overflow: hidden;
      transition: background 0.3s;
      border-radius: 4px;
      color: #5e5e5e;

      &:hover {
        background: var(--ant-primary-1);
      }

      .ant-tree-switcher-noop {
        width: 0;
      }

      .ant-tree-indent-unit {
        width: 12px;
      }
    }

    .ant-tree-node-content-wrapper {
      display: flex;
      flex: 1;
      flex-shrink: 1;
      flex-wrap: wrap;
      min-width: 0;

      .ant-tree-title {
        flex: 1;
        overflow: hidden;
      }
    }

    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 24px;
      line-height: 24px;

      .ant-tree-switcher-icon {
        color: #797a7d;
        font-size: 16px;
      }
    }

    .ant-tree-drop-indicator {
      // left: -8px !important; /* 向左延伸 */
      // width: calc(100% + 16px) !important; /* 增加宽度 */
      &::after {
        display: none !important;
      }
    }
  }
</style>
