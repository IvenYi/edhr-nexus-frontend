<template>
  <div class="exp-library-modal">
    <a-form :model="formState" ref="formRef" layout="vertical">
      <a-row :gutter="12">
        <a-col :span="24">
          <a-form-item label="经验组">
            <a-select
              v-model:value="formState.experience_library_id_"
              :options="libraryOptions"
              placeholder="请选择经验组"
              show-search
              @change="handleChange"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { IModal } from '@gct/runtime';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const defProps = defineProps<{
    modal: IModal;
    data: any;
  }>();

  const formRef = ref();
  const formState = ref({
    experience_library_id_: '',
  });

  const libraryOptions = ref([]);
  async function loadExpLibraryData() {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience_library',
        bsKey: 'listAll',
      },
      {},
    );
    libraryOptions.value = (res?.data ?? []).map((item) => {
      return {
        label: item.name_,
        value: item.id_,
      };
    });
  }

  function handleChange(value) {
    setTimeout(() => {
      defProps.modal.dismiss({
        ok: true,
        data: {
          experience_library_id_: value,
        },
      });
    }, 300);
  }

  onMounted(() => {
    loadExpLibraryData();
  });
</script>

<style lang="less">
  .exp-library-modal {
    padding: 12px;

    .content-row {
      min-height: 200px;
    }

    .exp-library-action-panel {
      width: auto;
      height: calc(100% - 24px);
      padding: 12px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
    }
  }
</style>
