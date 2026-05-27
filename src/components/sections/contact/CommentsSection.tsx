'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Upload, Heart, Pin, CornerDownRight } from 'lucide-react'
import useComments from '@/hooks/useComments'

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: smoothEase,
    },
  },
}

type Reply = {
  username?: string
  message?: string
  created_at?: string
}

export default function CommentsSection() {
  const { comments, loading, addComment, likeComment } =
    useComments()

  const [name, setName] = useState('')
  const [comment, setComment] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleImage = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) return

    await addComment({
      name,
      comment,
      image,
    })

    setName('')
    setComment('')
    setImage(null)
    setPreview(null)
  }

  const formatDateTime = (date?: string) => {
    if (!date) return ''

    return new Date(date).toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.8,
        ease: smoothEase,
      }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] md:rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 h-full"
    >
      {/* HEADER */}
      <div className="mb-5 md:mb-6">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">
          Comentarios
        </h3>

        <p className="text-xs md:text-sm text-white/40">
          Deja tus ideas aquí
        </p>
      </div>

      {/* FORM */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="space-y-3 md:space-y-4 mb-5 md:mb-6"
      >
        <motion.input
          variants={itemVariants}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none focus:border-white"
        />

        <motion.textarea
          variants={itemVariants}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tu comentario"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none resize-none focus:border-white"
        />

        <motion.label
          variants={itemVariants}
          className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 md:p-4 flex items-center gap-3 cursor-pointer"
        >
          <Upload size={16} />

          <span className="text-xs md:text-sm text-white/65">
            Subir imagen
          </span>

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleImage}
          />
        </motion.label>

        <AnimatePresence>
          {preview && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={preview}
              alt="Vista previa"
              className="rounded-2xl h-36 md:h-44 w-full object-cover border border-white/10"
            />
          )}
        </AnimatePresence>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-2xl py-3 md:py-4 bg-white/10 border border-white/10 transition-all disabled:opacity-60"
        >
          {loading ? 'Publicando...' : 'Publicar comentario'}
        </motion.button>
      </motion.div>

      {/* COMMENTS LIST */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="rounded-[24px] md:rounded-[28px] border border-white/10 bg-black/20 p-3 h-[320px] md:h-[420px] overflow-y-auto custom-scroll"
      >
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.map((item, i) => {
              const replies: Reply[] = Array.isArray(item.replies)
                ? item.replies
                : []

              return (
                <motion.div
                  key={item.id || i}
                  layout
                  initial={{
                    opacity: 0,
                    y: 18,
                    scale: 0.96,
                    filter: 'blur(6px)',
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: smoothEase,
                    layout: {
                      duration: 0.45,
                      ease: smoothEase,
                    },
                  }}
                  className={`rounded-[20px] md:rounded-[24px] border p-3 md:p-4 ${
                    item.is_pinned
                      ? 'border-purple-500/30 bg-purple-500/5'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0">
                      {item.name?.charAt(0) || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="text-sm font-medium break-words">
                          {item.name || 'Usuario'}
                        </p>

                        {item.is_pinned && (
                          <div className="flex items-center gap-1 px-2 py-[3px] rounded-full bg-purple-500/15 border border-purple-500/20 text-[10px] text-purple-300">
                            <Pin size={10} />
                            FIJADO
                          </div>
                        )}
                      </div>

                      <p className="text-[12px] md:text-[13px] text-white/55 break-words leading-relaxed">
                        {item.comment}
                      </p>

                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt="Imagen del comentario"
                          className="mt-3 rounded-xl w-full max-h-48 md:max-h-56 object-cover border border-white/10"
                        />
                      )}

                      {/* RESPUESTAS DEL ADMIN */}
                      {replies.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {replies.map((reply, index) => (
                            <div
                              key={index}
                              className="relative rounded-2xl border border-white/10 bg-black/25 px-3 py-3"
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-[2px] text-purple-300/80 shrink-0">
                                  <CornerDownRight size={14} />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-[11px] font-semibold text-purple-300">
                                      {reply.username || 'Administrador'}
                                    </span>

                                    {reply.created_at && (
                                      <span className="text-[9px] text-white/30">
                                        {formatDateTime(reply.created_at)}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] md:text-[12px] text-white/50 leading-relaxed break-words">
                                    {reply.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        likeComment(item.id, item.likes || 0)
                      }
                      className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white transition-colors shrink-0"
                    >
                      <Heart size={13} />
                      {item.likes || 0}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
