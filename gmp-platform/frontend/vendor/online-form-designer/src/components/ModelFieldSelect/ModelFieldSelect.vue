<template>
  <div class="model-field-select-wrap" ref="fieldCascaderPopRef">
    <a-form-item-rest>
      <a-input
        :class="['model-field-select-input', feildCascaderName ? 'clear-icon' : '']"
        v-model:value="feildCascaderName"
        @click="handleClick"
        @change="onChange"
        readonly
        :placeholder="$t('sys.pageDesigner.dataLinkage.rootSelectPlaceholder2')"
      >
        <template #suffix>
          <DownOutlined class="down-icon" />
        </template>
      </a-input>
    </a-form-item-rest>
    <div :class="['field-cascader-pop flex', fieldlist?.length && 'has-right']" v-show="visible">
      <div class="field-cascader-left-box px-12px py-8px serial-num-no-error">
        <a-form-item-rest>
          <a-input
            class="tree-search"
            v-model:value="leftSearch"
            :placeholder="$t('sys.onlineForm.searchModelOrFields')"
            allowClear
          >
            <template #suffix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
        </a-form-item-rest>
        <div class="field-cascader-list-box">
          <a-tree
            class="field-cascader-tree-instance"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            :load-data="onLoadData"
            :tree-data="leftTreeOptions"
            block-node
            @select="handleSelect"
            @expand="onExpand"
          >
            <template #title="{ data }">
              <div class="tree-node">
                <span v-if="data['title'].indexOf(leftSearch) > -1">
                  <span>{{ data['title'].substr(0, data['title'].indexOf(leftSearch)) }}</span>
                  <span class="search-name">{{ leftSearch }}</span>
                  <span>{{
                    data['title'].substr(data['title'].indexOf(leftSearch) + leftSearch?.length)
                  }}</span>
                </span>
                <span v-else>{{ data['title'] }}</span>
                <right-outlined
                  class="right-icon"
                  v-if="data.bindInfo && data.fieldType !== FIELD_TYPE.ENUM"
                />
              </div>
            </template>
          </a-tree>
        </div>
      </div>
      <div
        class="field-cascader-right-box px-12px py-8px serial-num-no-error"
        v-if="fieldlist?.length"
      >
        <a-form-item-rest>
          <a-input
            class="tree-search"
            v-model:value="rightSearch"
            :placeholder="$t('sys.onlineForm.searchModelOrFields')"
            allowClear
          >
            <template #suffix>
              <i class="iconfont icon-sousuo1"></i>
              <!-- <search-outlined /> -->
            </template>
          </a-input>
        </a-form-item-rest>
        <div class="field-cascader-list-box">
          <div
            :class="[
              'field-cascader-item',
              { 'field-cascader-item-selected': item.key == selectedFieldKey },
            ]"
            v-for="item in rightSelectOptions"
            :key="item.key"
            @click="setSelectedKey(item)"
          >
            <span v-if="item['title'].indexOf(rightSearch) > -1">
              <span>{{ item['title'].substr(0, item['title'].indexOf(rightSearch)) }}</span>
              <span class="search-name">{{ rightSearch }}</span>
              <span>{{
                item['title'].substr(item['title'].indexOf(rightSearch) + rightSearch?.length)
              }}</span>
            </span>
            <span v-else>{{ item['title'] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="model-field-select">
  import { computed, ref, onMounted, watch, nextTick } from 'vue';
  import type { TreeProps } from 'ant-design-vue';
  import { getDesignerCommonTableEntityModelList } from '/@/apis/gct-apaas/DesignerCommonController';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import {
    getModelMetaByKeys,
    getModelMetaTranslateModelFieldExp,
    getModelMetaListAllModelAndFieldByName,
  } from '/@/apis/gct-apaas/ModelMetaController';
  import { onClickOutside, watchDebounced } from '@vueuse/core';
  import { cloneDeep } from 'lodash-es';
  import { DownOutlined } from '@ant-design/icons-vue';

  const props = withDefaults(
    defineProps<{
      data: IData;
      value: string;
      modelKey?: string;
      isField?: boolean;
      showRefModel?: boolean;
    }>(),
    {
      isField: false,
      showRefModel: false,
    },
  );

  const emit = defineEmits(['update:value']);
  const leftSearch = ref();
  const rightSearch = ref();
  const fieldlist = ref();
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

  const leftTreeOptions = ref();

  const SHOW_FIELDTYPES = [
    FIELD_TYPE.TEXT,
    // FIELD_TYPE.LONG_TEXT,
    FIELD_TYPE.LONG,
    FIELD_TYPE.INTEGER,
    FIELD_TYPE.ENUM,
    FIELD_TYPE.EXPRESSION,
  ];

  onMounted(async () => {
    if (!props.isField && props.modelKey) {
      await getOriginModel();
      expandedKeys.value = [props.modelKey];
    } else {
      await getModelList();
    }
    const keys = props.value?.split('.');
    if (props.modelKey && keys.length >= 2) {
      expandedKeys.value = [keys[0]];
      selectedKeys.value = [keys[1]];
      modelByKey.value = expandedKeys.value[0];
      feildKey.value = selectedKeys.value[0];
      if (keys.length > 2) {
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
          (await getFieldlist(bindObj?.bindInfo));
      }
    },
  );

  const handleClick = () => {
    visible.value = !visible.value;
  };

  const onChange = (e) => {
    if (!e.target.value) {
      feildCascaderValue.value = '';
      prevName.value = '';
      feildCascaderName.value = '';
      expandedKeys.value = !props.isField ? [props.modelKey!] : [];
      selectedKeys.value = [];
      selectedFieldKey.value = '';
      fieldlist.value = [];
      rightSearch.value = '';
    }
  };

  async function getFieldCascaderName() {
    const res = (await getModelMetaTranslateModelFieldExp({ exp: props.value })) || '';
    feildCascaderName.value = res;
  }

  //序列号默认传一个modelkey
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
  };

  async function getFieldlist(bindInfo) {
    const res: any = (await getFieldMetaList({ modelKey: bindInfo })) || [];
    fieldlist.value = res
      .filter((v) => SHOW_FIELDTYPES.includes(v.type))
      .map((i) => {
        return {
          title: i.name,
          key: i.key,
        };
      });
  }
  // 默认懒加载
  const onLoadData: TreeProps['loadData'] = async (treeNode) => {
    if (treeNode.dataRef?.children) {
      return;
    }
    const res: FieldMetaDTO[] = (await getFieldMetaList({ modelKey: treeNode.key })) || [];
    const showFieldTypes = [...SHOW_FIELDTYPES];
    if (props.showRefModel) {
      showFieldTypes.push(FIELD_TYPE.REF);
    }
    let children = res.filter((v: any) => showFieldTypes.includes(v.type));
    if (!props.isField) {
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
        modelKey: i.modelKey,
        fieldType: i.type,
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
    leftTreeOptions.value = cloneDeep(treeData.value);
    backInFlag.value = true;
  };

  const feildCascaderValue = computed({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });

  const modelKey = computed({
    get() {
      if (props.data) {
        return props.data.modelKey;
      }
      return null;
    },
    set(value) {
      if (props.data) {
        // eslint-disable-next-line vue/no-mutating-props
        props.data.modelKey = value;
      }
    },
  });

  const rightSelectOptions = computed(() => {
    const list = rightSearch.value?.trim()
      ? fieldlist.value.filter((e) => e.title.indexOf(rightSearch.value.trim()) > -1)
      : cloneDeep(fieldlist.value);
    return list;
  });

  // watch(
  //   () => leftSearch.value,
  //   async (val) => {
  //     leftTreeOptions.value = [];
  //     let tree: any = cloneDeep(treeData.value);
  //     await nextTick();
  //     if (val?.trim()) {
  //       let hasChecked: boolean = false;
  //       tree.forEach((i) => {
  //         i.children = i.children?.filter((e) => e.title.indexOf(leftSearch.value.trim()) > -1);
  //         if (i.children?.filter((v) => v.key == selectedKeys.value[0])?.length) {
  //           hasChecked = true;
  //         }
  //       });
  //       tree = tree.filter(
  //         (i) => i.children?.length || i.title.indexOf(leftSearch.value.trim()) > -1,
  //       );
  //       leftTreeOptions.value = tree;
  //       expandedKeys.value = tree.filter((i) => i.children?.length).map((i) => i.key);
  //       if (!hasChecked) {
  //         fieldlist.value = [];
  //         selectedKeys.value = [];
  //       }
  //     } else {
  //       leftTreeOptions.value = [...tree];
  //       expandedKeys.value = !props.isField ? [props.modelKey!] : [];
  //     }
  //   },
  // );

  /**
   * 输入框查询选项
   */
  const getModeMetalListByName = async () => {
    const res = await getModelMetaListAllModelAndFieldByName({ name: leftSearch.value });
    const showFieldTypes = [...SHOW_FIELDTYPES];
    props.showRefModel && showFieldTypes.push(FIELD_TYPE.REF);

    treeData.value =
      res
        ?.map((item) => {
          const children = item.fieldMetaList
            ?.filter((v: any) => showFieldTypes.includes(v.type))
            .map((i) => {
              return {
                title: i.name,
                key: i.key,
                isLeaf: true,
                bindInfo: i.bindInfo,
                modelKey: i.modelKey,
                fieldType: i.type,
              };
            });
          return {
            key: item.modelMeta?.key,
            title: item.modelMeta?.name,
            isLeaf: false,
            checkable: false,
            disabled: true,
            children,
          };
        })
        .filter((i) => i.children?.length) || [];

    leftTreeOptions.value = cloneDeep(treeData.value);
  };

  watchDebounced(
    () => leftSearch.value,
    async (val) => {
      leftTreeOptions.value = [];
      expandedKeys.value = [];
      props.showRefModel && (fieldlist.value = []);
      if (val?.trim()) {
        await getModeMetalListByName();
        expandedKeys.value = leftTreeOptions.value.map((i) => i.key) || [];
      } else {
        await getModelList();
      }
    },
    {
      debounce: 200,
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
    modelByKey.value = node.parent.key;
    feildKey.value = selectedKeys.value[0];
    prevName.value = `${node.parent.node.title}.${node.title}`;
    modelKey.value = node.modelKey;
    if (node.bindInfo && node.fieldType !== FIELD_TYPE.ENUM) {
      getFieldlist(node.bindInfo);
    } else {
      fieldlist.value = [];
      feildCascaderName.value = prevName.value;
      feildCascaderValue.value = modelByKey.value + '.' + feildKey.value;
      visible.value = false;
    }
  };

  const onExpand = (keys: string[]) => {
    expandedKeys.value = keys;
  };

  const setSelectedKey = (value) => {
    selectedFieldKey.value = value.key;
    feildCascaderName.value = `${prevName.value}.${value.title}`;
    feildCascaderValue.value =
      modelByKey.value + '.' + feildKey.value + '.' + selectedFieldKey.value;
    visible.value = false;
    rightSearch.value = '';
  };

  onClickOutside(fieldCascaderPopRef, () => {
    visible.value = false;
  });

  defineExpose({
    feildCascaderName,
  });
</script>

<style lang="less" scoped>
  .model-field-select-wrap {
    position: relative;

    :deep(.model-field-select-input) {
      &.clear-icon {
        .anticon.ant-input-clear-icon-hidden {
          visibility: visible !important;
        }
      }
    }

    .field-cascader-pop {
      position: absolute;
      z-index: 1000;
      left: 0;
      // min-width: 400px;
      margin-top: 4px;
      background: #fff;
      box-shadow:
        0 3px 6px -4px rgb(0 0 0 / 12%),
        0 6px 16px 0 rgb(0 0 0 / 8%),
        0 9px 28px 8px rgb(0 0 0 / 5%);

      &.has-right {
        .field-cascader-left-box {
          width: 200px;
        }

        .field-cascader-right-box {
          width: 200px;
        }
      }

      .field-cascader-left-box {
        border-right: 1px solid #e0e3ea;
      }

      .field-cascader-list-box {
        height: 100%;
        max-height: 200px;
        margin-top: 4px;
        overflow-y: auto;

        .search-name {
          color: var(--ant-primary-color) !important;
        }
      }

      .field-cascader-item {
        margin-bottom: 4px;
        padding: 0 6px;
        border-radius: 4px;
        line-height: 24px;
        cursor: pointer;

        &:hover {
          background: #f5f5f5;
        }

        &-selected {
          background: #e6eeff !important;
        }
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
      height: 24px;
      line-height: 24px;

      .ant-tree-switcher-icon {
        // color: #797a7d;
        color: var(--ant-primary-color);
        font-size: 14px;
      }
    }

    .ant-tree-treenode {
      margin-bottom: 4px;
      padding: 0;
      transition: all 0.3s;
      border-radius: 4px;

      .ant-tree-switcher.ant-tree-switcher-noop {
        width: 0;
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
        .tree-node {
          position: relative;
          padding-right: 12px;

          .right-icon {
            position: absolute;
            top: 6px;
            right: 0;
            font-size: 12px;
          }
        }
      }

      .search-name {
        color: var(--ant-primary-color) !important;
      }

      &-selected {
        background: #e6eeff !important;
        // color: var(--ant-primary-color) !important;
        .ant-tree-node-selected {
          background-color: transparent;
        }
      }
    }
  }

  :deep(.ant-tree .ant-tree-treenode-disabled .ant-tree-node-content-wrapper) {
    color: rgb(0 0 0 / 85%);
    cursor: pointer;
  }

  .down-icon {
    font-size: 12px;
  }
</style>
