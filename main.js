const rp = require('request-promise');
const $ = require('cheerio');

const config = {
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

function hasContent(item) {
  return item && item.children && item.children[0] && item.children[0].data
}

function reduceToTopTen(scraped) {
  return Array.from(
    new Set(Object.values(scraped)
      .filter(item => hasContent(item))
      .map(item => item.children[0].data))
  ).slice(0, 10)
}

async function getHeadlines(url, rule) {
  try {
    let html = await rp(url)
    let scraped = $(rule, html)
    return reduceToTopTen(scraped)
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
  await asyncForEach(Object.values(config), async (configItem) => {
    headlines.push(await getHeadlines(configItem.url, configItem.rule))
  })

  wordCounts = {}
  headlines.forEach(headlineSet => {
    headlineSet.forEach(headline => {
      let words = headline.split(" ")
      words.forEach(word => {
        word = word
          .replace(/[?|!|'|‘|’|:]+/g, "")
          .toLowerCase()
        if (!(word in wordCounts)) {
          wordCounts[word] = 1
        } else {
          wordCounts[word] = wordCounts[word] + 1
        }
      })
    })
  })

  //TODO this just gets the most frequently occuring words
  //this is not even good enough joe please. come on. really.
  //you need to compare each headline to the other sources and
  //find headlines with the most overlap, then take the most common
  //words IN SEQUENCE from those headlines
  //this is baby stuff
  //what are you four?
  //also why are you commenting each line here?
  //use a comment block
  //god youre such a baby
  console.log(sortByValue(wordCounts).slice(0, 10))
}

collateHeadlines()