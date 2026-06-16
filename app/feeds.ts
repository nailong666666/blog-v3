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
		],
	},
] satisfies FeedGroup[]
