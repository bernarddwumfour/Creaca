import { AuditLogList } from '@/widgets/audit-logs/AuditLogList';
export default function SystemLogs() { return <div className="space-y-8"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">System monitoring</p><h1 className="text-3xl font-black">Audit <span className="text-orange-600">Logs.</span></h1></div><AuditLogList /></div>; }
