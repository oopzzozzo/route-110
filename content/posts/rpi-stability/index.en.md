+++
title = 'Raspberry Pi Stability'
date = 2025-09-07T21:20:54+08:00
series = ['Setup RSS']
categories = ['Note']
tags = ['Software', 'Hardware']
+++
> [
I bought an SSD for my Raspberry Pi, but it turned out that my Raspberry Pi shows a "low voltage" warning and crashes. As a result, my RSS server is still running on my old laptop.
]({{<ref "youtube-rss-filter">}})

### Relocating
Last winter, after I moved back home, I installed a better adapter and power cable, and the problem disappeared.

Since the Raspberry Pi worked fine, I set up more functions on it. The most important function is Pi-hole (as the DNS server for all my devices) to block ads and trackers.

### Problem Recurs
About half a year later, the Raspberry Pi started to crash from time to time and needed a reboot. Before rebooting, I couldn’t connect to Pi-hole, which meant no DNS and no internet. My family could only reach me by phone unless I noticed the Raspberry Pi was down and manually turned off the DNS settings on my phone.

### Cooling
As the Raspberry Pi crashed more often, I planned to buy the official power supply or use a PSU to solve the problem. So I carefully studied how much power my setup consumed and whether I could use PoE.

While calculating, I remembered I had installed a fan but didn’t connect it because I was afraid it would be noisy for my roommates or family. I plugged it in to test for noise, deciding whether to include its power consumption in my calculation. Then I realized, “Maybe the Raspberry Pi crashes not because of low voltage, but because of overheating.” The fan barely spun at its normal temperature and only started spinning at low speed above 50 degrees Celsius, which wasn’t noisy. So I kept it plugged in.

### Conclusion
Since I plugged in the fan, the Raspberry Pi still shows low voltage warnings, but Pi-hole has never been down again. In hindsight, it all made sense.
- The SSD module obstructed cooling, so buying a fan was worth it.
- It’s hot in Singapore, so the fan spins fast when it’s plugged in, and I was worried about disturbing my roommates.
- It’s cooler in Taiwan in winter, so no fan is needed, but it would overheat and crash in the summer.

It took me almost a year to understand such a simple truth.
