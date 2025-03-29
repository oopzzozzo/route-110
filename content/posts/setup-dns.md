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
域名規則設好後，就可以後 http://route110.blog 瀏覧了，只是還沒有 https。要使用加密的 https，需要有第三方認證的密鑰，客戶端才能信任密鑰的正確性。將密鑰、認証和域名打包起來稱為憑證。Namecheap 效期一年的憑證賣 5.99 鎂。另外也有免費的憑證可以拿，如 Let's Encrypt 和 SSL For Free。
Synology 控制台可以直接設定 Let's Encrypt，但是我試了幾次都失敗。起初猜測是因為我一直改動 DNS 紀錄，可能要等一段時間，各種 TTL 過去，Let's Encrypt 才能正常連上。後來發現好像另有原因。

### 各種 Let's Encrypt 失敗
要通過 Let's Encrypt 認證，就是要向 Let's Encrypt 證明這個域名是你的。
證明的方式大致為：
- 告訴 Let's Encrypt 你的 email 和想要認證的域名。
- Let's Encrypt 會生一串密語給你。
- 把這串密語放在網站上給 Let's Encrypt 看。
- Let's Encrypt 抓到這串密語後，相信網域是你的，就會給你 SSL 憑證檔。

其中放密鑰的方式有兩種
- http-01 challenge：開 http（連接埠 80）公開 my-domain/.well-known/acme-challenge/<my-token> 連結。
- dns-01 challenge：設定 _acme-challenge.my-domain 的 TXT 紀錄。

理論上 Synology 的 GUI 點一點，就可以通過 http-01 challenge，憑證到期前還會自動更新。（Nginx 預設只要 [match 到 /acme-challege/ 就會強迫轉到特定資料](https://cleanshadow.blogspot.com/2017/01/ssl.html)）。但是我一直失敗，letsdebug.net 總說我 timeout，各種設路由關防火牆無果。

試著用 dns-01 challenge。照理來說 [acme.sh](https://github.com/acmesh-official/acme.sh) 這個腳本定期執行，就可以自動拿密語放上 DNS 完成 dns-01 challenge。然而我是直接用 Namecheap 的 DNS，API 更新 TXT 紀錄的[功能有限制](https://www.namecheap.com/support/knowledgebase/article.aspx/9739/63/api-faq/#c)。所以也用不了。
最後只能用 certbot 手動完成 dns-01 challenge，拿憑證上傳到 Synology。三個月後又要再做一次。有時間再來研究如果 DNS 多過一層 cloudfare，能否使用 acme.sh。又或者乾脆直接付錢給 Namecheap 用 API。

## 其他方式
其實可以直接把東西放在 github.io 上，然後 DNS 直接CNAME 指到 github.io。這樣既方便又不用電費。缺點是不能自己監控流量，未來想加入複雜的資料庫功能也不容易。
