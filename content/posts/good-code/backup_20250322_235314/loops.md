+++
title = 'do-while, while, for'
date = 2020-12-01T22:50:28+08:00
lastmod = 2020-12-01T22:50:28+08:00
draft = false
categories = ['討論']
tags = ['批兔']
+++
while 跟 for 能做到的事一樣嗎？
剛接觸程式的人心中多半曾蒙生此問，然後大概花幾分鐘想一下，就會發現一樣。
這想法跟了我都快十年了，昨天才驚覺其中竟有蹊蹺。

while 不能使用區域變數做為判斷條件。
即是說，若非借助 if 或 break 或雙層，while 迴圈執行有限次之前後，必有狀態改變。

回過頭看，這才是我們需要 for 語法的原因吧，我們需要一個執行完不留雲彩的操作。

讓我來腦補一個故事：
很久很久以前，在人類還會寫組合語言的時代──流程控制全靠 conditional branch。
其順執行方向跳便是 if not (unless)，逆向跳則是 do-while。
於是 do-while 以人盡皆用之姿，躋身程式語言必備語法。
但馬上大家就發現，迴圈一定要執行一次很不方便，所以有了前測的 while；
隨著語言變得高階，變數的範圍開始受到重視，由此產生了 for；
再來是平行處理和 iterator pattern 的加持，而催生各種流派的 range loop。

真是越長大越覺得，程式語言就是人造語言的一種。
它的演化不會通往無極，而是會走向高熵。

--
※ 發信站: 批踢踢兔(ptt2.cc), 來自: 220.137.17.194 (臺灣)
␛[1;31m→ ␛[33mzp␛[m␛[33m:(路人)這似乎是上個世紀許多圖靈的圖子圖孫的奮鬥目標呀：    ␛[m推 12/05 06:13
␛[1;31m→ ␛[33mzp␛[m␛[33m:https://w.wiki/pHv 當時這些人好像不得不用打孔機寫程式(汗) ␛[m推 12/05 06:15
␛[1;31m→ ␛[33myangerma␛[m␛[33m:我在康橋介紹for-loop的時候也是唬這個理由當動機的，  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:但真的看歷史發展我猜那並不是真正的起源，因為像C在C9 ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:9以前都還不能把counter宣告在for的initialization blo ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:ck XDD                                              ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:看了一下wiki，for 最早出現是在別的語言，那時候的形  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:式是像bash那樣， for i in 1..5 或 for x in a b c d  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:，它的語義其實是「在某個序列中列舉」，完全沒有「條  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:件判斷」的語義。所以我猜for跟while最根本的差別是他  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:們的語義不同。                                      ␛[m推 12/05 10:18
好有道理，有符合 for 這個字的本意～
␛[1;31m→ ␛[33myangerma␛[m␛[33m:只是後來C引進for的時候不知道為什麼變成了我們熟悉的  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:那個style，可能是覺得原始版彈性太低太難用，結果就開 ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:了一個大洞讓for-loop 什麼都能做。至於後來讓counter  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:不用裸露在for-loop外應該就只是使用經驗上覺得那樣乾  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:淨多了。                                            ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:這樣想起來我覺得range-based for loop其實比較接近原  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:來for該有的語義欸，然後有些看似超精妙的for寫法有可  ␛[m推 12/05 10:18
␛[1;31m→ ␛[33myangerma␛[m␛[33m:能根本應該寫成while的XD                             ␛[m推 12/05 10:18
嗯，況且在自然語言中，for 的這個 range 甚至不需要是可列舉地。
␛[1;31m→ ␛[33mzp␛[m␛[33m:(路人)或許樓上的意思是不用䓡䓡的for𩦝該𥶹成while沒錯吧？  ␛[m推 12/05 19:58
␛[1;31m→ ␛[33mt1016d␛[m␛[33m:大家蠻熟悉的 python 的 for 就是原意呀 XD              ␛[m推 12/08 20:15
␛[1;31m→ ␛[33mt1016d␛[m␛[33m:但應該偶而都遇過希望 python 有 C 版 for 的時候吧 ww   ␛[m推 12/08 20:16
␛[1;31m→ ␛[33mzp␛[m␛[33m:(路人)for的原意超過10種：http://lexico.com/definition/for ␛[m推 12/08 22:35
␛[1;31m→ ␛[33mzp␛[m␛[33m:http://merriam-webster.com/dictionary/for                 ␛[m推 12/08 22:36
␛[1;31m→ ␛[33moToToT␛[m␛[33m:我覺得C++20的views搭配for有幾分python的味道了w        ␛[m推 12/09 09:18
