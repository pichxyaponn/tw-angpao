if ('Bun' in globalThis) {
    throw new Error('❌ Use Node.js to run this test!')
  }
  
  import { TWAngpao } from '@pichxyaponn/tw-angpao'
  
  if (typeof TWAngpao !== 'function') {
    throw new Error('❌ ESM Node.js failed')
  }
  
  console.log('✅ ESM Node.js works!')