// --- START OF FILE PrivacyPolicy.tsx ---
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BlurText from "@/BlurText/BlurText";
import { ArrowLeft, FileText } from "lucide-react"; // Icon for policy and back

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  const policySections = [
    {
      title: "Données collectées",
      content: "Lorsque vous utilisez Task-Chronos, nous pouvons collecter les données suivantes :",
      points: [
        "Adresse e-mail (lors de l’inscription)",
        "Numéro de téléphone (si précisé)",
        "Nom complet (si indiqué lors de l’inscription)",
        "Tâches, projets et autres contenus que vous créez",
        "Informations techniques (adresse IP, type de navigateur, etc.)",
      ],
    },
    {
      title: "Utilisation des données",
      content: "Vos données sont utilisées uniquement pour :",
      points: [
        "Permettre le fonctionnement de l’application",
        "Sauvegarder vos tâches et projets",
        "Améliorer la qualité du service",
      ],
    },
    {
      title: "Accès aux données",
      content:
        "Seul l’administrateur du site (Clément) peut accéder à l’ensemble des données via l’interface d’administration sécurisée, dans le but de maintenir et améliorer le service. Les autres utilisateurs ne peuvent pas accéder aux données des autres, grâce à des règles de sécurité strictes (Row Level Security).",
    },
    {
      title: "Partage des données",
      content: "Vos données ne sont jamais vendues, partagées ou louées à des tiers.",
    },
    {
      title: "Stockage et sécurité",
      content:
        "Les données sont stockées dans une base de données sécurisée fournie par Supabase, hébergée dans l’Union européenne. Des mesures de sécurité (authentification, chiffrement, restrictions d’accès) sont mises en place pour protéger vos informations.",
    },
    {
      title: "Droits des utilisateurs",
      content: "Conformément au RGPD, vous avez le droit de :",
      points: [
        "Accéder à vos données",
        "Corriger ou supprimer vos données",
        "Demander la suppression complète de votre compte et de vos tâches",
      ],
      footer: (
        <>
          Pour exercer ces droits, vous pouvez contacter :{" "}
          <a
            href="mailto:clement10600@gmail.com"
            className="text-indigo-400 hover:text-indigo-300 underline"
          >
            clement10600@gmail.com
          </a>
        </>
      ),
    },
    {
      title: "Demandes légales et autorités",
      content:
        "Nous ne transmettons aucune donnée personnelle à qui que ce soit, sauf en cas d’obligation légale. Si une autorité compétente (police, justice, etc.) nous demande des informations dans le cadre d’une enquête officielle, nous pourrons être légalement tenus de fournir certaines données, dans les limites prévues par la loi. Dans ce cas, seul l’administrateur de Task-Chronos pourra accéder aux données concernées pour répondre à cette demande.",
    },
    {
      title: "Modifications de la politique",
      content:
        "Cette politique peut être modifiée à tout moment. Les utilisateurs seront notifiés en cas de changement majeur.",
    },
  ];

  return (
    
    <div className="min-h-screen flex flex-col items-center justify-start bg-black text-white px-4 py-12 sm:py-16">
      
      <div className="w-full max-w-3xl">
        
        {/* Back Button */}
        <div className="mb-8">
          <Button
            
            onClick={() => navigate(-1)} // Goes to the previous page
            className="border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:text-white transition-all duration-300 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <FileText className="mx-auto h-12 w-12 text-indigo-500 mb-4" />
          <BlurText
            text="Politique de confidentialité – Task-Chronos"
            delay={50}
            animateBy="words"
            direction="top"
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          />
          <p className="text-sm text-gray-500">
            Dernière mise à jour : 13 mai 2025
          </p>
        </div>

        {/* Policy Content Card */}
        <div className="bg-gray-900/60 border border-gray-800 backdrop-blur-sm shadow-2xl rounded-xl p-6 sm:p-10">
          <p className="text-gray-300 mb-8 leading-relaxed">
            Cette politique de confidentialité explique comment Task-Chronos
            collecte, utilise et protège les données personnelles des
            utilisateurs.
          </p>

          {policySections.map((section, index) => (
            <div key={index} className="mb-8 last:mb-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-gray-300 mb-3 leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.points && (
                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-300 mb-3 leading-relaxed">
                  {section.points.map((point, pIndex) => (
                    <li key={pIndex}>{point}</li>
                  ))}
                </ul>
              )}
              {section.footer && (
                <p className="text-gray-300 leading-relaxed">
                  {section.footer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// --- END OF FILE PrivacyPolicy.tsx ---