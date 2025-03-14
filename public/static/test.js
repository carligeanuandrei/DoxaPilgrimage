/**
 * Modul de test pentru verificarea sistemului ES Modules
 * în directorul public
 */

export function getPublicMessage() {
  return "Modulul de test public a fost încărcat cu succes!";
}

export function getEnvironmentInfo() {
  return {
    location: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
}

export default {
  name: "PublicTestModule",
  version: "1.0.0"
};