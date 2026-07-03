#!/usr/bin/env node

import { exec } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import fs from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import process from 'node:process'
import { intro, log, outro, select, spinner, text } from '@clack/prompts'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '../blog.config'

function normalize(val: string | symbol | undefined): string | undefined {
	return typeof val === 'symbol' ? undefined : val?.trim()
}

// #region 读参
let fileName: string | undefined = process.argv[2]
const usePermalink = blogConfig.article.useRandomPremalink
const now = Temporal.Now.plainDateTimeISO()
const dateStr = now.toLocaleString('sv')
// #endregion

// #region 预览/发布
const publishStatus = normalize(await select({
	message: '选择发布状态',
	options: [
		{ value: 'preview', label: '🔒 预览模式', hint: '存入 /preview，不显示在首页' },
		{ value: 'publish', label: '📢 直接发布', hint: '存入 /posts，显示在首页' },
	],
	initialValue: 'preview',
}))
if (!publishStatus)
	process.exit(0)

const isPreview = publishStatus === 'preview'

const dirPrefix = isPreview ? 'previews' : 'posts'
const dir = join('content', dirPrefix, now.year.toString())

if (!fs.existsSync(dir))
	fs.mkdirSync(dir, { recursive: true })

intro(isPreview
	? '🔒 预览模式 — 新建未发布的文章'
	: '📝 发布模式 — 新建公开发布的文章')
// #endregion

// #region 传入文件名
if (fileName)
	log.info(`文件名: ${join(dir, fileName)}.md`)

const permalink = usePermalink
	? `/${dirPrefix}/${randomBytes(4).toString('hex').slice(1)}`
	: undefined

// #region url为名
do {
	if (fileName || usePermalink)
		break

	fileName = normalize(await text({
		message: `请输入文件名（将创建在 ${dir} 下）`,
		placeholder: `monthly-${now.month}`,
		validate: val => val?.trim() === '' ? '文件名不能为空' : undefined,
	}))
	if (!fileName)
		process.exit(0)

	if (fs.existsSync(join(dir, `${fileName}.md`))) {
		log.error('文件已存在')
		fileName = undefined
	}
} while (!fileName)
// #endregion

// #region 标题为名
let title = fileName

do {
	if (title)
		break

	title = normalize(await text({
		message: '请输入博客标题',
		placeholder: `${now.month}月生活`,
		validate: val => val?.trim() === '' ? '标题不能为空' : undefined,
	}))
	if (!title)
		process.exit(0)

	if (usePermalink) {
		if (fs.existsSync(join(dir, `${title}.md`))) {
			log.error('❌ 文件已存在')
			title = undefined
		}
	}
} while (!title)
// #endregion

// #region 生成路径
const mdPath = join(dir, `${usePermalink ? title : fileName}.md`)
if (!process.argv[2])
	log.info(`文件名: ${mdPath}`)

if (fs.existsSync(mdPath)) {
	log.error('文件已存在')
	process.exit(1)
}

// #region 图片目录
const slug = basename(mdPath, extname(mdPath))
const imgDir = join('public', now.year.toString(), slug)
if (!fs.existsSync(imgDir)) {
	fs.mkdirSync(imgDir, { recursive: true })
	log.info(`📁 图片目录: ${imgDir}/`)
}
// #endregion

// #region 分类
let category = normalize(await select({
	message: '请选择分类',
	options: [
		...Object.keys(blogConfig.article.categories).map(c => ({ value: c })),
		{ value: '自定义' },
	],
}))
if (!category)
	process.exit(0)
// #endregion

// #region 自定义分类
if (category === '自定义') {
	const customCategory = normalize(await text({
		message: '请输入自定义分类',
		validate: val => val?.trim() === '' ? '分类不能为空' : undefined,
	}))
	if (!customCategory)
		process.exit(0)
	category = customCategory
}
// #endregion

// #region 描述
const description = normalize(await text({
	message: '请输入文章描述',
	placeholder: '讲述关于这篇文章的故事...',
	validate: val => val?.trim() === '' ? '描述不能为空' : undefined,
}))
if (!description)
	process.exit(0)
// #endregion

// #region 样式类型
let type = normalize(await select({
	message: '选择文章版式',
	options: [
		{ value: 'tech', label: '技术 (tech)' },
		{ value: 'story', label: '故事 (story)' },
		{ value: 'custom', label: '自定义' },
	],
	initialValue: 'tech',
}))
if (!type)
	process.exit(0)
if (type === 'custom') {
	const customType = normalize(await text({
		message: '请输入自定义类型',
		validate: val => val?.trim() === '' ? '类型不能为空' : undefined,
	}))
	if (!customType)
		process.exit(0)

	log.warn('新建分类后，建议在 blog.config.ts 中添加对应配置')
	type = customType
}
// #endregion

// #region frontmatter
const frontmatter = {
	title,
	description,
	date: dateStr,
	updated: dateStr,
	image: `/${now.year}/${slug}/cover.jpg`,
	permalink,
	type: type === 'tech' ? undefined : type,
	categories: category === blogConfig.defaultCategory ? undefined : `[${category}]`,
	// draft: 'true # 撰写完成后，请删除此行',
}
// #endregion

// #region 写文件
fs.writeFileSync(mdPath, `---\n${Object.entries(frontmatter)
	.filter(([, value]) => value !== undefined)
	.map(([key, value]) => `${key}: ${value}`)
	.join('\n')}
---

## 从${title}说起

\`\`\`md wrap
<!-- 你可以在此处书写大纲，并在上方完成文章 -->
\`\`\`
`, 'utf8')

log.success(`已创建: ${resolve(mdPath)}`)
if (permalink)
	log.info(`🔗 文章链接: ${new URL(permalink, blogConfig.url)}`)

// #region 打开 Typora
const s = spinner()
s.start('正在打开 Typora...')
exec(`"D:\\Typora\\Typora\\Typora.exe" "${resolve(mdPath)}"`, (error) => {
    if (!error)
        return
    s.stop('⚠️ 无法打开 Typora')
    log.error(error.message)
    process.exit(1)
})
s.stop('⌨️ 已通过 Typora 打开文件')
// #endregion


outro(`🎉 开始书写吧！`)
