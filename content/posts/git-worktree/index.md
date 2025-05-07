+++
title = 'Git Worktree 減少克隆數'
date = 2025-05-07T20:37:10+08:00
categories = ['筆記']
tags = ['軟體']
+++

上週又發現朋友不知道 git worktree 指令。決定來介紹一下。

# 官方文件
https://git-scm.com/docs/git-worktree
目前沒有繁中版，待有志之士翻譯。

簡言之，`git worktree add <path>` 指令的功能類似 `git checkout -b <branch>`。一般的 `git checkout` 會更動目前檔案系統的檔案，變成指定的版本；而 `git worktree add` 則是會產生一個新的 `<path>` 資料夾，裡面的檔案會變成指定的版本。

# 使用情境
使用 monorepo 的後端工程師，可能多少遇過類似的情況：
- 手上有一個專案在寫，涉及兩個服務，各開一個分支。
- 一個服務寫差不多了，準備 merge 進測試環境。
- 同事送來五百行改動，請你這週看完。
- 值班時 QA 跟你說測試環境壞了。檢查發現某同事 bug 修完來不及 merge 就請假了。只好幫他做。
- 值班時對接的公司反應沙盒環境行為跟線上不一樣，請你檢查。
- PM 跑來確認，他要的新功能跟目前的上古邏輯有無沖突。

由於兩個服務平行開發，merge 不能半途而廢等原因。同一個 repo 自然會在本地有好幾份。
```
$ ls ~
team-repo
team-repo-pj1-serviceA
team-repo-pj1-serviceB
team-repo-test
team-repo-ongoing-codereview
team-repo-sandbox
team-repo-production
```

若這些 repo 是各自 clone 下來的，會產生一些不便：
- origin 更新時，每個資料夾都要自己 fetch 一次，少碰的資料夾會忘記 fetch。
- 想要 merge 另一個資料夾的 branch 時，必須先把它推上去再拉下來。

於是 git worktree 就派上用場了。只要 clone 了 `team-repo` 之後，
```
git worktree add team-repo-pj1-serviceA
```
就可以直接複製出歷史版本互通的資料夾了。
（若各資料夾繁多且獨立，豈不是等於沒有版本管理？）

# 原理
一般 `git clone` 下來的資料夾，裡面會有一個隱藏的 `.git` 存所有的歷史資料。
而 `git worktree add` 造出的的資料夾，`.git` 會 softlink 到本尊資料夾的 `.git`。
![.git檔說明圖](/images/git-worktree.png)
註：事實上不完全是一個 softlink，而是一個普檔案裡面放連結，整個 link 的邏輯還是刻在 git 指令裡。

# 各種閒聊
> git worktree 太好用啦！

> 我們公司是一個產品一個 branch，不是一個資料夾。我也不知道為什麼。

> 我會知道 git worktree 是因為我們公司內部有教學。教學的目標讀者是慣用古代版控工具的前輩。

> 同事你好，之前麻煩你們處理腳本中 .git 非資料夾的狀況，現在可能不需要了。因為我今天被裁員了……
