+++
title = 'RSS server'
date = 2024-08-22T01:14:28+08:00
draft = false
lastmod = 2024-08-22T01:14:28+08:00
series = ['架設 RSS']
categories = ['筆記']
tags = ['批兔','軟體']
+++
我很久以前想說要在房間架監視器 ＋ NAS。<br>
可以看我晚上睡得好不好，兼練音樂或運動時可以即時看重播。<br>
大概五月時發現用樹苺派做很麻煩，就訂了基本的 DS223j + 4TB HDD * 2。<br>
<br>
然後既然都有一臺 NAS 了，就得多多利用。<br>
以前用 ThunderBird + Dropbox 收 RSS，裝置間同步常出問題。<br>
於是就去找一包現成的 TT-RSS + postgresDB 映像，放 NAS 上跑。<br>
NAS 會自動把我家的 dynamic ip 登錄 DNS，我只要 port forwarding。
（這另有竅門 https://www.reddit.com/r/singapore/comments/190qeqn/）<br>

但隨著 feeds 增加，先是 feed loading 不出來，之後整臺 NAS 開始當。<br>
經查是 >95% CPU 卡在 IO wait，IO 是 postgresDB 的 diskIO。<br>
先是想 postgres 有沒有什麼設定可以不要 write through 的。<br>
但看來 postgres 收到很多單獨 request，每個 connection 都會產生獨立的 process。<br>
我想像中每個 process 間都要靠 HDD 上的檔案糸統溝通的話，似乎沒什麼改善空間。<br>
於是就想說不如把 postgres 拆開另外架。先架在我的舊筆電測試，看連不連得上。<br>
<br>
TT-RSS 容器 ping 筆電 ping 得通。我就開始在筆電上裝 postgres。<br>
安裝上除了 bin/ 沒被加進 path 以外，沒遇到什麼問題。但搬舊資料好難。<br>
直接把檔案從 container 複製到筆電，筆電的 postgres 會嫌版本不符。<br>
pg_upgrade 需要新舊兩版的 binary，但 container 的 binary 不能在筆電上跑。<br>
改用 dump text command 的話，讀入時會有跳脫字元或特殊符號的問題。<br>
總之我搞不定。於是決定開大招：在筆電上開一樣的 container，這樣版本保證相符。<br>
<br>
開下去後效能問題有解決，才發現：<br>
繞了一大圈，最後就只是把整包東西架在既有的筆電上嘛。完全被 NAS 給迷惑了。<br>
差別是我的筆電沒事就不能休眠，然後 SSD 壽命可能會減少。<br>
為此我還是決定買一張便宜的 SSD，接在樹莓派上，負責跑那些需要高頻 IO 的應用。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
