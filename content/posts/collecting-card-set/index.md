+++
title = '集滿卡組有多難'
date = 2026-01-21T20:49:59+08:00
categories = ['筆記']
tags = ['數學']
draft = true
+++

這是個簡單的高中數學問題，然而我遇到的當下居然想錯，所以來筆記一下。

### 重點
#### 題目
卡片販賣機有 \\( \frac{1}{12} \\) 的機率掉任一張卡，問集滿全套 12 張卡的期望購買次數為何？
#### 答案
\\( \frac{12}{12} + \frac{12}{11} + ... \frac{12}{1} \approx 37.24 \\)
#### 延伸題目
隨卡片張數增加，期望次數的增加趨勢為何？

### 詳解
#### 集卡過程
要集滿 12 張卡，我們要
- 集到第 1 張卡
- 集到第 2 張不一樣的卡
- 集到第 3 張不一樣的卡
- ...
- 集到第 12 張不一樣的卡

假設已經有 \\( x \\) 張不一樣的卡的情況下，接下來要集到第 \\( x+1 \\) 張不一樣的卡要抽 \\( a_x \\) 次。那麼從 0 張卡集到第 12 張卡的次數就是
$$ a_0 + a_1 + a_2 \dots + a_{11} $$

#### 集到一張新卡的期望次數
假設我已經有 5 張不一樣的卡了，集到第 6 張不一樣的卡要抽 \\( a_5 \\) 次，\\( a_5 \\) 的期望值是多少呢？

每一次有 \\( \frac{5}{12} \\) 的機率會抽到重複的，\\( \frac{7}{12} \\) 的機率會抽中新卡。\\( \frac{7}{12} \\) 的中獎率，[期望要抽的次數就是它的倒數](#why-reciprocal) \\( \frac{12}{7} \\)。

#### 集滿 12 張卡的期望次數
$$
\begin{aligned}
 &a_0 期望值 + a_1 期望值 + a_2 期望值 \dots + a_{11} 期望值 \\\\
= &\frac{12}{12} + \frac{12}{11} + \frac{12}{10} \dots + \frac{12}{1} \\\\
\approx &37.24
\end{aligned}
$$

#### 卡集張數與期望次數的關係
$$ N \times (\frac{1}{N} + \frac{1}{N-1} + \frac{1}{N-2} \dots + \frac{1}{1}) $$

右項為[調和級數](https://zh.wikipedia.org/zh-tw/調和級數)，複雜度為 \\( \log N \\)。故集滿 N 張卡集的期望次數複雜度為 \\( O(N \log N) \\)。

### 附錄
#### 為什麼期望要抽的次數就是中獎率的倒數？ {#why-reciprocal}
直觀的說法：
> 中獎率砍半，期望要抽的次數就加倍，所以是反比關係。<br>
為什麼中獎率砍半，期望要抽的次數就加倍呢？
我們可以從這個問題入手：一副撲克牌抽到紅Ａ所需的期望次數是多少？


從期望值定義出發的算法：
> $$
\begin{aligned}
期望抽數 &= 可能性甲發生機率 \times 可能性甲的抽數 + 可能性乙發生機率 \times 可能性乙的抽數 + 可能性丙\dots \\\\
期望抽數 &= 一抽入機率 \times 1抽 + (未能一抽入機率) \times (1抽 + 再接再厲的期望抽數)
\end{aligned}
$$
第一抽抽到重複的情況，對接下來的處境沒有任何幫助，所以再接再厲的期望抽數就是當下的期望抽數。算式整理一下，可得
$$
\begin{aligned}
期望抽數 &= 一抽入機率 \times 1抽 + (未能一抽入機率) \times (1抽 + 期望抽數) \\\\
期望抽數 &= 1抽 + (1 - 一抽入機率) \times 期望抽數 \\\\
期望抽數 &= \frac{1}{一抽入機率} \\\\
\end{aligned}
$$

#### 模擬集 12 張卡所需次數
![模擬集 12 張卡所需次數直方圖](histogram.png)

```python
import random
import matplotlib.pyplot as plt

def f():
    cnt = 0
    v = [0]*12
    while sum(v) != 12:
        v[random.randint(0, 11)] = 1
        cnt += 1
    return cnt

trials = 100000
results = [f() for _ in range(trials)]

plt.figure(figsize=(10, 6))
plt.hist(results, bins=range(min(results), max(results) + 2), align='left',
         color='skyblue', edgecolor='black', alpha=0.7)
plt.axvline(sum(results)/len(results), color='red', linestyle='dashed',
            linewidth=2, label=f'Mean: {sum(results)/len(results):.2f}')
plt.axvline(37.24, color='green', linestyle='dotted', linewidth=2,
            label='Theoretical: 37.24')

plt.title('Distribution of Purchases to Collect 12 Cards')
plt.xlabel('Number of Purchases')
plt.ylabel('Frequency')
plt.legend()
plt.grid(axis='y', alpha=0.3)

plt.savefig('histogram.png')
print("Histogram saved as histogram.png")
plt.show()
```

{{< katex >}}

