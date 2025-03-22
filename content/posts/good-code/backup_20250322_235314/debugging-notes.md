+++
title = 'debug 日記'
date = 2023-05-15T09:05:58+08:00
lastmod = 2023-05-15T09:05:58+08:00
draft = false
categories = ['請益']
tags = ['批兔']
+++
※ 引述《oopzzozzo (π)》之銘言：
: -- *ibus* --
: 要移除 ibus 相關 package 時，我理所當然打上 sudo apt remove *ibus*
: 結果刪了一堆重要的東西，然後我居然還無腦 reboot。
: 看 reboot 轉圈圈，只好進安全模式。
: > grep remove /var/log/dpkg.log > list.txt
: > vim list.txt
: 用一些 vim 魔法整理出誤刪的列表
: > xargs -a list.txt sudo apt install -y
: > reboot
: 人生又充滿希望！感恩 log，讚嘆 log！

昨天升級 ubuntu，gnome deskop 出了一點問題，我解決不了就決定粗爆降級。

每次做完這種事，要記筆記都好困難。
因為 GUI 壞掉，看到重要的 log 或 error message 時，不能順手貼到別的視窗。
最後要整理時只能從 shell history 看我做了什麼。
效果蠻差的，畢竟如何找到問題往往才是筆記的重點。

可能要用手機 OCR 進記事本，然後叫 ChatGPT 幫我看 log？
這樣甚至解決了我手動貼 log 的問題…
話說我其實無法想像以前人手機不能上網要怎麼修電腦…

--
※ 發信站: 批踢踢兔(ptt2.cc), 來自: 42.61.199.206 (新加坡)
␛[1;31m→ ␛[33mzp␛[m␛[33m:(Blue人)好像除惹a.仝時開枏台以上的電护筆記，b.進行每一步  ␛[m推 05/15 18:09
␛[1;31m→ ␛[33mzp␛[m␛[33m:　時都把自己�笨蛋而逐步慢慢記，3.事後用剩佘記憶回憶外，  ␛[m推 05/15 18:10
␛[1;31m→ ␛[33mzp␛[m␛[33m:　小的好像也無計可施（回到b.，如果是教�者，也有被迫逐步  ␛[m推 05/15 18:12
␛[1;31m→ ␛[33mzp␛[m␛[33m:　慢記的蔃力；還有二�的標�A3.𩦝為c.，抱歉在此勘誤）……  ␛[m推 05/15 18:15
