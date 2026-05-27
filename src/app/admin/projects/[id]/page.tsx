"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";

import {
  Code2,
  Layers,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Trash2,
  Pencil,
} from "lucide-react";

const toArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const cleanValue = value.trim();

    if (!cleanValue) return [];

    try {
      const parsed = JSON.parse(cleanValue);

      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {}

    return cleanValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const commaTextToArray = (value: string): string[] => {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const lineTextToArray = (value: string): string[] => {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [technologiesText, setTechnologiesText] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");

  const [currentImage, setCurrentImage] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProject();
  }, []);

  const fillForm = (data: any) => {
    setTitle(data?.title || "");
    setDescription(data?.description || "");
    setLiveUrl(data?.live_url || "");
    setGithubUrl(data?.github_url || "");
    setImageUrl(data?.image_url || "");

    setTechnologiesText(toArray(data?.technologies).join(", "));
    setFeaturesText(toArray(data?.key_features).join("\n"));
    setImageUrlsText(toArray(data?.image_urls).join("\n"));
  };

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el proyecto.",
        icon: "error",
        background: "#101010",
        color: "#fff",
      });

      router.push("/admin/projects");
      return;
    }

    setProject(data);
    fillForm(data);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar proyecto?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#101010",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#27272a",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (!error) {
      await Swal.fire({
        title: "Eliminado",
        text: "El proyecto fue eliminado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#101010",
        color: "#fff",
      });

      router.push("/admin/projects");
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el proyecto. Revisa permisos RLS.",
        icon: "error",
        background: "#101010",
        color: "#fff",
      });
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "El título no puede estar vacío.",
        icon: "warning",
        background: "#101010",
        color: "#fff",
      });
      return;
    }

    if (!description.trim()) {
      Swal.fire({
        title: "Campo requerido",
        text: "La descripción no puede estar vacía.",
        icon: "warning",
        background: "#101010",
        color: "#fff",
      });
      return;
    }

    setSaving(true);

    const imageUrlsArray = lineTextToArray(imageUrlsText);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      live_url: liveUrl.trim() || null,
      github_url: githubUrl.trim() || null,
      technologies: commaTextToArray(technologiesText),
      key_features: lineTextToArray(featuresText),
      image_url: imageUrl.trim() || imageUrlsArray[0] || null,
      image_urls: imageUrlsArray.length > 0 ? imageUrlsArray : imageUrl.trim() ? [imageUrl.trim()] : [],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    setSaving(false);

    if (!error && data) {
      setProject(data);
      fillForm(data);
      setEditMode(false);

      Swal.fire({
        title: "Guardado",
        text: "El proyecto fue actualizado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        background: "#101010",
        color: "#fff",
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "No se pudo actualizar el proyecto. Revisa permisos o campos.",
        icon: "error",
        background: "#101010",
        color: "#fff",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        Cargando proyecto...
      </div>
    );
  }

  const tech = editMode
    ? commaTextToArray(technologiesText)
    : toArray(project.technologies);

  const features = editMode
    ? lineTextToArray(featuresText)
    : toArray(project.key_features);

  const galleryImagesFromProject = toArray(project.image_urls);

  const galleryImages =
    galleryImagesFromProject.length > 0
      ? galleryImagesFromProject
      : project.image_url
        ? [project.image_url]
        : [];

  const nextImage = () => {
    if (currentImage < galleryImages.length - 1) {
      setCurrentImage((prev) => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImage > 0) {
      setCurrentImage((prev) => prev - 1);
    }
  };

  const cancelEdit = () => {
    fillForm(project);
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white px-4 sm:px-6 md:px-8 lg:px-12 py-5 md:py-8">
      {/* LIGHTBOX */}
      <AnimatePresence>
        {previewOpen && galleryImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center px-4"
          >
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            >
              <X size={18} />
            </button>

            {currentImage > 0 && (
              <button
                onClick={prevImage}
                className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <ChevronLeft size={18} />
              </button>
            )}

            <motion.img
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={galleryImages[currentImage]}
              className="max-w-[92vw] max-h-[78vh] rounded-2xl object-contain"
            />

            {currentImage < galleryImages.length - 1 && (
              <button
                onClick={nextImage}
                className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACK */}
      <motion.button
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => router.push("/admin/projects")}
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition mb-6"
      >
        <ArrowLeft size={14} />
        Volver a proyectos
      </motion.button>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.92fr] gap-8 xl:gap-10 items-start">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          {editMode ? (
            <div className="mb-4">
              <label className="text-xs text-white/45">
                Título del proyecto
              </label>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 text-2xl md:text-4xl font-bold bg-transparent border-b border-white/15 w-full outline-none pb-2"
              />
            </div>
          ) : (
            <h1 className="text-[28px] sm:text-[34px] md:text-[42px] font-bold leading-tight tracking-tight mb-3">
              {project.title}
            </h1>
          )}

          <div className="w-16 h-[2px] rounded-full bg-white/20 mb-5" />

          {editMode ? (
            <div className="mb-6">
              <label className="text-xs text-white/45">
                Descripción
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-2 min-h-[130px] bg-[#111] border border-white/10 rounded-2xl p-4 text-sm outline-none resize-none"
              />
            </div>
          ) : (
            <p className="text-sm md:text-[13px] leading-7 text-white/60 text-justify mb-6">
              {project.description}
            </p>
          )}

          {/* STATS */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#101010] border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Code2 size={16} />
              </div>

              <div>
                <p className="text-lg font-semibold">{tech.length}</p>
                <p className="text-[11px] text-white/40">Tecnologías</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="bg-[#101010] border border-white/10 rounded-2xl px-4 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Layers size={16} />
              </div>

              <div>
                <p className="text-lg font-semibold">{features.length}</p>
                <p className="text-[11px] text-white/40">Características</p>
              </div>
            </motion.div>
          </div>

          {/* LINKS */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
            {editMode ? (
              <>
                <div className="w-full sm:w-[260px]">
                  <input
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="URL del proyecto en vivo"
                    className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 w-full outline-none text-sm"
                  />

                  <p className="mt-1 text-[10px] text-white/25">
                    Ejemplo: https://mi-proyecto.vercel.app
                  </p>
                </div>

                <div className="w-full sm:w-[260px]">
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="URL de GitHub"
                    className="bg-[#111] border border-white/10 rounded-xl px-4 py-3 w-full outline-none text-sm"
                  />

                  <p className="mt-1 text-[10px] text-white/25">
                    Opcional. Déjalo vacío si no tienes repositorio.
                  </p>
                </div>
              </>
            ) : (
              <>
                {project.live_url ? (
                  <a
                    href={project.live_url}
                    target="_blank"
                    className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl bg-[#101010] border border-white/10 hover:bg-white/5 transition"
                  >
                    <ExternalLink size={15} />
                    <span className="text-sm">Ver proyecto</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl bg-[#101010] border border-white/10 text-white/45">
                    <ExternalLink size={15} />
                    <span className="text-sm">Sin enlace</span>
                  </div>
                )}

                {project.github_url ? (
                  <a
                    href={project.github_url}
                    target="_blank"
                    className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl bg-[#101010] border border-white/10 hover:bg-white/5 transition"
                  >
                    <GitBranch size={15} />
                    <span className="text-sm">GitHub</span>
                  </a>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2 px-4 py-3 rounded-xl bg-[#101010] border border-white/10 text-white/45">
                    <GitBranch size={15} />
                    <span className="text-sm">Sin GitHub</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* TECH STACK */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <Code2 size={15} className="text-white/70" />
              <p className="text-sm font-semibold">Tecnologías usadas</p>
            </div>

            {editMode ? (
              <div>
                <input
                  value={technologiesText}
                  onChange={(e) => setTechnologiesText(e.target.value)}
                  placeholder="React, Next.js, Supabase"
                  className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
                />

                <p className="mt-1 text-[10px] text-white/25">
                  Sepáralas con comas. Ejemplo: React, Next.js, Supabase
                </p>
              </div>
            ) : tech.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tech.map((t: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-2 rounded-xl bg-[#101010] border border-white/10 text-[11px] text-white/75"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/35">
                No hay tecnologías registradas.
              </p>
            )}
          </div>

          {/* IMAGE URL EDIT */}
          {editMode && (
            <div className="mb-7">
              <label className="text-xs text-white/45">
                Imagen principal
              </label>

              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL de imagen principal"
                className="w-full mt-2 bg-[#111] border border-white/10 rounded-xl px-4 py-3 outline-none text-sm"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Puedes pegar una URL de imagen. Si está vacío, se usará la primera imagen de la galería.
              </p>
            </div>
          )}
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          {/* GALLERY */}
          {galleryImages.length > 0 && (
            <div className="mb-6 xl:max-w-[520px] xl:ml-auto">
              <div className="relative rounded-[28px] overflow-hidden border border-white/10 bg-[#101010] shadow-[0_0_40px_rgba(255,255,255,0.03)]">
                <motion.img
                  key={currentImage}
                  initial={{
                    opacity: 0.5,
                    scale: 1.02,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                  src={galleryImages[currentImage]}
                  onClick={() => setPreviewOpen(true)}
                  className="w-full h-[200px] sm:h-[240px] md:h-[270px] xl:h-[280px] 2xl:h-[300px] object-cover cursor-pointer"
                />

                {currentImage > 0 && (
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center"
                  >
                    <ChevronLeft size={17} />
                  </button>
                )}

                {currentImage < galleryImages.length - 1 && (
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center"
                  >
                    <ChevronRight size={17} />
                  </button>
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {galleryImages.map((_: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`transition-all rounded-full ${
                        currentImage === i
                          ? "w-7 h-2 bg-white"
                          : "w-2 h-2 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {editMode && (
            <div className="mb-6 xl:max-w-[520px] xl:ml-auto">
              <label className="text-xs text-white/45">
                URLs de galería
              </label>

              <textarea
                value={imageUrlsText}
                onChange={(e) => setImageUrlsText(e.target.value)}
                placeholder={`https://imagen-1.jpg\nhttps://imagen-2.jpg`}
                className="w-full mt-2 min-h-[120px] bg-[#111] border border-white/10 rounded-2xl p-4 text-sm outline-none resize-none"
              />

              <p className="mt-1 text-[10px] text-white/25">
                Escribe una URL por línea. La primera se puede usar como portada.
              </p>
            </div>
          )}

          {/* FEATURES */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-[#101010] border border-white/10 rounded-3xl p-5 md:p-6 xl:max-w-[520px] xl:ml-auto"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={15} className="text-white/70" />
              <p className="text-sm font-semibold">
                Características principales
              </p>
            </div>

            {editMode ? (
              <div>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder={`Consulta de datos públicos\nValidación RENIEC\nInterfaz responsive`}
                  className="w-full min-h-[160px] bg-[#0f0f0f] border border-white/10 rounded-xl p-4 outline-none text-sm resize-none"
                />

                <p className="mt-1 text-[10px] text-white/25">
                  Escribe una característica por línea.
                </p>
              </div>
            ) : features.length > 0 ? (
              <ul className="space-y-3 text-sm text-white/65 leading-6">
                {features.map((f: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-white/35 mt-[2px]">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-white/35">
                No hay características registradas.
              </p>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10">
        {editMode ? (
          <>
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white text-black font-medium hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              onClick={cancelEdit}
              disabled={saving}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditMode(true)}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 transition flex items-center justify-center gap-2"
            >
              <Pencil size={16} />
              Editar
            </button>

            <button
              onClick={handleDelete}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-red-500 hover:bg-red-600 transition flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
