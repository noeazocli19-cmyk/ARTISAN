'use client'

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Plus,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Droplets,
  Zap,
  Hammer,
  Paintbrush,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  FolderOpen,
} from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string
  artisanId: string
  title: string
  description: string
  imageUrl: string
  category: string
}

interface UploadItem {
  id: string
  file: File
  preview: string
  title: string
  description: string
  category: string
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockPortfolio: PortfolioItem[] = [
  { id: "p1", artisanId: "1", title: "Réparation tuyauterie cuisine", description: "Remplacement complet de la tuyauterie dans une cuisine moderne", imageUrl: "https://picsum.photos/seed/plumb1/600/400", category: "Plomberie" },
  { id: "p2", artisanId: "1", title: "Installation robinetterie", description: "Pose de robinets mitigeurs dans une salle de bain", imageUrl: "https://picsum.photos/seed/plumb2/600/500", category: "Plomberie" },
  { id: "p3", artisanId: "1", title: "Dépannage fuite urgente", description: "Intervention rapide sur fuite d'eau", imageUrl: "https://picsum.photos/seed/plumb3/600/450", category: "Plomberie" },
  { id: "p4", artisanId: "2", title: "Installation tableau électrique", description: "Mise aux normes du tableau électrique", imageUrl: "https://picsum.photos/seed/elec1/600/400", category: "Électricité" },
  { id: "p5", artisanId: "2", title: "Rénovation circuit complet", description: "Refonte totale de l'installation électrique", imageUrl: "https://picsum.photos/seed/elec2/600/550", category: "Électricité" },
  { id: "p6", artisanId: "3", title: "Meuble sur mesure", description: "Création d'un meuble TV en bois massif", imageUrl: "https://picsum.photos/seed/wood1/600/400", category: "Menuiserie" },
  { id: "p7", artisanId: "3", title: "Cuisine équipée", description: "Conception et installation d'une cuisine complète", imageUrl: "https://picsum.photos/seed/wood2/600/480", category: "Menuiserie" },
  { id: "p8", artisanId: "4", title: "Décoration salon", description: "Peinture décorative avec effets texte", imageUrl: "https://picsum.photos/seed/paint1/600/400", category: "Peinture" },
  { id: "p9", artisanId: "4", title: "Fresque murale", description: "Création d'une fresque africaine contemporaine", imageUrl: "https://picsum.photos/seed/paint2/600/500", category: "Peinture" },
  { id: "p10", artisanId: "1", title: "Installation chauffe-eau", description: "Pose d'un chauffe-eau solaire", imageUrl: "https://picsum.photos/seed/plumb4/600/420", category: "Plomberie" },
]

const categories = ["Tous", "Plomberie", "Électricité", "Menuiserie", "Peinture", "Autre"]

const categoryIcons: Record<string, typeof Droplets> = {
  "Plomberie": Droplets,
  "Électricité": Zap,
  "Menuiserie": Hammer,
  "Peinture": Paintbrush,
  "Autre": MoreHorizontal,
}

const categoryColors: Record<string, string> = {
  "Plomberie": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "Électricité": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  "Menuiserie": "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  "Peinture": "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  "Autre": "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
}

// ─── Animation variants ──────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PortfolioUploadProps {
  onBack: () => void
}

