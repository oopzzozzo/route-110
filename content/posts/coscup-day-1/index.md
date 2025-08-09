+++
title = 'Coscup Day 1'
date = 2025-08-10T01:59:54+08:00
categories = ['活動']
tags = ['軟體']
+++

### 報到
之前大學畢業後一直想找時間參觀，但人都不在台灣。
參加 Coscup 不用錢也不用報名，人直接出現在台科大，拿名牌寫就可以了。

### 議程
https://coscup.org/2025/sessions/
總共有 13 間教室，UI 有點不太友善。我本來預計要聽
- 自己的 kernel 自己簽：secure boot 的開源之旅
- Exposing an Open Source Kernel using an Open Source Database The OSDB Project
- 管你要 trace 什麼、bpftrace 用下去就對了
- 利用 Linux 和 RTOS 進行異質多核處理器之間的通訊（衝堂）
- Philosophy of Observability
- 寫合約好麻煩？那就用現成的！無痛入門 Solana 應用開發
- 自旋鎖大進化：為你的多核電腦量身打造高效同步術！
- Postgresql 時間資料型態處理的一些探討
- 作爲甲方，我在推動數位公共建設所面臨的開源難題。
- 藉由 sched_ext 實作客製化 Linux CPU 排程器（小衝堂）
- Running Python in the Browser: Practical Applications with Pyodide
- CPU resource allocation with cgroups v2 and systemd

結果
- 衝堂的沒聽到
- Solana 因為午餐排比較久，改聽「林博仁的台灣中文內容翻譯指引」後半場
- 數位公共建設甲方因為我跑教室有點久，改聽「海纜斷光會怎樣？數位服務韌性檢測框架，及網站開發者該如何預防與準備」，從而不及聽下一場
- CPU resource allocation 好像性質跟自旋鎖有點像，就改聽了「Build a system with the filesystem maintained by OSTree」


### 自己的 kernel 自己簽：secure boot 的開源之旅
- 介紹 SPI -> bootloader -> OS 的流程
- 有四個 Key
  - Platform Key (PK)
  - Key Exchange Key (KEK)
  - Signature Database (db)
  - Forbidden Signature Database (dbx)
- 在 Machine Key 存在的情況下，可以用 shim 加入自己的 Machine Owner Key
- Grub 這個 bootloader 解密全硬碟是軟體模擬，所以很慢
  - 於是 /boot 不加密，其他東西用 PGP 簽
  - 但每樣要簽的東西，都有各自問題。如 Grub 自己的字型檔。

