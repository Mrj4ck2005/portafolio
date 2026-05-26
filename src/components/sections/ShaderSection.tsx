'use client'

import { motion } from 'framer-motion'
import ShaderBackground from '@/components/ShaderBackground'

const smoothEase: [number, number, number, number] = [
  0.22,
  1,
  0.36,
  1,
]

export default function ShaderSection() {
  return (
    <section className="relative w-full max-w-[1450px] mx-auto px-6 md:px-12 lg:px-20 py-10 md:py-16 text-white">
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
          scale: 0.98,
        }}
        whileInView={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        viewport={{
          once: false,
          amount: 0.25,
        }}
        transition={{
          duration: 0.9,
          ease: smoothEase,
        }}
        className="relative overflow-hidden rounded-[30px] md:rounded-[42px] border border-white/10 bg-black/30 backdrop-blur-xl min-h-[260px] md:min-h-[360px]"
      >
        <ShaderBackground />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_45%,rgba(0,0,0,0.74)_100%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.18),rgba(0,0,0,0.58))]" />

        <div className="relative z-10 min-h-[260px] md:min-h-[360px] flex flex-col items-center justify-center text-center px-6 md:px-10">
          <motion.p
            initial={{
              opacity: 0,
              y: 18,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: false,
            }}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: smoothEase,
            }}
            className="text-[11px] md:text-xs uppercase tracking-[0.34em] text-white/45 mb-4"
          >
            Desarrollo creativo
          </motion.p>

          <motion.h2
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: false,
            }}
            transition={{
              duration: 0.75,
              delay: 0.2,
              ease: smoothEase,
            }}
            className="text-2xl md:text-5xl font-semibold max-w-3xl leading-tight"
          >
            Diseñando experiencias digitales con código.
          </motion.h2>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: false,
            }}
            transition={{
              duration: 0.75,
              delay: 0.28,
              ease: smoothEase,
            }}
            className="mt-5 max-w-2xl text-sm md:text-base text-white/55 leading-relaxed"
          >
            Una sección visual para conectar mi perfil,
            mis proyectos y las tecnologías que utilizo.
          </motion.p>
        </div>

        <div className="absolute left-6 right-6 bottom-6 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      </motion.div>
    </section>
  )
}