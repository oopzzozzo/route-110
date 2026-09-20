+++
title = "Kana Maze"
date = 2026-09-20T21:10:00+08:00
categories = ['Game']
tags = ['Original', 'Machine Translation']
+++

<div style="overflow-x: auto;">
<canvas id="main-canvas" tabindex="0"></canvas>
</div>
{{< load-js "kana-maze.js" >}}

### How to Play
Push the ball around with your voice. The directions follow Japanese flick input (フリック入力) on a phone keyboard:

| kana | flick | effect |
|---|---|---|
| あ | tap | brake |
| い | left | accelerate left |
| う | up | accelerate up |
| え | right | accelerate right |
| お | down | accelerate down |

Only the vowel matters, so こ, そ and と all push downward — you can sing actual words. The louder you are, the harder it pushes.

No setup: it recognizes the canonical Japanese vowels straight away.

The microphone button (or `r`) opens a practice screen. 🔊 plays the canonical vowel, ● records yours, ◀ ▶ move between the five. Your attempt appears on the vowel map — the closer to the ring, the closer you are, and a ✓ means you're inside it. Take as long as you like.

**Practising changes nothing.** It only shows you where you land, so you move toward the canonical sound rather than the game moving toward you. Press ✓ only if you'd rather the game learned your voice instead; `Shift+R` puts the canonical sounds back.

The ball has momentum and won't stop when you do. You have to coast into the goal ring *slowly* to finish, which makes あ far more important than it sounds.

No microphone? Arrow keys push, space brakes. Press d to cycle the readouts on the right.

Your audio never leaves the browser.

### About
This started from the fact that the five Japanese vowels are unusually well separated acoustically — plot them by their first two formants and you already have a two-dimensional joystick. So why not use it as a d-pad?

I assumed I'd need to find a small model to recognize kana. It turns out you don't need one at all: run the spectrum through a mel filterbank, take logs, apply a discrete cosine transform to get MFCCs, then compare against five reference templates. Softmax the cosine similarities and you have your five probabilities. No dependencies, no weights to download.

The interesting part is that you never take the argmax. 30% い plus 52% う is just a weighted sum — 330 degrees. Being unclear produces an intermediate angle rather than a wrong guess.

What I only noticed after laying it out in flick order is that the two most confusable pairs, う/お and い/え, land on *opposite* axes. So when the recognizer can't tell them apart, the thrust cancels and the ball simply slows down. I thought that was a flaw at first. Having played it, I think it's the more honest failure: doing nothing when it can't tell beats confidently steering you into a wall.
