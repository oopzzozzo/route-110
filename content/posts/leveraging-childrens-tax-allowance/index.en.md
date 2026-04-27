+++
title = 'Leveraging Tax Allowance'
date = 2026-04-27T22:49:30+08:00
categories = ['Take']
tags = ['Finance']
+++
### Story
I just realized I could've transferred my tax allowance to my parents during my years working abroad. Here's how.

> A child can claim 60+ year-old parents as dependents. Regardless of who earns the income.

That way, the household uses every member's allowance.

### Analysis of Family Income Tax
#### Does the progressive tax rate penalize marriage?
Taiwan's [income tax brackets](https://www.ntbt.gov.tw/English/multiplehtml/3f18d2625aea4187b0d90e9b929afe4c) don't account for household size. In 2026:

![tax bracket graph](tax_plot.png "=x30vh")

- Two individual filers each earning NT$1M in wages have net income (in NT$k) of \\(1000 - 97_{\text{exemption}} - 218_{\text{wage ded.}} - 131_{\text{std. ded.}} = 554\\), and tax of \\(554 \times 5\\% = 27.7\\) each. Total: NT$55.4k.
- A married couple with NT$2M total wages has joint net income of \\((1000 - 97_{\text{exemption}} - 218_{\text{wage ded.}} - 131_{\text{std. ded.}}) \times 2 = 1108\\), and combined tax of \\(1108 \times 12\\% - 42.7 = 90.26\\) — NT$90.26k.

The system clearly disincentivizes marriage at higher incomes. So the tax bureau proposed the five "joint-filing, separate-tax" options — lest the wealthy abandon marriage altogether.

#### Five Tax-Splitting Options for Couples
The tax bureau provides [example calculations for joint filing with separate tax computation](https://www.etax.nat.gov.tw/etwmain/tax-info/understanding/tax-saving-secret/GYvNwBz). It looks complicated but could be simplified with figures.

The figure below shows a couple's taxable items — solid for positive amounts, dashed for negative.
![couple's tax items](married.svg)
From left to right:
- Wife's tax allowance
- Wife's wage (less wage deduction)
- Wife's non-wage income
- Dependents' income, and standard/itemized deduction
- Husband's non-wage income
- Husband's wage (less wage deduction)
- Husband's tax allowance

The tax bureau allows married couples to split the bundle into two halves, compute the tax on each half separately, and sum the results. There are four legal ways to split:
![five tax-split options for couples](married-tax-options.svg)

#### Splitting Case Study{#splitting-example}
Generally, the best split produces two halves of the most similar size. For example:
- Wife: NT$718k wage + NT$10k interest. Husband: NT$500k rental + NT$1.218M wage. → Split at the husband's wage.
- Wife: NT$1.218M wage + NT$500k interest. Husband: NT$1M rental + NT$1.218M wage. → Split at the wife's items.

![couple tax-split case study](married-case-study.svg)

#### Adding Children: the 5th, 6th, and 7th Cases
If the couple has a child with no wage income, the family's tax items look like this:
![family tax items](married-and-child.svg)

The child has the option to claim the husband and/or wife as dependents.
![family tax after the child claims a dependent](married-and-tax-with-child.svg)

If both spouses sit in the 20% bracket, having the child claim them as dependents saves up to \\(97 \times 20\\% = 19.4\\) per claim — NT$19.4k, enough for the kid's round-trip ticket to Australia.

{{< katex >}}
