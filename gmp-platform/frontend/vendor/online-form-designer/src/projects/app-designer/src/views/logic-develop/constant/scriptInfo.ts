import { ref } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { scriptTypeEnum } from '@gct/runtime';
const { t } = useI18n();

export const scriptInfo = ref([
  {
    key: 'name',
    label: t('sys.appDesigner.scriptName'),
    value: '',
  },
  {
    key: 'key',
    label: t('sys.appDesigner.scriptKey'),
    value: '',
  },
  {
    key: 'version',
    label: t('sys.appDesigner.version'),
    value: [],
  },
  {
    key: 'description',
    label: t('sys.description'),
    value: '',
  },
  {
    key: 'createUserName',
    label: t('sys.createUser'),
    value: '',
  },
  {
    key: 'createTime',
    label: t('sys.createTime'),
    value: '',
  },
  {
    key: 'modifyUserName',
    label: t('sys.appDesigner.modifier'),
    value: '',
  },
  {
    key: 'modifyTime',
    label: t('sys.appDesigner.modificationTime'),
    value: '',
  },
]);

export const sampleScriptMap = {
  [scriptTypeEnum.EVENT]:
    '//如果业务服务使用的是GET请求，用以下方式获取参数\n//const params = args.params\n//params 为http请求query中的参数\n//const workflowStepId = params.workflow_step_id_\n//例如取工步ID\n\n//如果业务服务使用的是POST\\PUT\\DELETE请求，用以下方式获取参数\n//const bodyValue = JSON.parse(args.body)\n//bodyValue 为http请求体中的json对象\n//const workflowStepId = bodyValue.workflow_step_id_\n//例如取工步ID\n\n',
  // method: '2',
  [scriptTypeEnum.BUSINESSSERVICE]:
    '//如果业务服务使用的是GET请求，用以下方式获取参数\n//const params = args.params\n//params 为http请求query中的参数\n//const workflowStepId = params.workflow_step_id_\n//例如取工步ID\n\n//如果业务服务使用的是POST\\PUT\\DELETE请求，用以下方式获取参数\n//const bodyValue = JSON.parse(args.body)\n//bodyValue 为http请求体中的json对象\n//const workflowStepId = bodyValue.workflow_step_id_\n//例如取工步ID\n',
  [scriptTypeEnum.TIMER]:
    '//定时器中，参数以json的形式传递进来\n//直接使用 args.workflow_step_id_ 这种形式即可取参数\n\n',
};
