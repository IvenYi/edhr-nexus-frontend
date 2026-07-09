import { defineComponent, PropType, ref, computed } from 'vue';
import { IModal, useModal, useNamespace } from '@gct/runtime';
import { DesignView, DesignViewPrefix } from '@gct/runtime-design';
import { MobileHomepageResponse } from '/@/apis/gct-apaas/model';
import { clone } from 'lodash-es';
import { IDesignData } from '@gct/base';
import { getNavPageInfo, putNavPageById } from '/@/apis/gct-platform/NavPageController';
import './custom-nav-page-design-view.scss';

export const CustomNavPageDesignView = defineComponent({
  name: 'CustomNavPageDesignView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
    OperateType: {
      type: String as PropType<HTTP_TYPE_ENUM>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-nav-page-design-view');
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

    // eslint-disable-next-line vue/no-mutating-props
    props.context.designType = DesignViewPrefix.CUSTOM_EXP_VIEW;

    useModal(async () => {
      await save();
      return {
        ok: true,
        data: [clone(data.value) as IData],
      };
    });

    const load = async () => {
      data.value = await getNavPageInfo({ id: props.context.id });
      if (data.value?.designerJson) {
        designJson.value = JSON.parse(data.value.designerJson);
        designJson.value!.type = DesignViewPrefix.CUSTOM_EXP_VIEW;
      }
      isLoaded.value = true;
    };

    const save = async (_data?: IData) => {
      errMsg.value = '';
      const json = design.value.getData();
      try {
        await putNavPageById(
          { id: props.context.id },
          { ...data.value, designerJson: json ? JSON.stringify(json) : undefined },
          {
            errorMessageMode: 'none',
            transferToConfig: { headers: { OperateType: props.OperateType } },
          },
        );
        return true;
      } catch (error) {
        const str: string = error.toString();
        errMsg.value = str.replace('Error: ', '');
      }
      return false;
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
        save={this.save as any}
        context={this.context}
        v-model:errMsg={this.errMsg}
        opts={{
          title: '自定义导航页面',
          prefix: DesignViewPrefix.CUSTOM_EXP_VIEW,
          showMobileTitleBar: false,
          isPreview: false,
        }}
      />
    );
  },
});
