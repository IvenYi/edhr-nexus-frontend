<template>
  <div class="wrap bg-[#E6E9EF] h-full w-full">
    <div class="header h54px bg-[#1A1D23] text-[#FFFFFF] ks-row-middle px16px">
      <left-outlined class="mr6px" @click="onBack" />
      <div class="ks-col">
        <span class="cursor-pointer ks-row-middle">
          <span class="max-w400px ell inline-block">{{ modalTitle[type] }}</span>
        </span>
      </div>

      <div class="buttons">
        <template v-for="btn of filterButtons" :key="btn.key">
          <div
            class="button ml-12px cursor-pointer"
            :class="[btn.className, { 'is-loading': loading }]"
            @click="onBtnItemClick(btn.key)"
            :aria-disabled="loading"
          >
            {{ btn.label }}
          </div>
        </template>
      </div>
    </div>

    <div class="content">
      <editor-left
        ref="editorLeftRef"
        :isReadonly="isReadonly"
        :form="basicFormData"
        :editInReadOnly="editInReadOnly"
      />

      <div class="editor-container">
        <div class="editor-container-area" v-if="tmplId">
          <FormTmplDetail class="editor-preview-doc" :key="tmplId" :tmpl-id="tmplId" :isRecord="1">
            <template #logbookFormConfig>
              <record-book-form-fill-config
                ref="formConfigRef"
                :form="formFillConfigData"
                :isReadonly="
                  isReadonly || (props.rowData?.status_ && props.rowData?.status_ !== 'draft')
                "
                :editInReadOnly="editInReadOnly"
              />
            </template>
          </FormTmplDetail>
        </div>

        <div class="editor-container-empty-area" v-else>
          <div class="w200px text-center color-[#666]">
            <img class="w100% h100%" src="@/assets/images/record-book-empty.png" alt="" />
            <span class="empty-tip">{{ $t('sys.onlineForm.noFormTemplateAddedYet') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onBeforeMount } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import EditorLeft from './editor-left.vue';
  import { EntityModelCategoryEnum, IModal } from '@gct/runtime';
  import FormTmplDetail from '/@online-form/views/web-render/components/form-tmpl-detail/form-tmpl-detail.vue';
  import RecordBookFormFillConfig from '/@online-form/views/designer/modules/base/record-book-form-fill-config.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  type BtnKey = 'save' | 'publish' | 'close';
  type Btn = { key: BtnKey; className: string; label: string };

  const { t } = useI18n();

  const buttons: Btn[] = [
    { key: 'save', className: 'save-btn', label: t('sys.saveText') },
    { key: 'publish', className: 'save-btn', label: t('sys.ipaas.saveAndPublish') },
    { key: 'close', className: 'btn-block', label: t('sys.closeText') },
  ];

  const modalTitle = computed(() => ({
    create: t('sys.newSth', { sth: t('sys.edhr.recordBook.recordBookTitle') }),
    view: t('sys.viewSth', { sth: t('sys.edhr.recordBook.recordBookTitle') }),
    edit: t('sys.editSth', { sth: t('sys.edhr.recordBook.recordBookTitle') }),
    prem: t('sys.editSth', { sth: t('sys.edhr.recordBook.recordBookTitle') }),
  }));

  // props
  const props = withDefaults(
    defineProps<{
      type?: 'create' | 'view' | 'edit' | 'prem';
      rowData?: any;
      formData?: any;
      modal: IModal;
      callback?: () => void;
    }>(),
    { type: 'create' },
  );

  const editorLeftRef = ref<InstanceType<typeof EditorLeft> | null>(null);
  const formConfigRef = ref<InstanceType<typeof RecordBookFormFillConfig> | null>(null);
  const loading = ref(false);

  const tmplId = computed(() => editorLeftRef.value?.getValue?.()?.tmpl_id_ ?? null);

  function safeParse(jsonLike: unknown) {
    if (!jsonLike || typeof jsonLike !== 'string') return {};
    try {
      return JSON.parse(jsonLike);
    } catch (e) {
      return {};
    }
  }

  const filterButtons = computed(() => {
    return buttons.filter((btn) => {
      if (props.type === 'create') return true;
      if (props.type === 'view') return btn.key === 'close';
      if (props.rowData?.status_ !== 'draft') return btn.key !== 'publish';
      return true;
    });
  });

  const basicFormData = computed(() => {
    if (props.type === 'create') return {};
    const r = props.rowData ?? {};
    return {
      tmpl_id_: r.tmpl_id_,
      code_: r.code_,
      name_: r.name_,
      org_id_: r.org_id_,
      label_ids_: r.label_ids_,
      start_time_: r.start_time_,
      end_time_: r.end_time_,
      filler_: r.filler_,
      viewer_: r.viewer_,
    };
  });

  const formFillConfigData = computed(() => {
    if (props.type === 'create') return {};
    const f = props.formData ?? {};
    return {
      fill_time_config_: safeParse(f.fill_time_config_),
      create_config_: safeParse(f.create_config_),
    };
  });

  const isReadonly = computed(() => props.type === 'view' || props.type === 'prem');

  const editInReadOnly = computed(() => {
    if (props.type === 'edit') {
      if (props.rowData?.status_ === 'archived')
        return ['viewer_', 'code_', 'name_', 'org_id_', 'label_ids_'];
      else if (props.rowData?.status_ === 'draft') {
        return [
          'tmpl_id_',
          'code_',
          'name_',
          'org_id_',
          'label_ids_',
          'start_time_',
          'end_time_',
          'filler_',
          'viewer_',
        ];
      }
      return ['code_', 'name_', 'org_id_', 'label_ids_', 'end_time_', 'filler_', 'viewer_'];
    } else if (props.type === 'create') {
      return [
        'tmpl_id_',
        'code_',
        'name_',
        'org_id_',
        'label_ids_',
        'start_time_',
        'end_time_',
        'filler_',
        'viewer_',
      ];
    }
    return [] as string[];
  });

  function onBack() {
    props.modal?.dismiss?.();
    props.callback?.();
  }

  async function onBtnItemClick(key: BtnKey) {
    if (key === 'close') return onBack();
    if (loading.value) return;

    try {
      loading.value = true;
      if (editorLeftRef.value?.validate) {
        await editorLeftRef.value.validate();
      }
      await saveRecord(key === 'publish');
    } catch (err) {
      console.error('operation failed', err);
    } finally {
      loading.value = false;
    }
  }

  async function saveRecord(isPublish: boolean) {
    const base = editorLeftRef.value?.getValue?.() ?? {};
    const basicData = {
      ...base,
      org_id_: editorLeftRef.value?.getCmpOrgId?.(base.org_id_, true) ?? null,
      status_: isPublish ? 'published' : (props.rowData?.status_ ?? 'draft'),
      id_: props.rowData?.id_ ?? undefined,
    } as Record<string, any>;

    const formCfg = formConfigRef.value?.getValue?.() ?? {};

    const payload = {
      ...basicData,
      ...formCfg,
      _DICT: undefined,
      _OPCT: undefined,
      _NOSUBMIT: undefined,
    } as Record<string, any>;

    try {
      const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'saveOrUpdate',
          modelCategory: EntityModelCategoryEnum.ENTITY,
          modelKey: 'em_notebook',
        },
        payload,
      );

      if (res) {
        const msgKey =
          props.type !== 'create'
            ? 'sys.webRender.edhrApplication.editSuccessOfSth'
            : 'sys.webRender.edhrApplication.createSuccessOfSth';
        message.success(t(msgKey, { sth: t('sys.edhr.recordBook.recordBookTitle') }));
        onBack();
      }
    } catch (err) {
      console.error('saveRecord error', err);
    }
  }
