"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/app/admin/Sidebar";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Pencil, X, Upload, Link as LinkIcon } from "lucide-react";
import Swal from "sweetalert2";

export default function TechStackPage() {
  const [techStacks, setTechStacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTechStacks();

    const channel = supabase
      .channel("techstack-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tech_stack",
        },
        () => {
          fetchTechStacks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTechStacks = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tech_stack")
      .select("*");

    if (!error) {
      const sorted = (data || []).sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );

      setTechStacks(sorted);
    }

    setLoading(false);
  };

  const resetForm = () => {
    setName("");
    setLogo(null);
    setLogoUrl("");
    setPreview("");
    setEditId(null);
  };

  const cleanFileName = (fileName: string) => {
    const extension = fileName.split(".").pop() || "png";

    const cleanName = fileName
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()
      .slice(0, 60);

    return `tech-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${cleanName}.${extension}`;
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLogo(file);
    setLogoUrl("");
    setPreview(URL.createObjectURL(file));
  };

  const handleLogoUrlChange = (value: string) => {
    setLogoUrl(value);
    setLogo(null);
    setPreview(value);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "Escribe el nombre de la tecnología.",
        icon: "warning",
        background: "#111",
        color: "#fff",
      });
      return;
    }

    setSaving(true);

    try {
      let finalLogoUrl = logoUrl.trim() || preview || "";

      if (logo) {
        const fileName = cleanFileName(logo.name);

        const { error: uploadError } = await supabase.storage
          .from("tech-stack")
          .upload(fileName, logo, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Error subiendo logo:", uploadError);

          Swal.fire({
            title: "Error",
            text: "No se pudo subir el logo. Revisa el bucket tech-stack o sus permisos.",
            icon: "error",
            background: "#111",
            color: "#fff",
          });

          setSaving(false);
          return;
        }

        const { data } = supabase.storage
          .from("tech-stack")
          .getPublicUrl(fileName);

        finalLogoUrl = data.publicUrl;
      }

      if (editId) {
        const { error } = await supabase
          .from("tech_stack")
          .update({
            name: name.trim(),
            logo_url: finalLogoUrl || null,
          })
          .eq("id", editId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("tech_stack").insert([
          {
            name: name.trim(),
            logo_url: finalLogoUrl || null,
          },
        ]);

        if (error) throw error;
      }

      setSaving(false);
      setOpen(false);
      resetForm();
      fetchTechStacks();

      Swal.fire({
        title: "Guardado",
        text: "La tecnología se guardó correctamente.",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
        background: "#111",
        color: "#fff",
      });
    } catch (error) {
      console.error("Error guardando tecnología:", error);

      setSaving(false);

      Swal.fire({
        title: "Error",
        text: "No se pudo guardar la tecnología. Revisa permisos o campos.",
        icon: "error",
        background: "#111",
        color: "#fff",
      });
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "¿Eliminar tecnología?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#111",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("tech_stack")
      .delete()
      .eq("id", id);

    if (!error) {
      setTechStacks((prev) =>
        prev.filter((item) => item.id !== id)
      );

      Swal.fire({
        title: "Eliminado",
        text: "La tecnología fue eliminada correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#111",
        color: "#fff",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar la tecnología.",
        icon: "error",
        background: "#111",
        color: "#fff",
      });
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setName(item.name || "");
    setLogo(null);
    setLogoUrl(item.logo_url || "");
    setPreview(item.logo_url || "");
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* SIDEBAR */}
      <div className="fixed left-0 top-0 h-screen z-40">
        <Sidebar />
      </div>

      {/* MAIN */}
      <main className="ml-0 lg:ml-[250px] min-h-screen">
        <div className="px-4 sm:px-6 md:px-8 pt-28 lg:pt-8 pb-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Tecnologías
              </h1>

              <p className="text-sm text-white/40 mt-1">
                Administra los lenguajes, frameworks y herramientas de tu portafolio
              </p>
            </div>

            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black hover:scale-[1.02] transition"
            >
              <Plus size={16} />
              Agregar tecnología
            </button>
          </div>

          {/* GRID */}
          {loading ? (
            <div className="text-white/40 text-sm">
              Cargando tecnologías...
            </div>
          ) : techStacks.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] h-[220px] flex items-center justify-center text-white/35 text-sm">
              No hay tecnologías registradas
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {techStacks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 hover:border-white/20 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {item.logo_url ? (
                        <img
                          src={item.logo_url}
                          alt={item.name}
                          className="w-full h-full object-contain p-2"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-white/[0.03] flex items-center justify-center text-[10px] text-white/30">
                          Sin logo
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-3">
                      <button
                        onClick={() => handleEdit(item)}
                        title="Editar tecnología"
                        className="w-9 h-9 rounded-xl border border-white/10 hover:bg-white/10 flex items-center justify-center transition"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        title="Eliminar tecnología"
                        className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-center hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-[14px] sm:text-[15px] font-medium break-words leading-relaxed">
                    {item.name}
                  </h2>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-[#111] border border-white/10 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold">
                {editId ? "Editar tecnología" : "Agregar tecnología"}
              </h2>

              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* NAME */}
            <div className="mb-4">
              <label className="text-xs text-white/50">
                Nombre de la tecnología
              </label>

              <input
                placeholder="Ejemplo: React"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none text-sm"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Escribe el nombre del lenguaje, framework o herramienta.
              </p>
            </div>

            {/* LOGO URL */}
            <div className="mb-4">
              <label className="text-xs text-white/50">
                URL del logo
              </label>

              <div className="relative mt-2">
                <LinkIcon
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                />

                <input
                  placeholder="https://cdn.jsdelivr.net/..."
                  value={logoUrl}
                  onChange={(e) => handleLogoUrlChange(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0f0f0f] border border-white/10 outline-none text-sm"
                />
              </div>

              <p className="mt-1 text-[10px] text-white/25">
                Puedes pegar un enlace de logo SVG o
