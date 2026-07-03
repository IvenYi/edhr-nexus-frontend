<template>
  <basic-popup v-model:show="show" title="表单创建" :popup-props="popupProps">
    <div class="flex h-full flex-col pt-8px pb-8px">
      <div class="pl-8px pr-8px">
        <div class="rounded-8px bg-white flex-none">
          <van-form ref="FormRef">
            <van-field
              :model-value="formData.tmplCategoryName"
              label="表单分类"
              required
              readonly
              is-link
              @click="handleCategorySelect"
              :rules="[{ required: true, message: '表单分类不能为空' }]"
            />

            <van-field
              v-model="formData.title"
              label="任务标题"
              required
              :rules="[{ required: true, message: '任务标题不能为空' }]"
            />
          </van-form>
        </div>
      </div>

      <div class="flex-1 overflow-auto pl-8px pr-8px mt-8px">
        <van-radio-group v-model="formData.tmplId">
          <div
            class="rounded-8px bg-white not-last-mb-8px pt-12px pb-12px pl-10px pr-10px"
            v-for="tmpl in categoryTmpls"
            :key="tmpl.id"
          >
            <basic-collapse>
              <template #title>
                <div class="flex items-center pr-10px">
                  <van-radio class="flex-none" :name="tmpl.id" />
                  <div class="text-14px font-bold ml-10px ellipsis">{{ tmpl.name }}</div>
                  <span class="tag--default ml-10px flex-none">默认</span>
                </div>
              </template>
              <div
                class="bg-[#F5F7FA] rounded-4px pl-10px pr-10px pt-4px pb-4px color-[#606266] text-12px mt-8px"
                >表单类型：{{ t('sys.onlineForm.formTypeEnum.' + tmpl.formType) }}</div
              >
              <div class="mt-16px">
                <div
                  v-for="ver in tmpl.children"
                  :key="ver.id"
                  class="flex items-center h-48px pl-10px pr-10px rounded-4px"
                  :class="{
                    'bg-[#E1ECFF]': `${tmpl.id}:${ver.id}` === formData.tmplId,
                  }"
                >
                  <van-radio :name="`${tmpl.id}:${ver.id}`" />
                  <span class="ml-10px">{{ ver.version }}</span>
                  <span class="tag--default ml-10px" v-if="ver.default === 1">默认</span>
                </div>
              </div>
            </basic-collapse>
          </div>
        </van-radio-group>
      </div>
    </div>

    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="show = false"
          >取消</van-button
        >
        <van-button class="flex-1" type="primary" @click="handleCreate">确认填报</van-button>
      </div>
    </template>
  </basic-popup>
</template>

