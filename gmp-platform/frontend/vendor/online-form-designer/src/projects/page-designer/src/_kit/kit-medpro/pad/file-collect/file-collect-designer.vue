<template>
  <div class="w-full" style="width: 100%">
    <div class="file-list__list flex-card">
      <div v-for="(file, index) of tableData" :key="index" :class="['file-list__item']">
        <IconNext
          class="file-list__item-svg"
          :size="32"
          :value="'icon-preset:' + fileTypeParser(file)"
        />
        <div class="file-list__item-name">
          <span>{{ file.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-file-collect">
  import { ref, computed } from 'vue';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  const tableData = ref<any[]>([
    {
      file: '/示例文档.pdf',
      name: '示例文档',
      type: 'internal',
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
      &.is-design {
        cursor: default;
        color: rgba(0, 0, 0, 0.85);
      }
    }
  }
</style>
