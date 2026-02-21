+++
title = "Six-Ball Puzzle"
date = 2021-06-28T23:43:05+08:00
categories = ['Game']
tags = ['Clone', 'Machine Translation']
+++

<div style="overflow-x: auto;">
<canvas id="main-canvas" tabindex="0"></canvas>
</div>
{{< load-js "six-ball.js" >}}

### How to Play
Arrow keys to move left/right, z/x to rotate, up arrow to drop. Press s to save the current state, l to load it back.

### About
This is a clone of "6-Ball Puzzle" from *51 Worldwide Games* on Switch. The original is similar to Tetris Battle — two players compete, and whoever fills up the board loses. When six same-colored balls connect, they clear. If the cleared balls form a specific shape (upward triangle, downward triangle, hexagon frame, or straight line), the opponent gets hit with a rain of colored balls.

I made this to practice after playing it at a friend's place — only to finish it and realize I had never properly figured out the logic for how balls above should fall after the ones below disappear.
