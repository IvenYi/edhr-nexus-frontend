import { createEditor, Boot } from '@wangeditor/editor';

// 全局标记变量
let isFormatPaintRegistered = false;
class FormatPaint {
  constructor() {
    this.title = '格式刷 双击可复用'; // 自定义菜单标题
    this.iconSvg = `<svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4119 14.3879L14.4655 8.9308H14.7852C15.0423 8.9308 15.2494 8.72366 15.2494 8.46652V5.03795C15.2494 4.7808 15.0423 4.57366 14.7852 4.57366H10.3923V1.32366C10.3923 1.06652 10.1852 0.859375 9.92801 0.859375H7.07087C6.81373 0.859375 6.60659 1.06652 6.60659 1.32366V4.57366H2.21373C1.95659 4.57366 1.74944 4.7808 1.74944 5.03795V8.46652C1.74944 8.72366 1.95659 8.9308 2.21373 8.9308H2.53337L1.58694 14.3879C1.57534 14.4546 1.57847 14.5229 1.59611 14.5882C1.61374 14.6535 1.64545 14.7142 1.68902 14.7659C1.73258 14.8176 1.78694 14.8592 1.84828 14.8877C1.90962 14.9162 1.97645 14.9309 2.04409 14.9308H14.9548C14.9816 14.9308 15.0084 14.929 15.0334 14.9237C15.0935 14.9136 15.151 14.8916 15.2027 14.8592C15.2543 14.8268 15.299 14.7844 15.3342 14.7346C15.3694 14.6848 15.3944 14.6286 15.4077 14.5691C15.4211 14.5096 15.4225 14.448 15.4119 14.3879ZM2.99944 5.82366H7.85659V2.10938H9.1423V5.82366H13.9994V7.6808H2.99944V5.82366ZM10.6938 13.6808H6.78516V10.8951C6.78516 10.8165 6.72087 10.7522 6.6423 10.7522H5.78516C5.70659 10.7522 5.6423 10.8165 5.6423 10.8951V13.6808H2.97801L3.78337 9.03795H13.2137L14.0191 13.6808H10.6938Z" fill="#797A7D"/>
    </svg>
    `;
    this.tag = 'button';
    if (!FormatPaint.prototype.init) {
      FormatPaint.prototype.attrs = {
        isSelect: false,
        formatJson: {},
        formatedHtml: '',
      };
      FormatPaint.prototype.init = true;
    }
  }
  getValue(editor) {
    // JS 语法
    return '';
  }

  // 菜单是否需要激活（如选中加粗文本，“加粗”菜单会激活），用不到则返回 false
  isActive(editor) {
    return this.attrs.isSelect;
  }

  // 菜单是否需要禁用（如选中 H1 ，“引用”菜单被禁用），用不到则返回 false
  isDisabled(editor) {
    // JS 语法
    return false;
  }

  // 点击菜单时触发的函数
  exec(editor, value) {
    if (this.isDisabled(editor)) return;
    const select = editor.getFragment()[0].children[0];
    if (!this.attrs.isSelect && select.text.length) {
      this.attrs.formatJson = { ...select };
      this.attrs.isSelect = true;
    } else {
      editor.getSelectionText();
      this.attrs.isSelect = false;
    }
    editor.blur();
    editor.focus(); // JS 语法
  }
  //设置格式化好的内容
  setFormatHtml(editor) {
    if (!this.attrs.formatedHtml.length) return;
    editor.dangerouslyInsertHtml(this.attrs.formatedHtml);
    this.attrs.formatedHtml = '';
    this.attrs.isSelect = false;
  }
}

export function withSelect(editor) {
  const myFormatPaint = new FormatPaint();

  const { onChange, onBlur, onFocus } = editor; // 获取当前 editor API
  const newEditor = editor;

  newEditor.onChange = (editor) => {
    onChange();
    if (myFormatPaint.attrs.isSelect) {
      myFormatPaint.attrs.formatJson.text = newEditor.getSelectionText();
      const _editor = createEditor({
        content: [myFormatPaint.attrs.formatJson],
      });
      myFormatPaint.attrs.formatedHtml = _editor.getHtml();
      if (!document.onmouseup) {
        document.onmouseup = () => {
          if (!myFormatPaint.attrs.formatedHtml.length) return;
          myFormatPaint.setFormatHtml(newEditor);
          document.onmouseup = null;
        };
      }
    }
    return;
  };
  return newEditor;
}

const FormatPaintMenuConf = {
  key: 'FormatPaintMenuConf', // 定义 menu key ：要保证唯一、不重复（重要）
  factory() {
    return new FormatPaint(); // 把 `YourMenuClass` 替换为你菜单的 class
  },
};

export const registerFormatPaint = () => {
  if (!isFormatPaintRegistered) {
    Boot.registerMenu(FormatPaintMenuConf);
    Boot.registerPlugin(withSelect);
    isFormatPaintRegistered = true;
  }
};
export default FormatPaintMenuConf;
