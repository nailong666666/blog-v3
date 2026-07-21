---
title: Git学习
description: 记录一下Git的学习过程
date: 2026-06-22 14:50:50
updated: 2026-07-21 00:00:00
image: /2026/Git学习/cover.jpg
categories: [技术]
---

## Git  简介

Git 是一个开源的分布式版本控制系统，主要用于记录文件的变化、管理代码版本、多人协作开发。

所谓分布式，就是每个人本地都会有一份完整的仓库历史，不是所有操作都必须依赖远程服务器。平时的提交、查看历史、切换分支这些操作都可以在本地完成，只有推送和拉取时才需要和远程仓库交互。

## Git  配置

通常用的是 `git config` 命令，在 Windows 下主要有三个地方。

- `/etc/gitconfig`  这个是系统对所有用户都适用的配置，在 Git 安装的根目录下，可以用 `git config --system` 进行操作，比如读取可以用 `git config --system --list`。

- `~/.gitconfig` 这个是只适用于当前用户的配置，在用户目录下，可以用 `git config --global` 进行操作，比如读取可以用 `git config --global --list`。

- `.git/config` 这个是只对当前仓库生效的配置，会在初始化后自动生成，可以用 `git config --local` 进行操作，比如读取可以用 `git config --local --list`。

这三个配置是有优先级的，范围越小优先级越高。也就是说，本地仓库配置会覆盖全局配置，全局配置会覆盖系统配置。

平时新环境主要先配置用户名和邮箱。

```cmd
git config --global user.name "your name"
git config --global user.email "your email"
git config --global --list
```

也可以配置默认编辑器、默认分支名这些。

```cmd
git config --global core.editor "code --wait"
git config --global init.defaultBranch main
```

## Git  创建仓库

创建仓库主要有两种方法。

### 1.  git init

这个命令是把本地一个普通目录初始化成 Git 仓库，即用 Git 去控制这个目录。命令执行后会生成 `.git` 目录，里面存放 Git 的版本数据和配置。

```cmd
git init
```

如果删除 `.git` 目录，就代表这个目录不再被 Git 管理，不过工作区中的普通文件不会自动删除。

### 2.  git clone

这个命令是从现有仓库中拷贝项目，会把远程仓库的完整历史和当前代码一起复制到本地，并自动配置好远程仓库。

```cmd
git clone https://github.com/user/repo.git
git clone https://github.com/user/repo.git my-project
```

第一种会使用仓库名作为目录名，第二种会把项目克隆到 `my-project` 目录里。

## Git  工作区、暂存区和版本库

Git 里比较核心的三个区域是工作区、暂存区和版本库。

- 工作区就是当前项目目录里实际看到和编辑的文件。
- 暂存区是 Git 用来准备下一次提交的地方，可以理解为一次提交前的清单。
- 版本库是 `.git` 目录，里面存放提交历史、分支、标签等数据。

常用命令如下。

```cmd
git status                         # 查看当前文件状态
git add <filename>                 # 添加单个文件到暂存区
git add .                          # 添加当前目录所有更改到暂存区
git commit -m "commit message"     # 提交暂存区的更改到本地仓库
git diff                           # 查看工作区中还没有 git add 的修改
git diff --cached                  # 查看暂存区中还没有 git commit 的修改
git restore <file>                 # 丢弃工作区修改
git restore --staged <file>        # 撤销 git add，从暂存区移回工作区

```

一个最基础的提交流程就是：

```cmd
git status
git add .
git commit -m "init project"
```

`git add` 并不是提交，只是把修改放到暂存区。真正生成版本记录的是 `git commit`。

## Git  文件状态

Git 中文件大概会经历这几种状态。

| 状态 | 说明 |
| :-- | :-- |
| `Untracked` | 新文件，还没有被 Git 跟踪 |
| `Modified` | 文件已经被修改，但是还没放进暂存区 |
| `Staged` | 修改已经放进暂存区，等待提交 |
| `Committed` | 修改已经提交到本地仓库 |

比如新建一个文件后，`git status` 会显示它是 `Untracked`。执行 `git add` 后，它会变成 `Staged`。再执行 `git commit` 后，这次修改就进入版本库。

## Git  查看历史

查看提交历史一般用 `git log`。

```cmd
git log
git log --oneline
git log --oneline --graph --decorate --all
```

`git log --oneline` 会把每次提交压缩成一行，比较适合快速查看。`--graph` 可以看到分支合并关系。

查看某次提交的具体内容，可以用：

```cmd
git show <commit-id>
```

只查看某个文件的提交历史：

```cmd
git log -- <file>
```

查看每一行最后是谁改的：

```cmd
git blame <file>
```

## Git  分支

分支可以理解为从某个提交点分出来的一条开发线。平时开发新功能、修 bug，最好都单独开分支，避免直接在主分支上乱改。

```cmd
git branch                         # 查看本地分支
git branch <branch-name>           # 创建分支
git switch <branch-name>           # 切换分支
git switch -c <branch-name>        # 创建并切换分支
git branch -d <branch-name>        # 删除已经合并的分支
git branch -D <branch-name>        # 强制删除分支
```

比如创建一个功能分支：

```cmd
git switch -c feature/login
```

开发完成后，切回主分支并合并：

```cmd
git switch main
git merge feature/login
```

如果两个分支修改了同一个文件的同一部分，就可能出现冲突。解决冲突时，需要手动编辑文件，保留最终想要的内容，然后重新 `git add` 和 `git commit`。

