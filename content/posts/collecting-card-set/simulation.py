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
plt.hist(results, bins=range(min(results), max(results) + 2), align='left', color='skyblue', edgecolor='black', alpha=0.7)
plt.axvline(sum(results)/len(results), color='red', linestyle='dashed', linewidth=2, label=f'Mean: {sum(results)/len(results):.2f}')
plt.axvline(37.24, color='green', linestyle='dotted', linewidth=2, label='Theoretical: 37.24')

plt.title('Distribution of Purchases to Collect 12 Cards')
plt.xlabel('Number of Purchases')
plt.ylabel('Frequency')
plt.legend()
plt.grid(axis='y', alpha=0.3)

plt.savefig('histogram.png')
print("Histogram saved as histogram.png")
plt.show()
