/** Single-dish editor sheet for the Tasting Room menu CMS. */
import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AdminCategory,
  AdminItem,
  DIETARY_TAGS,
  ItemDraft,
  saveItem,
  uploadItemImage,
} from "@/lib/admin/menu/api";
import type { DietaryTag } from "@/data/tasting-room-menu";

const TAG_LABELS: Record<DietaryTag, string> = {
  vegetarian: "Vegetarian",
  non_vegetarian: "Non-vegetarian",
  vegan: "Vegan",
  seafood: "Seafood",
  gluten_free: "Gluten free",
  contains_dairy: "Contains dairy",
  contains_nuts: "Contains nuts",
};

const num = (v: string) => (v.trim() === "" ? null : Number(v));

interface Props {
  item: AdminItem | null;
  categories: AdminCategory[];
  defaultCategoryId: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function MenuItemEditor({
  item,
  categories,
  defaultCategoryId,
  onClose,
  onSaved,
}: Props) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(item?.category_id ?? defaultCategoryId);
  const [calories, setCalories] = useState(item?.calories?.toString() ?? "");
  const [standard, setStandard] = useState(item?.standard_price?.toString() ?? "");
  const [glass, setGlass] = useState(item?.glass_price?.toString() ?? "");
  const [bottle, setBottle] = useState(item?.bottle_price?.toString() ?? "");
  const [smaller, setSmaller] = useState(item?.smaller_bottle_price?.toString() ?? "");
  const [pairing, setPairing] = useState(item?.pairing_text ?? "");
  const [tags, setTags] = useState<DietaryTag[]>(item?.tags ?? []);
  const [active, setActive] = useState(item?.active ?? true);
  const [unavailable, setUnavailable] = useState(item?.unavailable ?? false);
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? null);
  const [imagePath, setImagePath] = useState(item?.image_path ?? null);
  const [imageAlt, setImageAlt] = useState(item?.image_alt ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrl = imageUrl ?? foodImageFor(name, itemSlug(name));


  async function pickImage(file: File) {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Please use a photo under 8 MB");
      return;
    }
    setUploading(true);
    try {
      const { path, url } = await uploadItemImage(file, name || "dish");
      setImagePath(path);
      setImageUrl(url);
      toast.success("Photo uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!name.trim()) {
      toast.error("A dish needs a name");
      return;
    }
    const draft: ItemDraft = {
      name: name.trim(),
      description: description.trim() || null,
      calories: num(calories),
      standard_price: num(standard),
      glass_price: num(glass),
      bottle_price: num(bottle),
      smaller_bottle_price: num(smaller),
      pairing_text: pairing.trim() || null,
      category_id: categoryId,
      active,
      unavailable,
      image_url: imageUrl,
      image_path: imagePath,
      image_alt: imageAlt.trim() || null,
      tags,
    };
    setSaving(true);
    try {
      await saveItem(item?.id ?? null, draft);
      toast.success(item ? "Dish updated" : "Dish added");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-serif">
            {item ? "Edit dish" : "New dish"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Section</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Price (₹)</Label>
              <Input
                inputMode="numeric"
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Calories</Label>
              <Input
                inputMode="numeric"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Glass (₹)</Label>
              <Input
                inputMode="numeric"
                value={glass}
                onChange={(e) => setGlass(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Bottle (₹)</Label>
              <Input
                inputMode="numeric"
                value={bottle}
                onChange={(e) => setBottle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Small bottle (₹)</Label>
              <Input
                inputMode="numeric"
                value={smaller}
                onChange={(e) => setSmaller(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Pairing note</Label>
            <Input value={pairing} onChange={(e) => setPairing(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Dietary icons</Label>
            <div className="flex flex-wrap gap-1.5">
              {DIETARY_TAGS.map((tag) => {
                const on = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setTags(on ? tags.filter((t) => t !== tag) : [...tags, tag])
                    }
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      on
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photo</Label>
            {previewUrl ? (
              <div className="relative w-32">
                <img
                  src={previewUrl}
                  alt={imageAlt || name}
                  className="aspect-[4/5] w-32 rounded-md object-cover"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(null);
                      setImagePath(null);
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-background p-1 shadow"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {!imageUrl && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Built-in photo
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Portrait photos work best (4:5).
              </p>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void pickImage(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-4 w-4" />
              )}
              {imageUrl ? "Replace photo" : "Upload photo"}
            </Button>
            <Input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Photo description (accessibility)"
              className="mt-2"
            />
          </div>

          <div className="flex items-center gap-6 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={active} onCheckedChange={setActive} /> Live on menu
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={unavailable} onCheckedChange={setUnavailable} /> Sold out
            </label>
          </div>

          <div className="flex justify-end gap-2 pb-8">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
