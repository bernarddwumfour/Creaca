'use client';

import React from 'react';
import { Save, BrainCircuit, Key } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
    return (
        <div className="max-w-4xl space-y-8">
            {/* Header */}
            <div>
                <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">
                    PLATFORM CONFIGURATION
                </p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                    System <span className="text-orange-600">Settings.</span>
                </h1>
                <p className="text-zinc-500 font-medium tracking-tight text-sm">
                    Configure global parameters and AI engine behavior.
                </p>
            </div>

            <div className="grid gap-6">
                {/* AI Model Config */}
                <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                <BrainCircuit className="text-primary" size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">AI Engine Configuration</CardTitle>
                                <CardDescription>Toggle features and model versions.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Beta: GPT-4o Integration</Label>
                                <p className="text-xs text-zinc-500">Enable advanced reasoning for complex proofs.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between py-2">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Auto-Correction</Label>
                                <p className="text-xs text-zinc-500">AI automatically fixes minor LaTeX formatting errors.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* API & Infrastructure */}
                <Card className="shadow-none bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                                <Key className="text-primary" size={22} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">API Keys & Endpoints</CardTitle>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">Primary Math Engine URL</Label>
                            <div className="flex gap-3">
                                <input
                                    disabled
                                    value="https://api.kyrios.ai/v1/compute"
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-3 rounded-2xl font-mono text-xs text-zinc-500 focus-visible:ring-1 focus-visible:ring-primary"
                                />
                                <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest h-12 px-6">
                                    Rotate Key
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        variant="ghost"
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-8"
                    >
                        Discard Changes
                    </Button>
                    <Button className="rounded-2xl font-black uppercase tracking-widest bg-primary hover:bg-orange-600 h-11 px-8 gap-2">
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}