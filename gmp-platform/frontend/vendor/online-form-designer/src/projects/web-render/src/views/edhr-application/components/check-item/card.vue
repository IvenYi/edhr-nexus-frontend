<template>
  <div class="check-item bg-white rounded-4px">
    <div class="p-8px">
      <div class="flex justify-between">
        <span> 检验顺序 </span>
        <span> {{ seq }} </span>
      </div>
      <div class="flex justify-between">
        <span> {{ $t('sys.webRender.edhrApplication.projectName') }} </span>
        <span> {{ item.name_ }} </span>
      </div>
    </div>
    <div v-if="!disabled" class="check-item__footer pl-8px pr-8px flex">
      <span class="cursor-move check-item-drag">
        <i class="iconfont icon-drag"></i>
      </span>
      <span class="cursor-pointer ml-[auto]" @click="setting">
        <i class="iconfont icon-shezhi1"></i>
      </span>
      <span class="cursor-pointer error-gct ml-8px" @click="remove">
        <i class="iconfont icon-shanchu1"></i>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CheckItem } from './type';
  import { useI18n } from '/@/hooks/web/useI18n';
  import ItemModal from '../../render/document-item/modal/item-modal/index.vue';
  import { useCheckItem } from '/@online-form/views/designer/hooks/useCheckItem';
  import type { ITable } from '/@online-form/views/designer/types';

  const props = defineProps<{
    item: CheckItem;
    seq: number;
    list: CheckItem[];
    table: ITable;
    disabled: boolean;
  }>();

  const { t } = useI18n();
  const { syncDesignLayout } = useCheckItem();

  const remove = () => {
    // eslint-disable-next-line vue/no-mutating-props
    props.list.splice(props.seq - 1, 1);
    syncDesignLayout(props.table);
  };

  const setting = async () => {
    const { ok, data } = await gct.openUtil.modal<{
      ok: boolean;
      data: CheckItem[];
    }>(
      ItemModal,
      {
        data: { ...props.item },
      },
      {
        title: '检验项目配置',
        width: 640,
        height: 'auto',
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );
    if (!ok) return;
    Object.assign(props.item, data[0]);
  };
</script>

<style lang="less" scoped>
  .check-item {
    &__footer {
      border-top: 1px dashed #eee;
    }
  }
</style>
