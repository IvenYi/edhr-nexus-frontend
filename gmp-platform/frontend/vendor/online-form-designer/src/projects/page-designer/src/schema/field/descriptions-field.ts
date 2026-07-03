import { FIELD_TYPE } from '@/enums/appEnum';

export function runPropEditor(selectedRef, propEditorList) {
  console.log('desc-field', selectedRef, propEditorList);

  // 公共的属性
  const commonProps = [
    'label',
    'displayLabelText',
    'displayType',
    'hidden',
    'displayRule',
    'bindCompStyleType',
    'refCard',
    'refCardId',
  ];
  // 可直接使用scheme的组件
  const returnCmpProps = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION];
  //  || (selectedRef.props.fieldType === FIELD_TYPE.RDO_REF && e.name ===)
  const propArr = propEditorList
    .filter(
      (e) => commonProps.includes(e.name) || returnCmpProps.includes(selectedRef.props.fieldType),
    )
    .map((e) => {
      if (selectedRef.props.fieldType === FIELD_TYPE.TEXT) return { ...e, hidden: false };
      else return e;
    });

  return propArr;
}

export function runStyleEditor(selectedRef, propEditorList) {
  return propEditorList;
}
export function runEventEditor() {
  return [];
}
