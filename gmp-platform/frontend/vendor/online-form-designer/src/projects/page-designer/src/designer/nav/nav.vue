<template>
  <div class="designer-nav">
    <div
      class="designer-nav-item"
      :class="{
        'designer-nav-item--active': item.code === toolkit && toolkitShow,
      }"
      v-for="item in filterToolkitOptions"
      :key="item.code"
      @click="onNavClick(item.code)"
    >
      <div>
        <i class="iconfont" :class="item.icon"></i>
        <div> {{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { watch, ref } from 'vue';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { ToolkitEnum, FormComponents, BuiltinType } from '/@page-designer/enum';
  import { ToolkitOptions } from '/@page-designer/constant/toolkit';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';

  const { toolkit, toggleToolkit, setFieldToolkit, toolkitShow } = useToolkit();
  const { focusFormContainer, selectedRef } = useSelectedWidget();
  const { subTableModalState } = useDesigner();

  toggleToolkit(ToolkitEnum.WIDGETS);

  const filterToolkitOptions = ref<
    {
      code: ToolkitEnum;
      name: string;
      icon: string;
    }[]
  >([]);

  const beforeToolkit = ref<ToolkitEnum>(ToolkitEnum.WIDGETS);
  watch(
    () => focusFormContainer,
    (_focusFormContainer) => {
      if (
        _focusFormContainer.value.isFocus &&
        (selectedRef.value?.formItem ||
          [
            FormComponents.Form,
            FormComponents.FormProcess,
            FormComponents.RdoForm,
            FormComponents.MedProRdoForm,
            FormComponents.CardList,
            BuiltinType.MODAL,
          ].includes(selectedRef.value.type))
      ) {
        if (toolkit.value !== ToolkitEnum.FIELD) {
          beforeToolkit.value = toolkit.value;
        }
        toggleToolkit(ToolkitEnum.FIELD);
      } else {
        if (toolkit.value === ToolkitEnum.FIELD) {
          toggleToolkit(beforeToolkit.value, true);
        }
      }
      if (subTableModalState.value) {
        filterToolkitOptions.value = ToolkitOptions.slice();
        return;
      }

      if (_focusFormContainer.value!.isFocus) {
        setFieldToolkit({
          modelKey: _focusFormContainer.value!.formModelKey,
          formId: _focusFormContainer.value!.formId ?? '',
          childParentModelKey: _focusFormContainer.value!.refParentModelkey,
        });
      }

      filterToolkitOptions.value = ToolkitOptions.filter((option) => {
        if (_focusFormContainer.value!.isFocus) {
          return true;
        }
        return option.code !== ToolkitEnum.FIELD;
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const onNavClick = (nav: ToolkitEnum) => {
    if (nav === toolkit.value && toolkitShow.value) {
      toolkitShow.value = false;
      return;
    }
    toggleToolkit(nav, true);
  };
</script>

<style lang="less" scoped>
  .designer-nav {
    &-item {
      height: 68px;
      color: #5d6474;
      // padding: 0 4px;
      // margin-bottom: 2px;
      cursor: pointer;

      > div {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        // border-bottom: 1px solid #efefef;
        height: 100%;
        font-size: 12px;
        line-height: 1em;

        .iconfont {
          margin-bottom: 8px;
          color: #767f92;
          font-size: 20px;
        }
      }

      &--active {
        background: rgb(26 29 35 / 12%);
        color: #212528;

        .iconfont {
          color: #212528 !important;
        }
      }

      &:hover {
        background: rgb(26 29 35 / 6%);
      }
    }
  }
</style>
