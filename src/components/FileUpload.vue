<script setup lang="ts">
import { ref, onMounted } from 'vue'

type FileStatus = 'queued' | 'uploading' | 'indexing' | 'done' | 'error'

interface UploadFile {
  id: number
  name: string
  size: number
  status: FileStatus
  pct: number
}

const ACCENT = '#3B6EF0'

const navItems = ['Search', 'Documents', 'Settings'] as const
const activeNav = ref<string>('Documents')

const dragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const folderInput = ref<HTMLInputElement | null>(null)

const files = ref<UploadFile[]>([
  { id: 1, name: 'Q4-2024-Annual-Report.pdf',   size: 4200000, status: 'done',      pct: 100 },
  { id: 2, name: 'Product-Roadmap-2025.pdf',     size: 1800000, status: 'indexing',  pct: 72  },
  { id: 3, name: 'Engineering-RFC-001.docx',     size: 340000,  status: 'uploading', pct: 44  },
  { id: 4, name: 'Customer-Research-Notes.docx', size: 620000,  status: 'queued',    pct: 0   },
  { id: 5, name: 'Competitive-Analysis-H1.pdf',  size: 5100000, status: 'queued',    pct: 0   },
])

const columns = [
  { key: 'name',     label: 'Name'     },
  { key: 'size',     label: 'Size'     },
  { key: 'progress', label: 'Progress' },
  { key: 'status',   label: 'Status'   },
]

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function isPdf(name: string) { return name.endsWith('.pdf') }

function onDragOver(e: DragEvent) { e.preventDefault(); dragging.value = true }
function onDragLeave() { dragging.value = false }
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragging.value = false
  const dropped = Array.from(e.dataTransfer?.files ?? [])
  addFiles(dropped)
}

function addFiles(list: File[]) {
  const accepted = list.filter(f => f.name.endsWith('.pdf') || f.name.endsWith('.docx'))
  const next = accepted.map((f, i) => ({
    id: Date.now() + i,
    name: f.name,
    size: f.size,
    status: 'queued' as FileStatus,
    pct: 0,
  }))
  files.value.push(...next)
}

function onFilePick(e: Event) {
  const input = e.target as HTMLInputElement
  addFiles(Array.from(input.files ?? []))
  input.value = ''
}

onMounted(() => {
  folderInput.value?.setAttribute('webkitdirectory', '')
})

const statusMap: Record<FileStatus, { label: string; color: 'neutral' | 'primary' | 'success' | 'error' }> = {
  queued:    { label: 'Queued',    color: 'neutral'  },
  uploading: { label: 'Uploading', color: 'primary'  },
  indexing:  { label: 'Indexing',  color: 'primary'  },
  done:      { label: 'Indexed',   color: 'success'  },
  error:     { label: 'Failed',    color: 'error'    },
}
</script>

