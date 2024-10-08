if ('Bun' in globalThis) {
    throw new Error('❌ Use Node.js to run this test!')
  }
  
  const { TWAngpao } = require('@pichxyaponn/tw-angpao')
  
  if (typeof TWAngpao !== 'function') {
    throw new Error('❌ CommonJS Node.js failed')
  }
  
  console.log('✅ CommonJS Node.js works!')