### Exposing an Open Source Kernel using an Open Source Database The OSDB Project
- 說 relational database 有 relation，使人容易理解，不用通靈說我要看 port 的話該下 ps 還是 lsof 指令。
- 講者在 FreeBsd 裡塞 code，讓人可以用 sql 拿 kernel state data
- 插播介紹 sqlite
  - 能塞 C struct 進 DB 裡。
  - 有一位負責回所有信的 maintainer
  - [License](https://spdx.org/licenses/blessing.html) 很酷
  - 到處都是，像蟑螂一樣（你把 cockroachDB 放在哪裡？）
- 基礎假設是什麼都可以 kernel lock 拿 snapshot（我個人存疑，難到沒有不同 thread 看到不同時序的可能？）

### 管你要 trace 什麼、bpftrace 用下去就對了
- 介紹 bpftrace 怎麼用
- bpftrace 會 trace 所有的 process
- 有統計功能
- 效能好又不會把東西弄壞
- 有人問能不能 probe memory 裡某個特別的 object。雙方的認知就是只能 memory hardware interrupted，效能差又有數量限制。

### Philosophy of Observability
Grafana Labs 的贊助演說，主張
- same observability tool -> agreement in numbers
- Loki, mimir saves a lot of space

提問：「有什麼理由不買雲端服務商的 Grafana 嗎？」
講者：「Security Update 比較慢。」我認為這個回答不太好，付錢用雲端服務的人，很可能不介意當眾多壞掉的公司之一。

### 午餐
今天有開
- 加熱滷味：進門左邊，蠻多人的
- 自助餐：換一家了，暑假週六菜不多，無吸引力
- 李媽媽
- 涼麵吧：原本賣清真義大利麵的角落

我吃涼麵吧的菜菜三杯蕃茄烏龍麵加一顆蛋。三杯調味很麻，加上自選五樣涼涼的配菜，一下就吃完了。
不過今天只有兩個人做，人手明顯不足，等了十多分鐘。

### 林博仁的台灣中文內容翻譯指引
我只聽到後半場
- 舉一些例字，以信達雅評分。
- How to deal with ISO3166: Taiwan, Province of China
    - Replacement standards
    - Prioritize Common known names in ISO3166 over standard names in ISO3166
- Hackmd 裡 `{big text|the ruby}` -> `<ruby> 內文<rt>注解<rt> <ruby>` -> <ruby> 內文<rt>注解<rt> <ruby>

### 自旋鎖大進化：為你的多核電腦量身打造高效同步術！
- 主講感覺是練講了三十遍的研究生
- spinlock 缺點
    - spinlock: 不同 thread 一直 probe 同一個 volatile 變數
    - 問題是在 lock 釋放的瞬間，所有 thread 都會發一個貴貴的 atomic operation，卻只有 1/N 搶到
- 引入 linked-list，每條 thread 各自 probe 自己 node 上的 volatile 變數
後面我有點沒跟上，聽下去價值好像也不高，就去下一場了。

### Postgresql 時間資料型態處理的一些探討
我看標題以為是處理時間序資料，走進去才發現是在介紹資料型態。有點失望。
Postgresql 有 TZ，TZ column 也有 default TZ。底下存的是 int8 us 時間戳，錨點為 2000-01-01 00:00 UTC。
我：「其他資料庫的實作一樣嗎？現在大家都用 ORM，這有影響到 ORM 的設計嗎？」
講：「我不太瞭解 ORM，我都直接用 Database 比較多。」
我身邊：「你有 ORM 的話，DB 就一律設 UTC+0 不要管他就好。」

### 海纜斷光會怎樣？數位服務韌性檢測框架，及網站開發者該如何預防與準備
其實檢測框架是蠻好的問題，萬安不實際把台灣斷網的情況下，如何知道斷網的影響？

目前只有初步分析，網頁有沒有連國外 IP，當作韌性指標。或是直接問營運公司斷了會怎麼樣。
> Line 變成基礎設施，沒有它的話政府不運作怎麼辦？號稱超商是緊急物資中轉站，問題是物流人員上不了班有用嗎？

> Google 宣稱台灣有 Chat 的 server，所以對外斷掉還是可用。但是你得先下載下來，等真的斷掉那天，才知道是不是還登入得進去。

講者能做的其實也就是
- 呼籲大家關注電䌫 [smc.peering.tw](https://smc.peering.tw)
- 呼籲台灣長出修電䌫技能（目前只有舖電䌫船），防人禍也防天災。尤其國內電纜沒有外資，排不上維修。對離島軍民不利。
- 呼籲政府不要砍掉台東電䌫登陸站的預算
- 呼籲日本南方小島接電䌫到北台灣

然後他說他在找人贊助研究。

### Running Python in the Browser: Practical Applications with Pyodide
就只是 Demo 幾個科學計算腳本，說它好厲害。
問：「有沒有檔案系統」
答：「只有 Pyodide 接 browser 接的 library。」

### Build a system with the filesystem maintained by OSTree
OSTree 是一個 git-like 的分散式版本工具，功能是幫忙更新 OS 的檔案系統和 bootloader。

講者朋友：「我工作機是 Fedora，所以我有用 ostree，你的工作機呢？」
講：「嗯⋯我是 Arch Linux。」
友：「吼，所以你還是喜歡自己管 package 嘛，在這邊宣傳然後自己不用。」
講：「耶不是，這種發佈的模式就比較適合公司或教育場景，不是個人開發用的工作機啦。」

### 晚餐
去公館吃靜壽司，鮭魚醋青花丼飯。醋青花比預期酸也比預期軟，咬下去沒有亂流汁出來。

### 晚上心得
短時間內隔棟趕場有點累，然後我好像戴眼鏡血條會掉比較快，人也比較不友善，但是不戴又看不到。
本來想邊聽邊筆記的。結果午餐前就跟不上了。最後還是回來寫很晚。

明天應該多空一點時間逛逛攤位。
