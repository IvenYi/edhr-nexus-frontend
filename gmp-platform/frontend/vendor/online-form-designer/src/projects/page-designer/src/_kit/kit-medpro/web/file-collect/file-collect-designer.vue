<template>
  <div class="w-full" style="width: 100%">
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
    <div class="file-collect-wrap">
      <div v-show="showType === 'Card'" class="file-list__list flex-card">
        <div
          v-for="(file, index) of tableData"
          :key="index"
          :class="['file-list__item', 'is-design']"
        >
          <div style="padding: 0 12px;" v-for="document in file.documentSetEntries" :key='document.name'>
            <SvgIcon class="file-list__item-svg" :size="32" :name="fileTypeParser(document)" />
            <div class="file-list__item-name">
              <span>{{ document.name }}</span>
            </div>
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
        ref="tableContainerRef"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'documentSetEntries'">
            <template v-for="(item, ind) in record.documentSetEntries" :key="ind">
              <svg-icon
                :class="{ 'icon-hide': ind >= 3 }"
                :size="item.type === 'external' ? 19 : 20"
                :title="item.name"
                :name="fileTypeParser(item)"
              />
            </template>
            <span class="more" v-if="record.documentSetEntries.length > 3">
              {{ t('sys.pageDesigner.more') }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-file-collect">
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { columns } from './type';

  const { t } = useI18n();
  const tableContainerRef = ref();
  const switchIcons = [
    {
      icon: 'icon-liebiaozhanshi',
      name: 'List',
      key: 'switch_icon_list',
    },
    {
      icon: 'icon-kapianzhanshi',
      name: 'Card',
      key: 'switch_icon_card',
    },
  ];
  const showType = ref<'List' | 'Card'>('List');
  const tableData = ref<any[]>([
    {
      id: '909090',
      category: '示例类别',
      project: '示例项目',
      documentSetEntries: [
        {
          file: '/示例图片.png',
          name: '示例图片',
          type: 'internal',
        },
        {
          file: '/示例文档.doc',
          name: '示例文档',
          type: 'internal',
        },
        {
          file: 'https://lanhuapp.com/web/#/item/project/stage',
          name: '示例外链',
          type: 'external',
        },
      ],
    },
  ]);

  const fileTypeParser = computed(() => {
    return (item) => {
      if (item.type === 'external') {
        return 'link';
      }
      return typeParser(item.file);
    };
  });
  const onChangeTypeTab = (value) => {
    showType.value = value.name;
  };
</script>

<style scoped lang="less">
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
        .file-list__item {
          text-align: center;
          padding: 16px 10px;
          border: 1px solid #e8ebf0;
          border-radius: 4px;
          background: #fff;
          justify-content: space-around;
          row-gap: 10px;
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
  .file-collect-wrap {
    :deep(.ant-table.ant-table-middle) {
      .ant-table-tbody > tr > td,
      .ant-table-thead > tr > th {
        padding: 10px;
      }
      .ant-table-thead > tr > th {
        &::before {
          width: 1px;
          background: var(--vxe-table-resizable-line-color);
        }
      }
      .icon-hide {
        display: none;
      }
      .more {
        padding: 0 4px;
        cursor: pointer;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