</script>

<style scoped lang="less">
  .buttons {
    position: absolute;
    display: flex;
    align-items: center;
    height: 30px;
    margin: 12px 0;
    top: 0;
    right: 16px;
  }

  .button {
    height: 26px;
    background: transparent;
    border: 1px solid #e8ebf0;
    border-radius: 4px;
    color: #fff;
    font-size: 12px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    line-height: 1em;
    transition: all 0.3s;
    i {
      margin-right: 6px;
      display: flex;
      font-size: 12px;
    }
    &:hover {
      border-color: #fff;
    }

    &.save-btn {
      border: 1px solid var(--ant-primary-color);
      background-color: var(--ant-primary-color);
      &:hover {
        background: var(--ant-primary-color-hover);
        border-color: var(--ant-primary-color-hover);
      }
    }

    &.btn-block {
      background: #444444;
      border: 1px solid #444444;
      &:hover {
        background: var(--ant-primary-color-hover);
        border-color: var(--ant-primary-color-hover);
      }
    }

    &.is-loading {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  .content {
    display: flex;
    height: calc(100% - 54px);
  }

  .editor-container {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .editor-container-area {
      display: flex;
      flex-direction: column;
      position: relative;
      background-color: #fff;
      width: 100%;
      height: 100%;
      overflow: hidden;

      .editor-preview-doc {
        padding: 0;
        width: 100%;
        height: 100%;

        :deep(.online-form-sheet-view) {
          display: flex;
        }
      }
    }

    .editor-container-empty-area {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;

      .empty-tip {
        color: #818083;
        font-size: 18px;
        margin-top: 14px;
        display: inline-block;
      }
    }
  }
</style>
