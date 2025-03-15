import React from 'react';
import { Mail, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CmsText } from "@/components/shared/cms-display";

export default function VerifyAccountPage() {
  const [emailResent, setEmailResent] = React.useState(false);

  // Funcție pentru a retrimite email-ul de verificare
  const handleResendVerificationEmail = async () => {
    try {
      // Realizăm cererea pentru a retrimite email-ul de verificare
      const response = await fetch('/api/resend-verification-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important pentru a permite cookie-urile
      });

      if (response.ok) {
        setEmailResent(true);
      }
    } catch (error) {
      console.error('Eroare la retrimiterea email-ului:', error);
    }
  };

  return (
    <div className="container py-20 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Verifică-ți contul de email</CardTitle>
          <CardDescription className="text-lg">
            Ți-am trimis un email de verificare la adresa de email pe care ai folosit-o pentru înregistrare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-muted/50 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Ce trebuie să faci:</h3>
            <ul className="space-y-3 text-left list-none">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>Verifică inbox-ul tău de email (și directorul de spam)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>Deschide email-ul primit de la Doxa</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span>Apasă pe butonul de verificare din email</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <span>Link-ul de verificare este valabil 24 de ore</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted/30 p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Nu ai primit email-ul?</h3>
            <p className="mb-4">
              Verifică directoarele de spam și promoții din inbox-ul tău. Dacă tot nu găsești email-ul, 
              putem să ți-l retrimitem.
            </p>
            
            {emailResent ? (
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Email retrimis cu succes!</span>
              </div>
            ) : (
              <Button 
                onClick={handleResendVerificationEmail} 
                variant="outline" 
                className="mt-2"
              >
                Retrimite email-ul de verificare
              </Button>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground">
            <p>Ai nevoie de ajutor? <Link href="/contact" className="text-primary hover:underline">Contactează-ne</Link></p>
          </div>
        </CardFooter>
      </Card>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Înapoi la pagina principală
          </Link>
        </p>
      </div>
    </div>
  );
}