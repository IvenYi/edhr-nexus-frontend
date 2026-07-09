<template>
  <div class="element-menu-wrapper">
    <div v-for="category in CommonPrintElems" :key="category.label">
      <div class="title py8px">{{ $t(category.label) }}</div>
      <div class="comp-menu">
        <div
          class="comp-menu__el-wrap"
          :key="element.type"
          v-for="element in category.children"
          :title="$t(element.displayName)"
          draggable="true"
          @dragstart="(e) => dragstartHandler(e, element)"
          @click="(e) => addItemToStage(e, element)"
        >
          <div class="comp-menu__el">
            <i class="iconfont" :class="'icon-' + element.iconName"></i>
            <span>{{ $t(element.displayName) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="toolkit-widgets">
  import CommonPrintElems from '../constants/CommonPrintElems';
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
    width: 100%;
    padding: 10px 11px;
    overflow-y: auto;

    .comp-menu {
      display: flex;
      flex-flow: wrap;
      width: 100%;
      height: 100%;
      gap: 12px;
      //display: grid;
      //margin: 1px;
      //grid-template-columns: repeat(auto-fill, 75px);
      //grid-auto-rows: minmax(1px, 75px);
    }

    .comp-menu__el-wrap {
      box-sizing: border-box;
      width: 83px;
      height: 82px;
      padding: 5px 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #f1f1f1;
      border-radius: 4px;
      background: #fff;
      background-color: transparent;

      i {
        font-size: 30px;
      }

      &:hover {
        background-color: rgb(0 0 0 / 8%);
      }

      .comp-menu__el {
        width: 100%;
        height: 100%;
        text-align: center;
        cursor: pointer;

        .iconfont {
          color: #797a7d;
        }

        span {
          display: block;
          padding: 0 8px;
          overflow: hidden;
          color: #212528;
          font-size: small;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .title{
  line-height: 18px;
  }
</style>
