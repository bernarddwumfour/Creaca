"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRightCircle, Loader2, Mail, MessageCircle, User } from "lucide-react";
import { toast } from "sonner";

import api from "@/lib/axios";
import { ENDPOINTS } from "@/lib/endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ContactCopy = {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitButton: string;
  privacyNote: string;
  privacyLink: string;
};

export function ContactForm({ lang, copy }: { lang: string; copy: ContactCopy }) {
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    try {
      await api.post(ENDPOINTS.PLATFORM.CONTACT, {
        name: form.get("name"),
        email: form.get("email"),
        message: form.get("message"),
      });
      event.currentTarget.reset();
      toast.success("Your message has been sent.");
    } catch {
      toast.error("We could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="relative space-y-6 rounded-3xl border border-slate-100 bg-white/80 p-8 shadow-xl backdrop-blur-2xl dark:border-white/5 dark:bg-[#111114]/80">
      <h3 className="text-2xl font-black text-zinc-900 dark:text-white md:text-3xl">{copy.title}</h3>
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-black">{copy.nameLabel}</span>
        <span className="relative block">
          <Input required name="name" minLength={2} maxLength={100} className="h-12 pr-10" placeholder={copy.namePlaceholder} />
          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        </span>
      </label>
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-black">{copy.emailLabel}</span>
        <span className="relative block">
          <Input required name="email" type="email" maxLength={254} className="h-12 pr-10" placeholder={copy.emailPlaceholder} />
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        </span>
      </label>
      <label className="block space-y-2">
        <span className="ml-1 text-sm font-black">{copy.messageLabel}</span>
        <span className="relative block">
          <Textarea required name="message" minLength={10} maxLength={5000} className="min-h-32 pr-10" placeholder={copy.messagePlaceholder} />
          <MessageCircle className="absolute right-4 top-5 text-zinc-400" size={18} />
        </span>
      </label>
      <Button disabled={submitting} size="lg" className="w-full rounded-full py-6 font-bold">
        {submitting ? <Loader2 className="animate-spin" /> : <>{copy.submitButton}<ArrowRightCircle className="ml-2" /></>}
      </Button>
      <p className="text-center text-xs text-zinc-500">
        {copy.privacyNote}{" "}
        <Link className="font-bold underline" href={`/${lang}/privacy`}>{copy.privacyLink}</Link>.
      </p>
    </form>
  );
}
