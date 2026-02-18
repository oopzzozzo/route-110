+++
title = 'Coscup Day 2'
date = 2025-08-10T23:45:41+08:00
lastmod = 2025-08-10T23:46:20+08:00
categories = ['活動']
tags = ['軟體']
+++
### 議程
今天想看的有
- 4色小尺寸電子紙的DRM驅動程式開發之旅
- 極致量化：用少於兩個位元表示 LLM 的權重
- 適合新手的非程式碼貢獻：Kubernetes Release Team 簡介（跟下一場衝）
- Building and Maintaining Regional Language Support Communities in Global Open Source Projects ~ Insights from the LibreOffice Japanese Community Forum ~
- Ethereum Object Format (EOF): Necessary Evil or Needless Complexity?
- No Hardware, No Problem: Exploring OpenBMC and Host SoC Communication on Arm FVP
- Interprocess Music/Audio Signals Routing Paradigm in Modern Linux : Sound interoperation within Linux (and Other OSes) using PipeWire and more（衝堂）
- 共筆維護試算表比共筆維護地圖門檻更低!
- 使用GDB來針對BMC做除錯
- Apache Ozone 新一代分散式檔案系統介紹與貢獻歷程分享

結果：
- EOF 在午餐後，我吃完先去逛攤位，逛完晚進去一下沒聽懂，就決定出去繼續逛攤位。
- 維護地圖時間上就無法聽完全場，我也果斷放棄去。
### 4色小尺寸電子紙的DRM驅動程式開發之旅
我比較晚到，只聽到後半。

電子紙是用 SPI 介面，mmap 到 framebuffer 後，驅動程式會對 buffer 做一些後處理並寫出去。

### 極致量化：用少於兩個位元表示 LLM 的權重
介紹 bitnet，為少記憶體情境而設計的模型。
- 把格邊權重變成 0, +1, -1，乃至存成一張可以查的表。
- 能源用量真的低。可以從無到有訓練，訓練時就會做 drop。
- 觀察到一般的模型其實會有非常少的大 weight，可能是 bitnet 訓練比較慢的原因。

### 適合新手的非程式碼貢獻：Kubernetes Release Team 簡介
介紹現在的制度，每個小組的工作和忙的時間。

Kubernetes 通常每年 4, 8, 12 月發佈 minor 版本。每版會經過
- v1.x.0-alpha/beta.y
- v1.x.0-rc.y
- v1.x.0 文件更新
- v1.x.y 發佈

我結束前就去聽下一場了。後來在社群攤位遇到講者，
問他這份工作有什麼好玩或值得他做下去的地方。他說是可以認識不同人，並觀測第一手的消息。

### Building and Maintaining Regional Language Support Communities in Global Open Source Projects ~ Insights from the LibreOffice Japanese Community Forum ~
日本 LibreOffice 社群，每週晚上七點多線上會議，觀迎不想開鏡頭也不想開麥講話的人加入。每場平均也就三五個人。主要就是聊現在討論版上有出現什麼 bug、有什麼新聞之類的。

Libreoffice 疫情時使用者顯著增加。推測是企業遠端桌面或是雲端使用者，因為用虛擬機，所以不傾向用 Microsoft。

Libreoffice 去年開始有繁中 support。
台灣政府比較硬，日本 Microsoft 比較大聲。號稱影響力比韓國政府大。所以日本也是先推公開格式，無法去管到大家的軟體。

### 午餐
今天加熱滷味沒開，開了溫州大餛飩。自助餐東西比昨天多，儘管我印象中的大一女自助餐更吸引人，為了快我還是吃了。

我看好像很多與會人不知道學餐在地下一樓，所以吃小七和清心。

### 社群攤位
其實我會前沒注意到有三間教室是攤位，以為只有走廊上少少幾攤。後來中午進了三樓的兩間，發現四樓還有時已來不及了。

- Tenstorrent 一位目測韓國人，介紹他們的通用運算硬體，RISC-V CPU + tensix 晶片，說能源效率高、有 pytorch 支援，產品週期二到四年。
- g0v 是一個 slack 上會約出來黑客松的社群，不時會有人發想並開新專案。過往花許多力氣要求政府開放資料，現在開始有更多資料處理和傳播的專案。
- Hacking Thursday x TOSSUG 每週四晚上台北聚會，什麼都討論。
- WCAP 一位目測是日本人很有禮貌的發傳單，我的理解是他們好像在推廣某種認證。
- Mozilla 台灣社群，也是每週聚會。天瓏旁邊的摩茲工寮供開源活動借用。
- Ubuntu 台灣社群，我問他們平常做什麼。他們說也沒做什麼，就是版本發佈時找各軟體的人來辦一個派對。反正大家遇到問題也是找軟體本身的社群或是 Arch，頂多 GNOME 比較沒有其他人在關心。
- AWS User Group 北部每週四在 AWS 辦公室聚會，也有台灣線上聚。消息在臉書粉專。
- SITCON 對到眼就聊了一下，問了一下成員組成（大家都為什麼參加），對方只說什麼人都有，也不知道參加的動機。
- OCF 什麼都開放，最近幫藝術家做了開放版權的專輯。
- Video LAN 有擺攤，攤上的人戴了一頂大三角錐（VLC）帽，扮相有趣但我沒講到話。
- CloudMosa 做低階按鍵手機的 App store，實現社會正義。徵才中。他們合作的品牌，手機壽命約二到五年算多。

