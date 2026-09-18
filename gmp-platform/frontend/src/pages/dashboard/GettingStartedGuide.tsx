import { useState } from 'react';
import { Button, Tab, Tabs } from '@mui/material';
import { ArrowBackRounded, ArrowForwardRounded, CheckCircleOutlineRounded, LightbulbOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';

interface GuideStep {
  title: string;
  subtitle: string;
  role: string;
  before: string;
  actions: string[];
  outcome: string;
  links: { label: string; path: string }[];
}

const initialization: GuideStep[] = [
  {
    title: '组织与人员', subtitle: '先让协作有基础', role: '系统管理员',
    before: '准备部门结构、使用人员和岗位分工。',
    actions: ['在组织管理中维护部门结构，在用户管理中建立人员账号。', '在角色管理中检查岗位对应的权限，并为用户分配合适的角色。'],
    outcome: '参与人员拥有对应账号与角色，能够进入各自负责的功能。',
    links: [{ label: '组织管理', path: '/system/organization' }, { label: '用户管理', path: '/system/users' }, { label: '角色管理', path: '/system/roles' }],
  },
  {
    title: '基础资料', subtitle: '准备生产所需资源', role: '基础数据维护人员',
    before: '准备物料编码、名称、规格、单位，以及车间和设备资料。',
    actions: ['在物料管理中维护或导入物料，核对编码、版本与单位。', '根据实际生产需要维护车间、设备类型和设备；设备类型先于设备建立。'],
    outcome: '后续建模需要引用的物料与现场资源可以在对应列表中找到。',
    links: [{ label: '物料管理', path: '/master-data/materials' }, { label: '车间管理', path: '/master-data/workshops' }, { label: '设备类型', path: '/master-data/equipment-types' }, { label: '设备列表', path: '/master-data/equipment' }],
  },
  {
    title: '工序与路线', subtitle: '定义生产怎么走', role: '工艺维护人员',
    before: '准备工序清单、工艺顺序和需要引用的作业文档。',
    actions: ['在工序管理中维护或导入工序，在文档管理中准备需要引用的文档版本。', '在工艺路线中组织工序节点与连接关系，检查路线版本的内容。'],
    outcome: '形成供产品制程配置引用的工艺路线版本。',
    links: [{ label: '工序管理', path: '/master-data/operations' }, { label: '工艺路线', path: '/master-data/routes' }, { label: '文档管理', path: '/master-data/documents' }],
  },
  {
    title: '表单与模板', subtitle: '准备过程记录载体', role: '模板维护人员',
    before: '准备需要填写的记录表、字段要求与批记录结构。',
    actions: ['在表单模板中设计记录内容，使用预览检查字段与版式。', '在批记录模板中组织需要引用的表单；需要审批或表单流转时，在流程中心维护相应流程。'],
    outcome: '表单和批记录模板内容已核对，可以继续配置产品制程。',
    links: [{ label: '表单模板', path: '/master-data/form-templates' }, { label: '批记录模板', path: '/master-data/batch-record-templates' }, { label: '审批流程', path: '/workflow/review-templates' }, { label: '表单流程', path: '/workflow/form-processes' }],
  },
  {
    title: '产品制程', subtitle: '把配置连接起来', role: '工艺维护人员',
    before: '产品由物料管理中的半成品、产成品自动派生；同时准备工艺路线版本与批记录模板版本。',
    actions: ['在产品管理中找到对应产品，新增制程配置版本；找不到产品时，先检查来源物料及物料类型。', '选择工艺路线和批记录模板版本，配置工序的表单、文档等引用，并核对版本状态。'],
    outcome: '工单中可以选择所需产品及可用制程版本。接下来查看“跑通生产流程”。',
    links: [{ label: '产品管理', path: '/master-data/products' }, { label: '物料管理', path: '/master-data/materials' }],
  },
];

const production: GuideStep[] = [
  {
    title: '创建工单', subtitle: '明确生产任务', role: '生产计划人员',
    before: '确认产品及所需制程版本可用，准备计划数量与生产安排。',
    actions: ['打开工单管理，新建工单，选择产品并填写计划数量等信息。', '结合生产安排选择制程版本，保存后检查工单信息。'],
    outcome: '工单已出现在列表中，可以继续拆分生产对象。',
    links: [{ label: '工单管理', path: '/production/work-orders' }, { label: '产品管理', path: '/master-data/products' }],
  },
  {
    title: '安排批次', subtitle: '落实生产对象', role: '生产计划人员',
    before: '准备批次或 SN 编号、分配数量与计划时间。',
    actions: ['在工单中进入生产对象拆分，按实际生产方式批量添加、导入或手动添加批次 / SN。', '核对制程版本与分配数量，提交后到批次管理检查生成的生产对象。'],
    outcome: '生产对象与工单建立关联，可在批次管理中查询。',
    links: [{ label: '工单管理', path: '/production/work-orders' }, { label: '批次管理', path: '/production/batches' }],
  },
  {
    title: '执行与记录', subtitle: '在现场完成工作', role: '生产操作人员',
    before: '准备待执行的生产对象编号，并确认当前操作账号。',
    actions: ['进入生产工作台，扫码或选择生产对象，查看当前工序与可执行操作。', '按页面要求填写记录、处理签名和提交；根据执行反馈继续后续工序。'],
    outcome: '当前操作的结果与生产记录可在工作台中查看，后续操作以页面提示为准。',
    links: [{ label: '生产工作台', path: '/production/execution' }],
  },
  {
    title: '处理流程任务', subtitle: '推进需要你的环节', role: '任务办理人员',
    before: '已配置流程并产生分配给当前账号的任务时，进入这一环节。',
    actions: ['回到首页“我的待办”，通过流程实例链接了解流转情况，再打开需要处理的任务。', '核对任务编号和处理意见，按任务页面提供的操作完成办理；在“我的已办”中回看处理结果。'],
    outcome: '已办理任务可在已办记录中查询，流程进度可在流程实例中查看。',
    links: [{ label: '流程实例', path: '/workflow/instances' }],
  },
  {
    title: '查阅与追溯', subtitle: '回看过程与结果', role: '生产与质量人员',
    before: '准备要查询的批次 / SN 编号、表单或流程信息。',
    actions: ['在批次管理查看生产对象状态，在生产工作台回看执行内容。', '到表单列表查阅记录；需要了解流转过程时，打开流程实例的详情或日志。'],
    outcome: '能够从生产对象定位执行内容，并通过相应入口查阅表单与流程记录。',
    links: [{ label: '批次管理', path: '/production/batches' }, { label: '表单列表', path: '/form-management/list' }, { label: '流程实例', path: '/workflow/instances' }],
  },
];

export default function GettingStartedGuide({ tab, onTabChange }: { tab: number; onTabChange: (tab: number) => void }) {
  const [selectedSteps, setSelectedSteps] = useState([0, 0]);
  const steps = tab === 0 ? initialization : production;
  const selected = selectedSteps[tab];
  const step = steps[selected];
  const kind = tab === 0 ? 'initialization' : 'production';
  const selectStep = (index: number) => setSelectedSteps((previous) => previous.map((value, key) => key === tab ? index : value));

  return <>
    <Tabs value={tab} onChange={(_, value: number) => onTabChange(value)} aria-label="使用指南类型">
      <Tab id="guide-initialization-tab" aria-controls="guide-initialization-panel" label="初始化指南" />
      <Tab id="guide-production-tab" aria-controls="guide-production-panel" label="跑通生产流程" />
    </Tabs>
    <div role="tabpanel" id={'guide-' + kind + '-panel'} aria-labelledby={'guide-' + kind + '-tab'}>
      <div className="dashboard-guide-note"><LightbulbOutlined /><span>{tab === 0 ? '推荐准备顺序，可按职责选择阶段；此处为操作指南，不代表系统配置完成状态。' : '以生产场景为例；具体执行顺序和可用操作，以所选制程与页面提示为准。'}</span></div>
      <div className="dashboard-guide-layout">
        <nav className="dashboard-steps" aria-label="指南步骤">
          {steps.map((item, index) => <button key={item.title} aria-current={selected === index ? 'step' : undefined} className={'dashboard-step' + (selected === index ? ' is-selected' : '')} onClick={() => selectStep(index)}>
            <span className="dashboard-step-number">{String(index + 1).padStart(2, '0')}</span><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><ArrowForwardRounded />
          </button>)}
        </nav>
        <article className="dashboard-step-detail" aria-label="当前步骤说明">
          <div className="dashboard-step-heading"><span className="dashboard-eyebrow">步骤 {String(selected + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span><span className="dashboard-section-tag">{step.role}</span></div>
          <h3>{step.title}</h3><p className="dashboard-step-before"><strong>开始前</strong>{step.before}</p>
          <ol className="dashboard-step-actions">{step.actions.map((action) => <li key={action}>{action}</li>)}</ol>
          <div className="dashboard-step-outcome"><CheckCircleOutlineRounded /><div><strong>完成后检查</strong><p>{step.outcome}</p></div></div>
          <div className="dashboard-step-links">{step.links.map((link, index) => <Button component={Link} to={link.path} key={link.path} variant={index === 0 ? 'contained' : 'outlined'} endIcon={index === 0 ? <ArrowForwardRounded /> : undefined}>{link.label}</Button>)}</div>
          <div className="dashboard-step-pagination"><Button size="small" startIcon={<ArrowBackRounded />} disabled={selected === 0} onClick={() => selectStep(selected - 1)}>上一步</Button>{selected < steps.length - 1 ? <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => selectStep(selected + 1)}>下一步：{steps[selected + 1].title}</Button> : tab === 0 ? <Button size="small" endIcon={<ArrowForwardRounded />} onClick={() => onTabChange(1)}>查看生产流程</Button> : <span>需要时，随时回到这里查阅</span>}</div>
        </article>
      </div>
    </div>
  </>;
}
