export const validateEmoji = (value) => {
  // emoji
  const reg =
    /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  // 肤色变化的变体emoji
  const reg2 = /\u{1F91D}\u{1F3FB}-\u{1F3FF}/u;
  return reg.test(value) || reg2.test(value);
};

export const hasEmojiAndSpecStr = (value) => {
  return validateEmoji(value) || /[\*\?？:：,，\[\]【】#]/.test(value);
};

export const hasEmojiAndSpecStr1 = (value) => {
  return validateEmoji(value) || /[\*\?？:：,，\[\]\\/【】#]/.test(value);
};

export const validateModelName = (rule, value) => {
  if (hasEmojiAndSpecStr(value)) return Promise.reject($t('sys.model.modelNameError'));
  return Promise.resolve();
};

export const validateIsModelName = (rule, value) => {
  if (hasEmojiAndSpecStr1(value)) return Promise.reject($t('sys.model.notModelNameError'));
  return Promise.resolve();
};

export const maxValidate = { max: 100, message: $t('sys.max100') };
