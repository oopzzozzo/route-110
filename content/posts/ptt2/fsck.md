+++
title = 'fsck'
date = 2021-08-01T23:41:36+08:00
lastmod = 2021-08-01T23:41:36+08:00
categories = ['筆記']
tags = ['軟體', '批兔']
+++
昨天打完疫苗，晚上把筆電搬到床上要繼續耍癈。<br>
一時螢幕不亮，我強制重開後，Ubuntu 進安全模式、Windows 正常。<br>
<br>
貌似檔案系統毀損，Windows 不認 ext4，沒法救。<br>
我插 live usb 去 fsck，卻說我的 Ubuntu root 沒有毀損。<br>
<br>
看 stack overflow 有人說是 nvidia 驅動問題。<br>
我繞了一圈去用 command line 連 wifi 重下載驅動，不見改善。<br>
夜深只好先睡去。<br>
<br>
今早醒來煮飯，中午躺床上回血。<br>
下午開機仍進安全模式。突然想說來 fsck 其它 partition 看看。<br>
然後就修復了 /home，便成功開機進 GUI 了。<br>
<br>
半夜靈力太弱，真的不適合做事。<br>
<br>
--<br>
※ 發信站: 批踢踢兔(ptt2.cc), 來自: xxx.xxx.xxx.xxx (新加坡)<br>
