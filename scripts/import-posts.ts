import { readFileSync, writeFileSync, statSync, readdirSync, existsSync, mkdirSync } from 'node:fs'
import { basename, dirname, join, extname } from 'node:path'

// 源目录 → 博客 content/posts 目录
const SRC = 'D:/cangku/ctfshow-web'
const DEST = 'blog-v3/content/posts/2026'

// 目录名 → 分类映射
const categoryMap: Record<string, string> = {
  'CVE': '漏洞复现',
  'php反序列化': 'CTF',
  'php 反序列化': 'CTF',
}

if (!existsSync(DEST)) mkdirSync(DEST, { recursive: true })

function walk(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === '.git' || e.name === '.obsidian') continue
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (e.name.endsWith('.md')) files.push(full)
  }
  return files
}

function detectCategory(filePath: string): string {
  const rel = filePath.replace(SRC + '\\', '').replace(SRC + '/', '')
  const parts = rel.split(/[\\/]/)
  for (const part of parts) {
    if (categoryMap[part]) return categoryMap[part]
  }
  return 'CTF'
}

function makeTitle(filePath: string): string {
  const rel = filePath.replace(SRC + '\\', '').replace(SRC + '/', '')
  const parent = basename(dirname(filePath))
  const name = basename(filePath, extname(filePath))
  // wp.md → 用父目录名
  if (name === 'wp') return parent
  return name
}

const files = walk(SRC)
console.log(`找到 ${files.length} 个 md 文件\n`)

for (const srcPath of files) {
  let content = readFileSync(srcPath, 'utf-8')

  // 跳过已有 frontmatter 的
  if (content.trimStart().startsWith('---')) {
    console.log(`跳过（已有 frontmatter）: ${srcPath}`)
    continue
  }

  const mtime = statSync(srcPath).mtime
  const dateStr = mtime.toISOString().slice(0, 10) // YYYY-MM-DD
  const category = detectCategory(srcPath)
  const title = makeTitle(srcPath)

  const frontmatter = [
    '---',
    `title: ${title}`,
    `date: ${dateStr}`,
    `categories: [${category}]`,
    '---',
    '',
  ].join('\n')

  const newContent = frontmatter + content
  const destName = `${title}.md`
  const destPath = join(DEST, destName)

  writeFileSync(destPath, newContent, 'utf-8')
  console.log(`✅ ${title}.md  →  ${category} 分类`)
}

console.log(`\n完成！文章已复制到 ${DEST}/`)
