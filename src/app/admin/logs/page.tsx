'use client';

import React from 'react';
import { Terminal, Clock, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const DUMMY_LOGS = [
    { id: 1, type: 'success', event: 'AI Model Re-trained', details: 'Adaptive Calculus module weights updated.', timestamp: '2 mins ago', user: 'System' },
    { id: 2, type: 'info', event: 'User Login', details: 'Bernard logged in from Accra, Ghana (IP: 154.160.xx.xx)', timestamp: '15 mins ago', user: 'Bernard' },
    { id: 3, type: 'warning', event: 'High Computation Load', details: 'Neural network inference latency exceeded 200ms.', timestamp: '1 hour ago', user: 'AI Engine' },
    { id: 4, type: 'error', event: 'Payment Failed', details: 'Subscription renewal for student Alice Dupont failed.', timestamp: '4 hours ago', user: 'Billing' },
];

export default function SystemLogs() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 dark:bg-white rounded-lg text-white dark:text-zinc-900">
                    <Terminal size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Audit Logs</h1>
                    <p className="text-zinc-500 font-medium">Real-time system events and AI performance monitoring.</p>
                </div>
            </div>

            <div className="space-y-3">
                {DUMMY_LOGS.map((log) => (
                    <Card key={log.id} className="border-none shadow-sm dark:bg-[#111114] hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all cursor-default group">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`
                  ${log.type === 'success' ? 'text-emerald-500' : ''}
                  ${log.type === 'info' ? 'text-blue-500' : ''}
                  ${log.type === 'warning' ? 'text-amber-500' : ''}
                  ${log.type === 'error' ? 'text-red-500' : ''}
                `}>
                                    {log.type === 'success' && <CheckCircle2 size={20} />}
                                    {log.type === 'info' && <Info size={20} />}
                                    {log.type === 'warning' && <AlertTriangle size={20} />}
                                    {log.type === 'error' && <AlertTriangle size={20} />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{log.event}</span>
                                        <span className="text-[10px] font-black uppercase px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 tracking-tighter">{log.user}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-0.5">{log.details}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Clock size={14} />
                                <span className="text-[10px] font-bold font-mono">{log.timestamp}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}