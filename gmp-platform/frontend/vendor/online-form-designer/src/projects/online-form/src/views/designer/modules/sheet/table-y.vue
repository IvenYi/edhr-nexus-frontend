<template>
  <div
    class="table-y"
    :style="{
      top: `calc(${paper.padding.t}mm - 10px)`,
      maxHeight: `calc(${tableMaxHeight}mm + 10px)`,
      left: `calc(${paper.padding.l}mm - 20px)`,
      maxWidth: `calc(${tableMaxWidth}mm + 20px)`,
      display: isHidden ? 'none' : undefined,
    }"
  >
    <div class="table-y__points">
      <table cellpadding="0" cellspacing="0" class="table-y__table">
        <colgroup>
          <col :width="20" />
          <col :width="hoverLineIndex !== -1 ? tableWidth : 0" />
        </colgroup>
        <tbody>
          <tr
            v-for="(row, rowIndex) in paper.rows"
            :key="rowIndex + 1"
            :data-y="rowIndex + 1"
            :height="row.height"
          >
            <td style="position: relative">
              <div
                v-if="rowIndex === 0"
                :class="['table-y__point top', hoverLineIndex === 0 && 'is-hover']"
                :style="{ top: 0 }"
                @mouseenter="() => mouseenter(0)"
                @mouseleave="mouseleave"
              >
                <i class="icon-point"></i>
                <i class="iconfont icon-tianjia hover-icon" @click="(e) => addRow(e, 0)"></i>
              </div>
              <div
                :class="['table-y__point bottom', hoverLineIndex === rowIndex + 1 && 'is-hover']"
                @mouseenter="() => mouseenter(rowIndex + 1)"
                @mouseleave="mouseleave"
              >
                <i class="icon-point"></i>
                <i
                  class="iconfont icon-tianjia hover-icon"
                  @click="(e) => addRow(e, rowIndex + 1)"
                ></i>
              </div>
            </td>
            <td
              :class="[
                rowIndex === hoverLineIndex - 1 && 'bottom-border',
                rowIndex === 0 && hoverLineIndex === 0 && 'top-border',
              ]"
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

  const { paper, paperLayout, selection, insertRow, sheetReadonly } = useSpreadSheet();

  const tableWidth = computed(() => {
    return paper.value.cols.reduce((acc, col) => acc + col.width, 0);
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

  const addRow = (e: MouseEvent, index: number) => {
    e.stopPropagation();
    insertRow(index + 1);
  };
</script>

<style lang="scss">
  .table-y {
    position: absolute;
    z-index: 999;
    overflow: hidden;
    display: flex;
    padding-top: 10px;

    &__table {
      //表格不随父撑开
      height: 0;
      table-layout: fixed;
    }

    &__points {
      padding-bottom: 10px;
      flex-shrink: 0;
    }

    // 点的样式
    &__point {
      &.bottom {
        bottom: 0;
        transform: translateY(50%);
      }
      &.top {
        top: 0;
        transform: translateY(-50%);
      }
      right: 0px;
      position: absolute;
      line-height: 0;
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
        height: 16px;
        width: 16px;
        line-height: 1;
        position: relative;
      }

      .icon-point {
        font-size: 6px;
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-right: 2px;
        background-color: #788086;
        border-radius: 50%;
      }
    }

    // 线的样式
    .bottom-border {
      border-bottom: 2px solid var(--ant-primary-color);
    }
    .top-border {
      border-top: 2px solid var(--ant-primary-color);
    }
  }
</style>