<script setup lang="ts">
  import { ref, computed, reactive, onMounted } from 'vue';
  // import AddNgForm from '../ng/add-form.vue';
  // import DateTimePopup from '../date-time/date-time-popup.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { showFailToast, showSuccessToast } from 'vant';
  import ProducePickerPopup from '@mobile/views/edhr/_comps_/product/product-picker-popup.vue';
  import BasicPicker from '@mobile/views/edhr/_comps_/basic-popup/basic-picker.vue';
  import BasicCollapse from '@mobile/views/edhr/_comps_/basic-collapse/index.vue';
  import type { FormRelateDTO } from '/@/apis/gct-apaas/model/index';
  import { UserData } from '@mobile/stores/loginHooks';
  import { postOnlineFormInstanceTask } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { i18n } from '@mobile/locales/setupI18n';
  import { getInterfaceApi } from '@gct/runtime';
  import type { CategoryCompleteVO } from '/@/apis/gct-apaas/model';
  import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';
  import { ControlStatusEnum } from '@gct/nocode-base';

  const { businessSetting } = useBusinessSetting();

  interface ICreateInstance {
    tmplCategoryId: string;
    tmplCategoryName: string;
    formType: string;
    operatorRange: string;
    relateMaterialNo: string;
    title: string;
    tmplId: string;
    tmplName: string;
  }

  const { t } = i18n.global;
  const props = defineProps<{
    popupProps: any;
    context: {
      materialNo: string;
    };
    onOk?: Function;
    onCancel?: Function;
  }>();

  const show = ref<boolean>(true);
  const formData = ref<Partial<ICreateInstance>>({});
  const FormRef = ref();

  const categoryMap = new Map<string, CategoryCompleteVO>();
  const options = ref<
    Array<{
      value: string;
      text: string;
      indent: number;
    }>
  >([]);

  const categoryTmpls = ref<FormRelateDTO[]>([]);

  onMounted(() => {
    loadTmplCategories();
  });

  /** 计算平铺的选项，带缩进 */
  const calcFlatOptions = (arr: CategoryCompleteVO[], level = 0) => {
    return arr.reduce<any>((acc, cur) => {
      categoryMap.set(cur.id!, cur);
      acc.push({
        value: cur.id,
        text: cur.name,
        indent: level,
      });
      if (cur.child && cur.child.length > 0) {
        acc.push(...calcFlatOptions(cur.child, level + 1));
      }
      return acc;
    }, []);
  };

  const loadTmplCategories = async () => {
    const res = await getInterfaceApi.getCategoryList({
      moduleType: 'online_form_module',
    });

    options.value = calcFlatOptions(res ?? []);
  };

  const loadTmplsByCategoryId = async (id: string) => {
    const isControlled = !!businessSetting.enableDocControl;
    const res = await getInterfaceApi.getTmplsList({
      categoryId: id,
      name: undefined,
      pageNo: 1,
      pageSize: 9999,
      moduleType: 'online_form_module',
      formType: 'BASE,PROCESS',
      controlStatus: isControlled ? ControlStatusEnum.CONTROLLED : undefined,
      configured: false,
    });
    categoryTmpls.value = res.data ?? [];
  };

  const handleCategorySelect = () => {
    GctPopup.open(BasicPicker, {
      popupProps: {
        position: 'bottom',
      },
      context: {
        title: '表单分类',
        isTree: true,
        options: options.value,
        value: [formData.value.tmplCategoryId],
      },
      onOk: (value: string[]) => {
        if (value && value.length > 0) {
          const tmplCategoryId = value[0];
          const tmplCategory = categoryMap.get(tmplCategoryId);
          formData.value.tmplCategoryId = tmplCategoryId;
          formData.value.tmplCategoryName = tmplCategory!.name;
          loadTmplsByCategoryId(tmplCategoryId);
        }
      },
    });
  };

  const handleCreate = async () => {
    console.log(UserData);
    console.log(UserData.value.userId);
    try {
      await FormRef.value?.validate();
      const { tmplId, title } = formData.value;
      if (!tmplId) {
        showFailToast('请选择表单');
        return;
      }

      let data: Partial<ICreateInstance> = {
        operatorRange: `USER:${UserData.value.userId}`,
        tmplId,
        title,
      };
      if (tmplId.includes(':')) {
        // 带版本
        const [tid, vid] = tmplId.split(':');
        const tmplData = categoryTmpls.value.find((item) => item.id === tid);
        const { formType, name } = tmplData!;
        const verData = (tmplData?.children ?? []).find((item) => item.id === vid);
        const { version } = verData!;
        Object.assign(data, {
          formType,
          tmplName: `${name}:${version}`,
        });
      } else {
        // 默认
        const tmplData = categoryTmpls.value.find((item) => item.id === tmplId);
        const { formType, name } = tmplData!;
        Object.assign(data, {
          formType,
          tmplName: name,
        });
      }

      const res = await postOnlineFormInstanceTask(data);
      showSuccessToast('创建成功');
      if (props.onOk && typeof props.onOk === 'function') {
        props.onOk(res);
      }
      show.value = false;
    } catch (err) {
      console.warn(err);
    }
  };
</script>

<style scoped lang="less"></style>
