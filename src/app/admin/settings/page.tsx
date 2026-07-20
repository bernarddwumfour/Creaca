'use client';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import api from '@/lib/axios';
import { ENDPOINTS } from '@/lib/endpoints';
type Config={ai_engine_enabled:boolean;auto_correction_enabled:boolean};
export default function AdminSettings(){
 const {data,isLoading}=useQuery({queryKey:['admin-settings'],queryFn:async()=> (await api.get(ENDPOINTS.PLATFORM.ADMIN_SETTINGS)).data.data as Config});
 const [form,setForm]=useState<Config>({ai_engine_enabled:true,auto_correction_enabled:true});
 useEffect(()=>{if(data)setForm(data)},[data]);
 const save=useMutation({mutationFn:async()=>api.patch(ENDPOINTS.PLATFORM.ADMIN_SETTINGS,form),onSuccess:()=>toast.success('Settings saved'),onError:()=>toast.error('Unable to save settings')});
 if(isLoading)return <Loader2 className="animate-spin"/>;
 return <div className="max-w-4xl space-y-8"><h1 className="text-3xl font-black">System <span className="text-orange-600">Settings.</span></h1><Card><CardHeader><CardTitle>AI Engine Configuration</CardTitle></CardHeader><CardContent className="space-y-6">{([['ai_engine_enabled','AI engine'],['auto_correction_enabled','Auto-correction']] as const).map(([key,label])=><div key={key} className="flex items-center justify-between"><Label>{label}</Label><Switch checked={form[key]} onCheckedChange={(checked)=>setForm(current=>({...current,[key]:checked}))}/></div>)}</CardContent></Card><div className="flex justify-end gap-3"><Button variant="ghost" onClick={()=>data&&setForm(data)}>Discard changes</Button><Button disabled={save.isPending} onClick={()=>save.mutate()}>{save.isPending?<Loader2 className="mr-2 animate-spin"/>:<Save className="mr-2"/>}Save changes</Button></div></div>;
}
