// supabase/functions/email-reminder/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend"; // Ou le SDK de votre service d'email

// Variables d'environnement (à définir dans les secrets du projet Supabase)
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!; // Clé publique si accès limité
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!; // Clé service_role pour accès complet
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

const resend = new Resend(RESEND_API_KEY);

interface UserProfile {
  id: string;
  email: string; // Assurez-vous que l'email est accessible
  // Autres champs comme 'receive_reminders', 'reminder_frequency'
}

interface Task {
  id: string;
  title: string;
  date: string; // ou Date
  completed: boolean;
  // autres champs utiles
}

serve(async (req) => {
  // Sécurisation (optionnel mais recommandé si appelé par Cron Job configuré par vous)
  // Vous pourriez vérifier un 'Authorization: Bearer <VOTRE_SECRET_CRON>'
  // const authHeader = req.headers.get("Authorization");
  // if (authHeader !== `Bearer ${Deno.env.get("CRON_JOB_SECRET")}`) {
  //   return new Response("Unauthorized", { status: 401 });
  // }

  try {
    // Initialiser le client Supabase avec la clé service_role pour avoir les droits nécessaires
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Récupérer les utilisateurs qui doivent recevoir un rappel
    // (Exemple: tous les utilisateurs, ou ceux avec des préférences spécifiques)
    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles") // Ou votre table utilisateurs
      .select("id, email") // Et les préférences de rappel
      // .eq('receive_reminders', true) // Exemple de filtre
      // Vous pourriez aussi vouloir récupérer l'email depuis la table auth.users
      // const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) throw usersError;
    if (!users || users.length === 0) {
      return new Response("No users to remind.", { status: 200 });
    }

    for (const user of users) {
      const userProfile = user as UserProfile;

      // 2. Pour chaque utilisateur, récupérer ses tâches non complétées
      const { data: tasks, error: tasksError } = await supabaseAdmin
        .from("tasks")
        .select("title, date, completed")
        .eq("user_id", userProfile.id)
        .eq("completed", false)
        .order("date", { ascending: true });
        // .limit(10); // Limiter pour ne pas avoir d'emails trop longs

      if (tasksError) {
        console.error(`Error fetching tasks for user ${userProfile.id}:`, tasksError.message);
        continue; // Passer à l'utilisateur suivant
      }

      if (tasks && tasks.length > 0) {
        const tasksSummary = tasks
          .map((task: Task) => `- ${task.title} (Pour le ${new Date(task.date).toLocaleDateString('fr-FR')})`)
          .join("\n");

        const emailHtml = `
          <h1>Rappel de vos tâches - Task Chronos</h1>
          <p>Bonjour,</p>
          <p>Il vous reste <strong>${tasks.length} tâche${tasks.length > 1 ? 's' : ''}</strong> à compléter :</p>
          <pre>${tasksSummary}</pre>
          <p>Connectez-vous pour les gérer !</p>
          <p>L'équipe Task Chronos</p>
        `;

        // 3. Envoyer l'e-mail
        try {
          await resend.emails.send({
            from: "Task Chronos <nepasrepondre@votre-domaine.com>", // Adresse configurée dans Resend
            to: userProfile.email,
            subject: `Rappel : Vous avez ${tasks.length} tâche${tasks.length > 1 ? 's' : ''} en cours`,
            html: emailHtml,
          });
          console.log(`Reminder email sent to ${userProfile.email}`);
        } catch (emailError) {
          console.error(`Failed to send email to ${userProfile.email}:`, emailError);
        }
      }
    }

    return new Response(JSON.stringify({ message: "Reminder process completed." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});