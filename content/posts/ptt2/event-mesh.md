+++
title = 'Event Mesh'
date = 2024-10-09T14:04:30+08:00
draft = false
lastmod = 2024-10-09T14:04:30+08:00
categories = ['筆記']
tags = ['軟體', '批兔']
+++
昨天下午去聽資通訊局有免費午餐的演講。<br>
進大樓要拿證件給警衛登記。我的工作證（已失效）刷不過。<br>
警衛默默手打，沒有為難我。<br>
<br>
先是介紹 Tyk 獲得的資通訊局認證在做什麼。<br>
然後 Tyk 出來介紹他們的產品 API Gateway 是什麼。<br>
強調他們有整合 Sync 和 Async 的功能。<br>
<br>
之後是 Solace. 出來介紹他們的產品，一部 Event Mesh。<br>
一般的 Service Mesh 功能是幫一堆 micro service 做 routing。<br>
而 Event Mesh 就是幫一堆 micro service 發送和訂閱事件。<br>
號稱一臺可以支撐每秒幾百萬則事件。擅於迅速處理大量不同小事件。<br>
新加坡最常見的使用場景就是支付系統和運輸系統。<br>
<br>
我做了四年後端，居然從沒想過要把 Event 做成 Mesh…<br>
馬上來問兩個問題：<br>
- 跨地區的事件怎麼傳送？<br>
- 整個 Mesh 對順序性有什麼保證？<br>

講者回答：<br>
Mesh 上每個節點對所有到來事件都保證順序。並依此順序寫入其他節點。<br>
訂閱時，來自同一節點的事件之間順序相同。你可以跟我們工程師聊聊。<br>
<br>
會後<br>
講：「問題不錯啊，這就是客人會問我們的問題。你有用過我們產品嗎？」<br>
我：「沒有。我前公司的 Mesh 三天兩頭改邏輯，所以我知道自由度在哪…」<br>
然後工程師也加入對話，但講者（solution engineer）不時要打斷他。<br>
說：「他問的這個我們沒有保證啦。」<br>
一直以來我都沒有接觸過 tech sales，看他噴自家工程師好有趣。<br>
一方面覺得如果我的 PM 同事這麼強，我上班一定很輕鬆。<br>
二方面開始思考我以後遇到類似的角色時，要怎麼從他身上榨出最多知識。<br>
<br>
然後另一位員工來推銷，我說我現在無業。<br>
加 linkedin 時他搜我名字竟然搜不到。（或許我已因此錯失工作機會）<br>
我：「你們現在還會聽到客人有什麼出乎意料的需求嗎？」<br>
員：「好像沒有。只會問應用。像是要怎麼把產品用在 AI pipeline 上。」<br>
你全家都 AI。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
