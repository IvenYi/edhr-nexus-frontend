<template>
  <EbrEdhrFillModal
    ref="ebrRef"
    :materialNo="materialNum"
    :isViewPage="false"
    :needAutoSave="false"
    pageType="edhr-filling"
    :modal="modal"
    :formInstBtnPerKey="formInstBtnPerKey"
  >
    <template #fill-header="{ edhrInstInfo }">
      <a-dropdown v-model:visible="showDropdown" :trigger="['click']">
        <span
          class="cursor-pointer ks-row-middle"
          @click="
            searchNo = '';
            showDropdown = true;
          "
        >
          <span class="max-w400px ell inline-block" :title="edhrInstInfo?.materialNo">
            {{ edhrInstInfo?.materialNo }}
          </span>
          <span class="px2px">/</span>
          {{ edhrInstInfo?.productName }}:{{ edhrInstInfo?.productVersion }}
          <i class="iconfont icon-qiehuan ml8px text-[#247bff] lh-16px"></i>
        </span>
        <template #overlay>
          <div class="bg-[#fff] switch-wrap w360px">
            <MaterialNoAutocomplete
              v-if="showDropdown"
              v-model:value="searchNo"
              :dropdownMode="false"
              @enter="onSearchEnter"
            />
          </div>
        </template>
      </a-dropdown>
    </template>
  </EbrEdhrFillModal>
</template>
<script setup lang="ts">
  import { IModal } from '@gct/runtime';
  import { ref } from 'vue';
  import MaterialNoAutocomplete from '/@web-render/views/edhr-application/components/material-no-autocomplete/material-no-autocomplete.vue';
  import { useEdhrFill, EbrEdhrFillModal } from '/@online-form/views/integration/apaas_ebr/index';

  const props = defineProps<{
    materialNo: string;
    loading: boolean;
    modal: IModal;
    formInstBtnPerKey?: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:loading', value?: boolean): void;
  }>();

  const { edhrFill } = useEdhrFill(props, emit);

  const ebrRef = ref();
  const searchNo = ref();
  const showDropdown = ref(false);
  const materialNum = ref(props.materialNo);

  const onSearchEnter = async () => {
    searchNo.value = searchNo.value?.trim();
    if (!searchNo.value) return;
    await ebrRef.value?.validateChange(changeInstance);
  };

  function changeInstance() {
    showDropdown.value = false;
    edhrFill({ materialNo: searchNo.value }).then(async (res: any) => {
      if (res) {
        materialNum.value = searchNo.value;
      }
    });
  }
</script>
<style lang="less" scoped>
  .switch-wrap {
    box-shadow:
      0px 9px 28px 8px rgba(0, 0, 0, 0.05),
      0px 3px 6px -4px rgba(0, 0, 0, 0.12),
      0px 6px 16px 0px rgba(0, 0, 0, 0.08);
    border-radius: 6px;
    padding: 4px;
  }
</style>
