+++
title = 'Ubuntu 上的中文輸入法'
date = 2021-02-14T23:21:05+08:00
lastmod = 2021-02-14T23:21:05+08:00
draft = false
categories = ['筆記']
tags = ['軟體', '批兔']
+++
裝中文輸入法大概是所有中文使用者換到 linux 系統時，首先要面對的問題。<br>
而我至今還搞不定。<br>
<br>
在 linux 上處理文字輸入，首先需要一個框架，如：fcitx, gcin, ibus, scim...<br>
這個框架基上就是一支 deamon，把鍵盤事件轉成應用程式想吃的東西。<br>
一個好的輸入法框架，能讓我們訂出不同的輸入法（可簡單想成按鍵到字的對照表）<br>
並支援各種應用程式，如 qt4, qt5, gtk2, gtk3…<br>
顯然，在同一個框架下切換輸入法不是什麼問題，切換方式由框架決定；<br>
若要切換框架則相當麻煩，動輒 reboot，一般也不會在一個 OS 上裝多種輸入法框架。<br>
然後所謂框架，就是沒有要統一意思嘛，當然就各有各的優劣（bug）。<br>
<br>
知道了框架和輸入法的關係，就可以來裝輸入法了。<br>
在 debian 上，假設我想要用注音輸入中文，那我有許多選項︰<br>
```
$ sudo apt install fcitx fcitx-chewing
$ sudo apt install gcin （自帶注音）
$ sudo apt install ibus ibus-chewing
$ sudo apt install scim scim-chewing
```
裝好後再用 im-config 設定使用對應的框架便可。<br>
<br>
我第一次裝 Ubuntu，發現沒有內建中文輸入法時，也沒空仔細研究。<br>
先是裝了某個不會自動選字的注音輸入法，很快就受不了，我甚至不記得我當時裝了啥。<br>
然後就去隨便 google ，聽說 hime（gcin 的人分出來的）好像很厲害，就裝了。<br>
一開始用的感覺除了 UI 還是有點小雷（小窗窗消不掉），就是注音的選字非常神奇，<br>
打「線性」會跳出「線性代數」、打「天龍」會跳出「天瓏書局」…<br>
<br>
後來我換筆電，就直接裝 Ubuntu 18.04，陸續有 qt 唯 super user 能讀檔的問題。<br>
害我開 wire shark、virtual box 之類的都得 sudo，否則開檔案時就會當掉。<br>
之前不知原因，數月前才想到 cat /proc/<pid>/maps ，發現開檔過程有戳到 hime。<br>
果真這個 [bug](https://github.com/hime-ime/hime/issues/580) 約 2 年前就有人報了。<br>
（我好笨，下了 2 年的關鍵字都找不到問題點。）<br>
<br>
眼看這個問題還沒人認領，就先丟到我的最愛，想說有空來研究一下，暫用 ibus 頂著。<br>
然後差不多半年過去，年假到來。上去看了一下，問題好像有人解了，我來 build 看看。<br>
數個小時過去……干～我資工系畢業不會編譯程式～<br>
而且我好像還把什麼東西玩壞了，即使重新 `sudo apt install hime`，還是有一堆問題。<br>
以下筆記我做過的蠢事︰<br>
<br>
### strace, /proc/\<pid\>/maps 抓嫌疑犯 
起先我用 `strace -f -e open mmap wireshark`，想捕捉 wireshark 用記憶體的方式。<br>
但訊息太混亂，看嘸。<br>
於是土法煉鋼，當掉前後分別 `cat /proc/<pid>/maps`，再 diff 看有戳到哪些地方。<br>
抓到嫌疑犯 hime。<br>

### ibus 缺字 
剛換 ibus 時，因為 UI 能調的較少（小窗窗的字體和大小等）有些不習慣。<br>
接著無法克服的痛點是我 ibus-table-cangjie3 用起來會缺字。<br>
例如這篇文有用到的「只」和「注」就打不出來。但 [github 上的 source code 裡](https://github.com/definite/ibus-table-chinese/tree/master/tables/cangjie#L9330)又有。<br>
<br>
原因我也沒深究。<br>
<br>
### hime 編譯 
```
$ sudo apt remove *hime* ibus*
$ git clone https://github.com/hime-ime/hime.git; cd hime
$ sudo apt install libgtk2.0-dev libgtk-3-dev
$ sudo apt install xtst libappindicator-dev
$ sudo apt install qtbase5-dev qtbase5-private-dev
$ ./configure && make
$ sudo make install
$ im-config hime
$ sudo reboot
```
然後工具列無法顯示 hime 的 icon、terminal 無法 ctrl+alt+1 切成倉頡。<br>
<br>
### hime deb 
在 repo root<br>
```
$ sh distro/debian/gen-deb
$ sudo dpkg -i ../hime-*.deb
```
### 找人家打包好的 
我什麼都不會，只好撿[現成的](https://packages.debian.org/search?keywords=hime)。<br>
把東西加到 `/etc/apt/sources.list`<br>
```
$ sudo apt update<br>
$ sudo apt install hime<br>
```
嗯，版本衝突，我不敢再玩下去了。<br>
復原 `/etc/apt/sources.list`<br>

### \*ibus\* 
要移除 ibus 相關 package 時，我理所當然打上 `sudo apt remove *ibus*`<br>
結果刪了一堆重要的東西，然後我居然還無腦 reboot。<br>
看 reboot 轉圈圈，只好進安全模式。<br>
```
$ grep remove /var/log/dpkg.log > list.txt
$ vim list.txt
$ 一些 vim 魔法整理出誤刪的列表
$ xargs -a list.txt sudo apt install -y
$ reboot
```
人生又充滿希望！感恩 log，讚嘆 log！<br>
<br>
真是，資工系畢業連編譯人家寫好的程式都不會。<br>
難怪被說是學店。就是我這種人害的。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (臺灣)<br>
