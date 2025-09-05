// src/pages/LegalNoticePage.tsx
import React from 'react';
import HeaderBar from '@/components/HeaderBar';
import { Link } from 'react-router-dom';
import { Gavel } from 'lucide-react'; // Icône pour "légal"

const LegalNoticePage = () => {
  // REMPLACEZ CES VALEURS PAR VOS INFORMATIONS RÉELLES
  const editorInfo = {
    name: "Clément Nicolas",
    phone: "0764117899 // Tout abus sera encouru de poursuites judiciaires.",
    email: "clement10600@gmail.com", // Adaptez cet email
  };

  const publicationDirector = "Clément NICOLAS";

  const hostInfo = {
    name: "Vercel",
    address: "440 N Barranca Avenue #4133 , États-Unis",
    phone: "/",
  };
  // Fin des valeurs à remplacer

  const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h2 className="text-2xl font-semibold text-purple-300 dark:text-yellow-400 mt-8 mb-3">
      {children}
    </h2>
  );

  const Paragraph: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
    <p className={`text-gray-300 dark:text-gray-400 mb-3 leading-relaxed ${className}`}>
      {children}
    </p>
  );

  return (
    <>
      <HeaderBar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-indigo-900 text-white dark:from-slate-900 dark:via-slate-800 dark:to-black">
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32">
          
          <header className="text-center mb-10 md:mb-12">
            <Gavel size={48} className="mx-auto text-purple-400 dark:text-yellow-400 mb-4" />
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-100 dark:text-white">
              Mentions Légales
            </h1>
            <p className="mt-3 text-lg text-purple-300 dark:text-purple-400">
              Informations légales concernant le site Task Chronos.
            </p>
          </header>

          <article className="bg-white/5 dark:bg-slate-800/40 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-2xl text-sm sm:text-base">
            <Paragraph>
              Conformément aux dispositions des articles 6-III et 19 de la Loi n° 2004-575 du 21 juin 2004 pour la Confiance dans l'économie numérique, dite L.C.E.N., nous portons à la connaissance des utilisateurs et visiteurs du site Task Chronos les informations suivantes :
            </Paragraph>

            <SectionTitle>1. Informations légales</SectionTitle>
            <Paragraph>
              <strong>Éditeur du Site :</strong><br />
              Nom / Dénomination sociale : {editorInfo.name}<br />
              Téléphone : {editorInfo.phone}<br />
              Adresse e-mail : <a href={`mailto:${editorInfo.email}`} className="text-yellow-400 hover:underline">{editorInfo.email}</a><br />
          
            </Paragraph>

            <Paragraph>
              <strong>Directeur de la publication :</strong><br />
              {publicationDirector}
            </Paragraph>

            <SectionTitle>2. Hébergement</SectionTitle>
            <Paragraph>
              Le site Task Chronos est hébergé par :<br />
              Nom / Dénomination sociale : {hostInfo.name}<br />
              Adresse : {hostInfo.address}<br />
              {hostInfo.phone && `Téléphone : ${hostInfo.phone}`}<br />
             
            </Paragraph>

            <SectionTitle>3. Propriété intellectuelle</SectionTitle>
            <Paragraph>
              L'ensemble de ce site (contenus, textes, images, vidéos, logos, marques...) relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </Paragraph>
            <Paragraph>
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </Paragraph>
            <Paragraph>
             Toute reproduction non autorisée de ces marques, logos et signes distinctifs constitue une contrefaçon passible de sanctions pénales.
            </Paragraph>

            <SectionTitle>4. Protection des données personnelles</SectionTitle>
            <Paragraph>
              Les informations recueillies font l’objet d’un traitement informatique destiné à la gestion des comptes utilisateurs et à la fourniture des services de Task Chronos. Pour plus d'informations sur la gestion de vos données personnelles et pour exercer vos droits, veuillez consulter notre <Link to="/legal/privacy-policy" className="text-yellow-400 hover:underline">Politique de Confidentialité</Link>.
            </Paragraph>

            <SectionTitle>5. Cookies</SectionTitle>
            <Paragraph>
              Le site Task Chronos utilise des cookies pour améliorer l'expérience utilisateur, réaliser des statistiques de visites et proposer des fonctionnalités adaptées. Pour en savoir plus sur l'utilisation des cookies et pour gérer vos préférences, veuillez consulter notre <Link to="/legal/privacy-policy" className="text-yellow-400 hover:underline">Politique de Confidentialité </Link> 
            </Paragraph>
            
            <SectionTitle>6. Limitation de responsabilité</SectionTitle>
            <Paragraph>
              {editorInfo.name} s'efforce d'assurer au mieux de ses possibilités, l'exactitude et la mise à jour des informations diffusées sur ce site, dont elle se réserve le droit de corriger, à tout moment et sans préavis, le contenu. Toutefois, {editorInfo.name} ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à la disposition sur ce site.
            </Paragraph>
            <Paragraph>
              En conséquence, {editorInfo.name} décline toute responsabilité pour toute interruption du site, survenance de bogues, pour toute inexactitude ou omission portant sur des informations disponibles sur le site, pour tous dommages résultant d'une intrusion frauduleuse d'un tiers ayant entraîné une modification des informations mises à la disposition sur le site.
            </Paragraph>
            <Paragraph>
              Ce site peut contenir des liens vers d'autres sites. {editorInfo.name} ne peut être tenu pour responsable des problèmes d'accès ou de contenu de ces sites.
            </Paragraph>

            <SectionTitle>7. Droit applicable et attribution de juridiction</SectionTitle>
            <Paragraph>
              Tout litige en relation avec l’utilisation du site Task Chronos est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux compétents de Troyes.
            </Paragraph>

            <Paragraph className="mt-8 text-xs text-gray-400 dark:text-gray-500">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </Paragraph>
          </article>

          <footer className="text-center mt-12">
            <Link to="/" className="text-purple-300 hover:text-yellow-400 transition-colors dark:text-purple-400 dark:hover:text-yellow-300">
              ← Retour à l'application
            </Link>
          </footer>

        </div>
      </div>
    </>
  );
};

export default LegalNoticePage;