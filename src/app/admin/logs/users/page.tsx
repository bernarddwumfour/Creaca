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
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                        SYSTEM MONITORING
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                        Audit <span className="text-orange-600">Logs.</span>
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight text-sm">
                        Real-time system events and AI performance monitoring.
                    </p>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-3">
                {DUMMY_LOGS.map((log) => (
                    <Card
                        key={log.id}
                        className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 group hover:-translate-y-0.5 transition-all overflow-hidden"
                    >
                        <CardContent className="p-0">
                            <div className="py-4 px-6 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`
                                        ${log.type === 'success' ? 'text-emerald-500' : ''}
                                        ${log.type === 'info' ? 'text-blue-500' : ''}
                                        ${log.type === 'warning' ? 'text-amber-500' : ''}
                                        ${log.type === 'error' ? 'text-red-500' : ''}
                                    `}>
                                        {log.type === 'success' && <CheckCircle2 size={22} />}
                                        {log.type === 'info' && <Info size={22} />}
                                        {log.type === 'warning' && <AlertTriangle size={22} />}
                                        {log.type === 'error' && <AlertTriangle size={22} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-base tracking-tight">{log.event}</span>
                                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-500 tracking-widest">
                                                {log.user}
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{log.details}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-zinc-400 text-right">
                                    <Clock size={15} />
                                    <span className="text-xs font-mono font-bold whitespace-nowrap">{log.timestamp}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}