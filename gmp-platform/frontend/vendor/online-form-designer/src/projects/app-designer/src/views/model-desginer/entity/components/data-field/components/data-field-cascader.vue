<template>
  <div class="data-field-cascader-wrap" ref="fieldCascaderPopRef">
    <a-popover
      v-model:visible="visible"
      trigger="click"
      overlayClassName="data-field-cascader__popover"
      :overlayStyle="{ minWidth: '180px' }"
      placement="bottomLeft"
      :getPopupContainer="getPopupContainer"
    >
      <template #content>
        <div class="field-cascader-pop flex" v-show="visible">
          <div
            class="field-cascader-left-box pb-10px serial-num-no-error"
            :class="fieldlist?.length ? 'border-r' : ''"
          >
            <div class="field-cascader-search">
              <a-form-item-rest>
                <a-input
                  class="tree-search"
                  v-model:value="leftSearch"
                  :placeholder="isFeild ? '搜索模型' : '搜索字段'"
                  allowClear
                >
                  <template #prefix>
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
              </a-form-item-rest>
            </div>
            <div class="field-cascader-root-title ell" :title="leftTitle">
              {{ leftTitle }}
            </div>
            <div class="field-cascader-list-box">
              <a-tree
                class="field-cascader-tree-instance"
                v-model:expandedKeys="expandedKeys"
                v-model:selectedKeys="selectedKeys"
                :load-data="onLoadData"
                :tree-data="renderTreeOptions"
                block-node
                @select="handleSelect"
                @expand="onExpand"
              >
                <template #title="{ data, key }">
                  <div
                    :class="['tree-node', hoveredKey == data.key ? 'virtual-selected' : '']"
                    @mouseenter="handleNodeHoverEnter(key, data)"
                    @mouseleave="handleNodeHoverLeave(key)"
                    @click="!data['isLeaf'] ? toggleNodeExpand(data.key) : handleSelect"
                  >
                    <template v-if="isFeild">
                      <span
                        v-if="data['title'].indexOf(leftSearch) > -1 && !data['isLeaf']"
                        class="tree-node-txt"
                        :title="data['title']"
                      >
                        <span>{{
                          data['title'].substr(0, data['title'].indexOf(leftSearch))
                        }}</span>
                        <span class="search-name">{{ leftSearch }}</span>
                        <span>{{
                          data['title'].substr(
                            data['title'].indexOf(leftSearch) + leftSearch?.length,
                          )
                        }}</span>
                      </span>
                      <span class="tree-node-txt" :title="data['title']" v-else>{{
                        data['title']
                      }}</span>
                    </template>
                    <template v-else>
                      <span
                        v-if="data['title'].indexOf(leftSearch) > -1 && data['isLeaf']"
                        class="tree-node-txt"
                        :title="data['title']"
                      >
                        <span>{{
                          data['title'].substr(0, data['title'].indexOf(leftSearch))
                        }}</span>
                        <span class="search-name">{{ leftSearch }}</span>
                        <span>{{
                          data['title'].substr(
                            data['title'].indexOf(leftSearch) + leftSearch?.length,
                          )
                        }}</span>
                      </span>
                      <span class="tree-node-txt" :title="data['title']" v-else>{{
                        data['title']
                      }}</span>
                    </template>
                    <right-outlined
                      v-if="data.bindInfo && data.fieldType !== FIELD_TYPE.ENUM"
                      class="right-icon"
                    />
                  </div>
                </template>
              </a-tree>
            </div>
          </div>
          <div
            class="field-cascader-right-box pb-10px serial-num-no-error"
            v-if="orgFieldList?.length"
          >
            <div class="field-cascader-search">
              <a-form-item-rest>
                <a-input
                  class="tree-search"
                  v-model:value="rightSearch"
                  placeholder="搜索字段"
                  allowClear
                >
                  <template #prefix>
                    <i class="iconfont icon-sousuo1"></i>
                  </template>
                </a-input>
              </a-form-item-rest>
            </div>
            <div
              v-if="selectedNodeTitle"
              class="field-cascader-root-title ell"
              :title="selectedNodeTitle"
            >
              {{ selectedNodeTitle }}
            </div>
            <div class="field-cascader-list-box">
              <template v-if="rightSelectOptions.length">
                <div
                  :class="[
                    'field-cascader-item',
                    { 'field-cascader-item-selected': item.key == selectedFieldKey },
                  ]"
                  v-for="item in rightSelectOptions"
                  :key="item.key"
                  @click="setSelectedKey(item)"
                >
                  <span :title="item['title']" v-if="item['title'].indexOf(rightSearch) > -1">
                    <span>{{ item['title'].substr(0, item['title'].indexOf(rightSearch)) }}</span>
                    <span class="search-name">{{ rightSearch }}</span>
                    <span>{{
                      item['title'].substr(item['title'].indexOf(rightSearch) + rightSearch?.length)
                    }}</span>
                  </span>
                  <span :title="item['title']" v-else>{{ item['title'] }}</span>
                </div>
              </template>
              <!-- <a-empty v-else :image="emptyPng">
                <template #description>
                  <span class="text-[#cccccc]"> 暂无数据 </span>
                </template>
              </a-empty> -->
            </div>
          </div>
        </div>
      </template>
      <a-form-item-rest>
        <a-select
          :class="['data-field-cascader-input', feildCascaderName ? 'clear-icon' : '']"
          v-model:value="feildCascaderName"
          @click.stop="handleClick"
          @change="onChange"
          allowClear
          :open="false"
          placeholder="请选择模型字段"
        />
      </a-form-item-rest>
    </a-popover>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, watch, nextTick } from 'vue';
  import type { TreeProps } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import {
    getModelMetaByKeys,
    getModelMetaTranslateModelFieldExp,
  } from '/@/apis/gct-apaas/ModelMetaController';
  // import { onClickOutside } from '@vueuse/core';
  import { cloneDeep } from 'lodash-es';
  // import { getCascaderParentContainer } from '/@page-designer/components/widgets/hooks/listhook';
  // import { uuid2 } from '/@/utils/uuid';
  // import emptyPng from '/@bi-designer/assets/empty.png';

  const props = defineProps<{
    value: string;
    modelKey?: string;
    isFeild: boolean;
  }>();

  const emit = defineEmits(['update:value']);
  const { t } = useI18n();
  const leftSearch = ref();
  const rightSearch = ref();
  const fieldlist = ref();
  const orgFieldList = ref();
  const expandedKeys = ref<string[]>([]);
  const selectedKeys = ref<string[]>([]);
  const visible = ref<boolean>(false);
  const modelByKey = ref();
  const feildKey = ref();
  const selectedFieldKey = ref();
  const fieldCascaderPopRef = ref();
  const treeData = ref<any[]>([]);
  const prevName = ref<string>();
  const feildCascaderName = ref<string>();
  const backInFlag = ref<boolean>(false);
  const selectedNodeTitle = ref<string>();
  const hoveredKey = ref<string>();
  const leftTreeOptions = ref<any[]>();
  const fieldMap = new Map();
  const leftOrgTreeData = ref<any[]>();

  const shouldFlattenFirstLevel = computed<boolean>(() => {
    const list = leftOrgTreeData.value;
    return (
      Array.isArray(list) &&
      list.length === 1 &&
      Array.isArray(list[0]?.children) &&
      list[0].children.length > 0
    );
  });

  const leftTitle = computed<string>(() => {
    if (shouldFlattenFirstLevel.value) {
      return leftOrgTreeData.value?.[0]?.title || '';
    }
    return t('sys.entityModel');
  });

  const renderTreeOptions = computed<any[] | undefined>(() => {
    if (!shouldFlattenFirstLevel.value) {
      return leftTreeOptions.value;
    }
    const [firstNode] = leftTreeOptions.value || [];
    return (
      firstNode?.children?.map((child) => ({
        ...child,
        parentKey: firstNode.key,
        parentTitle: firstNode.title,
      })) || []
    );
  });

  const SHOW_FIELDTYPES = [
    FIELD_TYPE.TEXT,
    FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.LONG,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.DOUBLE,
    FIELD_TYPE.DECIMAL,
    FIELD_TYPE.BOOLEAN,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.DATE,
    // FIELD_TYPE.RDO_REF,
  ];

  onMounted(async () => {
    if (!props.isFeild && props.modelKey) {
      await getOriginModel();
      expandedKeys.value = [props.modelKey];
    } else {
      await getModelList();
    }
    await loadSingleRootChildren();
    const keys = props.value?.split('.');
    if (props.modelKey && keys.length >= 2) {
      expandedKeys.value = [keys[0]];
      selectedKeys.value = [keys[1]];
      modelByKey.value = expandedKeys.value[0];
      feildKey.value = selectedKeys.value[0];
      if (keys.length > 2) {
        selectedKeys.value = [];
        const expandObj = treeData.value.find((i) => i.key === expandedKeys.value[0]);
        await onLoadData({ dataRef: expandObj, key: expandObj.key } as any);
        const bindObj = expandObj.children?.find((val) => val.key === keys[1]);
        const node = {
          ...bindObj,
          modelTitle: expandObj.title,
        };
        await getFieldlist(node);
        selectedFieldKey.value = keys[2] || '';
      }
    }
    props.value && getFieldCascaderName();
  });

  watch(
    () => backInFlag.value,
    async () => {
      if (backInFlag.value && selectedKeys.value && props.modelKey) {
        const expandObj = treeData.value.find((i) => i.key === expandedKeys.value[0]);
        const bindObj = expandObj.children?.find((val) => val.key === selectedKeys.value[0]);
        prevName.value = `${expandObj?.title}.${bindObj?.title}`;
        bindObj?.bindInfo &&
          bindObj?.fieldType !== FIELD_TYPE.ENUM &&
          (await getFieldlist(bindObj));
      }
    },
  );

  const handleClick = () => {
    visible.value = !visible.value;
  };

  const onChange = (e) => {
    handleCancel();
    expandedKeys.value = !props.isFeild ? [props.modelKey!] : [];
  };

  const handleCancel = () => {
    feildCascaderValue.value = '';
    fieldlist.value = [];
    orgFieldList.value = [];
    feildCascaderName.value = undefined;
    selectedNodeTitle.value = undefined;
    hoveredKey.value = undefined;
    selectedKeys.value = [];
    selectedFieldKey.value = undefined;
    leftSearch.value = undefined;
    rightSearch.value = undefined;
  };

  async function getFieldCascaderName() {
    const res = (await getModelMetaTranslateModelFieldExp({ exp: props.value })) || '';
    feildCascaderName.value = res;
  }

  // 序列号默认传一个modelkey
  async function getOriginModel() {
    const res: any = (await getModelMetaByKeys({ modelKeys: props.modelKey })) || [];
    treeData.value =
      res?.map((i) => {
        return {
          key: i.key,
          title: i.name,
          isLeaf: false,
          checkable: false,
          disabled: true,
        };
      }) || [];
    leftTreeOptions.value = cloneDeep(treeData.value);
    leftOrgTreeData.value = cloneDeep(treeData.value);
  }

  // 序列号规则需要查出所有的模型
  const getModelList = async () => {
    const arr = await getDesignerCommonTableEntityModelList({
      type: 'NDO,BASE,RDO',
      subModel: 0,
    });
    treeData.value =
      arr?.map((item) => {
        return {
          key: item.key,
          title: item.name,
          isLeaf: false,
          checkable: false,
          disabled: true,
        };
      }) || [];
    leftTreeOptions.value = cloneDeep(treeData.value);
    leftOrgTreeData.value = cloneDeep(treeData.value);
  };

  async function getFieldlist(data) {
    selectedNodeTitle.value = data.title;
    // 标记当前悬浮节点
    hoveredKey.value = data.key;
    const key = `${data.modelKey}&${data.key}&${data.bindInfo}`;
    let list: any[] = [];
    if (fieldMap.has(key)) {
      list = fieldMap.get(key) || [];
    } else {
      list = (await getFieldMetaList({ modelKey: data.bindInfo })) || [];
      fieldMap.set(key, list);
    }
    orgFieldList.value = list;
    fieldlist.value = list
      .filter((v) => SHOW_FIELDTYPES.includes(v.type))
      .map((i) => {
        return {
          title: i.name,
          key: i.key,
          refKey: data.key,
          refName: data.title,
          modelKey: data.parentKey || data.modelKey,
          modelName: data.parentTitle || data.modelTitle,
        };
      });
  }

  // 默认懒加载
  const onLoadData: TreeProps['loadData'] = async (treeNode) => {
    console.log('treeNode------', treeNode);
    if (treeNode.dataRef?.children) {
      return;
    }
    const res: FieldMetaDTO[] = (await getFieldMetaList({ modelKey: treeNode.key })) || [];
    let children = res.filter((v: any) =>
      [...SHOW_FIELDTYPES, FIELD_TYPE.REF, FIELD_TYPE.RDO_REF].includes(v.type),
    );
    if (!props.isFeild) {
      // 非字段情况下过滤模型关联关联自身模型的字段
      children = children.filter((i) => i.bindInfo !== props.modelKey);
    }
    const modelKeys = children
      .filter((v) => v.bindInfo && v.type !== FIELD_TYPE.ENUM)
      .map((i) => i.bindInfo);
    let modelList: any = [];
    const list = children.map((i) => {
      return {
        title: i.name,
        key: i.key,
        isLeaf: true,
        bindInfo: i.bindInfo,
        fieldType: i.type,
        modelKey: treeNode.key || props.modelKey,
        modelTitle: treeNode.title || treeNode.dataRef?.title,
      };
    });
    if (modelKeys.length) {
      try {
        const result = (await getModelMetaByKeys({ modelKeys: modelKeys.join(',') })) || [];
        modelList = result.map((i) => ({ id: i.id, name: i.name }));
        list.forEach((i) => {
          i.title =
            i.bindInfo && i.fieldType !== FIELD_TYPE.ENUM
              ? i.title + `(${modelList.find((v) => v.id == i.bindInfo)?.name})`
              : i.title;
        });
      } catch (err) {
        console.warn(err);
      }
    }
    treeNode.dataRef!.children = list;
    treeData.value.forEach((i) => {
      if (i.key === treeNode.dataRef?.key) {
        i['children'] = list;
      }
    });
    treeData.value = [...treeData.value];

    // 展开时对children数据再做一次搜索
    const tree = cloneDeep(treeData.value);
    if (leftSearch.value && props.isFeild) {
      leftTreeOptions.value = tree.filter((i) => i.title.indexOf(leftSearch.value?.trim()) > -1);
      // leftTreeOptions.value = tree
      //   .map((i) => {
      //     return {
      //       ...i,
      //       children: i.children?.filter((v) => v.title.indexOf(leftSearch.value?.trim()) > -1),
      //     };
      //   })
      //   .filter((i) => i.title.indexOf(leftSearch.value?.trim()) > -1 || i.children?.length);
    } else {
      leftTreeOptions.value = tree;
      leftOrgTreeData.value = cloneDeep(treeData.value);
    }
    backInFlag.value = true;
  };

  const loadSingleRootChildren = async (): Promise<void> => {
    if (treeData.value.length !== 1) return;
    const [firstNode] = treeData.value;
    if (firstNode?.children?.length) return;
    await onLoadData({ dataRef: firstNode, key: firstNode.key } as any);
  };

  const feildCascaderValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });

  const rightSelectOptions = computed(() => {
    const list = rightSearch.value?.trim()
      ? fieldlist.value.filter((e) => e.title.indexOf(rightSearch.value.trim()) > -1)
      : cloneDeep(fieldlist.value);
    return list;
  });

  watch(
    () => leftSearch.value,
    async (val) => {
      leftTreeOptions.value = [];
      let tree: any = cloneDeep(treeData.value);
      await nextTick();
      if (val?.trim()) {
        let hasChecked: boolean = false;
        if (props.isFeild) {
          // leftTreeOptions.value = tree
          //   .map((i) => {
          //     if (i.children?.filter((v) => v.key == selectedKeys.value[0])?.length) {
          //       hasChecked = true;
          //       expandedKeys.value = [i.key];
          //     }
          //     return {
          //       ...i,
          //       children: i.children?.filter((v) => v.title.indexOf(leftSearch.value?.trim()) > -1),
          //     };
          //   })
          //   .filter((i) => i.title.indexOf(leftSearch.value?.trim()) > -1 || i.children?.length);
          leftTreeOptions.value = tree.filter(
            (i) => i.title.indexOf(leftSearch.value?.trim()) > -1,
          );
        } else {
          tree.forEach((i) => {
            i.children = i.children?.filter((e) => e.title.indexOf(leftSearch.value.trim()) > -1);
            if (i.children?.filter((v) => v.key == selectedKeys.value[0])?.length) {
              hasChecked = true;
            }
          });
          leftTreeOptions.value = tree;
        }

        if (!hasChecked) {
          fieldlist.value = [];
          selectedKeys.value = [];
        }
      } else {
        leftTreeOptions.value = [...tree];
        expandedKeys.value = !props.isFeild ? [props.modelKey!] : [];
        // props.isFeild && (fieldlist.value = []);
      }
    },
  );

  // const leftTreeOptions = computed(() => {
  //   let tree:any = [];
  //   if (leftSearch.value?.trim()) {
  //     tree = cloneDeep(treeData.value);
  //     tree.forEach(i => {
  //       i.children = i.children?.filter((e) => e.title.indexOf(leftSearch.value.trim()) > -1)
  //     });
  //     tree = tree.filter(i => i.children?.length);
  //     expandedKeys.value = tree.map(i => i.key);
  //   } else {
  //     tree = cloneDeep(treeData.value)
  //   }
  //   return tree;
  // });

  /**
   * 节点选中事件
   */
  const handleSelect = async (sKeys, { node }) => {
    // 不可取消选中
    if (sKeys.length === 0) return;
    selectedKeys.value = sKeys;
    const parentKey = node.parent?.key ?? node.parentKey;
    const parentTitle = node.parent?.node?.title ?? node.parentTitle;
    if (!parentKey || !parentTitle) return;
    modelByKey.value = parentKey;
    feildKey.value = selectedKeys.value[0];
    prevName.value = `${parentTitle}.${node.title}`;

    feildCascaderName.value = prevName.value;
    feildCascaderValue.value = modelByKey.value + '.' + feildKey.value;
    fieldlist.value = [];
    orgFieldList.value = [];
    selectedFieldKey.value = '';
    visible.value = false;
    // if (node.bindInfo && node.fieldType !== FIELD_TYPE.ENUM) {
    //   selectedNodeTitle.value = node.title;
    //   getFieldlist(node.bindInfo);
    // } else {
    //   fieldlist.value = [];
    //   selectedNodeTitle.value = '';
    //   feildCascaderName.value = prevName.value;
    //   feildCascaderValue.value = modelByKey.value + '.' + feildKey.value;
    //   visible.value = false;
    // }
  };

  const onExpand = (keys: string[]) => {
    expandedKeys.value = keys;
  };

  /**
   * 切换单个节点的展开/收起状态
   * @param {string} key - 节点key
   */
  const toggleNodeExpand = (key) => {
    const index = expandedKeys.value.indexOf(key);
    if (index > -1) {
      // 已展开 → 收起：移除key
      expandedKeys.value = expandedKeys.value.filter((k) => k !== key);
    } else {
      // 未展开 → 展开：添加key
      expandedKeys.value = [...expandedKeys.value, key];
    }
  };

  const setSelectedKey = (value) => {
    selectedFieldKey.value = value.key;
    // feildCascaderName.value = `${prevName.value}.${value.title}`;
    feildCascaderName.value = `${value.modelName}.${value.refName}.${value.title}`;
    // feildCascaderValue.value = modelByKey.value + '.' + feildKey.value + '.' + selectedFieldKey.value;
    feildCascaderValue.value = `${value.modelKey}.${value.refKey}.${selectedFieldKey.value}`;
    selectedKeys.value = [];
    visible.value = false;
    rightSearch.value = '';
  };

  /**
   * 鼠标悬浮进入节点时触发
   * @param {string} key - 节点唯一标识
   * @param {object} data - 节点完整数据（包含自定义字段如desc）
   * @param {object} node - 节点原生对象（包含层级、是否叶子节点等信息）
   */
  const handleNodeHoverEnter = (key, data) => {
    // hoveredKey.value = key; // 标记当前悬浮节点
    console.log('悬浮进入节点：', key, data);
    if (data.bindInfo && data.fieldType !== FIELD_TYPE.ENUM) {
      getFieldlist(data);
    } else {
      fieldlist.value = [];
      orgFieldList.value = [];
      selectedNodeTitle.value = '';
      hoveredKey.value = '';
    }
  };

  /**
   * 鼠标悬浮离开节点时触发
   * @param {string} key - 节点唯一标识
   */
  const handleNodeHoverLeave = (key) => {
    console.log('悬浮离开节点：', key);
  };

  // onClickOutside(fieldCascaderPopRef, () => {
  //   visible.value = false;
  // });

  const getPopupContainer = () => {
    return (
      document.getElementById('gct-scrollbody') ||
      document.body.querySelector('.data-field-cascader-wrap') ||
      document.body
    );
  };

  defineExpose({
    feildCascaderName,
  });
