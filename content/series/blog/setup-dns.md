+++
title = '設定 DNS'
date = 2025-03-03T00:06:53+08:00
series = ['架設部落格']
draft = false
+++

## 取名
想一個好名字很重要。本來想把頂級域名也取進來，像是 "three.one" 之類的。可是一直想不到好名字。就決定直接用`名字.blog`，這種沒創意的域名了。

## 買域名
找一間公司，如 GoDaddy, Namecheap, AWS... 付錢給它幫你註冊。我選 Namecheap，因為第一年有折扣。

Namecheap 付款可以用 Paypal、信用卡或是 Bitpay。我用 Paypal 比較省事。

## 設定 DNS 紀錄
照理來說應該要設定一個允許 DDNS 的 A 紀錄，由我的 NAS 透過 DDNS client 定期將我的 IP 位置上傳到 Namecheap。
可是我的 Synology NAS 不太支援 Namecheap 的 DDNS。因此先設成靜態 IP。

我看到兩種解決 DDNS 的方式
- 用 url 傳：`https://dynamicdns.park-your-domain.com/update?host=@&domain=example.com&password=yourpassword` 把東西放在 url 傳，還是不太舒服。
- 用 CNAME： 指到有免費 DDNS 的 xxx.synology.me 域名。[只建議用在 subdomain](https://www.namecheap.com/support/knowledgebase/article.aspx/9646/2237/how-to-create-a-cname-record-for-your-domain/)。

## 設定域名規則
本來部落格的網址是 https://mynas.synology.me/route-110/xxx。可以在 WebServer（synology 上的是 nginx，）上直接加一條規則，讓 `route110.blog` 打來的請求直接對應到 `route-110/` 資料夾。避免 `https://route110.blog/route-110/` 這種冗長的 url。

## 取得 SSL 憑證
Synology 控制台可以直接設定 Let's Encrypt，但是我試了幾次都失敗。目前猜測是因為我一直改動 DNS 紀錄，可能要等一段時間，各種 TTL 過去，Let's Encrypt 才能正常連上。

## 其他方式
其實可以直接把東西放在 github.io 上，然後 DNS 直接CNAME 指到 github.io。這樣既方便又不用電費。缺點是不能自己監控流量，未來想加入複雜的資料庫功能也不容易。
