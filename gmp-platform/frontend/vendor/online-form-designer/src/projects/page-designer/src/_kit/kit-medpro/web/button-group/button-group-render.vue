<template>
  <div class="w-full" style="width: 100%">
    <div
      class="button-group-wrap py-16px px-24px"
      :class="children.length == 1 ? 'flex-start' : ''"
    >
      <template v-for="item in children" :key="item.type">
        <div @click.stop="handleClick(item)" class="btn-item">
          <div class="loading" v-if="loading(item.btnType)"
            ><loading-outlined class="loading-icon"
          /></div>
          <SvgIcon
            :class="['btn-icon', setBtnColor(item.btnType) ? 'btn-color' : '']"
            size="40"
            :name="`btn-${item.btnType}`"
          />
          <span :class="['btn-name', loading(item.btnType) ? 'disabled' : '']">{{
            $t(item.props.title)
          }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-button-group">
  import { computed, ref, reactive, toRef } from 'vue';
  import type { IButtonGroup } from './schema';
  import { SvgIcon } from '/@/components/Icon';
  import { btnGroupType, btnGroupData } from './type';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Modal } from 'ant-design-vue';

  const props = defineProps<{ widget: IButtonGroup }>();
  const { refForm, model } = reactive(props.widget.props);
  const Event = getPageEvent();

  const loadingMap = ref(new Map());

  const children = toRef(() => {
    let data: any[] = [];
    if (props.widget.children) {
      data = props.widget.children.map((item) => {
        const btnInfo = btnGroupData.find((n) => n.schemaType === item.type);
        return {
          ...item,
          btnType: btnInfo?.type,
          btnName: btnInfo?.name,
        };
      });
    }
    return data;
  });

  const loading = computed(() => {
    return (type: btnGroupType) => {
      return loadingMap.value.get(type);
    };
  });

  const setBtnColor = computed(() => {
    return (type) => {
      return [btnGroupType.MODELING, btnGroupType.COPY].includes(type);
    };
  });

  const handleClick = (widget) => {
    if (widget.props.confirm) {
      Modal.confirm({
        content: widget.props.confirmText || $t('sys.pageDesigner.confirmTodo'),
        onOk() {
          clickFn(widget);
        },
        onCancel() {},
      });
    } else {
      clickFn(widget);
    }
  };

  const clickFn = async (widget: any) => {
    const val = widget.btnType;
    if (loadingMap.value.get(val)) return;
    switch (val) {
      case btnGroupType.CREATE:
        handleCreate(widget);
        break;
      case btnGroupType.COPY:
        handleCopy(widget);
        break;
      case btnGroupType.COPYVERSION:
        copyVersion(widget);
        break;
      case btnGroupType.DELETE:
        handleDelete(val);
        break;
      case btnGroupType.MODELING:
        handleModeling();
        break;
      case btnGroupType.USEINFO:
        handleUseInfo();
        break;
    }
    await Event.runEventByName('onClick', props.widget.events, val);
  };

  const handleCreate = async (widget: any) => {
    const form = await Event.getSyncComponent(refForm);
    if (widget.props.openModal) {
      const formData = form.getValue!();
      const { id_, ...params } = formData;
      if (!id_) return;
      const data = {
        ...params,
        default_: false,
      };
      Event.context.$getModal(widget.props.refModal).open({
        title: $t('sys.pageDesigner.createVersion'),
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(widget.props.refForm);
          form.createVersion(data);
          Event.context.$closeModal();
        },
        onClose(arg) {},
      });
    } else {
      form.createVersion();
    }
  };

  const handleCopy = async (widget: any) => {
    const form = await Event.getSyncComponent(refForm);
    if (widget.props.openModal) {
      const formData = form.getValue!();
      const { id_ } = formData;
      if (!id_) return;
      Event.context.$getModal(widget.props.refModal).open({
        title: $t('sys.pageDesigner.copy'),
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(widget.props.refForm);
          form.copyData(formData);
          Event.context.$closeModal();
        },
        onClose(arg) {},
      });
    } else {
      form.copyData();
    }
  };

  const copyVersion = async (widget: any) => {
    const form = await Event.getSyncComponent(refForm);
    if (widget.props.openModal) {
      const formData = form.getValue!();
      const { id_ } = formData;
      if (!id_) return;
      Event.context.$getModal(widget.props.refModal).open({
        title: $t('sys.pageDesigner.copyVersion'),
        async onOpen(ctx) {
          const form = await ctx.$asyncRef(widget.props.refForm);
          form.copyVersion(formData);
          Event.context.$closeModal();
        },
        onClose(arg) {},
      });
    } else {
      form.copyVersion();
    }
  };

  const handleDelete = async (type: btnGroupType) => {
    try {
      loadingMap.value.set('delete', true);
      const form = await Event.getSyncComponent(refForm);
      await form.deleteData();
    } catch (error) {
      console.error(error);
    }
    loadingMap.value.set('delete', false);
  };

  const handleModeling = async () => {
    try {
      const form = await Event.getSyncComponent(refForm);
      let id = form.getValue!().id_;
      if (!id) return;
      loadingMap.value.set('modeling', true);
      await Event.context.$modelingTraceability!({ id, modelKey: model }).open();
    } catch (error) {
      console.log(error);
    }
    loadingMap.value.set('modeling', false);
  };

  const handleUseInfo = async () => {
    try {
      loadingMap.value.set('useInfo', true);
      const form = await Event.getSyncComponent(refForm);
      const id = form.getValue!().id_;
      await Event.context.$usageInformation!({
        id,
        row: form.getValue!(),
        modelKey: props.widget.props.bindModelKey,
      });
    } catch (error) {
      console.log(error);
    }
    loadingMap.value.set('useInfo', false);
  };
</script>

<style scoped lang="less">
  .button-group-wrap {
    display: flex;
    justify-content: space-around;
    border-radius: 4px;
    background: #fafafa;

    &.flex-start {
      justify-content: flex-start;
    }

    .btn-item {
      position: relative;
      cursor: pointer;

      .btn-name {
        &.disabled {
          color: #ccc;
        }
      }

      &:hover {
        .btn-name {
          color: var(--ant-primary-color);

          &.disabled {
            color: #ccc;
          }
        }
      }

      .loading {
        position: absolute;
        left: 50%;
        width: 40px;
        height: 40px;
        padding: 0 5px;
        transform: translate(-50%, 0);
        background: rgb(255 255 255 / 50%);
        color: var(--ant-primary-color);
        font-size: 30px;

        .loading-icon {
          position: absolute;
          top: 5px;
        }
      }

      .btn-icon {
        display: block;
        margin: 0 auto;
      }

      .btn-color {
        color: #ff914a;
      }

      .btn-name {
        display: block;
        margin-top: 8px;
        line-height: 20px;
        text-align: center;
      }
    }
  }
</style>