<template>
  <div class="flex flex-col min-h-screen" style="background: oklch(98% 0.004 60); font-family: 'DM Sans', sans-serif;">

    <!-- Nav bar -->
    <header class="bg-white border-b flex items-center justify-between px-8 h-[52px] shrink-0" style="border-color: oklch(90% 0.005 60);">
      <div class="flex items-center gap-6">
        <span class="text-sm font-semibold tracking-tight" style="color: oklch(14% 0.005 60);">DocSearch</span>
        <nav class="flex gap-1">
          <UButton
            v-for="item in navItems"
            :key="item"
            variant="ghost"
            size="sm"
            :style="{
              color: activeNav === item ? ACCENT : 'oklch(55% 0.005 60)',
              background: activeNav === item ? `${ACCENT}10` : 'transparent',
              fontWeight: activeNav === item ? '500' : '400',
            }"
            @click="activeNav = item"
          >
            {{ item }}
          </UButton>
        </nav>
      </div>

      <UButton
        size="sm"
        style="background: #3B6EF0; color: #fff; font-weight: 500;"
        @click="fileInput?.click()"
      >
        <template #leading>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 10V3M6.5 3l-3 3M6.5 3l3 3" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </template>
        Upload
      </UButton>
    </header>

    <main class="flex-1 flex flex-col gap-6 px-8 py-7">

      <!-- Drop zone (compact horizontal) -->
      <div
        class="flex items-center gap-4 rounded-xl border-2 border-dashed px-6 py-5 cursor-pointer transition-all duration-200"
        :style="{
          borderColor: dragging ? ACCENT : 'oklch(90% 0.005 60)',
          background: dragging ? `${ACCENT}06` : 'transparent',
        }"
        @dragover="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop"
        @click="fileInput?.click()"
      >
        <div
          class="w-10 h-10 rounded-[10px] shrink-0 flex items-center justify-center"
          :style="{ background: `${ACCENT}12` }"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 12V3M9 3L6 6M9 3l3 3" :stroke="ACCENT" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 13.5v.75A1.75 1.75 0 004.75 16h8.5A1.75 1.75 0 0015 14.25v-.75" :stroke="ACCENT" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </div>

        <div class="flex-1">
          <p class="text-sm font-medium" style="color: oklch(14% 0.005 60);">Drop PDF or DOCX files here to index them</p>
          <p class="text-xs mt-0.5" style="color: oklch(55% 0.005 60);">Or browse your files and folders</p>
        </div>

        <div class="flex gap-1.5" @click.stop>
          <UButton
            size="sm"
            variant="ghost"
            :style="{ color: ACCENT, background: `${ACCENT}12`, fontWeight: '500' }"
            @click="fileInput?.click()"
          >Files</UButton>
          <UButton
            size="sm"
            variant="ghost"
            style="color: oklch(55% 0.005 60); background: oklch(93% 0.004 60); font-weight: 500;"
            @click="folderInput?.click()"
          >Folder</UButton>
        </div>
      </div>

      <!-- Hidden file inputs -->
      <input ref="fileInput" type="file" accept=".pdf,.docx" multiple class="hidden" @change="onFilePick" />
      <input ref="folderInput" type="file" accept=".pdf,.docx" multiple class="hidden" @change="onFilePick" />

      <!-- Document table -->
      <div>
        <p class="text-xs font-medium tracking-widest uppercase mb-3" style="color: oklch(55% 0.005 60);">Documents</p>

        <div class="bg-white rounded-xl border overflow-hidden" style="border-color: oklch(90% 0.005 60);">
          <!-- Header -->
          <div class="grid text-xs font-medium uppercase tracking-widest px-[18px] py-2.5 border-b" style="grid-template-columns: 1fr 90px 120px 120px; color: oklch(55% 0.005 60); border-color: oklch(90% 0.005 60);">
            <span>Name</span>
            <span>Size</span>
            <span>Progress</span>
            <span>Status</span>
          </div>

          <!-- Rows -->
          <div
            v-for="(file, i) in files"
            :key="file.id"
            class="grid items-center px-[18px] py-[13px]"
            :class="{ 'border-b': i < files.length - 1 }"
            style="grid-template-columns: 1fr 90px 120px 120px; border-color: oklch(90% 0.005 60);"
          >
            <!-- Name + icon -->
            <div class="flex items-center gap-2.5 min-w-0 pr-4">
              <!-- PDF icon -->
              <svg v-if="isPdf(file.name)" width="20" height="20" viewBox="0 0 20 20" fill="none" class="shrink-0">
                <rect x="3" y="1" width="12" height="16" rx="2" :fill="ACCENT" opacity="0.12"/>
                <rect x="3" y="1" width="12" height="16" rx="2" :stroke="ACCENT" stroke-width="1.5"/>
                <path d="M7 11h1.5c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8H7v5M11 8v5M13 8h-2" :stroke="ACCENT" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 1v4h5" :stroke="ACCENT" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- DOCX icon -->
              <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none" class="shrink-0">
                <rect x="3" y="1" width="12" height="16" rx="2" :fill="ACCENT" opacity="0.12"/>
                <rect x="3" y="1" width="12" height="16" rx="2" :stroke="ACCENT" stroke-width="1.5"/>
                <path d="M6 8l1.5 5 1.5-3.5L10.5 13 12 8" :stroke="ACCENT" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 1v4h5" :stroke="ACCENT" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span class="text-[13px] font-medium truncate" style="color: oklch(14% 0.005 60);">{{ file.name }}</span>
            </div>

            <!-- Size -->
            <span class="text-xs" style="color: oklch(55% 0.005 60);">{{ fmtSize(file.size) }}</span>

            <!-- Progress -->
            <div class="pr-4">
              <div v-if="file.pct > 0" class="flex items-center gap-2">
                <UProgress
                  :value="file.pct"
                  size="xs"
                  class="flex-1"
                  :color="file.status === 'done' ? 'success' : 'primary'"
                />
                <span class="text-[10px] min-w-[28px]" style="color: oklch(55% 0.005 60); font-family: 'DM Mono', monospace;">{{ file.pct }}%</span>
              </div>
              <span v-else class="text-xs" style="color: oklch(80% 0.005 60);">—</span>
            </div>

            <!-- Status -->
            <div class="flex items-center gap-1.5">
              <span
                v-if="file.status === 'uploading' || file.status === 'indexing'"
                class="w-1.5 h-1.5 rounded-full animate-pulse"
                :style="{ background: ACCENT }"
              />
              <UBadge
                :label="statusMap[file.status].label"
                :color="statusMap[file.status].color"
                variant="soft"
                size="sm"
              />
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="files.length === 0" class="flex flex-col items-center gap-2 py-12">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="opacity-30">
              <rect x="6" y="3" width="16" height="22" rx="3" :stroke="ACCENT" stroke-width="2"/>
              <path d="M11 11h10M11 15h7" :stroke="ACCENT" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p class="text-sm" style="color: oklch(55% 0.005 60);">No documents yet. Upload your first file above.</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.animate-pulse {
  animation: pulse 1.2s ease-in-out infinite;
}
</style>
