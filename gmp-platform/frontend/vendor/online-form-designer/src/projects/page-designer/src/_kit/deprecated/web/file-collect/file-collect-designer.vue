<template>
  <div class="w-full" style="width: 100%">
    <div
      class="p12px h100px ks-row-center-middle bg-[#fbfbfc]"
      v-if="!refSearch && !noNeedAutoQuery"
    >
      <span class="text-[#5d6474] text-14px">
        {{ $t('sys.pageDesigner.selectRefBatchSearch') }}</span
      >
    </div>
    <div v-else class="file-collect-wrap">
      <a-table
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
              <SvgIcon
                :class="{ 'icon-hide': ind >= 3 }"
                :size="item.type === 'external' ? 19 : 20"
                :title="item.name"
                :name="fileTypeParser(item)"
              />
            </template>
            <span class="more" v-if="record.documentSetEntries.length > 3">{{
              t('sys.pageDesigner.more')
            }}</span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-file-collect">
  import { computed, toRefs, ref } from 'vue';
  import type { FileCollectProps } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SvgIcon } from '/@/components/Icon';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import { columns } from './type';

  const { t } = useI18n();
  const tableContainerRef = ref();
  const props = defineProps<{ widget: FileCollectProps }>();
  const { noNeedAutoQuery, refSearch } = toRefs(props.widget?.props);
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
</script>

<style scoped lang="less">
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
