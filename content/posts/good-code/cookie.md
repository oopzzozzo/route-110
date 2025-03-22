+++
title = 'cookie'
date = 2022-03-05T23:17:28+08:00
lastmod = 2022-03-05T23:17:28+08:00
draft = false
categories = ['筆記']
tags = ['批兔','軟體']
+++
兩週前上班時遇到了一個 cookie 有關的狀況。<br>
我才意識到自己做了一年多後端，居然連 cookie 都不懂。好扯。<br>
~我寫的 cookie clicker 外掛說不定還比我所有後端程式產生的 cookie 多。~<br>
### 目地
http 做為一個 stateless 協定。伺服器端沒有對單一連線的記憶空間。<br>
所有狀態都得送給終端（瀏𣞢器），由終端儲存。下次傳資料時再全部傳回去。<br>
但這番操作太冗了。於是就有了後來的 IETF RFC 6265，<br>
讓瀏𣞢器負責收狀態資料，之後每當連到同域名網頁，就會自動帶上之前所有的狀態。<br>
### 用法
後端 response 加上 http header `Set-Cookie: SSO=af80cb`。<br>
之後瀏𣞢器每次連同一個域名的網頁，都會帶 http header `Cookie: SSO=af80cb`<br>
想知道目前瀏𣞢器存了哪些 cookie，chrome 跟 firefox 都是 F12>Storage>Cookies<br>
### 應用
可以用來存使用者登入的 session，或記錄使用者行為資料。<br>
伺服器端 set-cookie 時，有一些值可以設定，從而達到特殊效果，如：<br>
```http
Set-Cookie: SSO=af80cb; Path=/api; Secure; HttpOnly
Set-Cookie: lang=zh-TW; Domain=edu.tw; Expires=Wed, 09 Jun 2021 10:18:14 GMT
```
- Path 和 Domain 分別縮限和放寬瀏𣞢器之後帶上 Cookie 的情境<br>
- Secure 代表發 https 會帶這筆 cookie，http 不會（其實是瀏𣞢器自定何為 secure）<br>
- HttpOnly 代表瀏𣞢器不該讓前端 js 之類的東西知道這筆 cookie

若加上其他 header 也會有不同效果，像是 `Access-Control-Allow-Origin` 等…<br>
### 問題
1．無痕模式該怎麼處理 cookie？<br>
2．cookie 會發給所有符合條件的連結，很大一包，佔空間。<br>
3．各種歐盟法規。<br>
4．各舊版瀏𣞢器預設可以 cross-origin（cookie 會發給所有伺服器，沒有域名限制）<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
