import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { load(); }, []);
  const load = async () => {
    try { setSettings(await adminApi.getSettings()); } catch {} finally { setLoading(false); }
  };

  const updateField = (key: string, field: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast({ title: "Settings Saved" });
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  const fields = [
    { key: "store_name", label: "Store Name", field: "text", type: "text" },
    { key: "free_shipping_threshold", label: "Free Shipping Threshold (₹)", field: "amount", type: "number" },
    { key: "support_phone", label: "Support Phone", field: "text", type: "text" },
    { key: "newsletter_title", label: "Newsletter Title", field: "text", type: "text" },
    { key: "newsletter_subtitle", label: "Newsletter Subtitle", field: "text", type: "text" },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="font-heading font-bold text-xl text-white">Site Settings</h1><p className="text-white/30 text-xs">Configure global store settings</p></div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-5">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-white/40 text-xs mb-1.5 uppercase tracking-wider">{f.label}</label>
            <input
              type={f.type}
              value={settings[f.key]?.[f.field] ?? ""}
              onChange={e => updateField(f.key, f.field, f.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>
        ))}
        <div className="pt-4 border-t border-white/[0.06]">
          <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-primary to-orange-600 text-white font-semibold rounded-xl gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