### No Hardware, No Problem: Exploring OpenBMC and Host SoC Communication on Arm FVP
介紹說 ARM 開始在討論他們的 server 用 cpu 缺什麼 BMC 介面，並上到開源的 OpenBMC。然後他們先做了一個 virtual machine 出來，叫做 FVP。

### Interprocess Music/Audio Signals Routing Paradigm in Modern Linux : Sound interoperation within Linux (and Other OSes) using PipeWire and more
講者講話的結構我有點聽不懂，還是講英文⋯

有聽懂的部份：
- Linux 歷來常見的音訊管線工具 alsa -> pulseaudio -> pipewire
- 常見的 Jack 目標使用者是音樂創作者，旨在處理低延遲的使用情境。有些部份的邏輯會是「來不及處理就放棄」。
- 現代音訊處理功能日益複雜，往往會出現 Session managers 協作不同程序甚至機器。

我問 pipewire 跟 pulseaudio 有什麼顯著不同。講者說有一部份是在處理 wayland 等新介面的安全性限制，然後藍牙有顯著進步。早上在 Libreoffice 場出現的日本人說：「pipewire 明顯有做音訊的時間同步，在結合影音處理時會很明顯。」

### 使用GDB來針對BMC做除錯
BMC 指 Baseboard Management Controller，主機板上的微控制器，有自己的網路，可以用來監控 CPU 跟 OS 有沒有炸掉。

微控制器上會跑獨立的 OS，但容量有限，不見得能裝上整個 symbol table debug。講者說他經常是 coredump 出來，拿 instruction pointer 扣掉 objdump -j .text 的 offset 找壞掉的指令。

目前 OpenBMC 是開源的，各品牌和 ODM 廠都會用。講者：「一般人可能很難接觸到 BMC 的硬體，如果感興趣的話 OpenBMC 可以自己裝在樹莓派上玩看。」正常人哪會對 BMC 感興趣啦？那間教室坐了七八成滿，應該多是從業人員吧。

### Apache Ozone 新一代分散式檔案系統介紹與貢獻歷程分享
Apache Ozone 是一部分散式檔案系統，HDFS（Hadoop Distributed File System）的後繼者。主要差別有
- HDFS 的 index 都放在記憶體，Ozone 有寫進儲存裝置，使得單一機器能存的檔案數量不受限於記憶體。（單機容量 100TB -> 500TB）
- Ozone 會把檔案包成約 5 GB 一包的單位，方便搬動以均衡負載。

滴滴把 Ozone 魔改出了有 master-slave rotation 的版本。另一個積極共頁獻的是我前司。做了 cold-hot storage 和單次搬移大量檔案的功能。

我聽完才知道我以前用的公司 s3 背後是 Ozone，但我也想不起來做 s3 的同事有誰。可能他們叫同事搬家的時期，我都不是第一個去喬的那個勞工吧。講者今年大三，說他不理解為什麼有人想花心力去維護這種一次性的功能。我是很能體會這個東西在公司內會被數十個不同部門用上百次，一會兒把新加坡的資料拆分到巴西，一會兒合併其他團隊移交給我們的 bucket。不做出工具的話就有人要手動，既慢又易錯還會被罵，落入 DBA 常見的工作地獄。

由於最後已經超時，場地要整理了，所以我也沒機會解釋。

### 閉幕
會場演講廳坐滿到走道。主持人念完贊助單位後，有幾段三分鐘的短講。有人用來廣告其他開源活動，也有人用來 demo 自己的東西。其中有一位 demo 自己的專案取名諧音梗。

珍奶色和仙草色的紀念 T 已經沒有我的大小了，本來想買的。

### 晚餐
繞了水源市場一圈，週日晚上東西好像沒那麼好吃。我一路走到七里亭吃，大概是夏天的高麗菜問題，好像沒有以前好吃。印象中以前會有地瓜條，現在居然要加才有。有點後悔，沒有去吃隔壁多人的[素食自助餐]({{<ref "vegan-soy-pudding-restaurant-owner">}})
