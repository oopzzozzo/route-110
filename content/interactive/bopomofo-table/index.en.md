+++
title = "Bopomofo Character Table"
date = 2026-10-04T15:54:22+08:00
categories = ['Look']
tags = ['Language', 'Machine Translation']
+++

<div id="bopomofo-table"></div>
{{< load-js "bopomofo-manifest.js" >}}
{{< load-js "bopomofo-table.js" >}}

### How to Use
The table counts characters by initial (x-axis) and final (y-axis). Hover over or tap a cell to list its characters.

### Data
Common, Less common and Rare are the Ministry of Education's three standard character lists (via CNS11643); Big5 common and less common are the two character ranges of the Big5 encoding.

Readings:

- [libchewing dictionary](https://github.com/chewing/libchewing-data) (LGPL-2.1): the only source with frequency data; characters are ordered by frequency, and faded ones are alternate readings of polyphones.
- [MOE Revised Mandarin Chinese Dictionary](https://dict.revised.moe.edu.tw/), via [moedict-data](https://github.com/g0v/moedict-data) (CC BY-ND 3.0 TW).
- [CNS11643](https://www.cns11643.gov.tw/) (Open Government Data License v1.0): about 77,000 characters, many too rare for your device to display.

Sources without frequency data are ordered by stroke count.
