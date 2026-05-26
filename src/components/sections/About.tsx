"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Code, Award, Globe, FileText, ArrowUpRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

/* ================== ANIMACIÓN ================== */

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 35, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: 70, rotate: 2 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 25 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* ================== COMPONENTE ================== */

export default function About() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [projectCount, setProjectCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);

    check();
    window.addEventListener("resize", check);

    fetchStats();

    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchStats = async () => {
    try {
      const { count: projects } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      const { count: certificates } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true });

      setProjectCount(projects || 0);
      setCertificateCount(certificates || 0);
    } catch {
      setProjectCount(0);
      setCertificateCount(0);
    }
  };

  const scrollToPortfolio = (
    tab: "projects" | "certificates" | "techstack"
  ) => {
    window.dispatchEvent(
      new CustomEvent("changePortfolioTab", {
        detail: tab,
      })
    );

    const el = document.getElementById("portfolio");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isMobile === null) return null;

  const stats = [
    {
      icon: <Code size={16} />,
      value: String(projectCount),
      title: "PROYECTOS",
      tab: "projects" as const,
    },
    {
      icon: <Award size={16} />,
      value: String(certificateCount),
      title: "CERTIFICADOS",
      tab: "certificates" as const,
    },
    {
      icon: <Globe size={16} />,
      value: String(projectCount + certificateCount),
      title: "TRABAJOS COMPLETADOS",
      tab: "techstack" as const,
    },
  ];

  return (
    <section
      id="about"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "flex-start",
        padding: isMobile ? "60px 24px 30px" : "80px 60px 30px 120px",
      }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "32px",
          }}
        >
          {/* IZQUIERDA */}
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-80px" }}
            style={{
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  color: "var(--text-muted)",
                  letterSpacing: "0.2em",
                }}
              >
                SOBRE MÍ
              </span>
            </motion.div>

            <motion.div variants={fadeUp}>
              <div
                className="hero-title-shine"
                style={{
                  fontSize: isMobile ? 32 : "clamp(32px,5vw,46px)",
                  fontWeight: 800,
                  lineHeight: 1.03,
                }}
              >
                <div>Jack</div>
                <div>Anderson</div>
                <div>Rosales</div>
                <div>Garay</div>
              </div>
            </motion.div>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 40 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 1.1,
                    delay: 0.2,
                  },
                },
              }}
              style={{
                marginTop: 18,
                fontSize: 14,
                color: "var(--text-secondary)",
                lineHeight: 1.75,
                maxWidth: isMobile ? "100%" : "490px",
              }}
            >
              Me apasiona crear soluciones digitales modernas,
              combinando diseño, tecnología e interfaces limpias para construir
              proyectos funcionales, atractivos y orientados a necesidades
              reales.
            </motion.p>

            {/* FRASE */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.94 },
                show: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.9,
                    delay: 0.3,
                  },
                },
              }}
              style={{
                marginTop: 18,
                padding: "12px 25px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                fontSize: 12,
                fontStyle: "italic",
                display: "inline-block",
                width: "fit-content",
              }}
            >
              “Convirtiendo ideas en experiencias digitales limpias, modernas y
              significativas.”
            </motion.div>

            {/* BOTONES */}
            <motion.div
              variants={fadeUp}
              style={{
                display: "flex",
                gap: 10,
                marginTop: 18,
                flexWrap: "wrap",
              }}
            >
              {/* DESCARGAR CV */}
              <a
                href="https://drive.google.com/file/d/10dZuBRJRUBYJ6gDXEa9etAIp_agNY3oi/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "10px 18px",
                    borderRadius: 8,
                    border: "1px solid white",
                    background: "white",
                    color: "black",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "transform 0.25s ease, opacity 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform =
                      "translateY(-2px) scale(1.03)";
                    e.currentTarget.style.opacity = "0.92";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <FileText size={14} />
                  Descargar CV
                </button>
              </a>

              {/* VER PROYECTOS */}
              <button
                onClick={() => scrollToPortfolio("projects")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "1px solid white",
                  background: "transparent",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "transform 0.25s ease, opacity 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.03)";
                  e.currentTarget.style.opacity = "0.85";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.opacity = "1";
                }}
              >
                <ArrowUpRight size={14} />
                Ver proyectos
              </button>
            </motion.div>
          </motion.div>

          {/* VIDEO DE PERFIL */}
          
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false }}
              style={{
                width: "48%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <div
              style={{
                padding: 12,
                borderRadius: "50%",
                border: "1px solid var(--border)",
                transform: isMobile
                ? "translateX(50px)" // Mueve el video un poco hacia la derecha solo en teléfono
                : "translateX(-40px)", // Aleja un poco el video en escritorio
               }}
               >
                <div
                  style={{
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    overflow: "hidden",
                    background: "black",
                  }}
                >
                  <video
                    src="/assets/pp.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    aria-label="Video de perfil"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          
        </div>

        {/* TARJETAS */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: 18,
            marginTop: 36,
          }}
        >
          {stats.map((item, i) => (
            <motion.div
              key={i}
              variants={pop}
              whileHover={{ scale: 1.03 }}
              style={{
                position: "relative",
                padding: 18,
                borderRadius: 16,
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 10,
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                }}
              >
                {item.title}
              </div>

              <button
                onClick={() => scrollToPortfolio(item.tab)}
                aria-label={`Ir a ${item.title.toLowerCase()}`}
                style={{
                  position: "absolute",
                  bottom: 14,
                  right: 14,
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowUpRight size={15} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}