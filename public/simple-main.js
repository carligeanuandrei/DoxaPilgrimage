// Aceasta este o versiune simplificată a aplicației principale
// care ar trebui să funcționeze fără erori de module sau compilare

console.log("Încărcăm versiunea simplificată a DOXA");

// Funcție pentru a afișa un mesaj de încărcare
function showLoadingMessage() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="max-width: 800px; margin: 50px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #3b5998;">DOXA - Platformă de Pelerinaje Ortodoxe</h1>
        <p>Inițializare versiune simplificată...</p>
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3b5998; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        <p>Vă rugăm așteptați. Dacă aplicația nu se încarcă în câteva secunde, încercați una din opțiunile de mai jos:</p>
        <div style="margin-top: 20px;">
          <a href="/react-basic.html" style="display: inline-block; margin-right: 10px; padding: 10px 15px; background: #3b5998; color: white; text-decoration: none; border-radius: 4px;">Test React</a>
          <a href="/api/server-status" style="display: inline-block; padding: 10px 15px; background: #3b5998; color: white; text-decoration: none; border-radius: 4px;">Verificare Server</a>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </div>
    `;
  }
}

// Funcție pentru afișarea diagnozei problemelor
function showDiagnostics() {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="max-width: 800px; margin: 50px auto; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h1 style="color: #3b5998;">DOXA - Diagnostic</h1>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Diagnosticul Problemei</h2>
          <p>Am detectat erori în încărcarea modulelor JavaScript:</p>
          <ul style="margin-bottom: 0;">
            <li>Eroare de sintaxă în main.tsx ("missing ) after argument list")</li>
            <li>Eroare la importul modulelor React ("Failed to resolve module specifier 'react'")</li>
          </ul>
        </div>
        
        <h2>Soluții Potențiale</h2>
        <ol>
          <li>Folosirea versiunii fără module externe: <a href="/react-basic.html" style="color: #3b5998;">Încarcă Test React</a></li>
          <li>Verificarea statusului serverului: <a href="/api/server-status" style="color: #3b5998;">Test Server</a></li>
        </ol>
        
        <div style="margin-top: 30px;">
          <button onclick="location.reload()" style="padding: 10px 15px; background: #3b5998; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;">Reîncarcă Pagina</button>
          <a href="/react-basic.html" style="display: inline-block; padding: 10px 15px; background: #27ae60; color: white; text-decoration: none; border-radius: 4px;">Încarcă Versiunea Funcțională</a>
        </div>
      </div>
    `;
  }
}

// Afișăm mesajul de încărcare
showLoadingMessage();

// După un scurt delay, afișăm diagnoza
setTimeout(showDiagnostics, 2000);