+++
title = '那些不知道怎麼稱呼的東西'
date = 2023-09-16T16:44:09+08:00
draft = false
lastmod = 2023-09-16T16:44:09+08:00
categories = ['閒聊']
tags = ['批兔']
+++
```
tautology = lambda _: true<br>
_________ = lambda _: false<br>
```
ChatGPT: contradiction<br>
聽起來太哲學了，不夠工程。但我也說不出為什麼 tautology 不會太哲學。<br>
或許是因為 contradiction 會被誤解成 counter example 但 tautology 不會？<br>
<br>
```
short_circuit_or = lambda f, g: lambda x: f(x) or g(x)
________________ = labmda f, g: lambda x: any([f(x), g(x)])
```
*註︰上式應寫作 `lambda f, g: lambda x: (lambda a: a[0] or a[1])([f(x), g(x)])`*<br>

問了一圈同事沒有人知道。<br>
ChatGPT: non-short-circuit logical or<br>
Search Engine: eager or<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
