<template>
  <div
    class="table-x"
    :style="{
      top: `calc(${paper.padding.t}mm - 20px)`,
      maxHeight: `calc(${tableMaxHeight}mm + 20px)`,
      left: `calc(${paper.padding.l}mm - 10px)`,
      maxWidth: `calc(${tableMaxWidth}mm + 10px)`,
      display: isHidden ? 'none' : undefined,
    }"
  >
    <div
      class="table-x__points"
      :style="{
        width: `calc(${tableMaxWidth}mm + 10px)`,
      }"
    >
      <table cellpadding="0" cellspacing="0" class="table-x__table">
        <colgroup>
          <col
            v-for="(col, colIndex) in paper.cols"
            :key="colIndex + 1"
            :data-x="colIndex + 1"
            :width="col.width"
          />
        </colgroup>
        <tbody>
          <tr>
            <td
              style="position: relative; height: 20px"
              v-for="(col, colIndex) in paper.cols"
              :key="colIndex + 1"
              :data-x="colIndex + 1"
            >
              <div
                v-if="colIndex === 0"
                :class="['table-x__point left', hoverLineIndex === 0 && 'is-hover']"
                :style="{ left: 0 }"
                @mouseenter="() => mouseenter(0)"
                @mouseleave="mouseleave"
              >
                <i class="icon-point"></i>
                <i class="iconfont icon-tianjia hover-icon" @click="(e) => addCol(e, 0)"></i>
              </div>
              <div
                :class="['table-x__point right', hoverLineIndex === colIndex + 1 && 'is-hover']"
                @mouseenter="() => mouseenter(colIndex + 1)"
                @mouseleave="mouseleave"
              >
                <i class="icon-point"></i>
                <i
                  class="iconfont icon-tianjia hover-icon"
                  @click="(e) => addCol(e, colIndex + 1)"
                ></i>
              </div>
            </td>
          </tr>
          <tr
            class="table-x__lines"
            :style="{
              display: hoverLineIndex === -1 ? 'none' : undefined,
              height: tableHeight + 'px',
            }"
          >
            <td
              v-for="(col, colIndex) in paper.cols"
              :class="[
                colIndex === hoverLineIndex - 1 && 'right-border',
                colIndex === 0 && hoverLineIndex === 0 && 'left-border',
              ]"
              :key="colIndex + 1"
              :data-x="colIndex + 1"
              :style="{
                height: tableHeight + 'px',
              }"
            >
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { computed, ref } from 'vue';

  const { paper, paperLayout, selection, insertCol, sheetReadonly } = useSpreadSheet();

  const tableHeight = computed(() => {
    return paper.value.rows.reduce((acc, row) => acc + row.height, 0);
  });
  const tableMaxWidth = computed(() => {
    return paperLayout.value.w - paper.value.padding.l - paper.value.padding.r;
  });
  const tableMaxHeight = computed(() => {
    return paperLayout.value.h - paper.value.padding.t - paper.value.padding.b;
  });

  const isHidden = computed(() => {
    return sheetReadonly.value || (selection.e._t !== 1 && selection.e._l !== 1);
  });

  const hoverLineIndex = ref(-1);

  const mouseenter = (index: number) => {
    hoverLineIndex.value = index;
  };

  const mouseleave = () => {
    hoverLineIndex.value = -1;
  };

  const addCol = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    insertCol(index + 1);
  };
</script>

<style lang="scss">
  .table-x {
    position: absolute;
    z-index: 999;
    overflow: hidden;
    padding-left: 10px;

    &__table {
      //表格不随父撑开
      width: 0;
      table-layout: fixed;
    }

    &__points {
      padding-right: 10px;
    }

    &__point {
      &.right {
        right: 0;
        transform: translateX(50%);
      }
      &.left {
        left: 0;
        transform: translateX(-50%);
      }
      bottom: 0;
      position: absolute;
      line-height: 1;
      cursor: pointer;
      border: 1px solid transparent;
      &.is-hover {
        border-color: var(--ant-primary-color);
        color: var(--ant-primary-color);
        .icon-point {
          display: none;
        }
        .hover-icon {
          display: inline;
        }
      }

      .hover-icon {
        display: none;
        font-size: 16px;
      }

      .icon-point {
        display: inline-block;
        width: 6px;
        height: 6px;
        background-color: #788086;
        border-radius: 50%;
      }
    }

    &__lines {
      .right-border {
        border-right: 2px solid var(--ant-primary-color);
      }
      .left-border {
        border-left: 2px solid var(--ant-primary-color);
      }
    }
  }
</style>
