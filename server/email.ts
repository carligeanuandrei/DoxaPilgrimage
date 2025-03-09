import nodemailer from "nodemailer";
import { User } from "@shared/schema";

// Pentru development, vom folosi Ethereal Email
// În producție, acest obiect ar trebui să fie configurat cu servicii reale
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

// În funcție de variabila de mediu, utilizăm transportul corespunzător
const getTransporter = async () => {
  if (process.env.NODE_ENV === "production" && process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  return await createTestAccount();
};

export async function sendVerificationEmail(user: User, token: string): Promise<string> {
  const transporter = await getTransporter();
  
  // Construim URL-ul pentru verificare
  const verificationUrl = `${process.env.APP_URL || "http://localhost:5000"}/verify-email?token=${token}`;
  
  // Trimitem emailul
  const info = await transporter.sendMail({
    from: `"Doxa Pelerinaje" <${process.env.EMAIL_FROM || "noreply@doxa.com"}>`,
    to: user.email,
    subject: "Verifică-ți adresa de email pentru Doxa",
    text: `Bine ai venit la Doxa, ${user.firstName}!\n\nTe rugăm să verifici adresa de email accesând acest link: ${verificationUrl}\n\nAcest link va expira în 24 de ore.\n\nCu stimă,\nEchipa Doxa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Bine ai venit la Doxa!</h2>
        <p>Dragă ${user.firstName},</p>
        <p>Îți mulțumim pentru înregistrarea pe platforma Doxa, locul unde găsești cele mai bune pelerinaje ortodoxe.</p>
        <p>Pentru a-ți activa contul, te rugăm să confirmi adresa de email apăsând pe butonul de mai jos:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verifică adresa de email</a>
        </div>
        <p>Sau poți accesa următorul link:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Acest link va expira în 24 de ore.</p>
        <p>Cu stimă,<br>Echipa Doxa</p>
      </div>
    `,
  });
  
  // Pentru testare locală cu Ethereal, returnam URL-ul de preview
  if (process.env.NODE_ENV !== "production") {
    console.log("Email de verificare: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info) as string;
  }
  
  return "";
}

export async function sendWelcomeEmail(user: User): Promise<void> {
  const transporter = await getTransporter();
  
  await transporter.sendMail({
    from: `"Doxa Pelerinaje" <${process.env.EMAIL_FROM || "noreply@doxa.com"}>`,
    to: user.email,
    subject: "Bine ai venit în comunitatea Doxa!",
    text: `Bine ai venit la Doxa, ${user.firstName}!\n\nContul tău a fost activat cu succes. Acum poți să îți planifici pelerinajele și să explorezi toate funcționalitățile platformei.\n\nCu stimă,\nEchipa Doxa`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #4a5568; text-align: center;">Cont activat cu succes!</h2>
        <p>Dragă ${user.firstName},</p>
        <p>Contul tău Doxa a fost activat cu succes!</p>
        <p>Acum poți:</p>
        <ul>
          <li>Explora ofertele de pelerinaje din întreaga lume</li>
          <li>Rezerva locuri pentru tine și familia ta</li>
          <li>Beneficia de recomandări personalizate</li>
          <li>Primi notificări despre pelerinaje legate de sărbătorile ortodoxe preferate</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.APP_URL || "http://localhost:5000"}" style="background-color: #4f46e5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vizitează Doxa</a>
        </div>
        <p>Cu stimă,<br>Echipa Doxa</p>
      </div>
    `,
  });
}