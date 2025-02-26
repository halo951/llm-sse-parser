[![npm version](https://badge.fury.io/js/llm-sse-parser.svg)](https://badge.fury.io/js/llm-sse-parser)
[![NPM downloads](https://img.shields.io/npm/dm/llm-sse-parser.svg?style=flat)](https://npmjs.org/package/llm-sse-parser)
![license](https://badgen.net/static/license/MIT/blue)

# LLM SSE Response Parser

## About

A LLM's SSE response stream parse program.

## Methods

-   [SSEParser](#using-sseparser) : parse sse repsonse stream, and support cross-row matching.

-   [matchThink](#using-match-function) : match the think info in the output text

-   [matchContent](#using-match-function) : match the content in the output text

## Using SSEParser

-   with axios

> need add a fetch adapter, recommand '[konfig-axios-fetch-adapter](http://npmjs.com/package/konfig-axios-fetch-adapter)

```typescript
import axios from 'axios'
import fetchAdapter from 'konfig-axios-fetch-adapter'
import { SSEParser } from 'llm-sse-parser'

interface RawType {
    // props ...
}

// step 1: request
const res: AxiosResponse<ReadableStream> = await axios.post('/chat', data, {
    responseType: 'stream',
    adapter: fetchAdapter
})

// step 2: parse response

const parser: SSEParser<RawType> = new SSEParser(res.data)

// Tips: You can use `await` to wait for the sse stream to be parsed.
await parser
    .writer((raw: RawType) => {
        // write raw data
        console.log(raw)
    })
    .finish(() => {
        console.log('parse finish')
    })
    // 处理写入出错
    .capture((error) => {
        // handle parse fail event. and custom exception
    })
    .revice()

// step 3 (optional): and you can call parser.abort(), stop parse and emit finish event.
parser.abort()
```

-   with fetch

```typescript
import { SSEParser } from 'llm-sse-parser'

interface RawType {
    // props ...
}

const res = await fetch(`/chat`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: data
})

// step 2: parse response

const parser: SSEParser<RawType> = new SSEParser(res.body)

await parser
    .writer((raw: RawType) => {
        // write raw data
        console.log(raw)
    })
    .finish(() => {
        console.log('parse finish')
    })
    // 处理写入出错
    .capture((error) => {
        // handle parse fail event. and custom exception
    })
    .revice()
```

## Using match function

> if you enable deep seek, the response content has `<think>...</think>` content. you can use `matchThink` match think info.

```typescript
import { matchThink, matchContent } from 'llm-sse-parser'
const text: string = `<think>think info</think> llm stream output content`
const think: string = matchThink(text)
const content: string = matchContent(text)

console.log('think:', think)
console.log('content:', content)
```
