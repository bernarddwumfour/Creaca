'use client';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';
import { dict, Lang } from '@/lib/dictionary/dictionary';
import { ENDPOINTS } from '@/lib/endpoints';
export default function NotificationsPage(){
 const {lang:rawLang}=useParams<{lang:string}>(); const lang=(rawLang in dict?rawLang:'en') as Lang; const t=dict[lang].pages.notifications; const client=useQueryClient();
 const {data,isLoading}=useQuery({queryKey:['notifications','all'],queryFn:async()=> (await api.get(ENDPOINTS.PLATFORM.NOTIFICATIONS)).data.data});
 const markAll=useMutation({mutationFn:async()=>api.post(ENDPOINTS.PLATFORM.MARK_ALL_NOTIFICATIONS_READ),onSuccess:()=>{client.invalidateQueries({queryKey:['notifications']})}});
 if(isLoading)return <Loader2 className="animate-spin"/>;
 return <main className="container mx-auto min-h-[70vh] py-28"><div className="mb-8 flex items-center justify-between"><h1 className="text-3xl font-black">{t.title}</h1><Button variant="outline" disabled={!data?.unread_count||markAll.isPending} onClick={()=>markAll.mutate()}>{t.markAll}</Button></div><div className="space-y-3">{!data?.results?.length?<p className="text-zinc-500">{t.empty}</p>:data.results.map((note:any)=><Card key={note.id} className={note.is_read?'opacity-60':''}><CardContent className="flex gap-4 p-5"><Bell className="text-orange-600"/><div><p className="font-medium">{note.message}</p><p className="mt-1 text-xs text-zinc-400">{new Date(note.created_at).toLocaleString()}</p></div></CardContent></Card>)}</div></main>;
}
