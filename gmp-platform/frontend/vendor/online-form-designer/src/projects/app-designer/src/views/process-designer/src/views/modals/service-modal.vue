<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="300"
    :title="t('添加服务')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    :footer="null"
  >
    <div class="flex">
      <div class="w-120px flex-none service-category">
        <div
          :class="{ active: category === ScriptTypeEnum.DEFAULT }"
          @click="category = ScriptTypeEnum.DEFAULT"
          >脚本服务</div
        >
        <div
          :class="{ active: category === ScriptTypeEnum.ORCHESTRATION }"
          @click="category = ScriptTypeEnum.ORCHESTRATION"
          >编排服务</div
        >
      </div>
      <div class="flex-1">
        <a-tree
          v-if="category === ScriptTypeEnum.DEFAULT && groupScripts.length > 0"
          default-expand-all
          :selected-keys="selectKeys"
          class="service-tree"
          block-node
          :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
          :tree-data="groupScripts"
        >
          <template #title="{ data }">
            <div @click="handleClick(data)">{{ data.name }} </div>
          </template>
        </a-tree>
        <a-tree
          v-else-if="category === ScriptTypeEnum.ORCHESTRATION && groupScripts.length > 0"
          default-expand-all
          :selected-keys="selectKeys"
          class="service-tree"
          block-node
          :fieldNames="{ children: 'children', title: 'name', key: 'id' }"
          :tree-data="groupSos"
        >
          <template #title="{ data }">
            <div @click="handleClick(data)">{{ data.name }} </div>
          </template>
        </a-tree>
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref, toRaw, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useBpmn } from '/@app-designer/views/process-designer/src/hooks/useBpmn';

  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import type { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const groupScripts = ref<CategoryCompleteResponse[]>([]);
  const groupSos = ref<CategoryCompleteResponse[]>([]);
  const category = ref<ScriptTypeEnum>(ScriptTypeEnum.DEFAULT);

  let options: {
    value?: string;
    callback?: Function;
  } = {};

  const selectKeys = ref<string[]>([]);

  const { t } = useI18n();

  // const { saveAs } = useBpmn();

  /** 递归查找是否存在树结构中的值 */
  const findTreePathById = (leafId: string, nodes: any[]) => {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < nodes.length; i++) {
      if (leafId === nodes[i].id) {
        return nodes[i];
      }
      if (nodes[i].children) {
        const findResult = findTreePathById(leafId, nodes[i].children);
        if (findResult) {
          return findResult;
        }
      }
    }
  };

  const setService = (key, value, list) => {
    if (value) {
      const node = findTreePathById(value, list);
      if (node) {
        category.value = key;
      }
    }
  };

  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;

    options = data;

    selectKeys.value.push(data.data);

    category.value = ScriptTypeEnum.DEFAULT;

    if (groupScripts.value.length === 0) {
      getCategoryListComplete({
        module: ScriptTypeEnum.DEFAULT,
      }).then((res) => {
        groupScripts.value = res!;
        setService(ScriptTypeEnum.DEFAULT, data.data, toRaw(unref(groupScripts.value)));
      });
    }
    if (groupSos.value.length === 0) {
      getCategoryListComplete({
        module: ScriptTypeEnum.ORCHESTRATION,
      }).then((res) => {
        groupSos.value = res!;

        setService(ScriptTypeEnum.ORCHESTRATION, data.data, toRaw(unref(groupSos.value)));
      });
    }
  });

  // const formState = reactive({
  //   version: [undefined, undefined],
  // });

  const handleClose = () => {
    // formState.version = [undefined, undefined];
    // closeModal();
    // FormRef.value?.clearValidate();
    selectKeys.value = [];
    groupScripts.value = [];
    groupSos.value = [];
  };

  const handleClick = (data) => {
    console.log(data);
    if (options.callback && typeof options.callback === 'function') {
      options.callback(data.key);
    }
    closeModal();
  };

  const handleOk = async () => {
    // changeOkLoading(true);
    // try {
    //   await FormRef.value!.validate();
    //   await saveAs(formState.version.join('.'));
    //   changeOkLoading(false);
    //   closeModal();
    // } catch (err) {
    //   changeOkLoading(false);
    // }
  };
</script>

<style lang="less">
  .service-category {
    line-height: 36px;
    border-right: 1px solid #eaeaea;
    margin-right: 10px;
    padding-right: 10px;
    & > div {
      padding: 0 10px;
      cursor: pointer;
      &.active {
        background: rgba(237, 246, 246, 0.96);
      }
    }
  }
  .service-tree {
    @height: 32px;
    .ant-tree-treenode {
      padding: 0;
      &:hover {
        background: rgba(237, 246, 246, 0.96);
      }

      // display: flex;
      // align-items: center;
    }
    .ant-tree-switcher {
      line-height: @height;
    }
    .ant-tree-node-content-wrapper {
      padding: 0;
      cursor: pointer;
      height: @height;
      line-height: @height;
      padding: 0 8px;
      &:hover {
        background-color: transparent;
      }
    }
  }
</style>
