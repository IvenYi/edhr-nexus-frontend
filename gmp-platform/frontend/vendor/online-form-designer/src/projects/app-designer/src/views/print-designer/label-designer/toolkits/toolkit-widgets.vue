<template>
  <div class="element-menu-wrapper">
    <div class="comp-menu">
      <div
        class="comp-menu__el-wrap"
        :key="element.type"
        v-for="element in CommonPrintElems"
        :title="element.displayName"
        draggable="true"
        @dragstart="(e) => dragstartHandler(e, element)"
        @click="(e) => addItemToStage(e, element)"
      >
        <div class="comp-menu__el">
          <i class="iconfont" :class="'icon-' + element.iconName"></i>
          <span>{{ element.displayName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="toolkit-widgets">
  import CommonPrintElems from '../constants/CommonPrintElems';
  // import { useI18n } from '/@/hooks/web/useI18n';
  // const { t } = useI18n();
  import { useDesigner } from '../hooks/useDesigner';
  import { usePage } from '../hooks/usePage';
  const { clearSelectedElements, registerElement } = useDesigner();
  const { project } = usePage();
  const dragstartHandler = (e, item) => {
    e.dataTransfer.dropEffect = 'copy';
    e.dataTransfer.effectAllowed = 'all';
    e.dataTransfer.setData('text/plain', JSON.stringify(initItem(item)));
  };
  const initItem = (item) => {
    return {
      zIndex: 'auto',
      top: 0,
      left: 0,
      bottom: 'auto',
      right: 'auto',
      ...item,
    };
  };
  const addItemToStage = (e, item) => {
    clearSelectedElements();
    registerElement({
      pageId: project.value.id,
      el: initItem(item),
    });
  };
</script>

<style lang="less" scoped>
  .element-menu-wrapper {
    display: flex;
    flex-flow: column nowrap;
    //height: calc(100% - 0px);
    width: 100%;
    padding: 10px;
    //position: absolute;
    overflow-y: auto;

    .comp-menu {
      display: flex;
      flex-flow: wrap;
      width: 100%;
      height: 100%;
      gap: 7px;
      //display: grid;
      //margin: 1px;
      //grid-template-columns: repeat(auto-fill, 75px);
      //grid-auto-rows: minmax(1px, 75px);
      // border-left: 1px solid #f1f1f1;
      // border-top: 1px solid #f1f1f1;
    }

    .comp-menu__el-wrap {
      width: 75px;
      height: 75px;
      padding: 2px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      background-color: transparent;

      i {
        font-size: 30px;
      }

      .comp-menu__el {
        width: 100%;
        height: 100%;
        border-top: 1px solid #f1f1f1;
        border-right: 1px solid #f1f1f1;
        border-bottom: 1px solid #f1f1f1;
        border-left: 1px solid #f1f1f1;
        color: #333;
        text-align: center;
        cursor: pointer;
      }
    }

    .comp-menu__el:hover {
      background-color: rgb(0 0 0 / 8%);
    }

    .comp-menu__el span {
      display: block;
      padding: 0 8px;
      overflow: hidden;
      font-size: small;
      text-overflow: ellipsis;
    }
  }
</style>
