<template>
  <div class="model-traceability">
    <div class="header flex">
      {{ t('sys.pageDesigner.modelingTraceability') }}：
      <a-switch v-model:checked="checked" @change="handleSave" size="small" />
      <div class="color-[#8F8F8F] ml16px">开启后，将记录、管理和追溯实体模型数据</div>
    </div>
    <div class="container">
      <div class="px-16px pt-12px trace-field-title">
        {{ t('sys.appDesigner.traceField') }}
      </div>
      <div class="color-[#8F8F8F] px-16px pb-16px trace-field-title">
        展示需要记录追溯的字段。当用户修改所选字段时，字段的原值和新值、以及操作人、操作时间都将被记录
      </div>

      <div class="tree px-16px" id="trace-tree" :style="{ height: treeHeight + 'px' }">
        <a-tree
          v-if="treeData"
          :tree-data="treeData"
          v-model:checkedKeys="checkedKeys"
          defaultExpandAll
          show-line
        >
          <template #title="{ title, key, type, modelName }">
            <i
              v-if="key !== 1"
              :class="['iconfont', FieldIconMap[type] || 'icon-zidingyi']"
              class="color-[#868A96] icon-type"
            ></i>
            {{ `${title}${modelName ? '(' + modelName + ')' : ''}` }}
          </template>
          <template #switcherIcon="{ dataRef, defaultIcon, expanded }">
            <CaretDownOutlined v-if="expanded" class="down-icon" />
            <CaretRightOutlined v-else-if="!expanded" />
            <component :is="defaultIcon" v-else />
            <!-- <i :class="['iconfont', FieldIconMap[dataRef.type] || 'icon-zidingyi']"></i> -->
          </template>
        </a-tree>
      </div>
    </div>
  </div>
  <model-tranceability-modal @register="register" />
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onUnmounted } from 'vue';
  import { message, TreeProps } from 'ant-design-vue';
  import ModelTranceabilityModal from './modal/model-tranceability-modal.vue';
  import { useModal } from '/@/components/Modal';
  import { ModelMetaResponse, TraceSettingRequest } from '/@/apis/gct-apaas/model';
  import {
    getTraceSettingTreeByModelKey,
    putTraceSettingById,
  } from '/@/apis/gct-apaas/TraceSettingController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { calculateDistanceToParent } from '/@/utils/domUtils';
  import { cloneDeep } from 'lodash-es';
  import { FieldIconMap } from '@gct/runtime';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const { t } = useI18n();
  const props = defineProps<{
    model: ModelMetaResponse;
    activeKey: string;
  }>();

  const [register, { openModal }] = useModal();

  const level = ref(2);
  const checked = ref(1);
  const treeData = ref<TreeProps['treeData']>();
  /** 选中复选框的树节点 */
  const checkedKeys = ref<string[]>([]);
  const traceSettingId = ref('');
  const treeHeight = ref(0);

  const setPageTreeItem = (data, pathStr) => {
    return data
      .map((item: any) => {
        item.id = item.key;
        item.key = `${pathStr !== '' ? `${pathStr}|` : ''}${item.key}`;
        checkedKeys.value.push(item.key);
        if (Array.isArray(item.children)) {
          setPageTreeItem(item.children, item.id);
        }
        return item;
      })
      .filter((e) => {
        return ![FIELD_TYPE.RANGE_USER, 'online_form', FIELD_TYPE.LABEL_TEMPLATE].includes(e.type);
      })
      .filter((p) => {
        return !p.children || (p.children && p.children.length);
      });
  };

  const setPageTree = (data) => {
    checkedKeys.value = [];
    const root = cloneDeep(data);
    const treeList = setPageTreeItem(root, '');
    return treeList;
  };

  const initTraceSettingField = async () => {
    if (props.model.key) {
      const res = await getTraceSettingTreeByModelKey({ modelKey: props.model.key });
      traceSettingId.value = res?.id ?? '';
      if (res?.checkedFields) {
        checkedKeys.value = JSON.parse(res.checkedFields);
      }

      treeData.value =
        setPageTree(res?.treeData) && setPageTree(res?.treeData).length
          ? [{ title: props.model.name, key: 1, children: setPageTree(res?.treeData) }]
          : [];

      checked.value = !!res?.enable as number;
    }
  };

  watch(
    [props.model.key, props.activeKey],
    () => {
      initTraceSettingField();
    },
    {
      immediate: true,
    },
  );

  // 保存建模追溯
  const handleSave = async () => {
    const data: TraceSettingRequest = {
      checkedFields: JSON.stringify(checkedKeys.value),
      level: level.value,
      modelKey: props.model.key,
      enable: Number(checked.value),
    };
    await putTraceSettingById({ id: traceSettingId.value }, data);
    if (checked.value) {
      message.success(t('sys.tipEnabledSuccess'));
    } else {
      message.success(t('sys.tipDisabledSuccess'));
    }
  };

  // 打开历史记录
  const handleOpenDialog = () => {
    openModal(true, props.model);
  };

  const calcTreeHieght = () => {
    nextTick(() => {
      treeHeight.value =
        document.querySelector('.content')?.getBoundingClientRect().height! -
        calculateDistanceToParent(
          document.getElementById('trace-tree'),
          document.querySelector('.content'),
        ).top -
        40;
    });
    console.log(treeHeight.value);
  };
  calcTreeHieght();
  // 添加窗口大小改变的事件监听器
  window.addEventListener('resize', calcTreeHieght);
  onUnmounted(() => {
    window.removeEventListener('resize', calcTreeHieght);
  });
</script>

<style lang="less">
  .model-traceability {
    height: 100%;
    .header {
      height: 52px;
      border: 1px solid #eaeaea;

      align-items: center;
      padding: 0 14px;
      .left {
        display: flex;
        align-items: center;
        width: 200px;
        .input {
          height: 28px;
          max-width: 80px !important;
          margin-right: 8px;
        }
      }
    }
    .container {
      height: calc(100%);
      width: 100%;
      // min-height: 400px;
      .trace-field-title {
        border-left: 1px solid #f0f0f0;
        border-right: 1px solid #f0f0f0;
      }
      .tree {
        height: 100%;
        overflow: auto;
        // width: 50%;
        // margin-left: 14px;
        border: 1px solid #eaeaea;
        border-top: none;
      }
    }
  }
</style>
<style scoped lang="less">
  :deep(.ant-tree-switcher-noop) {
    display: none;
  }
  .icon-type {
    font-size: 12px;
  }
  .down-icon {
    color: var(--ant-primary-color);
  }
</style>
