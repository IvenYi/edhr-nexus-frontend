<template>
  <div class="template-config mt-5">
    <div class="title py4px">{{ t('sys.model.templateEvent') }}</div>
    <div class="mt8px bg-[#FBFBFC] pt24px pb24px px16px">
      <div class="flex">
        <div class="mr12px flex flex-col justify-center items-center">
          <img :src="themeSetting.themeColor === '#026AC8' ? ruleBlue : ruleGreen" alt="" />
          <div class="w2px h100% line"></div>
        </div>
        <div>
          <div class="text-[#1A1D23] mb4px">{{ t('sys.pageDesigner.validateruleProp') }}</div>
          <div class="text-[#8B8B8B] mb8px">
            模板导入数据处理前，进行数据校验：如果验证不通过，不作操作，跳过该数据
          </div>
          <a-tree-select
            class="mb24px"
            allowClear
            v-model:value="formData.vsKey"
            :tree-data="scriptOptions"
            :placeholder="t('sys.chooseText')"
            :selectable="(node) => !node.children"
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
            @select="handleSelect"
            style="width: 500px"
            showSearch
            :listHeight="300"
            :filterTreeNode="filterTreeNode"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            v-model:treeExpandedKeys="treeExpandedKeys"
          >
            <template #title="data">
              <div
                v-if="data.children && data.children.length"
                @click.stop="handleTitleClick(data)"
              >
                {{ data.name }}
              </div>
              <div v-else>
                {{ data.name }}
              </div>
            </template>
          </a-tree-select>
        </div>
      </div>
      <div class="flex">
        <div class="mr12px flex flex-col justify-center items-center">
          <img :src="themeSetting.themeColor === '#026AC8' ? logicBlue : logicGreen" alt="" />
          <div class="w2px h100% bg-[#e8ebf0] mt8px"></div>
        </div>
        <div>
          <div class="text-[#1A1D23] mb4px">
            {{ t('sys.pageDesigner.businessLogicProcessing') }}
          </div>
          <div class="text-[#8B8B8B] mb8px">
            选择业务脚本，成功导入execl数据后默认进行业务流程处理
          </div>
          <a-tree-select
            allowClear
            class="mb24px"
            v-model:value="formData.lsKey"
            :tree-data="scriptOptions"
            :placeholder="t('sys.chooseText')"
            :selectable="(node) => !node.children"
            :field-names="{ children: 'children', label: 'name', value: 'id' }"
            @select="handleSelect"
            style="width: 500px"
            showSearch
            :listHeight="300"
            :filterTreeNode="filterTreeNode"
            :getPopupContainer="(triggerNode) => triggerNode.parentNode"
            v-model:treeExpandedKeys="treeExpandedKeys"
          >
            <template #title="data">
              <div
                v-if="data.children && data.children.length"
                @click.stop="handleTitleClick(data)"
              >
                {{ data.name }}
              </div>
              <div v-else>
                {{ data.name }}
              </div>
            </template>
          </a-tree-select>
          <div>
            执行方式：
            <a-radio-group v-model:value="formData.exeType">
              <a-radio :value="0">同步导入</a-radio>
              <a-radio :value="1">异步导入</a-radio>
            </a-radio-group>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import ruleBlue from '/@/assets/svg/pic_yzgz_blue.svg';
  import ruleGreen from '/@/assets/svg/pic_yzgz_green.svg';
  import logicBlue from '/@/assets/svg/pic_ywljcl_blue.svg';
  import logicGreen from '/@/assets/svg/pic_ywljcl_green.svg';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { isNumber } from 'lodash-es';

  // const props = defineProps<{
  // form: object;
  // columns: object[];
  // }>();

  const props = defineProps({
    eventInfo: {
      type: Object,
      default: () => ({
        vsKey: undefined,
        lsKey: undefined,
        exeType: 1,
      }),
    },
  });

  const emit = defineEmits(['change']);

  const { t } = useI18n();

  const { themeSetting } = useThemeSetting();

  const scriptOptions = ref();

  const treeExpandedKeys = ref([]);

  const formData = ref(props.eventInfo);

  watch(
    () => formData.value,
    () => {
      const { exeType } = formData.value;

      if (!isNumber(exeType)) {
        formData.value.exeType = 1;
      }

      emit('change', formData.value);
    },
    { deep: true, immediate: true },
  );

  const getOptionList = () => {
    getCategoryListComplete({ module: 'script_module' }).then((res) => {
      scriptOptions.value = (res || [])
        .filter((row) => row?.children?.length)
        .map((i) => {
          treeExpandedKeys.value.push(i.id);
          return { ...i, selectable: false };
        });
    });
  };

  // 阻止父节点选中
  const handleSelect = (selectedKeys, { node }) => {
    // if (node.children) {
    //   selectedValue.value = selectedKeys.filter((key) => key !== node.key);
    // }
  };

  const handleTitleClick = (data) => {
    console.log('data', data);
    if (treeExpandedKeys.value.includes(data.id)) {
      treeExpandedKeys.value = treeExpandedKeys.value.filter((i) => i !== data.id);
    } else {
      treeExpandedKeys.value.push(data.id);
    }
  };
  const filterTreeNode = (inputVal, treeNode) => {
    return treeNode.name.toLowerCase().includes(inputVal.toLowerCase());
  };
  getOptionList();
</script>
<style lang="less" scoped>
  .title {
    display: flex;
    align-items: center;
    font-size: 16px;
    &::before {
      content: ' ';
      display: block;
      width: 3px;
      height: 16px;
      background-color: var(--ant-primary-color);
      margin-right: 8px;
    }
  }
  :deep(.ant-select-tree-treenode-selected),
  :deep(.ant-select-tree .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected) {
    background-color: hsl(from var(--ant-primary-color) h s 95%);
    color: var(--ant-primary-color);
    border-radius: 4px;
  }

  :deep(.ant-select-tree-treenode),
  :deep(.ant-select-tree .ant-select-tree-node-content-wrapper) {
    &:hover {
      border-radius: 4px;
      background-color: #f2f5f8;
    }
  }
  :deep(.ant-select-tree .ant-select-tree-treenode) {
    padding: 4px 0;
  }
  .line {
    margin: 8px 0;
    background: #e8ebf0;
  }
  :deep(.ant-tree-select-dropdown) {
    padding: 0 8px;
  }
  :deep(.anticon-caret-down) {
    color: #5a5f6b;
  }
</style>
