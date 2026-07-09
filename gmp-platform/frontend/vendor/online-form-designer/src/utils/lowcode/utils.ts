import { isEmpty } from 'lodash-es';

export const insertCustomCssToHead = function (cssCode, modalId = '') {
  const head = document.getElementsByTagName('head')[0];
  const oldStyle = document.getElementById('gct-custom-css' + modalId);
  if (oldStyle) {
    head.removeChild(oldStyle); //先清除后插入！！
  }

  const newStyle = document.createElement('style');
  newStyle.id = 'gct-custom-css' + modalId;
  newStyle.type = 'text/css';
  if (isEmpty(modalId)) {
    newStyle.innerHTML = cssCode;
  } else {
    newStyle.innerHTML = `#${modalId}{${cssCode}}`;
  }
  head.appendChild(newStyle);
};