</script>

<style lang="less" scoped>
  .data-field-cascader-wrap {
    position: relative;
    :deep(.data-field-cascader-input) {
      &.clear-icon {
        .anticon.ant-input-clear-icon-hidden {
          visibility: visible !important;
        }
      }
    }
  }
  .field-cascader-pop {
    // min-width: 400px;
    // margin-top: 4px;
    // position: absolute;
    // left: 0;
    z-index: 1000;
    background: #fff;
    border-radius: 4px;
    // box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    //   0 9px 28px 8px rgba(0, 0, 0, 0.05);
    .field-cascader-left-box {
      width: 180px;
      &.border-r {
        border-right: 1px solid #e0e3ea;
      }
    }
    .field-cascader-right-box {
      width: 180px;
    }
    .field-cascader-search {
      padding: 1px 0;
      border-bottom: 1px solid #f2f5f8;
    }
    .field-cascader-root-title {
      padding: 6px 12px 4px;
      color: #8b8b8b;
      font-weight: 400;
      line-height: 20px;
      margin-top: 8px;
      word-break: break-all;
      font-size: 14px;
    }
    .field-cascader-list-box {
      // padding: 0 12px;
      margin-top: 4px;
      // height: 100%;
      // min-height: 192px;
      // max-height: 192px;
      height: 192px;
      overflow-y: auto;
      .search-name {
        color: var(--ant-primary-color) !important;
      }
    }
    .field-cascader-item {
      cursor: pointer;
      line-height: 32px;
      // margin-bottom: 4px;
      padding: 0 12px;
      // border-radius: 4px 4px 4px 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        background: #f5f5f5;
      }
      &-selected {
        // background: #e6eeff !important;
        background: rgba(from var(--ant-primary-color) r g b / 8%) !important;
        color: var(--ant-primary-color);
        font-weight: 500;
      }
    }
  }

  // 修改树样式
  :deep(.field-cascader-tree-instance) {
    .ant-tree-switcher {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 32px;
      line-height: 32px;
      .ant-tree-switcher-icon {
        // color: #797a7d;
        color: var(--ant-primary-color);
        font-size: 14px;
      }
    }

    .ant-tree-treenode {
      padding: 0;
      padding-left: 8px;
      // margin-bottom: 4px;
      transition: all 0.3s;
      // border-radius: 4px 4px 4px 4px;
      height: 32px;
      .ant-tree-switcher.ant-tree-switcher-noop {
        width: 0;
      }
      &:has(span.ant-tree-node-content-wrapper span.ant-tree-title div.virtual-selected) {
        background: #f5f5f5;
      }
      &:hover {
        background: #f5f5f5;
        .tree-node__more {
          display: block;
        }
      }
      &.ant-tree-treenode-disabled {
        &:hover {
          background: transparent;
        }
      }

      .ant-tree-title {
        display: inline-block;
        width: 130px;
        .tree-node {
          width: 100%;
          display: flex;
          // position: relative;
          // padding-right: 12px;
          align-items: center;
          .tree-node-txt {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .right-icon {
            // position: absolute;
            // right: 0;
            // top: 6px;
            font-size: 12px;
          }
        }
      }

      .search-name {
        color: var(--ant-primary-color) !important;
      }

      // &-selected:has(
      //     > span.ant-tree-node-content-wrapper
      //       > span.ant-tree-title
      //       > div.tree-node
      //       > span.right-icon
      //   ) {
      //   background-color: #f2f5f8 !important;
      // }

      &-selected {
        background: rgba(from var(--ant-primary-color) r g b / 8%) !important;
        color: var(--ant-primary-color);
        font-weight: 500;
        .ant-tree-node-selected {
          background-color: transparent;
        }
        .right-icon {
          color: var(--ant-primary-color);
        }
      }
    }
  }
  :deep(.ant-tree .ant-tree-node-content-wrapper) {
    line-height: 32px;
    padding-right: 8px;
  }

  :deep(.ant-tree .ant-tree-treenode-disabled .ant-tree-node-content-wrapper) {
    color: rgba(0, 0, 0, 0.85);
    cursor: pointer;
  }
</style>
<style lang="less">
  // .data-field-cascader-wrap {
  //   .ant-popover-inner-content {
  //     padding: 8px 12px;
  //   }
  // }
  .data-field-cascader__popover {
    .ant-popover-content {
      .ant-popover-inner-content {
        padding: 0;
        .ant-input-affix-wrapper {
          border-width: 0;
          padding: 4px 12px;
          &:focus {
            border-width: 0;
            border-color: transparent;
          }
          &:hover {
            border-width: 0;
            border-color: transparent;
          }
          .ant-input-prefix {
            color: #9d9d9d;
          }
        }
      }
    }
  }
</style>
