import { cloneDeep } from 'lodash-es';
import {
  IFormEditItem,
  IFormEditItemController,
  IFormEditItemState,
  IFormHiddenItem,
} from '../../interface';
import { FormItemBasicController } from '../form-item-basic/form-item-basic.controller';
import { FormEditItemState } from '../../state';

/**
 * 表单编辑项控制器
 *
 * @author zhanghanrui
 * @date 2024-04-02 20:04:00
 * @export
 * @abstract
 * @class FormEditItemController
 * @extends {FormItemBasicController}
 * @implements {IFormEditItemController}
 */
export abstract class FormEditItemController
  extends FormItemBasicController
  implements IFormEditItemController
{
  declare model: IFormEditItem;

  declare state: IFormEditItemState;

  get key(): string {
    return this.model.field ?? this.model.name;
  }

  get value(): any {
    return getValue(this.key, this.form.state.data);
  }

  set value(value: any) {
    const data = this.form.state.data;
    const oldValue = cloneDeep(getValue(this.key, data));
    setValue(value, this.key, data);
    this.form.evt.emit('change', this.key, value, oldValue);
    this.state.value = value;
  }

  get editorValue(): any {
    // 多值映射处理按顺序把值封装成数组的元素返回
    if (this.model.fields) {
      return this.model.fields.map((key) => {
        return (this.form.item[key] as IFormEditItemController).value;
      });
    }
    return this.value;
  }

  set editorValue(v: any) {
    // 多值映射处理时,改值按顺序赋予元素的值
    if (this.model.fields) {
      this.model.fields.forEach((key, i) => {
        (this.form.item[key] as IFormEditItemController).value = v?.[i];
      });
    } else {
      this.value = v;
    }
  }

  protected override init(): void {
    super.init();
    if ((this.model as IFormHiddenItem).type !== 'hidden') {
      const { editor } = this.model;
      this.state.readonly = editor.readonly;
      if (editor.disabled != null) {
        this.state.disabled = editor.disabled;
      }
    }
    if (this.model.dictionary) {
      const { mode } = this.model.dictionary;
      if (mode === 'static') {
        this.state.options = this.model.dictionary.items || [];
      }
    }
  }

  blur(): void {
    if ((this.state.value == null || this.state.value === '') && this.model.defaultValue != null) {
      this.value = this.model.defaultValue;
      this.form.evt.emit('blur', this.key, this.value);
    }
  }

  defaultValue(): void {
    const data = this.form.state.data;
    if (getValue(this.key, data) == null && this.model.defaultValue != null) {
      // this.form.state.data[this.key] = this.model.defaultValue;
      setValue(this.model.defaultValue, this.key, data);
    }
  }

  reset(): void {
    if (this.model.defaultValue !== undefined) {
      this.value = this.model.defaultValue;
    } else {
      this.value = undefined;
    }
  }

  protected override crateItemState(): IFormEditItemState {
    return new FormEditItemState();
  }
}

function getValue(name: string, data: object) {
  const key_list = name.split('.');
  try {
    return key_list.reduce((memo, cur) => memo[cur], data);
  } catch (err) {
    console.warn(err);
  }
}

function setValue(value: any, name: string, data: object) {
  const key_list = name.split('.');
  const len = key_list.length - 1;
  key_list.reduce((memo, cur, index) => {
    if (index === len) {
      memo[cur] = value;
    }
    return memo[cur];
  }, data);
}
