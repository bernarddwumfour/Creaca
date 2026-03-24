'use client';

import React from 'react';
import {
    MoreVertical,
    UserPlus,
    Mail,
    ShieldCheck,
    Activity,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const DUMMY_USERS = [
    { id: 1, name: "Bernard Nyanteh", email: "bernard@kyrios.ai", role: "Admin", status: "Active", mastery: "98%", focus: "Linear Algebra" },
    { id: 2, name: "Alice Dupont", email: "alice.d@univ.fr", role: "Student", status: "Active", mastery: "72%", focus: "Calculus III" },
    { id: 3, name: "Carlos Mendez", email: "c.mendez@tec.mx", role: "Student", status: "Idle", mastery: "45%", focus: "Probability" },
    { id: 4, name: "Jane Smith", email: "jane@mit.edu", role: "Tutor", status: "Active", mastery: "91%", focus: "Abstract Algebra" },
];

export default function UserManagement() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">User Directory</h1>
                    <p className="text-zinc-500 font-medium">Manage students and academic permissions.</p>
                </div>
                <Button className="rounded-xl font-bold gap-2">
                    <UserPlus size={18} /> Invite User
                </Button>
            </div>

            <Card className="border-none shadow-sm dark:bg-[#111114] overflow-hidden">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 text-zinc-400" size={18} />
                        <Input placeholder="Search by name, email or focus..." className="pl-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none" />
                    </div>
                </div>
                <CardContent className="p-0">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800">
                                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">User</th>
                                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Role</th>
                                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Status</th>
                                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Mastery</th>
                                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-widest">Focus</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {DUMMY_USERS.map((user) => (
                                <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{user.name}</span>
                                            <span className="text-xs text-zinc-500">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="rounded-lg font-bold text-[10px] uppercase">{user.role}</Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                                            <span className="text-sm font-medium">{user.status}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono font-bold text-primary">{user.mastery}</td>
                                    <td className="p-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">{user.focus}</td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}