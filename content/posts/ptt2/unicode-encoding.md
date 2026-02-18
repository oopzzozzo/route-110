+++
title = 'unicode 編碼'
date = 2022-09-03T12:50:31+08:00
lastmod = 2022-09-03T12:50:31+08:00
categories = ['筆記']
tags = ['軟體', '批兔']
+++
繼[不懂 cookie]({{<ref "cookie">}})之後，我又發現自己做兩年後端，卻連 unicode 都不懂。<br>
### Unicode 編碼字元集　
一部少於 0x110000 個符號的字典，每個符號對應一個小於 0x110000 的整數，<br>
稱為 code point，中譯碼點或碼位。一般來說數字越小越常用。<br>

### Unicode Trasformation Format 
瞭解碼點之後，接著問題就是如何用數位裝置記錄碼點（串）。<br>
這是一個編碼問題，自然在不同場景下有不同解法。<br>

### utf32 
一個 unicode 碼點對應一個 4 位元組字組。<br>
即碼點之二進值，有 Big/Little Endian 兩種順序不同。<br>

### utf16 
一個 unicode 碼點對應 2 或 4 個位元組。也有位元組順序考量。<br>
碼點之二進值小於 2^16 時，直接以兩個位元組表示其值；<br>
二進值不小於 2^16 時，先減去 2^16，得一小於 2^20 數 0bYYYYYYYYYYZZZZZZZZZZ<br>
表示為 110110YY YYYYYYYY 110111ZZ ZZZZZZ。<br>
可想知，如此編碼乃因碼點 0b110110XXXXXXXXXX 和0b110111XXXXXXXXXX 皆無對應符號。<br>
### utf8 
一個 unicode 碼點對應 1-4 個位元組。<br>
碼點之二進制表示：0bTTTUUVVVVWXXXXYZZZZZZ<br>

| utf8 編碼 | 條件 |
| --- | --- |
| 0YZZZZZZ                            | T..X = 0 |
| 110XXXXY 10ZZZZZZ                   | T..W = 0 |
| 1110VVVV 10WXXXXY 10ZZZZZZ          | T..U = 0 |
| 11110TTT 10UUVVVV 10WXXXXY 10ZZZZZZ |     -    |

### 其他常識 
BOM：一個說明編碼方式的檔頭。有些軟體如 Excel 會主動加上，寫程式讀檔時需注意。<br>
utf8mb4：MySQL 的 utf8 一個符號只能 3 個位元組，需要指定 Max Byte 4。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (臺灣)<br>
