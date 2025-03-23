+++
title = 'do-while, while, for'
date = 2020-12-01T22:50:28+08:00
lastmod = 2020-12-01T22:50:28+08:00
draft = false
categories = ['討論']
tags = ['軟體', '批兔']
+++
while 跟 for 能做到的事一樣嗎？<br>
剛接觸程式的人心中多半曾蒙生此問，然後大概花幾分鐘想一下，就會發現一樣。<br>
這想法跟了我都快十年了，昨天才驚覺其中竟有蹊蹺。<br>
<br>
while 不能使用區域變數做為判斷條件。<br>
即是說，若非借助 if 或 break 或雙層，while 迴圈執行有限次之前後，必有狀態改變。<br>
<br>
回過頭看，這才是我們需要 for 語法的原因吧，我們需要一個執行完不留雲彩的操作。<br>
<br>
讓我來腦補一個故事：<br>
很久很久以前，在人類還會寫組合語言的時代──流程控制全靠 conditional branch。<br>
其順執行方向跳便是 if not (unless)，逆向跳則是 do-while。<br>
於是 do-while 以人盡皆用之姿，躋身程式語言必備語法。<br>
但馬上大家就發現，迴圈一定要執行一次很不方便，所以有了前測的 while；<br>
隨著語言變得高階，變數的範圍開始受到重視，由此產生了 for；<br>
再來是平行處理和 iterator pattern 的加持，而催生各種流派的 range loop。<br>
<br>
真是越長大越覺得，程式語言就是人造語言的一種。<br>
它的演化不會通往無極，而是會走向高熵。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (臺灣)<br>
Re: 好有道理，有符合 for 這個字的本意～<br>
Re: 嗯，況且在自然語言中，for 的這個 range 甚至不需要是可列舉地。<br>
