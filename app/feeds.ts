import type { FeedGroup } from '../app/types/feed'

/**
 * 友链列表
 * 按分组组织，每组包含 name、desc 和 entries。
 * 需要添加友链时，在对应分组的 entries 数组中追加即可。
 *
 * 示例：
 * {
 *   name: '朋友们',
 *   desc: '友情链接',
 *   entries: [
 *     myFeed,
 *     {
 *       author: '张三',
 *       title: '张三的博客',
 *       desc: '分享技术与生活',
 *       link: 'https://example.com/',
 *       feed: 'https://example.com/atom.xml',
 *       icon: 'https://example.com/favicon.ico',
 *       avatar: 'https://example.com/avatar.png',
 *       archs: ['Nuxt', 'Vercel'],
 *       date: '2025-01-01',
 *     },
 *   ],
 * },
 */
export default [
	{
		name: '朋友们',
		desc: '友情链接',
		entries: [
			{
				author: 'sawd6',
				title: 'sawd6',
				desc: 'CTF与开发双修',
				link: 'https://sawd6.xyz',
				icon: '/sawd6.jpg',
				avatar: '/sawd6.jpg',
				date: '2026-06-16',
			},
			{
				author: 'A1right',
				title: 'A1right的小窝',
				desc: '专注 Web 安全、CTF 题解与 Agent 渗透实验的个人博客',
				link: 'https://itsa1right.ink',
				icon: 'https://itsa1right.ink/images/a1right-avatar.png',
				avatar: 'https://itsa1right.ink/images/a1right-avatar.png',
				date: '2025-07-16',
			},
			{
				author: '康可ing',
				title: '康可ing',
				desc: 'conquer,conquer,conquer...',
				link: 'https://blog.yanxisishi.top/',
				icon: 'https://q1.qlogo.cn/g?b=qq&nk=3497863696&s=640',
				avatar: 'https://q1.qlogo.cn/g?b=qq&nk=3497863696&s=640',
				date: '2025-07-16',
			},
		],
	},
] satisfies FeedGroup[]
