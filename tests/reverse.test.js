// otetaan käyttöön testattava funktio
const reverse = require('../utils/for_testing').reverse

// test määrittelee yksittäisen testitauksen
// testin kuvaus 'reverse of a'
// testitapauksen toiminnallisuus {}
test('reverse of a', () => {
  const result = reverse('a') // generoidaan palindromi

  //expect käärii tuloksen olioon joka mahdollistaa matcher-funktioiden käytön esim. toBe-funktio
  expect(result).toBe('a') // varmistetaan tulos

})

test('reverse of react', () => {
  const result = reverse('react')

  expect(result).toBe('tcaer')
})

test('reverse of saippuakauppias', () => {
  const result = reverse('saippuakauppias')

  expect(result).toBe('saippuakauppias')
})