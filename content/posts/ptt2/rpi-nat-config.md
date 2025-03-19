+++
title = '樹莓派 NAT 設定'
date = 2020-03-02T00:43:36+08:00
draft = false
lastmod = 2020-03-02T00:43:36+08:00
categories = ['筆記']
tags = ['批兔']
+++
交換學生一學期後，我拿出半年沒開機的樹莓派，想先在家裡確定它能用。<br>
```
$ sudo apt update
91 packages can be upgraded ...
$ sudo apt upgrade
..
can not stat XXXX ...
```
看起來是更新 e2fsprogs 時出問題，接下來做什麼都會在檔案系統遇到問題。<br>
google 一下，有人說是 chattr, lsattr 的問題，我就用電腦下載新的執行檔覆寫。<br>
```
$ sudo apt upgrade
can not stat XXX/man1/XXX ... (I/O error)
```
我用電腦覆寫這個檔案，結果電腦跟我說這是 Read Only Device...<br>
推測是壞軌（記憶卡也叫壞軌嗎），試著 rm -rf 上層資料，成功後重新把檔案載回來。<br>
```
$ sudo apt upgrade
can not stat XXXXXX ... (I/O error)
```
這樣下去沒完沒了，於是我決定整個刷掉重來。<br>
<br>
### 然後我到了宿舍
照著下面這兩個做<br>
https://www.raspberrypi.org/documentation/configuration/wireless/access-point.md<br>
https://medium.com/@chungyi410/%E5%B0%87-raspberry-pi-%E7%9A%84-eth0-%E7%B6%B2%E8%B7%AF%E4%BB%8B%E9%9D%A2%E8%A8%AD%E5%AE%9A%E5%9B%BA%E5%AE%9A-ip-43010aa3effb<br>
<br>
> Start it up<br>
Now enable and start hostapd<br>
..<br>
Do a quick check of their status to ensure they are active and running.<br>
...

<br>
咦，有奇怪的訊息，怎麼辦？我筆電連的到樹莓派，卻上不了臉書，大概是 DNS 問題。<br>
可是樹莓派本身上得了臉書。我弄了超久，還回家遠端，還是弄不懂。<br>
結果今天回宿舍打開上面兩個連結想說重做一遍，才發現...<br>
原來 Start it up 後面還有步驟我沒做完，當然還不能用...<br>
<br>
明明照著做就能用了，超簡單被我弄的超複雜...<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (臺灣)<br>
