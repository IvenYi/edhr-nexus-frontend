import { computed, defineComponent } from 'vue';
import {
  gctFormItemEditorProps,
  IEditorBasic,
  t,
  TagTypeEnum,
  useGctFormValue,
  useNamespace,
} from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import './content-tag-style.scss';

export interface IFieldInfoEditor extends IEditorBasic {
  readonly type: DesignEditorType.CONTENT_TAG_STYLE;
}

export const ContentTagStyle = defineComponent({
  name: 'ContentTagStyle',
  props: gctFormItemEditorProps<IObject>(),
  setup() {
    const ns = useNamespace('content-tag-style');

    const keys = Object.keys(TagTypeEnum);

    const val = useGctFormValue();

    const check = computed({
      get() {
        return val.value?.check;
      },
      set(value) {
        val.value = {
          ...(val.value || {}),
          check: value,
        };
      },
    });

    const mode = computed({
      get() {
        return val.value?.mode || TagTypeEnum.RADIUS;
      },
      set(value) {
        val.value = {
          ...(val.value || {}),
          mode: value,
        };
      },
    });

    const color = computed({
      get() {
        return val.value?.color;
      },
      set(value) {
        val.value = {
          ...(val.value || {}),
          color: value,
        };
      },
    });

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('title')}>
            <span class={ns.e('label')}>{t('sys.cardDesign.cfg_form.label_style')}</span>
            <span class={ns.e('check')}>
              <a-checkbox v-model:checked={check.value} size="small">
                {t('sys.cardDesign.cfg_form.cfg_content_tag_style')}
              </a-checkbox>
            </span>
          </div>
          {check.value ? (
            <div class={ns.e('content')}>
              <span class={ns.e('select')}>
                <a-select v-model:value={mode.value} size="small" placeholder={t('sys.chooseText')}>
                  {keys.map((key) => {
                    const val = TagTypeEnum[key as keyof typeof TagTypeEnum];
                    const label = t(`sys.pageDesigner.${val}`);
                    return (
                      <a-select-option class={ns.e('option')} key={val} value={val} label={label}>
                        <div class={ns.e('tag')}>
                          <span class={[ns.e('tag-icon'), val]}></span>
                          <span>{label}</span>
                        </div>
                      </a-select-option>
                    );
                  })}
                </a-select>
              </span>
              <span class={ns.e('color')}>
                <color-editor
                  v-model:value={color.value}
                  show-alpha
                  size="small"
                  class={ns.e('color-picker')}
                />
              </span>
            </div>
          ) : null}
        </div>
      );
    };
  },
});
