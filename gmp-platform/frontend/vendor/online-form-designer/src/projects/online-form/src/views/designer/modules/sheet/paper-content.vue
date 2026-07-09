<template>
  <context-menu type="paper">
    <div class="paper-content">
      <table cellpadding="0" cellspacing="0">
        <colgroup>
          <col
            v-for="(col, colIndex) in paper.cols"
            :key="colIndex + 1"
            :data-x="colIndex + 1"
            :width="col.width"
          />
        </colgroup>
        <tbody>
          <spread-sheet-tr
            v-for="(row, rowIndex) in paper.rows"
            :key="rowIndex + 1"
            :data-y="rowIndex + 1"
            :height="row.height"
          >
            <spread-sheet-cell
              v-for="(col, colIndex) in paper.cols"
              :key="colIndex + 1"
              :data-x="colIndex + 1"
              :data-y="rowIndex + 1"
              :x="colIndex + 1"
              :y="rowIndex + 1"
              :class="{
                highlight:
                  colIndex + 1 >= selection.l &&
                  colIndex + 1 <= selection.r &&
                  rowIndex + 1 >= selection.t &&
                  rowIndex + 1 <= selection.b,
              }"
              :cell="paper.cells[rowIndex][colIndex] || {}"
            />
          </spread-sheet-tr>
        </tbody>
      </table>

      <spread-sheet-image v-for="(item, index) in paper.images" v-bind="item" :key="index" />

      <!-- 表头 start -->
      <spread-sheet-dynamic-thead v-if="paper.thead?.thRange" v-bind="paper.thead" />
      <!-- 表头 end -->

      <!-- 动态表 start -->
      <template v-for="t in paper.dynamicTables" :key="t.id">
        <spread-sheet-dynamic-thead v-if="t.thRange" v-bind="t" />
        <spread-sheet-dynamic-tr v-bind="t" />

        <!-- 二维表 -->
        <SpreadSheetDataGroup2D v-if="t.dgRange" v-bind="t" />
      </template>
      <!-- 动态表 end -->

      <!-- 固定表 start -->
      <template v-for="t in paper.fixedTables" :key="t.id">
        <spread-sheet-dynamic-thead v-if="t.thRange" v-bind="t" />
        <spread-sheet-fixed-table v-if="t.type !== SubTableType.CHECK" v-bind="t" />

        <!-- 检验表 -->
        <spread-sheet-check-table v-if="t.type === SubTableType.CHECK" v-bind="t" />
        <SpreadSheetCheckTr v-if="t.type === SubTableType.CHECK && t.rowRange" v-bind="t" />
        <SpreadSheetDataGroup2D v-if="t.type === SubTableType.CHECK && t.dgRange" v-bind="t" />

        <!-- 固定表 -->
        <spread-sheet-data-group v-if="t.type !== SubTableType.CHECK && t.dgRange" v-bind="t" />
      </template>
      <!-- 固定表 end -->

      <template v-for="f in tableDataGroups">
        <spread-sheet-data-group-ref
          v-for="(item, index) in f.xDataGroups"
          v-bind="item"
          :key="index"
        />
        <spread-sheet-data-group-ref
          v-for="(item, index) in f.yDataGroups"
          v-bind="item"
          :key="index"
        />
        <template v-for="(row, rowIndex) in f.otherDataGroups" :key="rowIndex">
          <template v-for="(cell, cellIndex) in row" :key="cellIndex">
            <spread-sheet-data-group-ref v-bind="cell" />
          </template>
        </template>
      </template>

      <template v-for="f in checkRowDataGroups">
        <spread-sheet-data-group-ref
          v-for="(item, index) in f.yDataGroups"
          v-bind="item"
          :key="index"
          render="row"
        />
      </template>

      <template v-for="f in checkColDataGroups">
        <spread-sheet-data-group-ref
          v-for="(item, index) in f.xDataGroups"
          v-bind="item"
          :key="index"
        />
      </template>

      <!-- 选区 -->
      <spread-sheet-selection />
    </div>
  </context-menu>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import SpreadSheetTr from './sheet-tr.vue';
  import SpreadSheetCell from './sheet-cell.vue';
  import SpreadSheetImage from './sheet-image.vue';
  import SpreadSheetSelection from './sheet-selection.vue';
  import SpreadSheetDynamicTr from './sheet-dynamic-tr.vue';
  import SpreadSheetCheckTable from './sheet-check-table.vue';
  import SpreadSheetFixedTable from './sheet-fixed-table.vue';
  import SpreadSheetDataGroup from './sheet-data-group.vue';
  import SpreadSheetDataGroup2D from './sheet-data-group-2d.vue';
  import SpreadSheetCheckTr from './sheet-check-tr.vue';
  import SpreadSheetDataGroupRef from './sheet-data-group-ref.vue';
  import SpreadSheetDynamicThead from './sheet-dynamic-thead.vue';
  import ContextMenu from '../base/context-menu.vue';
  import { SubTableType } from '../../enums';

  const { paper, selection, tableDataGroups, checkRowDataGroups, checkColDataGroups } =
    useSpreadSheet();
</script>

<style></style>
