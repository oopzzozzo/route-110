+++
title = "注音字表"
date = 2026-10-04T15:54:22+08:00
categories = ['查表']
tags = ['語言']
+++

<div id="bopomofo-table"></div>
{{< load-js "bopomofo-manifest.js" >}}
{{< load-js "bopomofo-table.js" >}}

### 使用說明
表格以聲母為橫軸、韻母為縱軸，統計各組合的字數。滑過或點擊格子可列出字表。

### 資料來源
字集中的常用、次常用、罕用字為教育部的三份國字標準字體表（取自全字庫）；Big5 常用、次常用為 Big5 編碼的兩個字區。

讀音：

- [新酷音詞庫](https://github.com/chewing/libchewing-data)（LGPL-2.1）：唯一有字頻的來源，字依常用程度排序，淡色字為破音字的次要讀音。
- [教育部《重編國語辭典修訂本》](https://dict.revised.moe.edu.tw/)，經[萌典資料](https://github.com/g0v/moedict-data)轉換（CC BY-ND 3.0 TW）。
- [CNS11643 全字庫](https://www.cns11643.gov.tw/)（政府資料開放授權條款第1版）：約 7.7 萬字，多數罕用字可能無法顯示。

無字頻的來源依筆畫排序。
