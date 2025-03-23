+++
title = '-O0 爛掉，-O2 沒事？'
date = 2019-08-30T11:55:00+08:00
draft = false
lastmod = 2019-08-30T11:55:00+08:00
categories = ['問題']
tags = ['交換', '批兔']
+++
今天平行程式課堂小作業：拿老師給的圓周率程式，加上 openmp，試跑就可以交了。<br>
這只是個很麻煩的簡單作業吧？但神奇的事發生了，用 icc 編譯沒事，gcc 就爛掉。<br>
<br>
因為每次執行出來的總和都是高估，想說應該不是 race condition，可能是浮點數問題。<br>
隨手加個 -O2 想說可能 icc 也會爛掉，結果反而 gcc 變好了，傻眼。<br>
<br>
後來發現，問題出在老師給的程式。（明明不到 20 行）<br>
```<br>
double x, pi, sum = 0.0;<br>
for(int i=0; i<N; i++){<br>
    x = (i + .5) * step;<br>
    sum += 4.0 / (1.0 + x*x);<br>
}<br>
```
race condition 發生在 share memory 的 x 上，於是結果就高估了。<br>
O1 以上應該是會把 x 直接 inline 成 common subexpression 放 cache，就沒有出事。<br>
<br>
第一次遇到沒開優化反而壞掉的狀況，蠻有趣的。<br>
但我現在很怕下次作業要跑幾百行程式，完全無法信任老師給的東西啊！<br>
班上沒朋友只能寫批兔抱怨，好難過。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx<br>
Re: 我只學過 O2 萬能<br>
