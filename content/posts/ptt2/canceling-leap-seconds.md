+++
title = 'Re: 閏秒'
date = 2022-11-24T22:47:36+08:00
draft = false
lastmod = 2022-11-24T22:47:36+08:00
categories = ['心得']
tags = ['批兔','科學']
+++
※ 引述《oopzzozzo (π)》之銘言：<br>
: 殊不知有關 posix timestamp 的定義，大多只提：Seconds since the Epoch.<br>
: 而忽略了：leap seconds are ignored<br>
: 從 1970 年起，UTC 已經閏了 26 秒了<br>
: ### 世界時間標準<br>
: TAI：400 臺銫原子鐘之加權平均時間，以 1972 年 1 月 1 日午夜起算。<br>
: UT1：子午線上之太陽時間，以 IAU 所訂 ICRF（1998 至今已翻了三版）為量測標準<br>
: UTC：使用 TAI 之秒長，然於半年底時動態增減秒，以維持與 UT1 時差 < 0.9 秒

現在又說閏秒 2035 年之前要取消。比 2038 年 timestamp 溢位還早。<br>
https://www.bipm.org/documents/20126/66742098/Draft-Resolutions-2022.pdf/2e8e53df-7a14-3fc8-8a04-42dd47df1a04<br>
不知道 2035 之前有沒有機會遇到調快時鐘的反閏秒。（我中文好爛，不知道正確稱呼）<br>
屆時應該會有人想出一些時間裂縫的用途。<br>
<br>
說到時間裂縫，前幾天的後端社畜日常中，遇到一個 container 時鐘比大家慢了一分多。<br>
敝司 container 不意外是用 host node 的時鐘，於是就得有人去把壞 node 清空。<br>
事後想想還是覺得很神奇，<br>
光 log 時序亂掉就夠惱人了，竟沒人發現。難道多數後端工作並不倚賴時間的正確性？<br>
一想到我的 code 會莫名其妙被搬到一分鐘前跑，就覺得要寫好 code 真不容易…<br>
<br>
話說最近突然發覺，+7 區的新加坡，手錶調 +8，就是日光節約時間的錶。<br>
然後新加坡一整年都是夏天，所以一整年都是夏令時間。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
