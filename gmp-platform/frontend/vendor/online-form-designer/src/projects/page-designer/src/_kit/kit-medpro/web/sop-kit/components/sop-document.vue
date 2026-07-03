<template>
  <div class="file-list">
    <div class="file-list__header p-4px mb-8px">
      <div
        v-for="tab of switchIcons"
        :key="tab.key"
        class="switch-item"
        :class="[showType === tab.name && 'selected']"
        @click.stop="() => onChangeTypeTab(tab)"
      >
        <i class="iconfont" :class="tab.icon"></i>
      </div>
    </div>
    <div v-show="showType === 'Card'" class="file-list__list flex-card">
      <div
        v-for="(file, index) of tableData"
        :key="index"
        :class="['file-list__item', isDesign ? 'is-design' : '']"
      >
        <SvgIcon
          class="file-list__item-svg"
          :size="32"
          :name="fileTypeParser(file)"
          @click.stop="handleClick(file)"
        />
        <div class="file-list__item-name">
          <span v-if="isDesign">{{ file.name }}</span>
          <a-tooltip v-else>
            <template #title>{{ file.name }}</template>
            <span @click.stop="handleClick(file)">{{ file.name }}</span>
          </a-tooltip>
        </div>
      </div>
    </div>
    <a-table
      v-show="showType === 'List'"
      row-key="id"
      :columns="columns"
      :data-source="tableData"
      size="middle"
      :pagination="false"
      ref="tableRef"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'index'">
          {{ index + 1 }}
        </template>
        <template v-if="column.key === 'sopDocument'">
          <a-tooltip>
            <template #title>{{ record.name }}</template>
            <SvgIcon
              size="20"
              :name="fileTypeParser(record)"
              style="cursor: pointer"
              @click.stop="handleClick(record)"
            />
          </a-tooltip>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="sop-document">
  import { ref, computed } from 'vue';
  import { SvgIcon } from '/@/components/Icon';
  import { switchIcons, columns } from '../type';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { downloadByUrl } from '/@/utils/file/download';
  import { isFunction } from '/@/utils/is';

  interface IProps {
    showType: 'Card' | 'List';
    fileList: any[];
    isDesign: boolean;
    nameClick?: Function;
  }
  const props = defineProps<IProps>();
  const emit = defineEmits(['update:showType']);
  const tableRef = ref();

  const tableData = computed(() => {
    return props.fileList?.map((i) => {
      const docItem = i.sopDocument;
      return {
        ...i,
        name: docItem.name,
        type: docItem.type,
        file: docItem.type == 'internal' ? docItem.file : docItem.url,
      };
    });
  });

  const fileTypeParser = computed(() => {
    return (item) => {
      if (item.type === 'external') {
        return 'link';
      }
      return typeParser(item.file);
    };
  });

  const onChangeTypeTab = (data) => {
    emit('update:showType', data.name);
  };

  function handleClick(item) {
    if (props.isDesign) return;
    if (props.nameClick && isFunction(props.nameClick)) {
      props.nameClick(item);
    } else {
      downloadByUrl({ url: item.path });
    }
  }
</script>

<style lang="less" scoped name="sop-document">
  .file-list {
    &__header {
      width: 64px;
      height: 32px;
      border-radius: 4px;
      background: #f3f5f9;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
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
        .file-list__item {
          flex-direction: column;
          text-align: center;
          width: 115px;
          margin: 3px 9px 3px 0;
          padding: 16px 10px;
          border: 1px solid #e8ebf0;
          border-radius: 4px;
          background: #fff;
          &.material-table-field:nth-child(3n + 3) {
            margin-right: 0;
          }
          &-svg {
            margin: 8px auto 0;
          }
          &-name {
            cursor: pointer;
            width: 100%;
            height: 22px;
            line-height: 22px;
            margin: 8px auto 4px;
          }
          &-size {
            line-height: 18px;
            font-size: 12px;
            color: #c3c3c3;
          }
          &:hover {
            box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.08);
            border-color: #fff;
            .file-list__item-size {
              &.is-design {
                color: #c3c3c3;
              }
            }
          }
        }
      }
    }
    &__item {
      display: flex;
      &-name {
        span {
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      &-size {
        color: #c3c3c3;
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
</style>
