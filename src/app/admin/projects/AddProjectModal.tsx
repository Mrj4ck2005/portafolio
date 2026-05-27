"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Upload, X } from "lucide-react";

export default function AddProjectModal({
  isOpen,
  onClose,
  onAdd,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [live, setLive] = useState("");
  const [github, setGithub] = useState("");
  const [tech, setTech] = useState("");
  const [features, setFeatures] = useState("");

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const textToArray = (value: string) => {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const linesToArray = (value: string) => {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const cleanFileName = (fileName: string) => {
    const extension = fileName.split(".").pop() || "jpg";

    const cleanName = fileName
      .replace(/\.[^/.]+$/, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase()
      .slice(0, 60);

    return `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${cleanName}.${extension}`;
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    const urls = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews((prev) => [...prev, ...urls]);
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setLive("");
    setGithub("");
    setTech("");
    setFeatures("");
    setImages([]);
    setPreviews([]);
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) {
      return showToast("El título del proyecto es obligatorio.");
    }

    if (!desc.trim()) {
      return showToast("La descripción del proyecto es obligatoria.");
    }

    if (!tech.trim()) {
      return showToast("Agrega al menos una tecnología.");
    }

    if (!features.trim()) {
      return showToast("Agrega al menos una característica.");
    }

    if (images.length === 0) {
      return showToast("Sube al menos una imagen del proyecto.");
    }

    setLoading(true);

    try {
      const technologiesArray = textToArray(tech);
      const featuresArray = linesToArray(features);
      const uploadedUrls: string[] = [];

      for (const image of images) {
        const fileName = cleanFileName(image.name);

        const { error: uploadError } =
          await supabase.storage
            .from("projects")
            .upload(fileName, image, {
              cacheControl: "3600",
              upsert: false,
            });

        if (uploadError) {
          console.error("Error subiendo imagen:", uploadError);
          showToast("No se pudo subir una imagen. Revisa Storage.");
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("projects")
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }

      const projectPayload = {
        title: title.trim(),
        description: desc.trim(),
        live_url: live.trim() || null,
        github_url: github.trim() || null,
        technologies: technologiesArray,
        key_features: featuresArray,
        image_url: uploadedUrls[0] || null,
        image_urls: uploadedUrls,
      };

      const { data, error } = await supabase
        .from("projects")
        .insert([projectPayload])
        .select()
        .single();

      if (error) {
        console.error("Error guardando proyecto:", error);
        showToast(
          "No se pudo guardar el proyecto. Revisa los campos o permisos."
        );
        setLoading(false);
        return;
      }

      onAdd(data);
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error inesperado:", error);
      showToast("Ocurrió un error inesperado.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-md flex items-center justify-center px-3 sm:px-6 py-6">
      {toast && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-xl text-sm shadow-lg z-50 max-w-[90vw] text-center">
          {toast}
        </div>
      )}

      <div className="w-full max-w-[820px] bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="px-4 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-semibold">
              Agregar proyecto
            </h2>

            <p className="text-[11px] sm:text-xs text-white/40 mt-1">
              Completa la información para mostrarlo en tu portafolio
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        >
          {/* TITLE + UPLOAD */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_150px] gap-4">
            {/* TITLE */}
            <div>
              <label className="text-xs text-white/50">
                Título del proyecto
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Ejemplo: ValidaPE"
                className="w-full mt-2 px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Escribe el nombre principal que aparecerá en el portafolio.
              </p>
            </div>

            {/* UPLOAD */}
            <div>
              <label className="text-xs text-white/50 block mb-2">
                Imágenes
              </label>

              <label className="h-[86px] border border-dashed border-white/15 rounded-2xl bg-[#111] hover:bg-[#151515] transition flex flex-col items-center justify-center cursor-pointer">
                <Upload
                  size={18}
                  className="mb-1 text-white/50"
                />

                <span className="text-[11px] text-white/60">
                  Subir imágenes
                </span>

                <input
                  type="file"
                  multiple
                  hidden
                  accept="image/*"
                  onChange={handleImages}
                />
              </label>

              <p className="mt-1 text-[10px] text-white/25">
                La primera imagen será la portada del proyecto.
              </p>
            </div>
          </div>

          {/* PREVIEW */}
          {previews.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {previews.map((img, i) => (
                <div
                  key={i}
                  className="relative rounded-2xl overflow-hidden border border-white/10"
                >
                  <img
                    src={img}
                    alt={`Vista previa ${i + 1}`}
                    className="w-full h-24 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black rounded-full p-1.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* DESCRIPTION */}
          <div>
            <label className="text-xs text-white/50">
              Descripción
            </label>

            <textarea
              value={desc}
              onChange={(e) =>
                setDesc(e.target.value)
              }
              placeholder="Describe brevemente qué hace tu proyecto..."
              className="w-full mt-2 px-4 py-3 min-h-[110px] bg-[#111] border border-white/10 rounded-2xl outline-none resize-none text-sm"
            />

            <p className="mt-1 text-[10px] text-white/25">
              Explica el propósito del proyecto y qué problema resuelve.
            </p>
          </div>

          {/* URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <input
                placeholder="URL del proyecto en vivo"
                value={live}
                onChange={(e) =>
                  setLive(e.target.value)
                }
                className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Ejemplo: https://mi-proyecto.vercel.app
              </p>
            </div>

            <div>
              <input
                placeholder="URL de GitHub"
                value={github}
                onChange={(e) =>
                  setGithub(e.target.value)
                }
                className="w-full px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Opcional. Puedes dejarlo vacío si no tienes repositorio público.
              </p>
            </div>
          </div>

          {/* TECH */}
          <div>
            <label className="text-xs text-white/50">
              Tecnologías usadas
            </label>

            <input
              placeholder="React, Next.js, Supabase, Tailwind CSS"
              value={tech}
              onChange={(e) =>
                setTech(e.target.value)
              }
              className="w-full mt-2 px-4 py-3 bg-[#111] border border-white/10 rounded-2xl outline-none text-sm"
            />

            <p className="mt-1 text-[10px] text-white/25">
              Sepáralas con comas. Ejemplo: React, Next.js, Supabase
            </p>
          </div>

          {/* FEATURES */}
          <div>
            <label className="text-xs text-white/50">
              Características principales
            </label>

            <textarea
              placeholder={`Consulta de datos públicos\nValidación RENIEC\nValidación SUNAT\nInterfaz responsive`}
              value={features}
              onChange={(e) =>
                setFeatures(e.target.value)
              }
              className="w-full mt-2 px-4 py-3 min-h-[120px] bg-[#111] border border-white/10 rounded-2xl outline-none resize-none text-sm"
            />

            <p className="mt-1 text-[10px] text-white/25">
              Escribe una característica por línea. Cada línea se guardará como un punto separado.
            </p>
          </div>

          {/* ACTION */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition text-sm"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-black font-medium hover:opacity-90 transition text-sm disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Guardar proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
