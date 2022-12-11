Heroku: https://sleepy-headland-05941.herokuapp.com/

## Muistiinpanot
// node index.js -> suorittaa tiedoston
// npm start -> "start": "node index.js",
// npm install express -> asentaa transitiivisen riippuvuuden "Express" node_modules kansioon
// npm update -> päivittää riippuvuudet
// npm install -> hakee ajantasaiset package.json määrittelyn kanssa yhteensopivat riippuvuudet
// node -> interaktiivinen node-repl komentojen kokeluun konsolissa
// npm install --save-dev nodemon -> asennetaan kehityksenaikaiseksi riippuvuudeksi, ei globaaliksi
// node_modules/.bin/nodemon index.js -> sovelluksen käynnistys
// npm run dev -> npm scripti sovelluksen käynnistämiseen nodemonilla. Poiketen start ja test scripteistä tarvitaan myös run komento.
// npm install cors -> Cross-origin resource sharing
// npm run build -> luo tuotanto buildin react sovelluksest
// cp -r build ../../FullstackTHEORYBackend -> luo kopion buildista backendin alle
// git push heroku master
// node --inspect index.js -> Chrome DevTools
// node mongo.js <mongo db pwd>
// npm install dotenv -> luo .env & päivitä .gitignore
// MONGODB_URI=<osoite> npm run watch -> manuaalinen tapa, mutta .env parempi käytäntö joka tulee muistaa myös ignorata
// heroku config:set MONGODB_URI='<insert URL>' -> komentoriviltä, mutta parempi tapa asettaa config var herokuun
// npm install eslint --save-dev -> ESLint backendiin kehitysaikaiseksi riippuvuudeksi
// npx eslint --init -> muodostetaan alustava ESLint-konfiguraatio