---
title: Git学习
description: 记录一下Git的学习过程
date: 2026-06-22 14:50:50
updated: 2026-06-22 14:50:50
image: /2026/Git学习/cover.jpg
categories: [技术]
---

## Git  简介

git是一个开源的分布式版本控制系统。

## Git  配置 

通常用的是`git config`命令，在windows下主要有三个地方。

- `/etc/gitconfig`  这个是系统对所有用户都适用的配置，在git安装的根目录下，可以用`git config --system` 进行操作，比如读取可以用`git config --system -list`。

  ​

- `～/.gitconfig` 这个是只适用于当前用户的配置，在用户目录下，可以用`git config --global`进行操作，比如读取可以用`git config --global --list`。

  ​

- `/.git/config` 这个是只对当前目录的配置，会在初始化后自动生成，可以用`git config --local`进行操作，比如读取可以用`git config --local --list`。

这三个配置是每一个级别的配置都会覆盖上层的相同配置。

## Git  创建仓库

创建仓库主要有两种方法。

1. `git init`

   这个命令是把本地一个普通目录初始化成`git`仓库，即用`git`去控制，命令执行后会生成`./git`目录，删除后代表不再用`git`去控制。

   ​

2. `git clone`

   这个命令是从现有仓库中拷贝项目，会在初始化 Git 仓库的基础上，把远程仓库的完整历史和当前代码一起复制到本地，并自动配置好远程仓库。## Git 工作区

##  GIt  工作区、暂存区和版本库

工作区是当前项目目录除了`./git`的目录，暂存区是`./git/index`，版本库是`./git`。以下是一些常用命令。

```cmd
git add <filename>								   # 提交单个文件到暂存区
git add .												# 提交当前目录所有文件到暂存区
git status												# 查看文件是否提交暂存区状态
git commit -m "commit message"    				# 提交暂存区的更改到本地仓库
git diff												   # 查看工作区中还没 git add到暂存区的
git diff --cached										# 查看暂存区中还没 git commit的
git notes add -m "message"						   # 可以在不修改commit Hash的情况下修改注释
git restore file								      # 恢复工作区，从暂存区到工作区
git restore --staged file	      				# 撤销 git add，从HEAD到暂存区

```



