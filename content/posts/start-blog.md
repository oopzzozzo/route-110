+++
title = '開始架部落格'
date = 2025-02-02T23:21:07+08:00
lastmod = 2025-03-29T20:59:38+08:00
series = ['架設部落格']
tags = ['軟體']
+++

## 動機
大四時找工作發現，如果有自己的部落格，自我介紹會容易很多。當時就想要架一個部落格，但對學生來說架部落格聽起來不酷，所以也就沒有花時間嘗試。

兩年後我在新加坡偶然被橫書的金庸小說衝擊到，突然覺得我應該來發揚直書中文。於是研究了一下最基本的技術，瞭解到架設靜態網頁大概是：
- 找一個把文章內容 html 的工具，例如
    - hugo 可以把 markdown 轉成 html
    - wordpress.org 提供一個可以編輯 html 的後臺
    - notepad 每篇文章都手刻 html 也無不可。
- 依選定的 html 生成工具，設定標題、版面、分類、文章模版。通常就是從現成的模版裡挑一個。
- 打一些文章，生出對應的 html。
- 把生出的 html 上傳到你的 server 上。
- 確定 DNS 沒問題，大家可以看到你的部落格。

我決定採用 hugo 的 blowfish 主題，blowfish 是建立在 tailwind css 上，能處理多語言切換、亮暗模式以及右至左書寫排版。希望從它開始設定直書比較容易一些。然而試了一下發現我實在不是做前端的料。整個架部落格計畫就被擱置了。

結果去年又開始找工作，又發現我應該要有部落格。重點是先求有再求好。

## 步驟
### 安裝 hugo 和 blowfish
#### 安裝 hugo 並開一個部落格
```
snap install hugo # apt 上的版本太舊
hugo new site route-110
cd route-110
git init
echo 'public/' >> .gitignore # hugo 生出來的 html 會被放在 public/
```

#### 套用現成的 blowfish 主題模版
```bash
cd route-110
hugo mod init github.com/oopzzozzo/route-110

# config/_default/module.toml
[[imports]]
disable = false
path = "github.com/nunocoracao/blowfish/v2"
```
我原本是用 git submodule 載入模版，但是我開 git worktree 的話，branch 出去的那棵 tree 在 debug 時讀不到 submodule 的內容。沒辦法同時在多個 branch 上 debug 不太方便，所以改用 hugo mod。

### 設定 blowfish
```
cd config/_default/module.toml
wget https://github.com/nunocoracao/blowfish/releases/latest/download/config-default.zip
unzip config-default.zip
```
拿到 blowfish 的設定檔後，設定語言、作者、favicon 等……就可以開始寫文章了。

### 丟上 NAS
```
# Makefile
deploy-nas:
    hugo
    rsync -r public/* my-nas:/volume1/web/route-110
```
想到好域名以前，就先將就用 NAS 現成的域名。
