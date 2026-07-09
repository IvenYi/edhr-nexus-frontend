<template>
  <a-drawer placement="right" :visible="visible" :closable="false" :width="480" :mask="false">
    <div class="flex justify-between items-center -mt-3">
      <div class="text-lg font-bold">
        {{ t('sys.tenant.assetCenter.sealManagement.sealDetail') }}
      </div>
      <div @click="onClose" style="margin-left: auto" class="cursor-pointer">
       <close-outlined />
      </div>
    </div>
    <div class="py-8 flex justify-center border-1 border-b-solid border-[#e1e1e3]">
      <div class="flex justify-center items-center w-30 h-30">
        <img :src="getSealImageUrl(seal.sealImage)" class="max-w-full max-h-full" />
      </div>
    </div>
    <div>
      <div class="mt-6">
        <div class="text-[#adadad]">
          {{ t('sys.tenant.assetCenter.sealManagement.sealName') }}
        </div>
        <div class="mt-2">{{ seal.name }}</div>
      </div>
      <div class="mt-6">
        <div class="text-[#adadad]">
          {{ t('sys.tenant.assetCenter.sealManagement.sealType') }}
        </div>
        <div class="mt-2">
          <div
            class="inline-block px-2 py-1 border-1 border-solid border-[#e1e3e5] bg-[#f9fbfc] rounded text-xs"
          >
            {{ t(sealTypeMap[seal.type]) }}
          </div>
        </div>
      </div>
      <div class="mt-6">
        <div class="text-[#adadad]">
          {{ t('sys.tenant.assetCenter.sealManagement.sealPassword') }}
        </div>
        <div class="mt-2 flex justify-between items-center select-none">
          <div class="flex justify-center items-center">
            <span class="inline-block max-w-36 truncate">
              {{ [...seal.password].map((t) => (passwordVisible ? t : '*')).join('') }}
            </span>
            <span
              class="ml-2 cursor-pointer text-[#64686a]"
              @click="passwordVisible = !passwordVisible"
            >
              <i
                class="icon gct-iconfont"
                :class="passwordVisible ? 'icon-eye_open' : 'icon-eye_close'"
              ></i>
            </span>
          </div>
          <div>
            <a type="link" size="small" @click="copy(seal.password)">
              <div class="flex items-center text-[14px]">
                <i class="icon gct-iconfont icon-icon_copy"></i>
                <span class="ml-1">
                  {{ t('sys.tenant.assetCenter.sealManagement.copyPassword') }}
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </a-drawer>
</template>
<script setup lang="ts">
  import { ref, unref, watch } from 'vue';
  import { sealTypeMap, getSealImageUrl } from './util';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { t } = useI18n();
  const { createMessage } = useMessage();

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false,
    },

    seal: {
      type: Object as PropType<any>,
      default: null,
    },

    onClose: {
      type: Function as PropType<() => void>,
      default: () => {},
    },
  });

  const passwordVisible = ref(false);

  const copy = (message) => {
    const { isSuccessRef } = useCopyToClipboard(message);
    unref(isSuccessRef) && createMessage.success(t('sys.pageDesigner.copySuccess'));
  };

  watch(
    () => props.seal,
    () => {
      passwordVisible.value = false;
    },
    {
      deep: true,
    },
  );
</script>
