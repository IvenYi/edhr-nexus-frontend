import { defineComponent, onUnmounted, PropType, ref, nextTick, watch, computed } from 'vue';
import { useNamespace } from '@gct/runtime';
import { onClickOutside } from '@vueuse/core';
import { IDesignData } from '@gct/base';
import { Modal } from 'ant-design-vue';
import { useDesignViewController } from '../hooks';
import { IDesignViewOptions } from '../interface';
import { DesignViewPrefix } from '../constant';
import { DesignItemPreview } from '../components/design';
import './design-view.scss';

export const DesignView = defineComponent({
  name: 'DesignView',
  props: {
    // 是否启用名称编辑
    isEditName: {
      type: Boolean,
      default: false,
    },

    // 是否隐藏撤销、重做
    hideUndoRedo: {
      type: Boolean,
      default: false,
    },

    // 默认显示名称
    name: {
      type: String,
      default: '',
    },
    data: {
      type: Object as PropType<IDesignData>,
    },
    save: {
      type: Function as PropType<(data: IData) => Promise<boolean>>,
      required: true,
    },
    errMsg: {
      type: String,
      default: '',
    },
    context: {
      type: Object as PropType<IContext>,
      default: () => {
        return {};
      },
    },
    opts: {
      type: Object as PropType<IDesignViewOptions>,
      default: () => {
        return {
          title: (window as any).$t('sys.designView.title.default'),
          prefix: DesignViewPrefix.CUSTOM_HOME,
        };
      },
    },
  },
  emits: ['close', 'save', 'preview', 'update:name', 'update:errMsg'],
  setup(props, { emit }) {
    const t = (window as any).$t;

    const ns = useNamespace('design-view');

    const nameRef = ref();

    const c = useDesignViewController();

    const oldTitleName = ref<string>(props.name);

    const titleName = ref<string>(props.name);

    const isEdit = ref<boolean>(false);

    // 是否正在保存中
    const isSave = ref<boolean>(false);

    // 是否正在预览中
    const isPreview = ref<boolean>(false);

    const errInfo = computed(() => {
      if (titleName.value.length > 100) {
        emit('update:errMsg', '');
        return t('sys.designView.title.errorMsg');
      }
      if (props.errMsg) {
        return props.errMsg;
      }
      return '';
    });

    watch(
      () => props.name,
      (val) => {
        oldTitleName.value = val;
        titleName.value = val;
      },
    );

    // 配置参数处理
    {
      const { prefix } = props.opts;
      if (prefix) {
        c.store.prefix = prefix;
      }
    }

    const onClose = () => {
      if (c.store.isChange) {
        const cfg = Modal.confirm({
          title: t('sys.designView.saveConfirm.title'),
          content: (
            <div>
              <span>{t('sys.designView.saveConfirm.content')}</span>
              <div class={ns.b('continue-edit')}>
                <button type="button" onClick={() => cfg.destroy()}>
                  继续编辑
                </button>
              </div>
            </div>
          ),
          okText: t('sys.designView.saveConfirm.confirm'),
          cancelText: t('sys.designView.saveConfirm.cancel'),
          onOk: async () => {
            const bol = await onSave();
            if (bol === true) {
              emit('close');
            }
          },
          onCancel: () => {
            emit('close');
          },
          class: ns.b('confirm'),
          maskStyle: {
            backgroundColor: 'transparent',
          },
        });
      } else {
        emit('close');
      }
    };

    const save = async (): Promise<boolean> => {
      if (props.save) {
        const validate = await c.validate();
        if (!validate) {
          return false;
        }
        const bol = await props.save(getData());
        if (bol === true) {
          c.store.isChange = false;
          return true;
        }
      }
      return false;
    };

    const onSave = async (): Promise<boolean> => {
      try {
        isSave.value = true;
        const bol = await save();
        if (bol) {
          onClose();
        }
      } finally {
        setTimeout(() => {
          isSave.value = false;
        }, 300);
      }
      return false;
    };

    const onPreview = async () => {
      try {
        isPreview.value = true;
        const bol = await save();
        if (bol) {
          emit('preview', getData());
        }
      } finally {
        setTimeout(() => {
          isPreview.value = false;
        }, 300);
      }
    };

    const getData = () => {
      return c.store.getData();
    };

    const setData = (data: IDesignData) => {
      c.store.setData(data);
    };

    setData(props.data || { nodes: [], pageNode: null, tree: [], type: '' });

    onUnmounted(() => {
      c.unmounted();
    });

    const onEdit = (e) => {
      if (props.isEditName) {
        e.stopPropagation();
        isEdit.value = true;
        oldTitleName.value = titleName.value;
        nextTick(() => {
          nameRef.value.focus();
          nameRef.value.select();
        });
      }
    };

    onClickOutside(nameRef, (e) => {
      if (isEdit.value) {
        if (errInfo.value) {
          e.stopPropagation();
          nameRef.value.focus();
          nameRef.value.select();
          return;
        }
        isEdit.value = false;
        const newVal = (titleName.value = titleName.value.trim());
        if (titleName.value.length > 100) {
          emit('update:name', newVal);
          return;
        }
        if (oldTitleName.value !== newVal) {
          if (newVal == '') {
            titleName.value = oldTitleName.value;
          } else {
            e.stopPropagation();
            emit('update:name', newVal);
            c.store.isChange = true;
            // emit('save', false);
          }
        }
      }
    });

    const onPref = () => {
      c.store.undo();
    };

    const onNext = () => {
      c.store.redo();
    };

    return {
      t,
      ns,
      c,
      titleName,
      isEdit,
      errInfo,
      nameRef,
      isPreview,
      isSave,
      onClose,
      onSave,
      onPreview,
      getData,
      setData,
      onEdit,
      onPref,
      onNext,
    };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <div class={this.ns.be('header', 'left')}>
            <div class={this.ns.be('header', 'back')} onClick={this.onClose}>
              <i class="iconfont icon-a-Leftarrow" />
            </div>
            <div class={this.ns.be('header', 'title')}>
              {this.opts.title ?? this.t('sys.designView.title.default')}：&nbsp;
            </div>
            <div class={this.ns.be('header', 'view-title-edit')}>
              <a-input
                ref="nameRef"
                v-show={this.isEdit}
                v-model:value={this.titleName}
                bordered={false}
                onClick={(e) => e.stopPropagation()}
              />
              <span class={this.ns.e('edit-title')} v-show={!this.isEdit} onClick={this.onEdit}>
                <span title={this.titleName}>{this.titleName}</span>
                <i class="iconfont icon-a-Single-linetext" />
              </span>
              {this.errInfo ? (
                <div class={this.ns.bem('header', 'view-title-edit', 'error-info')}>
                  <span>{this.errInfo}</span>
                </div>
              ) : null}
            </div>
          </div>
          <div class={this.ns.be('header', 'right')}>
            {this.opts.isBacktrack !== false && !this.hideUndoRedo ? (
              <div class={this.ns.be('header', 'design-actions')}>
                <a-button
                  type="text"
                  onClick={this.onPref}
                  disabled={!this.c.store.history.canUndo()}
                >
                  {{
                    default: () => this.t('sys.designView.undo'),
                    icon: () => <i class="iconfont icon-shangyibu" />,
                  }}
                </a-button>
                <a-button
                  type="text"
                  onClick={this.onNext}
                  disabled={!this.c.store.history.canRedo()}
                >
                  {{
                    default: () => this.t('sys.designView.redo'),
                    icon: () => <i class="iconfont icon-xiayibu" />,
                  }}
                </a-button>
              </div>
            ) : null}
            <div class={this.ns.be('header', 'view-actions')}>
              {this.opts.isPreview !== false ? (
                <a-button onClick={this.onPreview} loading={this.isPreview}>
                  {{
                    default: () => this.t('sys.designView.preview'),
                    icon: () => <i class="iconfont icon-yulan" />,
                  }}
                </a-button>
              ) : null}
              <a-button onClick={this.onSave} loading={this.isSave}>
                {{
                  default: () => this.t('sys.designView.save'),
                  icon: () => <i class="iconfont icon-baocun1" />,
                }}
              </a-button>
            </div>
          </div>
        </div>
        <div class={this.ns.b('content')}>
          <DesignItemPreview />
          {this.opts.isMaterial !== false ? (
            <div class={this.ns.be('content', 'left')}>
              <material-content />
            </div>
          ) : null}
          <div class={this.ns.be('content', 'center')}>
            <design-content opts={this.opts} />
          </div>
          <div class={this.ns.be('content', 'right')}>
            <panel-content context={this.context} />
          </div>
        </div>
      </div>
    );
  },
});
