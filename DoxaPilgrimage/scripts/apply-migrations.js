const { spawn } = require('child_process');

console.log("Aplicăm migrările la baza de date folosind drizzle-kit...");

// Rulăm comanda drizzle-kit push:pg
const drizzleProcess = spawn('npx', ['drizzle-kit', 'push:pg'], {
  stdio: 'inherit',
  shell: true
});

drizzleProcess.on('close', (code) => {
  if (code === 0) {
    console.log("Migrările au fost aplicate cu succes!");
  } else {
    console.error(`Procesul de migrare a eșuat cu codul ${code}`);
  }
});