export function PortfolioUpload({ onBack }: PortfolioUploadProps) {
  // Gallery state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(mockPortfolio)
  const [activeCategory, setActiveCategory] = useState("Tous")
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Upload state
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Filtered items
  const filteredItems = activeCategory === "Tous"
    ? portfolio
    : portfolio.filter((item) => item.category === activeCategory)

  // ─── Lightbox navigation ─────────────────────────────────────────────────

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const navigateLightbox = useCallback((direction: "prev" | "next") => {
    if (lightboxIndex === null) return
    const len = filteredItems.length
    if (direction === "prev") {
      setLightboxIndex(lightboxIndex === 0 ? len - 1 : lightboxIndex - 1)
    } else {
      setLightboxIndex(lightboxIndex === len - 1 ? 0 : lightboxIndex + 1)
    }
  }, [lightboxIndex, filteredItems.length])

  // ─── File handling ───────────────────────────────────────────────────────

  const processFiles = useCallback((files: FileList | File[]) => {
    const newItems: UploadItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file: f,
        preview: URL.createObjectURL(f),
        title: "",
        description: "",
        category: "Autre",
      }))
    setUploadItems((prev) => [...prev, ...newItems])
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files)
    }
  }, [processFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [processFiles])

  const removeUploadItem = useCallback((id: string) => {
    setUploadItems((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const updateUploadItem = useCallback((id: string, field: keyof UploadItem, value: string) => {
    setUploadItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }, [])

  // ─── Upload simulation ───────────────────────────────────────────────────

  const handlePublish = useCallback(() => {
    if (uploadItems.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)
    setUploadComplete(false)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    setTimeout(() => {
      clearInterval(interval)
      setUploadProgress(100)

      // Add uploaded items to portfolio
      const newItems: PortfolioItem[] = uploadItems.map((item, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        artisanId: "1",
        title: item.title || "Projet sans titre",
        description: item.description || "Aucune description",
        imageUrl: item.preview,
        category: item.category,
      }))

      setPortfolio((prev) => [...newItems, ...prev])

      // Clean up previews
      uploadItems.forEach((item) => URL.revokeObjectURL(item.preview))

      setTimeout(() => {
        setIsUploading(false)
        setUploadComplete(true)
        setUploadItems([])

        setTimeout(() => {
          setUploadComplete(false)
        }, 2000)
      }, 500)
    }, 2600)
  }, [uploadItems])

  // ─── Render ──────────────────────────────────────────────────────────────

  const lightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/50 via-white to-orange-50/50 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-border/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="rounded-full hover:bg-amber-100 dark:hover:bg-amber-950"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                    Portfolio
                  </span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {portfolio.length} projets &middot; Mettez en valeur votre savoir-faire
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="gallery" className="w-full">
          <TabsList className="mb-8 bg-amber-50 dark:bg-amber-950/30 p-1 h-auto rounded-xl">
            <TabsTrigger
              value="gallery"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Galerie
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="rounded-lg px-6 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ajouter
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════ GALLERY VIEW ═══════════════ */}
          <TabsContent value="gallery">
            {/* Category Filters */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = categoryIcons[cat]
                  const isActive = activeCategory === cat
                  return (
                    <Button
                      key={cat}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(cat)}
                      className={
                        isActive
                          ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md"
                          : "hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                      }
                    >
                      {Icon && <Icon className="h-3.5 w-3.5 mr-1.5" />}
                      {cat}
                      {cat !== "Tous" && (
                        <span className="ml-1.5 text-xs opacity-70">
                          ({portfolio.filter((p) => p.category === cat).length})
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Masonry Grid */}
            <motion.div
              key={activeCategory}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4"
            >
              {filteredItems.map((item, index) => {
                const Icon = categoryIcons[item.category] || MoreHorizontal
                const colorClass = categoryColors[item.category] || categoryColors["Autre"]

                return (
                  <motion.div
                    key={item.id}
                    variants={cardVariants}
                    layout
                  >
                    <Card
                      className="group overflow-hidden cursor-pointer border-border/50 hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 break-inside-avoid"
                      onClick={() => openLightbox(index)}
                    >
                      <div className="relative overflow-hidden">
                        {/* Image */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />

                        {/* Title overlay at bottom */}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                          <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                            {item.title}
                          </h3>
                        </div>

                        {/* Hover overlay with description + badge */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center">
                          <Badge className={`${colorClass} mb-3`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {item.category}
                          </Badge>
                          <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                          <div className="mt-4 flex items-center gap-1 text-white/70 text-xs">
                            <ImageIcon className="h-3 w-3" />
                            Cliquer pour agrandir
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </motion.div>

            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/50 mb-4">
                  <ImageIcon className="h-10 w-10 text-amber-500" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Aucun projet dans cette catégorie
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  Ajoutez votre premier projet en cliquant sur l&apos;onglet &quot;Ajouter&quot;
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* ═══════════════ UPLOAD VIEW ═══════════════ */}
          <TabsContent value="upload">
            <div className="space-y-6">
              {/* Drop Zone */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`
                    relative rounded-2xl border-2 border-dashed p-8 sm:p-12
                    transition-all duration-300 cursor-pointer
                    ${isDragOver
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 scale-[1.01]"
                      : "border-amber-300/50 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-950/10 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                    }
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="flex flex-col items-center text-center gap-4">
                    <div className={`
                      flex h-20 w-20 items-center justify-center rounded-2xl
                      transition-all duration-300
                      ${isDragOver
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg scale-110"
                        : "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/50 dark:to-orange-950/50"
                      }
                    `}>
                      <Upload className={`h-10 w-10 transition-colors ${isDragOver ? "text-white" : "text-amber-600 dark:text-amber-400"}`} />
                    </div>

                    <div>
                      <p className="text-lg font-semibold">
                        {isDragOver ? "Déposez vos images ici" : "Glissez-déposez vos images"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        ou cliquez pour parcourir vos fichiers
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        JPG, PNG, WebP
                      </span>
                      <span>&middot;</span>
                      <span>Plusieurs fichiers possibles</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Upload Progress */}
              <AnimatePresence>
                {(isUploading || uploadComplete) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {uploadComplete ? (
                            <>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">
                                  Publication réussie !
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Vos projets ont été ajoutés au portfolio
                                </p>
                              </div>
                            </>
                          ) : (
                            <>
                              <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
                              <div className="flex-1">
                                <p className="font-semibold text-sm">
                                  Publication en cours...
                                </p>
                                <Progress value={uploadProgress} className="mt-2 h-2" />
                              </div>
                              <span className="text-sm font-mono text-amber-600 dark:text-amber-400">
                                {uploadProgress}%
                              </span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploaded Previews */}
              <AnimatePresence>
                {uploadItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        Images sélectionnées
                        <span className="text-muted-foreground font-normal text-sm ml-2">
                          ({uploadItems.length})
                        </span>
                      </h3>
                      <Button
                        onClick={handlePublish}
                        disabled={isUploading}
                        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-md"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Publication...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Publier ({uploadItems.length})
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {uploadItems.map((item, idx) => {
                        const Icon = categoryIcons[item.category] || MoreHorizontal
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card className="overflow-hidden border-border/50 hover:shadow-md transition-shadow">
                              <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row">
                                  {/* Preview Image */}
                                  <div className="relative sm:w-48 h-40 sm:h-auto shrink-0">
                                    <img
                                      src={item.preview}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <Button
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        removeUploadItem(item.id)
                                      }}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>

                                  {/* Form Fields */}
                                  <div className="flex-1 p-4 space-y-3">
                                    <Input
                                      placeholder="Titre du projet"
                                      value={item.title}
                                      onChange={(e) => updateUploadItem(item.id, "title", e.target.value)}
                                      className="border-border/50 focus-visible:ring-amber-500"
                                    />
                                    <Textarea
                                      placeholder="Description du projet..."
                                      value={item.description}
                                      onChange={(e) => updateUploadItem(item.id, "description", e.target.value)}
                                      rows={2}
                                      className="border-border/50 focus-visible:ring-amber-500 resize-none"
                                    />
                                    <Select
                                      value={item.category}
                                      onValueChange={(val) => updateUploadItem(item.id, "category", val)}
                                    >
                                      <SelectTrigger className="border-border/50 focus:ring-amber-500">
                                        <SelectValue placeholder="Catégorie" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.filter((c) => c !== "Tous").map((cat) => (
                                          <SelectItem key={cat} value={cat}>
                                            <span className="flex items-center gap-2">
                                              {(() => {
                                                const CatIcon = categoryIcons[cat]
                                                return CatIcon ? <CatIcon className="h-3.5 w-3.5" /> : null
                                              })()}
                                              {cat}
                                            </span>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    {item.category && (
                                      <Badge variant="outline" className={categoryColors[item.category]}>
                                        <Icon className="h-3 w-3 mr-1" />
                                        {item.category}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty state hint */}
              {uploadItems.length === 0 && !isUploading && !uploadComplete && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground text-sm">
                    Sélectionnez des images ci-dessus pour commencer à créer votre portfolio
                  </p>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ═══════════════ LIGHTBOX DIALOG ═══════════════ */}
      <Dialog open={lightboxIndex !== null} onOpenChange={(open) => { if (!open) closeLightbox() }}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black border-0">
          <DialogTitle className="sr-only">
            {lightboxItem?.title || "Visualisation du projet"}
          </DialogTitle>
          {lightboxItem && (
            <div className="relative">
              {/* Image */}
              <div className="relative bg-black flex items-center justify-center max-h-[75vh]">
                <img
                  src={lightboxItem.imageUrl}
                  alt={lightboxItem.title}
                  className="max-w-full max-h-[75vh] object-contain"
                />

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={closeLightbox}
                >
                  <X className="h-5 w-5" />
                </Button>

                {/* Prev arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox("prev") }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                {/* Next arrow */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  onClick={(e) => { e.stopPropagation(); navigateLightbox("next") }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Counter */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
                  {lightboxIndex !== null ? lightboxIndex + 1 : 0} / {filteredItems.length}
                </div>
              </div>

              {/* Info panel */}
              <div className="bg-white dark:bg-neutral-900 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold truncate">{lightboxItem.title}</h2>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                      {lightboxItem.description}
                    </p>
                  </div>
                  {(() => {
                    const LIcon = categoryIcons[lightboxItem.category] || MoreHorizontal
                    return (
                      <Badge className={`${categoryColors[lightboxItem.category]} shrink-0`}>
                        <LIcon className="h-3 w-3 mr-1" />
                        {lightboxItem.category}
                      </Badge>
                    )
                  })()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
