/**
 * Componentă simplă App pentru varianta DOXA
 */
import React from "react";

/**
 * O componentă simplă de test care să ne ajute să diagnosticăm problemele
 */
export default function App() {
  // Efect la montare
  React.useEffect(() => {
    console.log("Componenta App React a fost montată cu succes!");
  }, []);
  
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DOXA - Versiunea React</h1>
        <p>Aplicația React a fost încărcată cu succes!</p>
      </header>
      <main className="app-main">
        <div className="card">
          <h2>Diagnosticare completă</h2>
          <p>Această pagină reprezintă o versiune simplificată a aplicației DOXA, 
          folosită pentru a verifica funcționalitatea de bază React.</p>
        </div>
        
        <div className="links-container">
          <a href="/client/index.html" className="btn">Înapoi la aplicația completă</a>
          <a href="/api/server-status" className="btn">Verificare API</a>
        </div>
      </main>
    </div>
  );
}