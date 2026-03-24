'use client';

import React from 'react';
import { Save, Database, Globe, Key, BellRing, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight uppercase">System Settings</h1>
                <p className="text-zinc-500 font-medium">Configure global parameters and AI engine behavior.</p>
            </div>

            <div className="grid gap-6">
                {/* AI Model Config */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="text-primary" size={20} />
                            <CardTitle className="text-lg font-black">AI Engine Configuration</CardTitle>
                        </div>
                        <CardDescription>Toggle features and model versions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Beta: GPT-4o Integration</Label>
                                <p className="text-xs text-zinc-500">Enable advanced reasoning for complex proofs.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold">Auto-Correction</Label>
                                <p className="text-xs text-zinc-500">AI automatically fixes minor LaTeX formatting errors.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </CardContent>
                </Card>

                {/* API & Infrastructure */}
                <Card className="border-none shadow-sm dark:bg-[#111114]">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Key className="text-primary" size={20} />
                            <CardTitle className="text-lg font-black">API Keys & Endpoints</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-zinc-500">Primary Math Engine URL</Label>
                            <div className="flex gap-2">
                                <input
                                    disabled
                                    value="https://api.kyrios.ai/v1/compute"
                                    className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-none px-4 py-2 rounded-lg font-mono text-xs text-zinc-400"
                                />
                                <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase">Rotate Key</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button variant="ghost" className="font-bold">Discard Changes</Button>
                    <Button className="font-bold px-8 bg-primary hover:bg-orange-600 rounded-xl gap-2">
                        <Save size={18} /> Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}