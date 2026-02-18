+++
title = 'Re: 解釋'
date = 2023-04-11T22:37:07+08:00
lastmod = 2023-04-11T22:37:07+08:00
categories = ['討論']
tags = ['批兔']
+++
> [
繼**超過一個人用浮點數存金額**之後。昨天又一奇葩問題被問第二次<br>
我：「不用時區啊」「unix timestamp 又沒有時區。」<br>
是說有經驗的人到底是預期到有這類問題，還是單純被問任何問題都能快速講出來啊？
]({{<ref "explain">}})<br>

結果今天又被問一次︰「我們 DB 裡存的 ctime（unix timestamp）是什麼時區啊？」<br>
我都開始懷疑是公司找人太雷還是我標準太高了。<br>
"seconds since the Unix epoch" 學到定義是不會馬上檢查一下它跟時區有沒有關嗎？<br>
<br>
開始認真考慮以後要不要直接跟別人說「我們的 timestamp 是存 UTC+0 時間」，<br>
要一本正經地說這種鬼話好難喔…<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
