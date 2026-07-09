<template>
  <div class="file-list-wrap">
    <div class="file-list-wrap__header">
      <div
        v-for="tab of switchIcons"
        :key="tab.key"
        :class="['switch-item', showType === tab.name && 'selected']"
        @click.stop="() => onChangeTypeTab(tab)"
      >
        <i class="iconfont" :class="tab.icon"></i>
      </div>
    </div>

    <div v-show="showType === 'Card'" class="file-list-wrap__list flex-card">
      <div v-if="fileLoading" class="nocode-common-loading-warp" style="height: 300px">
        <a-spin :spinning="true" />
      </div>
      <template v-else>
        <div
          v-for="(file, index) of tableData"
          :key="index"
          :class="['file-list-wrap__item', isDesign ? 'is-design' : '']"
          @click.stop="handleClick(file)"
        >
          <span :class="['file-status', file.status]">{{ StatusNames[file.status] }}</span>
          <SvgIcon class="file-list-wrap__item-svg" :size="34" :name="typeParser(file)" />
          <div class="file-list-wrap__item-name">
            <span :title="isDesign ? '' : file.name">
              {{ file.snContainerName ? `【${file.snContainerName}】${file.name}` : file.name }}
            </span>
          </div>
        </div>
      </template>
    </div>

    <a-table
      v-show="showType === 'List'"
      row-key="id"
      :columns="tableCol"
      :data-source="tableData"
      size="middle"
      :pagination="false"
      ref="tableRef"
      :loading="fileLoading"
      @resizeColumn="handleResizeColumn"
      :customRow="
        (record) => {
          return {
            onClick: (event) => {
              handleClick(record);
            }, // 点击行
          };
        }
      "
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.key === 'status'">
          <span :class="['file-status', record.status]">{{ StatusNames[record.status] }}</span>
        </template>
        <template v-if="column.key === 'type'">
          <SvgIcon class="file-svg" :size="18" :name="typeParser(record)" />
          <span>{{ record.typeName || TypeNames[record.type] }}</span>
        </template>
        <template v-if="column.key === 'name'">
          <span v-if="isDesign">{{ record.name }}</span>
          <a-button type="link" v-else class="record-name" :title="record.name">
            {{
              record.snContainerName ? `【${record.snContainerName}】${record.name}` : record.name
            }}
          </a-button>
          <!-- <a-tooltip v-else>
            <template #title>{{ record.name }}</template>
            <span :title="record.name" @click.stop="handleClick(record)">{{ record.name }}</span>
          </a-tooltip> -->
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="fileList">
  import { computed, ref } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { isFunction } from '/@/utils/is';
  import {
    switchIcons,
    columns,
    CollectionData,
    TypeNames,
    typeParser,
    StatusNames,
  } from '../types';

  const tableCol = ref(columns);

  interface IProps {
    showType: 'Card' | 'List';
    fileData: CollectionData[];
    isDesign: boolean;
    nameClick?: Function;
    fileLoading: boolean;
  }

  const props = defineProps<IProps>();
  const emit = defineEmits(['update:showType', 'fileCheck']);

  const onChangeTypeTab = (data) => {
    emit('update:showType', data.name);
  };

  const tableData = computed(() => {
    return props.fileData.map((i) => i);
  });

  async function handleClick(item) {
    if (props.isDesign) return;
    if (props.nameClick && isFunction(props.nameClick)) {
      props.nameClick(item);
    } else {
      emit('fileCheck', item);
    }
  }

  function handleResizeColumn(w, col) {
    col.width = w;
  }
</script>

<style lang="less" scoped>
  .file-list-wrap {
    // padding-top: 8px;
    &__header {
      width: 64px;
      height: 32px;
      padding: 4px;
      border-radius: 4px;
      background: #f3f5f9;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 8px;
      .switch-item {
        position: relative;
        display: flex;
        align-items: center;
        width: 24px;
        height: 24px;
        color: #c9cede;
        border-radius: 2px;
        cursor: pointer;
        .iconfont {
          width: 24px;
          height: 24px;
          font-size: 16px;
          display: flex;
          justify-content: center;
        }
        &.selected {
          background-color: #fff;
          color: #384356;
        }
      }
    }

    &__list {
      display: flex;
      &::-webkit-scrollbar {
        display: block;
        width: 4px;
      }
      &.flex-card {
        flex-direction: row;
        flex-wrap: wrap;
        max-height: 372px;
        overflow-y: auto;
        .file-list-wrap__item {
          position: relative;
          padding-top: 16px;
          text-align: center;
          width: 130px;
          margin-right: 10px;
          padding: 8px;
          background: #fff;
          border: 1px solid #e8ebf0;
          border-radius: 4px 4px 4px 4px;
          &-svg {
            margin: 0 auto;
            margin-top: 8px;
          }
          &-name {
            width: 100%;
            margin-top: 2px;
            height: 22px;
            line-height: 22px;
          }
          .file-status {
            position: absolute;
            right: 0;
            top: 0;
            line-height: 12px;
            border-radius: 0 4px 0 4px;
          }
          &:hover {
            border-color: #026ac8;
          }
        }
      }
    }

    &__item {
      margin-bottom: 8px;
      &-name {
        span {
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &:hover {
        cursor: pointer;
        color: var(--ant-primary-color);
      }
      &.is-design {
        cursor: default;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }

  .file-status {
    font-size: 12px;
    padding: 2px 4px;
    &.initial {
      color: #026ac8;
      background: rgba(2, 106, 200, 0.1);
    }
    &.stash {
      color: #f77e4a;
      background: rgba(247, 126, 74, 0.1);
    }
    &.submitted {
      color: #979797;
      background: rgba(151, 151, 151, 0.1);
    }
  }

  .record-name {
    &:hover {
      cursor: pointer;
      color: var(--ant-primary-color);
    }
  }
</style>
