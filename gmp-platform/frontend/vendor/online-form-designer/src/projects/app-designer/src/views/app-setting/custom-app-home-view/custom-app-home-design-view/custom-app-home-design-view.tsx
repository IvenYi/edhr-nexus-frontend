import { defineComponent, PropType, ref, computed } from 'vue';
import { IModal, useModal, useNamespace } from '@gct/runtime';
import { DesignView } from '@gct/runtime-design';
import {
  getMobileHomepageInfo,
  putMobileHomepageById,
} from '/@/apis/gct-apaas/MobileHomepageController';
import { MobileHomepageResponse } from '/@/apis/gct-apaas/model';
import { clone } from 'lodash-es';
import { CustomAppHomePreviewView } from '../../custom-app-home-preview-view/custom-app-home-preview-view';
import { IDesignData } from '@gct/base';
import { RenderNodeType } from '@gct/runtime-render';
import { GlobalParamEnum } from '@gct/runtime-mobile-render';
import {
  postAppGlobalSettings,
  getAppGlobalSettingsInfo,
} from '/@/apis/gct-apaas/AppGlobalSettingsController';
import './custom-app-home-design-view.scss';

export const CustomAppHomeDesignView = defineComponent({
  name: 'CustomAppHomeDesignView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-app-home-design-view');
    // 设计器
    const design = ref<any>();
    // 是否加载完成
    const isLoaded = ref(false);
    // 是否编辑过
    const isEdit = ref(false);
    // 自定义首页数据
    const data = ref<MobileHomepageResponse>();
    // 设计界面数据
    const designJson = ref<IDesignData | null>();
    // 保存错误信息
    const errMsg = ref('');
    // 自定义首页名称
    const name = computed({
      get() {
        return data.value?.name;
      },
      set(val) {
        if (data.value && data.value.name !== val) {
          data.value.name = val;
          isEdit.value = true;
        }
      },
    });

    useModal(async () => {
      await save();
      return {
        ok: true,
        data: [clone(data.value) as IData],
      };
    });

    const load = async () => {
      data.value = await getMobileHomepageInfo({ id: props.context.id });
      if (data.value?.designerJson) {
        designJson.value = JSON.parse(data.value.designerJson);
      }
      isLoaded.value = true;
    };

    const save = async (_data?: IData) => {
      errMsg.value = '';
      const json = design.value.getData();
      try {
        const id = await putMobileHomepageById(
          { id: props.context.id },
          { ...data.value, designerJson: json ? JSON.stringify(json) : undefined },
          {
            errorMessageMode: 'none',
            transferToConfig: {
              headers: { operateType: props.context.isEdit ? 'UPDATE' : 'INSERT' },
            },
          },
        );
        if (json.nodes && json.nodes.find((i) => i.type === RenderNodeType.SELECT_COMPONENT)) {
          addGlobalVariable();
        }
        if (id) {
          return true;
        }
      } catch (error) {
        const str: string = error.toString();
        errMsg.value = str.replace('Error: ', '');
      }
      return false;
    };

    const addGlobalVariable = async () => {
      const info = await getAppGlobalSettingsInfo({ ids: GlobalParamEnum.SELECT_ID });
      if (!info?.length) {
        const config = {
          key: GlobalParamEnum.SELECT_ID,
          type: 'string',
          defaultValue: '',
          description: window.$t('sys.appDesigner.customAppHome.globalVar.tip'),
          appredis: true,
        };
        postAppGlobalSettings({
          key: GlobalParamEnum.SELECT_ID,
          name: '',
          type: 'var',
          configJson: JSON.stringify(config),
          source: 'mobile',
        });
      }
    };
    load();

    const onClose = () => {
      props.modal.dismiss({ ok: isEdit.value });
    };

    const onSave = async (close: boolean = true) => {
      const oldName = data.value?.name;
      try {
        await save();
      } catch (error) {
        data.value!.name = oldName;
      }
      if (close !== false) {
        onClose();
      }
    };

    const onPreview = async () => {
      gct.openUtil.fullScreen(CustomAppHomePreviewView, { context: props.context });
    };

    return {
      ns,
      name,
      design,
      isLoaded,
      data,
      designJson,
      errMsg,
      load,
      save,
      onClose,
      onSave,
      onPreview,
    };
  },
  render() {
    if (this.isLoaded === false) {
      return;
    }
    return (
      <DesignView
        ref="design"
        isEditName
        v-model:name={this.name}
        data={this.designJson!}
        onClose={this.onClose}
        onSave={this.onSave}
        onPreview={this.onPreview}
        save={this.save as any}
        v-model:errMsg={this.errMsg}
      />
    );
  },
});
