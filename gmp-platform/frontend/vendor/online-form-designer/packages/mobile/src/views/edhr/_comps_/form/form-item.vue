<template>
  <div
    class="content-item h-60px pt-14px pb-14px pl-18px pr-18px flex items-center"
    @click="handleClick"
  >
    <span
      class="form-icon flex justify-center items-center mr-10px text-white text-18px w-32px h-32px rounded-4px"
      :style="{
        background: themeConfig?.iconBackground,
      }"
    >
      <i class="iconfont icon-a-biaodan2 !text-18px leading-none"></i>
    </span>
    <div class="flex-1 w-1px flex items-center">
      <Highlight
        class="inline-block item-name text-16px color-[#1A1D23]"
        :text="form.name"
        :keyword="keyword"
      />
      <span class="flex-shrink-0 required-tag" v-if="form.required">必填</span>
    </div>
    <InstanceStatusLabel
      class="flex-none ml-10px"
      ref="statusLabelRef"
      :form-type="form.formType!"
      :data-status="form.dataStatus"
      :instance-status="form.instanceStatus!"
      :is-form-summary="true"
    />
    <slot name="deleteRender"></slot>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { MbProcessStatusEnum } from '@mobile/views/edhr/_utils_/interface';
  import Highlight from '@mobile/views/edhr/_comps_/highlight/highlight.vue';
  // import { useRouter } from 'vue-router';

  import { InstanceStatusLabel } from '@gct/nocode-mobile-render';

  const props = defineProps<{
    form: {
      createTime: string;
      docOutlineId: string;
      instanceStatus: string;
      materialNo: string;
      name: string;
      ofInstId: string;
      tmplId: string;
      type: string;
      dataStatus: string;
      formType: string;
    };
    keyword?: string;
  }>();

  const emit = defineEmits(['trigger']);
  const statusLabelRef = ref();

  // const router = useRouter();
  const handleClick = () => {
    emit('trigger', props.form);
  };

  const themeConfig = computed(() => {
    return statusLabelRef.value?.themeConfig;
  });
</script>

<style scoped lang="less">
  .content-item {
    &.no-write {
      &::after {
        color: #797a7d;
        background: #eaedf1;
      }

      .form-icon {
        background: #a9afbc;
      }
    }

    &.is-run {
      &::after {
        color: #0066ff;
        background: rgba(0, 102, 255, 0.1);
      }

      .form-icon {
        background: #247bff;
      }
    }

    &.is-ok {
      &::after {
        color: #309c41;
        background: rgba(48, 156, 65, 0.1);
      }

      .form-icon {
        background: #45d192;
      }
    }

    &.is-stash {
      &::after {
        color: #f77e4a;
        background: rgba(247, 126, 74, 0.1);
      }

      .form-icon {
        background: #ff9442;
      }
    }

    &.is-error {
      &::after {
        color: #f54547;
        background: #ffeced;
      }

      .form-icon {
        background: #f54547;
      }
    }

    .required-tag {
      padding: 4px 6px;
      background: rgba(245, 69, 71, 0.1);
      border-radius: 4px 4px 4px 4px;
      font-weight: 400;
      font-size: 12px;
      color: #f54547;
      line-height: 16px;
    }

    .item-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
