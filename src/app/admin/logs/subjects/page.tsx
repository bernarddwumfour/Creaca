import { AuditLogList } from '@/widgets/audit-logs/AuditLogList';
export default function SubjectLogs() { return <div className="space-y-8"><h1 className="text-3xl font-black">Subject <span className="text-orange-600">Logs.</span></h1><AuditLogList scope="subject" /></div>; }
