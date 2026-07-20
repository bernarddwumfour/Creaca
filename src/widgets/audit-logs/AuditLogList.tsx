'use client';

import { useQuery } from '@tanstack/react-query';
import { Clock, Loader2, Terminal } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';

export function AuditLogList({ scope = '' }: { scope?: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-logs', scope],
    queryFn: async () => (await api.get(ENDPOINTS.PLATFORM.ADMIN_LOGS, { params: { scope } })).data.data,
  });
  if (isLoading) return <Loader2 className="animate-spin" />;
  const logs = data?.results || [];
  if (!logs.length) return <p className="text-sm text-zinc-500">No audit events have been recorded yet.</p>;
  return <div className="space-y-3">{logs.map((log: any) => <Card key={log.id} className="shadow-none dark:bg-zinc-900/80"><CardContent className="flex items-center justify-between p-5"><div className="flex gap-4"><Terminal className="mt-1 text-orange-600" size={20}/><div><p className="font-black">{log.action}</p><p className="text-sm text-zinc-500">{log.message}</p><p className="mt-1 text-[10px] uppercase text-zinc-400">{log.actor}</p></div></div><span className="flex items-center gap-2 text-xs text-zinc-400"><Clock size={14}/>{new Date(log.created_at).toLocaleString()}</span></CardContent></Card>)}</div>;
}
