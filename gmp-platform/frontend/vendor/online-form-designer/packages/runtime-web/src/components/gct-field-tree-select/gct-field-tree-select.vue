<template>
  <a-popover
    trigger="click"
    placement="bottom"
    :getPopupContainer="(element) => element.parentNode"
    :overlayStyle="{ paddingTop: 0, paddingBottom: 0 }"
  >
    <a-select value="配置多级表头" dropdown-class-name="hidden" />
    <template #content>
      <div class="w230px m--14px">
        <a-tree
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
          :allowDrop="allowDrop"
          v-model:expandedKeys="expandedKeys"
          :virtual="false"
          ref="treeRef"
        >
          <template #icon="{ isGroup, key }">
            <SvgIcon v-if="isGroup" class="folder" size="20" name="folder" />
            <span
              v-else-if="getFieldTypeByKey(key)"
              class="iconfont primary-gct"
              :class="FieldIconMap[getFieldTypeByKey(key)]"
            ></span>
          </template>
          <template #title="{ key, isGroup, groupLevel, data }">
            <div class="ks-row">
              <a-input
                :value="getFieldTitle(data)"
                @update:value="(v) => setFieldTitle(v, data)"
                class="ks-col h24px"
                v-if="editorNode[fieldNames.key] === key"
                ref="editorInput"
                @blur="finishEditor(key)"
                :allowClear="false"
              />
              <div class="ks-col ell" v-else>
                {{ getFieldTitle(data) }}
              </div>
              <div class="action" v-if="editorNode[fieldNames.key] !== key">
                <a-popconfirm
                  v-if="isGroup"
                  placement="topLeft"
                  :title="$t('sys.pageDesigner.confirmTodo')"
                  @confirm="() => deleteFieldByid(key)"
                >
                  <a-tooltip title="删除">
                    <span
                      class="icon-shanchu iconfont mr6px cursor-pointer primary-gct-hover"
                    ></span
                  ></a-tooltip>
                </a-popconfirm>
                <a-tooltip title="添加子分组" v-if="isGroup && canAddChildGroup(key)">
                  <span
                    @click="addGroup(groupLevel + 1, key)"
                    class="icon-chuangjian iconfont mr6px cursor-pointer primary-gct-hover"
                  ></span
                ></a-tooltip>
                <a-tooltip title="重命名" v-if="isGroup">
                  <span
                    @click="editorRow(data)"
                    class="icon-a-Single-linetext iconfont mr6px cursor-pointer primary-gct-hover"
                  ></span
                ></a-tooltip>
                <a-tooltip title="拖动排序">
                  <span class="icon-drag iconfont"></span>
                </a-tooltip>
              </div>
            </div>
          </template>
        </a-tree>

        <div class="popover-bottom">
          <a-button type="link" @click="addGroup(1)">
            <template #icon>
              <plus-outlined />
            </template>
            添加表头分组
          </a-button>
        </div>
      </div>
    </template>
  </a-popover>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, reactive } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { cloneDeep } from 'lodash-es';
  import { FieldIconMap } from '@gct/runtime';
  import { message } from 'ant-design-vue';

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
    /**最大层级数，默认3层 */
    maxLevel: {
      type: Number,
      default: 3,
    },
    getLabelByFun: {
      type: Function,
      default: () => {},
    },
    getFieldTypeByFun: {
      type: Function,
      default: () => {},
    },
    setLabelByFun: {
      type: Function,
      default: () => {},
    },
  });
  const emit = defineEmits(['change']);
  const { fieldNames, getLabelByFun, setLabelByFun, getFieldTypeByFun } = props;
  /**记录能否拖拽成功开关  标记线的颜色 */
  const selectedDrop = ref(true);
  /**展开节点 */
  const expandedKeys = ref<any[]>([]);
  /**正在编辑德输入框组件 */
  const editorInput = ref();
  /**正在编辑的节点 */
  const editorNode = ref({});
  const treeRef = ref();
  function getFieldTitle(data) {
    if (data.isGroup) {
      return data[fieldNames.title];
    } else {
      return getLabelByFun(props.fieldMap[data[fieldNames.key]]);
    }
  }
  function setFieldTitle(title, data) {
    if (data.isGroup) {
      editorNode.value[fieldNames.title] = title;
    } else {
      setLabelByFun(data[fieldNames.key], title);
    }
    emit('change');
  }
  function getFieldTypeByKey(key): string {
    return getFieldTypeByFun(props.fieldMap[key]);
  }
  function deleteFieldByid(key) {
    loop(props.groupOptions, key, (value, index, children) => {
      if (value.isGroup && value.children.length) {
        children.push(...value.children);
      }
      children.splice(index, 1);
    });
    emit('change');
  }
  async function editorRow(data) {
    editorNode.value = data;
    await nextTick();
    editorInput.value && editorInput.value.select();
  }
  function finishEditor(key) {
    editorNode.value = {};
  }

  /**
   * 获取指定节点的层级
   */
  function getNodeLevel(key: string): number {
    let level = 1;

    function findLevel(data: any[], currentLevel: number): boolean {
      for (const item of data) {
        if (item[fieldNames.key] === key) {
          level = currentLevel;
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (findLevel(item.children, currentLevel + 1)) {
            return true;
          }
        }
      }
      return false;
    }

    findLevel(props.groupOptions, 1);
    return level;
  }

  /**
   * 计算被拖拽节点及其所有子节点的最大深度
   */
  function getDragNodeMaxDepth(dragNode: any): number {
    function getMaxDepth(node: any): number {
      if (!node.isGroup) return 0;
      let maxChildDepth = 0;
      for (const child of node.children) {
        maxChildDepth = Math.max(maxChildDepth, getMaxDepth(child));
      }
      return maxChildDepth + 1;
    }

    return getMaxDepth(dragNode);
  }

  /**
   * 检查是否可以在指定层级添加子分组
   */
  function canAddChildGroup(parentKey: string): boolean {
    const parentLevel = getNodeLevel(parentKey);
    return parentLevel < props.maxLevel;
  }

  /**
   * 拖拽前验证是否允许放置
   */
  function allowDrop(info: any): boolean {
    const { dropNode, dragNode } = info;
    const { dropToGap } = info;
    // 计算目标位置的层级
    let targetLevel = 1;
    if (dropNode.isGroup && !dropToGap) {
      // 拖拽到分组内部作为子元素
      targetLevel = getNodeLevel(dropNode.key) + 1;
    } else {
      // 拖拽到同级位置
      targetLevel = getNodeLevel(dropNode.key);
    }

    // 计算被拖拽节点的最大深度
    const dragNodeMaxDepth = getDragNodeMaxDepth(dragNode);
    // 验证是否会超过最大层级限制
    selectedDrop.value = targetLevel + dragNodeMaxDepth - 1 <= props.maxLevel;
    return true;
  }

  const onDrop = async (info) => {
    if (!selectedDrop.value) return;
    const { dropToGap, dragNode, node } = info;
    const dropPosition = info.dropPosition;

    //获取被拖拽的节点
    const _dNode = await new Promise((resolve) => {
      loop(props.groupOptions, dragNode.key, (value, index, children) => {
        const node = children.splice(index, 1);
        resolve(cloneDeep(node[0]));
      });
    });

    loop(props.groupOptions, node.key, (value, index, children) => {
      if (node.isGroup && !dropToGap) {
        value.children.unshift(_dNode);
      } else {
        children.splice(dropPosition === -1 ? index : index + 1, 0, _dNode);
      }
    });
    emit('change');
  };

  const loop = (data: any[], key: string, callback: any) => {
    const length = data.length;
    for (let i = 0; i < length; i++) {
      const item = data[i];
      if (item[fieldNames.key] === key) {
        callback(item, i, data);
        break;
      }
      if (item.children) {
        loop(item.children, key, callback);
      }
    }
  };
  async function addGroup(level, key?: string) {
    if (key) {
      loop(props.groupOptions, key, async (data, index, children) => {
        const group = creatGroup(level);
        data.children.push(group);
        await nextTick();
        !expandedKeys.value.includes(key) && expandedKeys.value.push(key);
        editorRow(group);
        treeRef.value.scrollTo({ key: group.key });
      });
    } else {
      const group = creatGroup(level);
      props.groupOptions.push(group);
      editorRow(group);
      await nextTick();
      treeRef.value.scrollTo({ key: group.key });
    }
    emit('change');
  }
  /**创建分组 */
  function creatGroup(level: number) {
    const indexOptions: number[] = [];
    dfsNonRecursive(props.groupOptions, (node) => {
      if (node.isGroup) {
        indexOptions.push(node.index);
      }
    });
    const index = indexOptions.length ? Math.max(...indexOptions) + 1 : 1;
    return {
      title: `分组${index}`,
      groupLevel: level,
      key: new Date().getTime(),
      isGroup: true,
      children: [],
      index,
    };
  }
  function dfsNonRecursive(root: any[], callback) {
    if (!root) return;
    const childrenKey = 'children';
    // 使用栈模拟递归
    const stack = [...root];
    while (stack.length > 0) {
      const node = stack.shift(); // 取出栈顶节点
      // 将子节点逆序压入栈中（保证顺序正确）
      if (Array.isArray(node[childrenKey])) {
        for (let i = node[childrenKey].length - 1; i >= 0; i--) {
          stack.unshift(node[childrenKey][i]);
        }
      }
      callback(node);
    }
  }
  onMounted(() => {});
</script>
<style lang="scss" scoped>
  .popover-bottom {
    padding: 8px 0;
    border-top: 1px solid #e8e8e8;
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

        .action {
          display: block;
        }
      }

      .action {
        display: none;

        .disabled-action {
          color: #ccc !important;
          cursor: not-allowed !important;

          &:hover {
            color: #ccc !important;
          }
        }
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
