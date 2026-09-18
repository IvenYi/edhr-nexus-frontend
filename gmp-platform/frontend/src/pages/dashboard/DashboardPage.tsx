import { useRef, useState } from 'react';
import { Box, Button, Tab, Tabs } from '@mui/material';
import { ArrowForwardRounded, AutoStoriesOutlined, Inventory2Outlined, PlayCircleOutlineRounded, AssignmentOutlined, ArticleOutlined } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import TodoList from './TodoList';
import DoneList from './DoneList';
import GettingStartedGuide from './GettingStartedGuide';
import './DashboardPage.css';

const shortcuts = [
  { title: '生产工作台', description: '进入现场，执行生产任务', path: '/production/execution', icon: PlayCircleOutlineRounded },
  { title: '工单管理', description: '安排生产，管理计划与批次', path: '/production/work-orders', icon: AssignmentOutlined },
  { title: '批次管理', description: '查找批次，跟进生产状态', path: '/production/batches', icon: Inventory2Outlined },
  { title: '表单列表', description: '检索记录，查看填报内容', path: '/form-management/list', icon: ArticleOutlined },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [taskTab, setTaskTab] = useState(0);
  const [guideTab, setGuideTab] = useState(0);
  const guideRef = useRef<HTMLElement>(null);
  const tasksRef = useRef<HTMLElement>(null);
  const date = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  const taskKind = taskTab === 0 ? 'todo' : 'done';

  const openGuide = (tab: number) => {
    setGuideTab(tab);
    guideRef.current?.scrollIntoView({ block: 'start' });
    guideRef.current?.focus({ preventScroll: true });
  };

  return (
    <Box className="dashboard-page">
      <header className="dashboard-heading">
        <div><span className="dashboard-eyebrow">工作，从这里开始</span><h1>首页工作台</h1></div>
        <span className="dashboard-date">{date}</span>
      </header>
      <section className="dashboard-welcome" aria-label="欢迎与工作导航">
        <div className="dashboard-welcome-copy">
          <span className="dashboard-welcome-label">每一步，都有方向</span>
          <h2>{user?.displayName || user?.username || '你好'}，欢迎回来</h2>
          <p>从基础数据准备，到生产执行与记录追溯。<br />找到今天的重点，也看清下一步。</p>
          <Button variant="contained" endIcon={<ArrowForwardRounded />} onClick={() => {
            setTaskTab(0);
            tasksRef.current?.scrollIntoView({ block: 'start' });
            tasksRef.current?.focus({ preventScroll: true });
          }}>查看我的待办</Button>
        </div>
        <div className="dashboard-welcome-guides">
          <button className="dashboard-guide-entry" onClick={() => openGuide(0)}>
            <AutoStoriesOutlined /><span><strong>第一次使用？从这里开始</strong><small>按顺序准备系统与基础数据</small></span><ArrowForwardRounded />
          </button>
          <button className="dashboard-guide-entry" onClick={() => openGuide(1)}>
            <PlayCircleOutlineRounded /><span><strong>了解一条完整生产流程</strong><small>从创建工单到执行、查阅记录</small></span><ArrowForwardRounded />
          </button>
        </div>
      </section>

      <div className="dashboard-work-grid">
        <section className="dashboard-panel dashboard-tasks" ref={tasksRef} tabIndex={-1} aria-label="日常工作">
          <div className="dashboard-section-heading"><div><h2>日常工作</h2><p>聚焦分配给你的流程任务</p></div><span className="dashboard-section-tag">我的工作</span></div>
          <Tabs value={taskTab} onChange={(_, value: number) => setTaskTab(value)} aria-label="任务分类">
            <Tab id="dashboard-todo-tab" aria-controls="dashboard-todo-panel" label="我的待办" />
            <Tab id="dashboard-done-tab" aria-controls="dashboard-done-panel" label="我的已办" />
          </Tabs>
          <div role="tabpanel" id={'dashboard-' + taskKind + '-panel'} aria-labelledby={'dashboard-' + taskKind + '-tab'}>
            {taskTab === 0 ? <TodoList /> : <DoneList />}
          </div>
        </section>
        <aside className="dashboard-panel dashboard-shortcuts" aria-label="常用入口">
          <div className="dashboard-section-heading"><div><h2>常用入口</h2><p>快速回到手头的工作</p></div></div>
          {shortcuts.map(({ title, description, path, icon: Icon }) => (
            <Link to={path} key={path} className="dashboard-shortcut"><span className="dashboard-shortcut-icon"><Icon /></span><span><strong>{title}</strong><small>{description}</small></span><ArrowForwardRounded /></Link>
          ))}
        </aside>
      </div>

      <section className="dashboard-panel dashboard-learning" ref={guideRef} tabIndex={-1} aria-label="使用指南">
        <div className="dashboard-section-heading"><div><span className="dashboard-eyebrow">从入门到日常</span><h2>把流程看清，把工作做好</h2><p>选择一个阶段，查看操作说明和对应入口。</p></div><AutoStoriesOutlined className="dashboard-learning-icon" /></div>
        <GettingStartedGuide tab={guideTab} onTabChange={setGuideTab} />
      </section>
      <footer className="dashboard-footer">从数据到流程，从执行到记录 · eDHR 工作台</footer>
    </Box>
  );
}
