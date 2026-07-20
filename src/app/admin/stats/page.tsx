'use client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
export default function PerformanceAnalytics() {
 const {data,isLoading}=useQuery({queryKey:['admin-stats'],queryFn:async()=> (await api.get(ENDPOINTS.PLATFORM.ADMIN_STATS)).data.data});
 if(isLoading)return <Loader2 className="animate-spin"/>;
 const stats=[['Total users',data?.total_users],['Active courses',data?.active_courses],['Active subjects',data?.active_subjects],['Active subscriptions',data?.active_subscriptions],['Course purchases',data?.course_purchases],['Revenue (GHS)',data?.total_revenue],['Completion rate',`${data?.completion_rate||0}%`]];
 return <div className="space-y-8"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-400">Analytics dashboard</p><h1 className="text-3xl font-black">Performance <span className="text-orange-600">Lab.</span></h1></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label,value])=><Card key={String(label)} className="shadow-none dark:bg-zinc-900/80"><CardContent className="p-6"><p className="text-[10px] font-black uppercase text-zinc-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></CardContent></Card>)}</div></div>;
}
