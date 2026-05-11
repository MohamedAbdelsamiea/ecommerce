"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

type Props = {
  user: { id: string; name: string | null; email: string };
};

export function ProfileForm({ user }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(user.name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast(data.error || "Failed to update profile", "destructive");
        return;
      }

      toast("Profile updated", "success");
      router.refresh();
    } catch {
      toast("Something went wrong", "destructive");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="text-lg font-semibold mb-1">Edit Profile</h3>
      <p className="text-sm text-muted-foreground mb-5">Update your account name</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email} disabled className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
        </div>
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
