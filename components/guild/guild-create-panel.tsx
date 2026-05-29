"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNightmareLocale } from "@/components/site/use-nightmare-locale";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import type { GuildSummary } from "./guild-types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type GuildCreatePanelProps = {
  compact?: boolean;
};

export function GuildCreatePanel({ compact = false }: GuildCreatePanelProps) {
  const router = useRouter();
  const { dictionary } = useNightmareLocale();
  const t = dictionary.guild.create;
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [server, setServer] = useState("Nidhogg");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const computedSlug = useMemo(() => slugify(name), [name]);
  const resolvedSlug = slug || computedSlug;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/guilds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          slug: resolvedSlug,
          description: description || undefined,
          server: server || undefined,
        }),
      });

      if (response.status === 401) {
        router.replace("/login?next=/profile");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to create guild");
      }

      const payload = (await response.json()) as { guild: GuildSummary };
      router.replace(`/guilds/${payload.guild.slug}`);
    } catch {
      setMessage(t.error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Panel
      as="section"
      className={compact ? "guild-create-panel compact" : "guild-create-panel"}
    >
      <SectionHeading
        align="left"
        className="guild-create-header"
        eyebrow={t.kicker}
        title={t.title}
        description={t.description}
      />

      <form className="guild-create-form" onSubmit={handleSubmit}>
        <label>
          {t.nameLabel}
          <input
            maxLength={80}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <label>
          {t.slugLabel}
          <input
            maxLength={64}
            minLength={2}
            onChange={(event) => setSlug(slugify(event.target.value))}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            required
            value={resolvedSlug}
          />
          <small>{t.slugHint}</small>
        </label>
        <label>
          {t.serverLabel}
          <Select onChange={(event) => setServer(event.target.value)} value={server}>
            <option value="Freya">Freya</option>
            <option value="Nidhogg">Nidhogg</option>
          </Select>
        </label>
        <label>
          {t.descriptionLabel}
          <input
            maxLength={240}
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
        <Button
          className="guild-primary-button guild-create-submit"
          disabled={isSaving}
          icon={<Plus size={16} />}
          type="submit"
        >
          {isSaving ? t.creating : t.submit}
        </Button>
      </form>

      {message && <p className="guild-inline-message">{message}</p>}
    </Panel>
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
