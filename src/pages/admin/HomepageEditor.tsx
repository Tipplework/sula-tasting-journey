import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  getSiteSettings,
  upsertSiteSettings,
  listSections,
  createSection,
  updateSection,
  deleteSection,
  type SiteSettings,
  type HomepageSection,
} from "@/lib/content/homepage";
import { listContentItems } from "@/lib/content/api";
import type { ContentItem } from "@/lib/content/types";

const SECTION_TYPES = [
  { value: "featured", label: "Featured grid" },
  { value: "collection", label: "Collection grid" },
  { value: "editorial", label: "Editorial (large cards)" },
  { value: "cta", label: "CTA band" },
];

export default function HomepageEditor() {
  const nav = useNavigate();
  const [settings, setSettings] = useState<Partial<SiteSettings>>({});
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [s, secs, its] = await Promise.all([
        getSiteSettings(),
        listSections(true),
        listContentItems(true),
      ]);
      setSettings(s ?? {});
      setSections(secs);
      setItems(its);
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      await upsertSiteSettings(settings);
      toast.success("Hero saved");
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  }

  async function addSection() {
    try {
      const newSec = await createSection({
        section_type: "featured",
        title: "New section",
        sort_order: sections.length,
        enabled: true,
        item_slugs: [],
      });
      setSections((s) => [...s, newSec]);
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function saveSection(sec: HomepageSection) {
    try {
      const updated = await updateSection(sec.id, sec);
      setSections((arr) => arr.map((s) => (s.id === sec.id ? updated : s)));
      toast.success("Section saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function removeSection(id: string) {
    if (!confirm("Delete this section?")) return;
    try {
      await deleteSection(id);
      setSections((arr) => arr.filter((s) => s.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <Link to="/content-center" className="text-xs text-muted-foreground hover:text-foreground">← Content Center</Link>
            <h1 className="text-xl font-light tracking-tight mt-1">Editorial Homepage</h1>
            <p className="text-xs text-muted-foreground mt-1">pdfs.discoversula.com landing page</p>
          </div>
          <div className="flex gap-2">
            <a href="/?lib=1" target="_blank" rel="noreferrer"><Button size="sm" variant="ghost">Preview</Button></a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            {/* HERO */}
            <section className="space-y-4 border rounded-md p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Hero</h2>
                <Button size="sm" onClick={saveSettings} disabled={saving}>
                  {saving ? "Saving…" : "Save hero"}
                </Button>
              </div>
              <Field label="Eyebrow">
                <Input value={settings.hero_eyebrow ?? ""} onChange={(e) => setSettings({ ...settings, hero_eyebrow: e.target.value })} />
              </Field>
              <Field label="Title">
                <Input value={settings.hero_title ?? ""} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} />
              </Field>
              <Field label="Subtitle">
                <Textarea rows={2} value={settings.hero_subtitle ?? ""} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} />
              </Field>
              <Field label="Background image URL">
                <Input value={settings.hero_image_url ?? ""} onChange={(e) => setSettings({ ...settings, hero_image_url: e.target.value })} placeholder="https://…" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CTA label">
                  <Input value={settings.hero_cta_label ?? ""} onChange={(e) => setSettings({ ...settings, hero_cta_label: e.target.value })} />
                </Field>
                <Field label="CTA URL">
                  <Input value={settings.hero_cta_url ?? ""} onChange={(e) => setSettings({ ...settings, hero_cta_url: e.target.value })} />
                </Field>
              </div>
              <div className="pt-4 border-t space-y-3">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground">SEO</h3>
                <Field label="Meta title">
                  <Input value={settings.meta_title ?? ""} onChange={(e) => setSettings({ ...settings, meta_title: e.target.value })} />
                </Field>
                <Field label="Meta description">
                  <Textarea rows={2} value={settings.meta_description ?? ""} onChange={(e) => setSettings({ ...settings, meta_description: e.target.value })} />
                </Field>
                <Field label="OG image URL">
                  <Input value={settings.og_image_url ?? ""} onChange={(e) => setSettings({ ...settings, og_image_url: e.target.value })} />
                </Field>
              </div>
            </section>

            {/* SECTIONS */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">Sections</h2>
                <Button size="sm" onClick={addSection}>Add section</Button>
              </div>
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground border border-dashed rounded-md p-6 text-center">
                  No sections yet. The library will show a default grid of all published items.
                </p>
              )}
              <div className="space-y-4">
                {sections.map((sec) => (
                  <SectionRow
                    key={sec.id}
                    sec={sec}
                    items={items}
                    onChange={(patch) => setSections((arr) => arr.map((s) => (s.id === sec.id ? { ...s, ...patch } : s)))}
                    onSave={() => saveSection(sec)}
                    onDelete={() => removeSection(sec.id)}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function SectionRow({
  sec,
  items,
  onChange,
  onSave,
  onDelete,
}: {
  sec: HomepageSection;
  items: ContentItem[];
  onChange: (patch: Partial<HomepageSection>) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const toggleItem = (slug: string) => {
    const set = new Set(sec.item_slugs);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    onChange({ item_slugs: Array.from(set) });
  };

  return (
    <div className="border rounded-md p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="uppercase text-[10px]">{sec.section_type}</Badge>
          {sec.enabled ? <Badge className="text-[10px]">Enabled</Badge> : <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs">
            <Switch checked={sec.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
            Enabled
          </label>
          <Button size="sm" variant="ghost" onClick={onDelete}>Delete</Button>
          <Button size="sm" onClick={onSave}>Save</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            value={sec.section_type}
            onChange={(e) => onChange({ section_type: e.target.value })}
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
          >
            {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Order">
          <Input type="number" value={sec.sort_order} onChange={(e) => onChange({ sort_order: Number(e.target.value) })} />
        </Field>
      </div>

      <Field label="Title">
        <Input value={sec.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
      </Field>
      <Field label="Subtitle / eyebrow">
        <Input value={sec.subtitle ?? ""} onChange={(e) => onChange({ subtitle: e.target.value })} />
      </Field>

      {sec.section_type === "cta" && (
        <Field label="Background image URL">
          <Input value={sec.image_url ?? ""} onChange={(e) => onChange({ image_url: e.target.value })} />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA label">
          <Input value={sec.cta_label ?? ""} onChange={(e) => onChange({ cta_label: e.target.value })} />
        </Field>
        <Field label="CTA URL">
          <Input value={sec.cta_url ?? ""} onChange={(e) => onChange({ cta_url: e.target.value })} />
        </Field>
      </div>

      {sec.section_type !== "cta" && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Items in this section</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-auto border rounded-md p-2">
            {items.map((it) => {
              const active = sec.item_slugs.includes(it.slug);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggleItem(it.slug)}
                  className={`text-left text-xs p-2 rounded border transition ${active ? "border-foreground bg-foreground/5" : "border-transparent hover:border-border"}`}
                >
                  <div className="truncate font-medium">{it.title}</div>
                  <div className="truncate text-muted-foreground">/c/{it.slug}</div>
                </button>
              );
            })}
            {items.length === 0 && <p className="text-xs text-muted-foreground col-span-full p-2">No content yet.</p>}
          </div>
          <p className="text-[11px] text-muted-foreground">Selected order matches the order you click. Re-toggle to reorder.</p>
        </div>
      )}
    </div>
  );
}
