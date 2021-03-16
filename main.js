const rp = require('request-promise');
const $ = require('cheerio');

const CONFIG = {
  'theGuardian': {
    'url': 'https://theguardian.com/uk',
    'rule': '.fc-item__headline .js-headline-text'
  },
  'bbc': {
    'url': 'https://news.bbc.co.uk',
    'rule': 'a > h3'
  },
  'googleNews': {
    'url': 'https://news.google.com',
    'rule': 'article > h3 > a'
  }
}

const ignoreWords = [
  "in", "for", "and", "over", "at", "on", "from", "to", "as", "than", "says", "uk", "of"
]

function randomCaps(string) {
  let arr = string.toLowerCase().split("")
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 == 0) {
      arr[i] = arr[i].toUpperCase()
    }
  }
  return arr.join("")
}

function reduceToTop(scraped, num) {
  return Array.from(
    new Set(Object.values(scraped)
      .filter(item => item?.children?.[0]?.data)
      .map(item => item.children[0].data))
  ).slice(0, num)
}

async function getHeadlines(url, rule) {
  try {
    let html = await rp(url)
    let scraped = $(rule, html)
    return reduceToTop(scraped, 3)
  } catch (err) {
    console.log(err)
  }
}

function printHeadlines(headlines) {
  headlines.forEach((headline, index) => {
    console.log(`${index}: ${headline}`)
  })
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

function sortByValue(jsonObject) {
  var sortedArray = [];
  for (var i in jsonObject) {
    sortedArray.push([jsonObject[i], i]);
  }
  return sortedArray.sort().reverse();
}

async function collateHeadlines() {
  let headlines = []
  let temp
  await asyncForEach(Object.values(CONFIG), async (configItem) => {
    headlines.push(await getHeadlines(configItem.url, configItem.rule))
  })

  wordCounts = {}
  headlines.forEach(headlineSet => {
    headlineSet.forEach(headline => {
      let words = headline.split(" ").filter(word => !ignoreWords.includes(word.toLowerCase()))
      words.forEach(word => {
        word = word
          .replace(/[^\w\d]/g, "")
          .replace(/[?|!|'|‘|’|:|,]+/g, "")
          .toLowerCase()
        if (!(word in wordCounts)) {
          wordCounts[word] = 1
        } else {
          wordCounts[word] = wordCounts[word] + 1
        }
      })
    })
  })

  word = sortByValue(wordCounts)[0][1]
  const TEMPLATES = [
  `todays main news is something about *${word}*`,
  `blah blah blah *${word}* blah blah blah`,
  `_The Man_ wants you to think about *${word}* today`,
  `idk what the _real_ story is, but the smokescreen is something to do with *${word}*`,
  `if you're not sick of hearing about *${word}* already then you'll love the news today`,
  `i swear to god if i hear about *${word}* one more time...`,
  `"*${randomCaps(word)}*"`,
  `tldr: *${word}*`,
  `*${word}*. You got that?`,
  `It's something about *${word}*`,
  `everyone's talking about *${word}*!`,
  `omg did u hear abt *${word}*??`,
  `knock knock. who's there? *${word}*.`
  ]
  console.log(TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)])
}

collateHeadlines()
