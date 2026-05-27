'use client'

import { useEffect, useState } from 'react'
import {
  fetchCertificates,
  fetchProjects,
  fetchTechStacks,
} from '@/lib/portfolioService'

export default function usePortfolio() {
  const [projects, setProjects] = useState<any[]>([])
  const [certificates, setCertificates] = useState<any[]>([])
  const [techStacks, setTechStacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    setLoading(true)

    const [
      projectsData,
      certificatesData,
      techStacksData,
    ] = await Promise.all([
      fetchProjects(),
      fetchCertificates(),
      fetchTechStacks(),
    ])

    setProjects(projectsData || [])
    setCertificates(certificatesData || [])
    setTechStacks(techStacksData || [])

    setLoading(false)
  }

  return {
    projects,
    certificates,
    techStacks,
    loading,
    reloadPortfolio: loadPortfolio,
  }
}
