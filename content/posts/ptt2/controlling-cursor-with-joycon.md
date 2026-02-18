+++
title = '用 joycon 當滑鼠'
date = 2022-12-26T15:13:56+08:00
lastmod = 2022-12-26T15:13:56+08:00
draft = false
categories = ['筆記']
tags = ['軟體', '硬體', '批兔']
+++
前陣子察覺懶人桌的設計不太適合用滑鼠，把滑鼠放床上，手腕比較舒適。<br>
結果滑鼠擺床上久了，身體就自動躺平，於是把鍵盤也放到床上左手邊，剩眼睛看螢幕。<br>
想起一年多前看 Http 203 [把 joycon 當簡報筆](https://youtu.be/cGyLHxn16pE?t=172)。<br>
我決定效法，這樣我也不用懶人桌了，直接把床搬到電視前，躺著控制就行。<br>
<br>
第一步是買 joycon。副廠除了形狀不一樣，最大的差別是右手沒有紅外線攝影機。<br>
說不定我哪天會想用現成的紅外線攝影機來看我家微波爐，估且就買正版。<br>
因懶得去森林廣場，就等 12.12 電商比較便宜時下單，然後我晚上才買，只剩怪顏色。<br>
等到貨拆箱，我才意識到手把不附充電器。只好再上網買，又多等了一趟中到星的物流…<br>
<br>
隔了一個月總算開始。<br>
左右兩支手把各是獨立的藍牙裝置。似乎只能用裝置名 Joy-Con (R) 來區分。<br>
要讓兩支合作可能得費一番功夫，但我只是要拿一支當滑鼠用，所以都有人幫我做好了。<br>
> sudo apt install joystick # 下載 joystick 的 X11 驅動程式<br>
> sudo vim /usr/share/X11/xorg.conf.d/50-joystick.conf # 設手把按鍵對應 keycode<br>
教學都在 man joystick，不確定自己按了什麼鍵的話可以用 xev 指令測試。<br>
要知 xorg config 是在啟動時載入，所以要 logout 並用 xorg login 才會生效。<br>
<br>
我嘗試後的按鍵碼(R)，基本上橫放時(L)的鍵會對應，但直拿時就差 180 度：<br>
 1: A<br>
 2: X<br>
 3: B<br>
 4: Y<br>
 5: SR<br>
 6: SL<br>
 9: -<br>
10: +<br>
13: home<br>
14: capture<br>
15: R<br>
16: ZR<br>
沒測到按磨菇頭的部份，可能是 7,8,11,12 之一吧。<br>
<br>
為了設定對應的 keycode 以符合使用，於是我想說先來設個 benchmark。<br>
想想我平常在床上用電腦的情境。通常不太需要專注，大概就看看漫畫或 YouTube。<br>
然後等 login 時轉念：「既然不用專注，那其實也不重要，不看去睡就好啦！」<br>
搞了半天，原來我在降低自己耍癈的門檻，而不是增加效率和工作的舒適度…<br>
看來要認真研究如何整合兩支 joycon 模擬鍵盤輸入，才有可能增進效率。<br>
<br>
目前配置和使用心得(R)：<br>
蘑菇頭：游標移動，好像是 xy 軸的慣性是獨立計算，操作白痴如我用起來不太靈活。<br>
方向鍵：捲動，要調到剛好的捲動尺寸不太容易。<br>
R/ZR  ：滑鼠左右鍵，本來就是用食指按，沒啥問題。<br>
SL/SR ：ctrl 和 shift<br>
+/home：tab 和 W 用來切和關瀏𣞢器分頁<br>
有考慮把左右捲動改成瀏𣞢器上一頁下一頁，但按 shift + 上下好像不太直覺。<br>
尤其看電視距離遠，若沒戴眼鏡，會很常放大並左右捲。<br>
原來想要遠離電腦桌，問題不只是電腦的輸入介面，還有我的視力和聽力。<br>
<br>
話說我是這次才弄懂 xorg 是什麼，相關名詞：<br>
X Window System：一個視窗系統標準，提供 IO 整合介面。方視窗，不能旋轉，可捲動。<br>
X11：X Window System 版本 11<br>
X server：提供 X Window System 介面供 client 應用的程式。可以遞迴。<br>
Xorg：X Window System 的標準 X server 實作<br>
GUI：如 Gnome, KDE 都可以蓋在視窗系統之上。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
