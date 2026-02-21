+++
title = "Familiar Tower of Hanoi"
date = 2020-02-25T14:41:05+08:00
categories = ['Game']
tags = ['Classic', 'Machine Translation']
+++

<div style="overflow-x: auto;">
<canvas id="main-canvas"></canvas>
</div>
{{< load-js "hannoi.js" >}}

### How to Play
Select the number of disks, then press Start. Click a pillar to pick up the top disk or place one down.

### About
Tower of Hanoi is a classic math puzzle. Three pegs, and a stack of disks — move them all from one peg to the opposite one, following these rules:
- Only one disk may be moved at a time.
- A larger disk may not be placed on top of a smaller one.

I built this as a small JavaScript exercise before job hunting in college. I figured I could solve the Tower of Hanoi in my sleep, so I wanted to test whether I truly understood it — or had just memorized the solution without realizing it.
