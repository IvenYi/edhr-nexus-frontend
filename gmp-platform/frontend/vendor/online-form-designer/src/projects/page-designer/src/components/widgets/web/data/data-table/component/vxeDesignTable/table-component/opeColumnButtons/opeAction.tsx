import { computed, defineComponent, h, unref, PropType } from 'vue';
import { OperateButton, BaseButton } from '/@page-designer/types/web';
import { Popconfirm, Button } from 'ant-design-vue';
import { ButtonColorType } from '/@page-designer/enum';
import { IconNext } from '/@/components/Icon';
import { useI18n } from 'vue-i18n';
import { InfoCircleFilled } from '@ant-design/icons-vue';

/**按钮 */
function getAction(i: OperateButton | BaseButton) {
  return <div>{i.props.label || i.props.title}</div>;
}
/**操作按钮 */
function TableAction(i: OperateButton, emit) {
  const child = getAction(i);
  let render: any;
  if (i.props.buttonType === ButtonColorType.LINK) {
    render = <a class={`ant-btn-link ant-btn-${i.props.buttonTheme}`}> {child}</a>;
  } else render = <Button class={`ant-btn-${i.props.buttonTheme}`}>{child}</Button>;
  return PopAction(i, emit, render);
}
/**操作下拉作按钮 */
function PopAction(i: OperateButton | BaseButton, emit, c?: any) {
  const child = c ? c : getAction(i);
  const { t } = useI18n();

  if (i.props.confirm) {
    return (
      <Popconfirm
        title={i.props.confirmText || t('sys.pageDesigner.confirmTodo')}
        onConfirm={() => emit('runEvent')}
        icon={h(InfoCircleFilled)}
        overlayClassName="gct-project-popconfirm"
        okText={t('sys.okText')}
      >
        {child}
      </Popconfirm>
    );
  } else {
    return <child onClick={() => emit('runEvent')}></child>;
  }
}

/**操作按钮 */
export const getTableAction = defineComponent({
  name: 'GetTableAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<OperateButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => TableAction(props.action!, emit);
  },
});
/**操作下拉作按钮 */
export const getPopAction = defineComponent({
  name: 'GetPopAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<OperateButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => PopAction(props.action!, emit);
  },
});
/** 新版的操作按钮 */
function newTableAction(i: BaseButton, emit) {
  // const { t } = useI18n();
  const render = h(
    Button,
    {
      size: i.props.size,
      type: i.props.type,
      danger: i.props.danger,
      disabled: false,
      class: [
        i.props.enableCustomColor && i.props.fontColor ? 'btn-font-color' : '',
        i.props.enableCustomColor && i.props.backgroundColor
          ? i.props.type === 'primary'
            ? 'btn-bg-style'
            : i.props.type !== 'link'
            ? 'btn-border-style'
            : ''
          : '',
      ],
      icon: i.props.hasIcon
        ? h(IconNext, {
            size: 16,
            value: i.props.icon,
            style: {
              marginRight: i.props.hasText ? '4px' : 0,
              '--color': 'inherit',
              lineHeight: '1',
              verticalAlign: i.props.hasText ? 'text-bottom' : 'unset',
            },
          })
        : '',
    },
    {
      default: () => [i.props.hasText ? i.props.title : ''],
    },
  );
  return PopAction(i, emit, render);
}
/**操作按钮 */
export const getNewTableAction = defineComponent({
  name: 'GetNewTableAction',
  inheritAttrs: false,
  props: {
    action: {
      type: Object as PropType<BaseButton>,
    },
  },
  emits: ['runEvent'],
  setup(props, { emit }) {
    return () => newTableAction(props.action!, emit);
  },
});
