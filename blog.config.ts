import type { FeedEntry } from './app/types/feed'

const basicConfig = {
	title: '奶龙',
	subtitle: 'CTF',
	// 长 description 利好于 SEO
	description: '博客',
	author: {
		name: '奶龙',
		avatar: '/avatar.jpg',
		email: 'hi@example.cyou',
		homepage: 'https://www.example.site/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: '/avatar.jpg',
	language: 'zh-CN',
	timeEstablished: '2026-06-13',
	timeZone: 'Asia/Shanghai',
	url: 'https://blog.example.site/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'tabler:circle-dashed' },
			/** 实践可复用操作经验：工具/系统/部署/排障 */
			技术: { icon: 'tabler:mouse', color: '#33aaff' },
			/** 编程：代码实现/工程实践/开发方法 */
			开发: { icon: 'tabler:code', color: '#7777ff' },
			/** 安全：漏洞/CTF/恶意软件/安全事件分析 */
			安全: { icon: 'tabler:bug', color: '#ff7733' },
			/** CTF：夺旗竞赛题解与Writeup */
			CTF: { icon: 'tabler:flag-3', color: '#ffaa00' },
			/** CVE：漏洞复现与分析 */
			CVE: { icon: 'tabler:shield-exclamation', color: '#dd3355' },
			/** 思考：观点讨论/复盘反思/行业或产品观察 */
			杂谈: { icon: 'tabler:message', color: '#33bbaa' },
			/** 记录叙事：个人经历/校园家庭/日常片段 */
			生活: { icon: 'tabler:leaf', color: '#ff7777' },
		},
		/** 文章版式，首个为默认版式 */
		types: {
			tech: {},
			story: {},
		},
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
		/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
		useRandomPremalink: false,
		/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
		hidePostPrefix: true,
		/** 禁止搜索引擎收录的路径 */
		robotsNotIndex: ['/preview', '/previews/*'],
	},

	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/** 订阅源是否启用XSLT样式 */
		enableStyle: true,
	},

	/** 向 <head> 中添加脚本 */
	scripts: [
		// 自己部署的 Umami 统计服务（需要时取消注释并填入你的地址）
		// { 'src': 'https://your-umami.example.com/script.js', 'data-website-id': 'your-id', 'defer': true },
		// Cloudflare Insights 统计（需要时取消注释并填入你的 token）
		// { 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "your-token"}', 'defer': true },
		// Twikoo 评论系统（需要时取消注释并填入你的服务地址）
		// { src: 'https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js', defer: true },
	],

	/** 自己部署的 Twikoo 服务（需要时取消注释并填入你的地址） */
	// twikoo: {
	// 	envId: 'https://your-twikoo.example.com/',
	// 	preload: 'https://your-twikoo.example.com/',
	// },
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: '我的博客',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'Vercel'],
	date: blogConfig.timeEstablished,
	comment: '',
}

export default blogConfig