## Git  merge 和 rebase

`merge` 和 `rebase` 都可以把一个分支上的修改合到另一个分支，但历史记录的形状不一样。

`merge` 会保留真实分支结构，可能产生一个新的合并提交。

```cmd
git switch main
git merge feature/login
```

`rebase` 会把当前分支的提交搬到目标分支最新提交之后，历史看起来更直。

```cmd
git switch feature/login
git rebase main
```

简单来说，想保留完整分支历史可以用 `merge`，想让提交历史更线性可以用 `rebase`。已经推送到公共远程分支的提交不要随便 rebase，因为它会改写提交历史。

## Git  远程仓库

远程仓库一般用于代码备份和多人协作。最常见的远程名是 `origin`。

```cmd
git remote -v
git remote add origin https://github.com/user/repo.git
git remote remove origin
```

推送代码到远程：

```cmd
git push origin main
```

第一次推送时可以加 `-u`，让本地分支和远程分支建立跟踪关系。

```cmd
git push -u origin main
```

之后就可以直接：

```cmd
git push
git pull
```

拉取远程代码主要有两个命令。

```cmd
git fetch
git pull
```

`git fetch` 只是把远程最新数据拉到本地，不会直接改工作区。`git pull` 相当于 `git fetch` 加上合并操作，会把远程分支合到当前分支。

## Git  撤销和回退

撤销操作要先看修改处在哪个位置。

如果只是工作区改了，还没 `git add`：

```cmd
git restore <file>
```

如果已经 `git add` 了，但还没提交：

```cmd
git restore --staged <file>
```

如果已经提交了，但想改最后一次提交信息：

```cmd
git commit --amend
git commit --amend -m "new message"
```

如果想回退到某个提交，可以用 `git reset`。这个命令要谨慎，因为不同参数影响不一样。

```cmd
git reset --soft <commit-id>   # 回退提交，修改保留在暂存区
git reset --mixed <commit-id>  # 回退提交，修改保留在工作区，默认就是 mixed
git reset --hard <commit-id>   # 回退提交，并丢弃工作区修改
```

如果提交已经推送到远程，通常更推荐用 `git revert` 生成一个反向提交，而不是直接改历史。

```cmd
git revert <commit-id>
```

`reset` 是把分支指针移回去，`revert` 是新增一个提交来抵消之前的提交。

## Git  stash

`stash` 用来临时保存当前工作区修改。比如当前分支改到一半，突然要切去另一个分支修 bug，就可以先把现场存起来。

```cmd
git stash
git stash push -m "message"
git stash list
git stash pop
git stash apply stash@{0}
git stash drop stash@{0}
```

`git stash pop` 会恢复最近一次 stash，并把它从 stash 列表里删除。`git stash apply` 只恢复，不删除。

## Git  标签

标签一般用来标记版本，比如 `v1.0.0`。

```cmd
git tag
git tag v1.0.0
git tag -a v1.0.0 -m "release v1.0.0"
git push origin v1.0.0
git push origin --tags
```

轻量标签只是一个简单标记，附注标签会带上标签信息、创建者和说明，一般正式发布更推荐用附注标签。

## Git  忽略文件

`.gitignore` 用来配置不需要进入版本控制的文件，比如依赖目录、构建产物、环境变量文件等。

```gitignore
node_modules/
dist/
.env
*.log
```

如果一个文件已经被 Git 跟踪了，再写进 `.gitignore` 不会自动生效，需要先从暂存区移除跟踪。

```cmd
git rm --cached <file>
git rm -r --cached <dir>
```

这里只是取消 Git 跟踪，不会删除本地文件。

## Git  常见工作流

个人开发时，一个比较常用的流程是：

```cmd
git switch main
git pull
git switch -c feature/demo

# 修改代码
git status
git add .
git commit -m "add demo"

git switch main
git pull
git merge feature/demo
git push
```

多人协作时，一般会把功能分支推到远程，然后通过 Pull Request 或 Merge Request 合并。

```cmd
git switch -c feature/demo
git add .
git commit -m "add demo"
git push -u origin feature/demo
```

这样主分支会更稳定，每个功能也有独立的分支记录。

## Git  常用命令整理

最后整理一下常用命令，方便之后查。

```cmd
git status                         # 查看当前状态
git add .                          # 添加修改到暂存区
git commit -m "message"            # 提交修改
git log --oneline                  # 查看简洁提交历史
git diff                           # 查看工作区修改
git diff --cached                  # 查看暂存区修改

git branch                         # 查看分支
git switch <branch>                # 切换分支
git switch -c <branch>             # 创建并切换分支
git merge <branch>                 # 合并分支
git rebase <branch>                # 变基到指定分支

git remote -v                      # 查看远程仓库
git fetch                          # 拉取远程数据，不自动合并
git pull                           # 拉取并合并远程代码
git push                           # 推送代码

git restore <file>                 # 丢弃工作区修改
git restore --staged <file>        # 撤销暂存
git reset --soft <commit-id>       # 回退提交，保留暂存区
git reset --mixed <commit-id>      # 回退提交，保留工作区
git revert <commit-id>             # 用新提交撤销旧提交

git stash                          # 暂存当前修改
git stash pop                      # 恢复最近一次暂存
git tag                            # 查看标签
```

Git 的核心其实就是先理解几个区域，再熟悉提交、分支、远程、回退这几类操作。命令很多，但日常真正高频使用的并不多，剩下的遇到具体场景再查就行。
