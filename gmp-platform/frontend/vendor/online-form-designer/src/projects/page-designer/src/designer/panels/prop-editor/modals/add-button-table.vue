<template>
  <a-modal v-model:visible="visible" :title="title" @ok="handleOk" :width="700">
    <div class="p30px">
      <!-- {{ formState }} -->
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-form-item
          :label="$t('sys.pageDesigner.title')"
          name="label"
          :rules="[
            {
              required: true,
              message: $t('sys.pageDesigner.title') + $t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-input v-model:value="formState.label" :placeholder="$t('sys.inputText')" />
        </a-form-item>
        <div class="ks-row">
          <a-form-item
            class="ks-col"
            :label="$t('sys.pageDesigner.buttonType')"
            name="buttonType"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.buttonType') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-radio-group v-model:value="formState.buttonType" button-style="solid">
              <a-radio-button :value="i" v-for="i in ButtonColorType" :key="i">{{
                $t('sys.pageDesigner.' + i)
              }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <!-- innerEvent -->
          <a-form-item
            class="ks-col ml10px"
            :label="$t('sys.pageDesigner.buttonTheme')"
            name="buttonTheme"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.buttonTheme') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-select
              v-model:value="formState.buttonTheme"
              style="width: 100%"
              :placeholder="$t('sys.chooseText')"
            >
              <a-select-option :value="i" v-for="i in ButtonColorTheme" :key="i">{{
                $t('sys.pageDesigner.' + i)
              }}</a-select-option>
            </a-select>
          </a-form-item>
        </div>
        <div class="ks-row">
          <a-form-item :label="$t('sys.pageDesigner.innerEvent')" name="innerEvent">
            <a-switch v-model:checked="formState.innerEvent" />
          </a-form-item>
          <div class="w10px"></div>
          <a-form-item
            class="ks-col"
            v-if="formState.innerEvent"
            :label="$t('sys.pageDesigner.sysMethedType')"
            name="sysMethedType"
            :rules="[
              {
                required: true,
                message:
                  $t('sys.pageDesigner.sysMethedType') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-select
              v-model:value="formState.sysMethedType"
              style="width: 100%"
              :placeholder="$t('sys.chooseText')"
            >
              <a-select-option :value="i" v-for="i in sysMethedData" :key="i">{{
                $t('sys.pageDesigner.' + i)
              }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            class="ks-col"
            v-else
            :label="$t('sys.pageDesigner.eventName')"
            name="eventName"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.eventName') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
              {
                pattern: /^[a-zA-Z_]+$/,
                message: $t('sys.pageDesigner.eventName') + '仅支持字母、下划线',
              },
            ]"
          >
            <a-input v-model:value="formState.eventName" :placeholder="$t('sys.inputText')" />
          </a-form-item>
        </div>
        <a-form-item
          v-if="showlinkPage"
          :label="$t('sys.pageDesigner.linkPage')"
          name="linkPage"
          :rules="[
            {
              required: true,
              message: $t('sys.pageDesigner.linkPage') + $t('sys.pageDesigner.cannotBeEmpty'),
            },
          ]"
        >
          <a-tree-select
            v-model:value="formState.linkPage"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :placeholder="$t('sys.chooseText')"
            allow-clear
            tree-default-expand-all
            :tree-data="pageTrees"
            tree-node-filter-prop="label"
          />
        </a-form-item>
        <div class="ks-row">
          <a-form-item :label="$t('sys.pageDesigner.confirm')" name="confirm">
            <a-switch v-model:checked="formState.confirm" />
          </a-form-item>
          <div class="w10px"></div>
          <a-form-item
            class="ks-col"
            v-if="formState.confirm"
            :label="$t('sys.pageDesigner.confirmText')"
            name="confirmText"
            :rules="[
              {
                required: true,
                message: $t('sys.pageDesigner.confirmText') + $t('sys.pageDesigner.cannotBeEmpty'),
              },
            ]"
          >
            <a-input v-model:value="formState.confirmText" :placeholder="$t('sys.inputText')" />
          </a-form-item>
        </div>
        <a-form-item :label="$t('sys.pageDesigner.displayRule')">
          <a-button @click="handleOpenExpr" :type="!!formState.displayRule ? 'primary' : 'default'">
            <template #icon>
              <setting-outlined />
            </template>
            {{ $t('sys.edit') + $t('sys.pageDesigner.displayRule') }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
  import { ref, toRaw, computed, watch } from 'vue';
  import type { FormInstance, TreeSelectProps } from 'ant-design-vue';
  import { OperateButton } from '/@page-designer/types/web';
  import { ButtonColorTheme, ButtonColorType, operateSysEnums } from '/@page-designer/enum';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import useExpression, { ExpressionModeEnum, ExpressionTabEnum } from '/@/components/Expression';
  import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
  // import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const { mitt } = useMitt();
  const props = defineProps<{
    model: string;
    id: string;
  }>();
  const { openModal } = useExpression();
  type ButtonProps = OperateButton['props'];
  const formRef = ref<FormInstance>();
  const formState = ref<Partial<ButtonProps>>({});
  const resolveCallback = ref();
  const title = ref('');
  const visible = ref(false);
  const pageTrees = ref<TreeSelectProps['treeData']>([]);
  const sysMethedData = computed(() => {
    return [operateSysEnums.COLUMNDELETE, operateSysEnums.COLUMNLINK];
  });
  const showlinkPage = computed(() => {
    return (
      formState.value.innerEvent && formState.value.sysMethedType === operateSysEnums.COLUMNLINK
    );
  });
  watch(showlinkPage, (i) => {
    if (i) {
      getPageLinkOptions();
    }
  });
  async function getPageLinkOptions() {
    let tree = (await getCategoryListComplete({ module: 'web_module' })) || [];
    pageTrees.value = tree.map((i) => {
      const children = i.children?.map((c) => {
        return { label: c.name, value: c.id };
      });
      return { label: i.name, value: i.id, disabled: true, children };
    });
  }
  const handleOk = async () => {
    await formRef.value!.validate();
    visible.value = false;
    resolveCallback.value(toRaw(formState.value));
    if (!formState.value.innerEvent) {
      mitt.emit('new-event', { methodName: formState.value.eventName, params: 'rowValue,index' });
      mitt.emit('get-schema-code');
    }
  };

  const open = async (form: ButtonProps, t): Promise<ButtonProps> => {
    await formRef.value?.clearValidate();
    formState.value = form;
    title.value = t;
    visible.value = true;
    return new Promise((resolve) => {
      resolveCallback.value = resolve;
    });
  };
  const handleOpenExpr = async () => {
    openModal({
      expr: formState.value.displayRule,
      mode: ExpressionModeEnum.DISPLAY_RULE,
      identifiers: {
        [ExpressionTabEnum.FIELD]: await _getIdentifiers(),
      },
      callback: (expr) => {
        formState.value.displayRule = expr;
      },
    });
  };
  /**根据页面的form组装identifiers */
  const _getIdentifiers = async () => {
    const P = [{ id: props.id, props: { name: $t('sys.pageDesigner.currTableRow'), model: props.model } }]
      .filter((i) => i.props.model)
      .map(async (form) => {
        const fieldList = await getFieldMetaList({ modelKey: form.props.model! });
        const children =
          fieldList?.map((i) => ({ id: i.key!, name: i.name!, valueType: i.type! })) || [];
        return {
          id: form.id,
          name: form.props.name || form.id,
          children,
        };
      });
    const formlist = await Promise.all(P);
    return formlist;
  };
  defineExpose({ open });
</script>
<style scoped lang="less"></style>
