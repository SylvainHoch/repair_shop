const processSteps = [
  { title: "Formulaire", description: "L'utilisateur décrit son objet et la panne observée." },
  { title: "Prise en charge", description: "Le site indique si l'objet peut être pris en charge ou explique pourquoi aucun dépôt n'est nécessaire." },
  { title: "Dépôt", description: "L'objet est déposé à l'adresse indiquée." },
  { title: "Réparation", description: "L'objet est récupéré et une tentative de réparation est effectuée." },
  { title: "E-mail", description: "L'utilisateur reçoit le résultat et les détails de l'intervention." },
  { title: "Retour au dépôt", description: "L'objet est remis au dépôt et l'utilisateur est informé." },
  { title: "Retrait", description: "L'utilisateur vient récupérer son objet." },
];

const howItWorksSteps = [
  { title: "Vous décrivez l'objet", description: "Le formulaire précise le type d'appareil, la panne, les symptômes et les points de sécurité." },
  { title: "Je vérifie la prise en charge", description: "Le site vérifie si la demande entre dans mon périmètre avant de vous envoyer vers le dépôt." },
  { title: "Vous déposez seulement si c'est validé", description: "Si le diagnostic est envisageable, vous recevez les indications pour déposer l'objet." },
  { title: "Je tente la réparation puis je vous réponds", description: "Je vous informe du résultat, des pièces éventuelles et du moment où l'objet peut être récupéré." },
];

const services = [
  { title: "Petits appareils", description: "Cafetière, grille-pain, bouilloire, aspirateur, lampe ou autre objet du quotidien." },
  { title: "Tri avant dépôt", description: "Le formulaire évite les trajets inutiles et identifie les cas qui demandent plutôt un professionnel." },
  { title: "Aide gratuite", description: "La prise en charge est bénévole. L'objectif est de réparer quand c'est raisonnable, pas de vendre." },
];

const decisionPoints = ["Panne décrite clairement", "Absence de risque de sécurité majeur", "Pièces ou cause probable identifiables", "Objet adapté à une réparation locale"];
const refusedObjects = ["Objets encore sous garantie", "Micro-ondes", "Télévisions", "PC", "Smartphones", "Gros électroménagers"];

const faqItems = [
  { question: "Est-ce que la réparation est garantie ?", answer: "Non. Je fais un diagnostic et une tentative de réparation, mais le résultat n'est jamais garanti." },
  { question: "Est-ce que c'est gratuit ?", answer: "Oui, le service est bénévole. Si des pièces de remplacement sont nécessaires, je vous contacte avant achat pour vous informer et obtenir votre accord. Les pièces restent à votre charge." },
  { question: "Ça prend combien de temps ?", answer: "Comptez au moins deux semaines. Je fais ça bénévolement, sur mon temps libre : l'intervention peut prendre un peu de temps." },
];

