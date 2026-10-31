import { useParams } from 'react-router-dom';
import WorkflowInstancePanel from './WorkflowInstancePanel';
export default function InstanceLogs() {
  const { id } = useParams();
  return id ? <WorkflowInstancePanel id={id} audit /> : null;
}
