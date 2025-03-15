
const http = require('http');

console.log('📊 Testare conexiune API DOXA...');

// Test pentru API-ul de mănăstiri
http.get('http://localhost:5001/api/monasteries', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`✅ API mănăstiri funcțional! Număr de înregistrări: ${response.length || 0}`);
    } catch (e) {
      console.error('❌ Eroare la comunicarea cu API-ul de mănăstiri:', e.message);
      console.log('Răspuns brut:', data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Eroare de conexiune la API-ul de mănăstiri:', err.message);
});

// Test pentru API-ul de pelerinaje
http.get('http://localhost:5001/api/pilgrimages', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log(`✅ API pelerinaje funcțional! Număr de înregistrări: ${response.length || 0}`);
    } catch (e) {
      console.error('❌ Eroare la comunicarea cu API-ul de pelerinaje:', e.message);
      console.log('Răspuns brut:', data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Eroare de conexiune la API-ul de pelerinaje:', err.message);
});