const diySources = [
  { name: "Repair Café", description: "Trouver un atelier participatif proche de chez vous.", href: "https://www.repairtogether.be" },
  { name: "iFixit", description: "Consulter des guides de démontage et de diagnostic.", href: "https://www.ifixit.com/" },
  { name: "Spareka", description: "Comprendre les pannes courantes et les pièces associées.", href: "https://www.spareka.fr/comment-reparer" },
  { name: "Ateliege", description: "Services de conception et d'impression 3D de pièces de remplacement.", href: "https://www.ateliege.be" },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Je répare vos petits appareils électroménagers, bénévolement</p>
            <h1>Réparation d'appareils électroménagers, bénévole et locale à Liège</h1>
            <p>Je suis ingénieur et bénévole dans des Repair Cafés depuis des années. J'ai envie de donner un peu de temps à la communauté et de continuer à apprendre.</p>
            <p>Pour faciliter la procédure, je vous propose de remplir un formulaire afin de valider la prise en charge. <strong>Si la prise en charge est validée</strong>, vous pourrez déposer votre objet et le récupérer au même endroit après réparation.</p>
            <div className="landing-actions">
              <a className="landing-primary-btn" href="/reparabilite">Commencer le diagnostic</a>
              <a className="landing-secondary-link" href="#fonctionnement">Voir le fonctionnement</a>
            </div>
            <dl className="landing-hero-facts">
              <div><dt>Gratuit</dt><dd>Service bénévole</dd></div>
              <div><dt>Transparent</dt><dd>Décision expliquée</dd></div>
              <div><dt>Pratique</dt><dd>Dépôt seulement si utile</dd></div>
            </dl>
          </div>
          <figure className="landing-hero-media"><img src="/repair-workbench.png" alt="Établi propre avec petit appareil et outils de réparation" /></figure>
        </div>
      </section>

      <section id="fonctionnement" className="landing-section landing-how-section">
        <div className="landing-container">
          <div className="landing-how-header">
            <div className="landing-section-heading">
              <p className="landing-section-label">Comment ça marche ?</p>
              <h2>Un parcours simple, sans dépôt inutile.</h2>
              <p>Le formulaire permet de vérifier rapidement si votre objet peut être pris en charge. Si la demande est hors périmètre, vous le savez avant de vous déplacer.</p>
            </div>
            <a className="landing-primary-btn" href="/reparabilite">Remplir le formulaire</a>
          </div>
          <ol className="landing-how-list">{howItWorksSteps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.description}</span></li>)}</ol>
        </div>
      </section>

      <section id="services" className="landing-section landing-section-muted"><div className="landing-container"><div className="landing-section-heading"><p className="landing-section-label">Service</p><h2>Une aide ciblée pour les objets réparables.</h2><p>Ce site sert à qualifier la demande avant dépôt. Il ne remplace pas le diagnostic final, mais il donne une première décision claire.</p></div><div className="landing-service-grid">{services.map((service) => <article key={service.title} className="landing-service-card"><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></div></section>

      <section className="landing-section landing-refused-section"><div className="landing-container landing-refused-grid"><div className="landing-section-heading"><p className="landing-section-label">Objets refusés</p><h2>Certains objets ne sont pas pris en charge.</h2><p>Pour des raisons de sécurité, de taille, de complexité ou de disponibilité des pièces, ces demandes seront automatiquement classées hors périmètre.</p></div><ul className="landing-refused-list" aria-label="Objets refusés systématiquement">{refusedObjects.map((object) => <li key={object}>{object}</li>)}</ul></div></section>

      <section className="landing-section"><div className="landing-container landing-process-grid"><div className="landing-section-heading"><p className="landing-section-label">Parcours détaillé</p><h2>Ce qui se passe après la validation du formulaire.</h2><p>En répondant à quelques questions, vous saurez si je peux procéder à un diagnostic complet et à une tentative de réparation. Une réponse favorable au questionnaire ne garantit en aucun cas une réparation : elle permet seulement de filtrer les cas probablement hors de mon champ de compétence. Le délai de réparation est d'environ deux semaines ; je consacre une demi-journée par semaine à ce projet.</p></div><figure className="landing-workflow-visual"><img src="/repair-workflow.png" alt="Parcours de réparation : formulaire, vérification de la prise en charge, dépôt, tentative de réparation, e-mail de résultat, retour au dépôt, puis retrait de l'objet." /></figure><ol className="landing-step-list landing-sr-only">{processSteps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.description}</span></li>)}</ol></div></section>

      <section className="landing-section landing-decision-section"><div className="landing-container landing-decision-grid"><div><p className="landing-section-label">Décision</p><h2>Ce qui influence la prise en charge.</h2><p>Le formulaire n'est pas une promesse de réparation. Il sert surtout à éviter les cas dangereux, trop flous ou manifestement hors périmètre.</p><a className="landing-primary-btn" href="/reparabilite">Lancer le diagnostic</a></div><ul className="landing-check-list">{decisionPoints.map((point) => <li key={point}>{point}</li>)}</ul></div></section>

      <section className="landing-section landing-faq-section"><div className="landing-container"><div className="landing-section-heading"><p className="landing-section-label">FAQ</p><h2>Les questions fréquentes avant de déposer un objet.</h2></div><div className="landing-faq-grid">{faqItems.map((item) => <article key={item.question} className="landing-faq-item"><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></div></section>

      <section className="landing-section landing-resource-strip"><div className="landing-container"><div className="landing-resource-header"><div><p className="landing-section-label">Ressources</p><h2>Et pourquoi ne pas réparer vous-même ? Voici des ressources pour vous aider.</h2></div></div><div className="landing-resource-grid">{diySources.map((source) => <a key={source.name} className="landing-resource-card" href={source.href} target="_blank" rel="noreferrer"><strong>{source.name}</strong><span>{source.description}</span></a>)}</div></div></section>

      <section className="landing-section landing-about-section"><div className="landing-container landing-about-grid"><div className="landing-section-heading"><p className="landing-section-label">À propos</p><h2>Le réparateur ? C'est moi !</h2><p>Moi, c'est Sylvain. Je suis ingénieur de formation et bénévole dans des Repair Cafés depuis plusieurs années. J'aime comprendre comment les objets fonctionnent, chercher les pannes, apprendre au passage et donner un peu de temps pour éviter que des appareils réparables finissent trop vite à la poubelle.</p><p>Ce service reste bénévole : je tente les réparations quand elles sont raisonnables, dans mon périmètre de compétence et sans garantie de résultat. L'objectif est simple : aider quand c'est possible, être clair quand ça ne l'est pas et continuer à progresser réparation après réparation.</p></div><div className="landing-about-card" aria-label="Profil du réparateur"><img src="/me.jpg" alt="Portrait de Sylvain, réparateur bénévole" /><span>Ingénieur aéro</span><span>Bénévole Repair Café</span><span>Service gratuit</span><span>Curieux d'apprendre</span></div></div></section>
    </main>
  );
}
