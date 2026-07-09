<template>
  <div class="wrapper">
    <div class="title">{{ $t('sys.pageDesigner.business') }}</div>
    <ul @dragstart="handleDragStart" v-if="filterValidWidgetList.length">
      <li
        v-for="item in filterValidWidgetList"
        :key="item.type"
        :data-type="item.type"
        draggable="true"
      >
        <i class="iconfont" :class="item.icon"></i>
        {{ item.name }}</li
      >
    </ul>
    <a-empty v-else :image="Empty.PRESENTED_IMAGE_SIMPLE" :description="null" />
  </div>
</template>

<script setup lang="ts" name="toolkit-content-reverse-modeling">
  import { computed } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { getFieldIcon } from '/@online-form/utils/field.enum';
  import { OnlineFormBusinessTypes } from '/@online-form/views/designer/constants';
  import {
    TransferType,
    setTransferData,
  } from '/@online-form/views/designer/modules/base/drag/use-drop';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';

  const { t } = useI18n();

  const widgetConfigList = OnlineFormBusinessTypes.map((type) => {
    return {
      type: type,
      name: t(`sys.model.${type}`),
      icon: getFieldIcon(type) || 'icon-zidingyi',
    };
  });

  const { currentCell, panelData } = useSpreadSheet();

  const filterValidWidgetList = computed(() => {
    // 单元格的组合字段不支持拖动反向建模组件
    if (currentCell.value?.data?.multiFields && [PanelType.Cell].includes(panelData.type))
      return [];
    return widgetConfigList.filter(() => true);
  });

  function handleDragStart(e) {
    const type = e.target.dataset.type;

    setTransferData(e, { type: TransferType.ReverseModeling, data: { type } });
  }
</script>

<style lang="less" scoped>
  .wrapper {
    padding: 12px;
  }
  .title {
    font-weight: bold;
    margin-bottom: 12px;
  }
  ul,
  li {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul {
    display: grid;
    grid-gap: 8px;
    grid-template-columns: repeat(2, 1fr);

    li {
      // height: 34px;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
      display: flex;
      align-items: center;
      padding: 2px 8px;
      color: #212528;
      font-size: 12px;
      cursor: pointer;

      .iconfont {
        margin-right: 6px;
        color: #797a7d;
      }
    }
  }
</style>
