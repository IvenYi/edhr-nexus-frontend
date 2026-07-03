<template>
  <div class="panel-box" :key="selectedItem.id">
    <div class="selection-title__wrapper">
      <!-- <i class="iconfont icon" :class="[`icon-${selectionIcon}`]"></i> -->
      <span :class="selectionTitle ? 'color-[#797A7D]' : 'color-[#1A1D23]'">{{ $t('sys.appDesigner.template') }}</span>
      <span v-if="selectionTitle" :class="selectionTitle ? 'color-[#797A7D]' : 'color-[#1A1D23]'">
        &nbsp;>&nbsp;
      </span>
      <span v-if="selectionTitle" :title="selectionTitle" class="selection-title color-[#1A1D23]">
        {{ selectionTitle }}
      </span>
    </div>
    <page-properties v-if="selectionType === 'page'" @propchange="onPropChange" />

    <component-properties v-if="selectionType === 'component'" @propchange="onPropChange" />
  </div>
</template>

<script setup lang="ts" name="panel-widget">
  import { computed } from 'vue';
  import { useDesigner } from '../../hooks/useDesigner';
  import { useProp } from '../../hooks/useProp';
  import PageProperties from './page-properties.vue';
  import ComponentProperties from './component-properties.vue';

  const { selectedElements, updateEgglement } = useDesigner();
  const { selectedItem } = useProp();

  const selectionTitle = computed(() => {
    if (selectedElements.value.length === 0) {
      return '';
    } else if (selectedElements.value.length > 1) {
      return $t('sys.printDesigner.multipleEleTip');
    } else {
      return $t(selectedElements.value[0].displayName);
    }
  });
  const selectionIcon = computed(() => {
    if (selectedElements.value.length === 0) {
      return 'pages';
    } else if (selectedElements.value.length > 1) {
      return 'multiple';
    } else {
      return selectedElements.value[0].iconName.toLowerCase();
    }
  });
  const selectionType = computed(() => {
    if (selectedElements.value.length === 0) {
      return 'page';
    } else if (selectedElements.value.length > 1) {
      return 'multiple';
    } else {
      return 'component';
    }
  });

  /**
   * changeData中包含prop表示修改的style或者attrs中的属性名
   * */
  const onPropChange = (changeData) => {
    if (changeData.value === '') return;
    let newValue = {};
    if (
      !['alias'].includes(changeData.type) &&
      typeof changeData.value === 'string' &&
      !isNaN(changeData.value)
    ) {
      newValue[changeData.type] = parseInt(changeData.value);
    } else {
      newValue[changeData.type] = changeData.value;
    }

    if (changeData.prop) {
      newValue['prop'] = changeData.prop;
    }

    saveChanges(newValue);
  };
  const saveChanges = (newValue) => {
    updateEgglement({ egglement: selectedItem.value, ...newValue });
  };
</script>

<style lang="less">
  @import './PropertiesMenu.less';

  .panel-box {
    position: relative;
    height: 100%;
    // border-left: 1px solid #e0e3ea;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 0;
    }

    .selection-title__wrapper {
      display: flex;
      align-items: center;
      height: 42px;
      padding-left: 12px;
      border-bottom: 1px solid #e0e3ea;
      color: #212528;
    }
  }
</style>
