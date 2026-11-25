const processSteps = [
  { title: "Formulaire", description: "L'utilisateur d�crit son objet et la panne observ�e." },
  { title: "Prise en charge", description: "Le site indique si l'objet peut �tre pris en charge ou explique pourquoi aucun d�p�t n'est n�cessaire." },
  { title: "D�p�t", description: "L'objet est d�pos� � l'adresse indiqu�e." },
  { title: "R�paration", description: "L'objet est r�cup�r� et une tentative de r�paration est effectu�e." },
  { title: "E-mail", description: "L'utilisateur re�oit le r�sultat et les d�tails de l'intervention." },
  { title: "Retour au d�p�t", description: "L'objet est remis au d�p�t et l'utilisateur est inform�." },
  { title: "Retrait", description: "L'utilisateur vient r�cup�rer son objet." },
];

const howItWorksSteps = [
  { title: "Vous d�crivez l'objet", description: "Le formulaire pr�cise le type d'appareil, la panne, les sympt�mes et les points de s�curit�." },
  { title: "Je v�rifie la prise en charge", description: "Le site v�rifie si la demande entre dans mon p�rim�tre avant de vous envoyer vers le d�p�t." },
  { title: "Vous d�posez seulement si c'est valid�", description: "Si le diagnostic est envisageable, vous recevez les indications pour d�poser l'objet." },
  { title: "Je tente la r�paration puis je vous r�ponds", description: "Je vous informe du r�sultat, des pi�ces �ventuelles et du moment o� l'objet peut �tre r�cup�r�." },
];

const services = [
  { title: "Petits appareils", description: "Cafeti�re, grille-pain, bouilloire, aspirateur, lampe ou autre objet du quotidien." },
  { title: "Tri avant d�p�t", description: "Le formulaire �vite les trajets inutiles et identifie les cas qui demandent plut�t un professionnel." },
  { title: "Aide gratuite", description: "La prise en charge est b�n�vole. L'objectif est de r�parer quand c'est raisonnable, pas de vendre." },
];

const decisionPoints = ["Panne d�crite clairement", "Absence de risque de s�curit� majeur", "Pi�ces ou cause probable identifiables", "Objet adapt� � une r�paration locale"];
const refusedObjects = ["Objets encore sous garantie", "Micro-ondes", "T�l�visions", "PC", "Smartphones", "Gros �lectrom�nagers"];

const faqItems = [
  { question: "Est-ce que la r�paration est garantie ?", answer: "Non. Je fais un diagnostic et une tentative de r�paration, mais le r�sultat n'est jamais garanti." },
  { question: "Est-ce que c'est gratuit ?", answer: "Oui, le service est b�n�vole. Si des pi�ces de remplacement sont n�cessaires, je vous contacte avant achat pour vous informer et obtenir votre accord. Les pi�ces restent � votre charge." },
  { question: "�a prend combien de temps ?", answer: "Comptez au moins deux semaines. Je fais �a b�n�volement, sur mon temps libre : l'intervention peut prendre un peu de temps." },
];

const diySources = [
  { name: "Repair Caf�", description: "Trouver un atelier participatif proche de chez vous.", href: "https://www.repairtogether.be" },
  { name: "iFixit", description: "Consulter des guides de d�montage et de diagnostic.", href: "https://www.ifixit.com/" },
  { name: "Spareka", description: "Comprendre les pannes courantes et les pi�ces associ�es.", href: "https://www.spareka.fr/comment-reparer" },
  { name: "Ateliege", description: "Services de conception et d'impression 3D de pi�ces de remplacement.", href: "https://www.ateliege.be" },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="landing-hero">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Je r�pare vos petits appareils �lectrom�nagers, b�n�volement</p>
            <h1>R�paration d'appareils �lectrom�nagers, b�n�vole et locale � Li�ge</h1>
            <p>Je suis ing�nieur et b�n�vole dans des Repair Caf�s depuis des ann�es. J'ai envie de donner un peu de temps � la communaut� et de continuer � apprendre.</p>
            <p>Pour faciliter la proc�dure, je vous propose de remplir un formulaire afin de valider la prise en charge. <strong>Si la prise en charge est valid�e</strong>, vous pourrez d�poser votre objet et le r�cup�rer au m�me endroit apr�s r�paration.</p>
            <p>?? Je me d�place � v�lo : merci de privil�gier des objets qui tiennent dans un grand sac � dos ou une caisse en plastique.</p>
            <div className="landing-actions">
              <a className="landing-primary-btn" href="/reparabilite">Commencer le diagnostic</a>
              <a className="landing-secondary-link" href="#fonctionnement">Voir le fonctionnement</a>
            </div>
            <dl className="landing-hero-facts">
              <div><dt>Gratuit</dt><dd>Service b�n�vole</dd></div>
              <div><dt>Transparent</dt><dd>D�cision expliqu�e</dd></div>
              <div><dt>Pratique</dt><dd>D�p�t seulement si utile</dd></div>
            </dl>
          </div>
          <figure className="landing-hero-media"><img src="/repair-workbench.png" alt="�tabli propre avec petit appareil et outils de r�paration" /></figure>
        </div>
      </section>

      <section id="fonctionnement" className="landing-section landing-how-section">
        <div className="landing-container">
          <div className="landing-how-header">
            <div className="landing-section-heading">
              <p className="landing-section-label">Comment �a marche ?</p>
              <h2>Un parcours simple, sans d�p�t inutile.</h2>
              <p>Le formulaire permet de v�rifier rapidement si votre objet peut �tre pris en charge. Si la demande est hors p�rim�tre, vous le savez avant de vous d�placer.</p>
            </div>
            <a className="landing-primary-btn" href="/reparabilite">Remplir le formulaire</a>
          </div>
          <ol className="landing-how-list">{howItWorksSteps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.description}</span></li>)}</ol>
        </div>
      </section>

      <section id="services" className="landing-section landing-section-muted"><div className="landing-container"><div className="landing-section-heading"><p className="landing-section-label">Service</p><h2>Une aide cibl�e pour les objets r�parables.</h2><p>Ce site sert � qualifier la demande avant d�p�t. Il ne remplace pas le diagnostic final, mais il donne une premi�re d�cision claire.</p></div><div className="landing-service-grid">{services.map((service) => <article key={service.title} className="landing-service-card"><h3>{service.title}</h3><p>{service.description}</p></article>)}</div></div></section>

      <section className="landing-section landing-refused-section"><div className="landing-container landing-refused-grid"><div className="landing-section-heading"><p className="landing-section-label">Objets refus�s</p><h2>Certains objets ne sont pas pris en charge.</h2><p>Pour des raisons de s�curit�, de taille, de complexit� ou de disponibilit� des pi�ces, ces demandes seront automatiquement class�es hors p�rim�tre.</p></div><ul className="landing-refused-list" aria-label="Objets refus�s syst�matiquement">{refusedObjects.map((object) => <li key={object}>{object}</li>)}</ul></div></section>

      <section className="landing-section"><div className="landing-container landing-process-grid"><div className="landing-section-heading"><p className="landing-section-label">Parcours d�taill�</p><h2>Ce qui se passe apr�s la validation du formulaire.</h2><p>En r�pondant � quelques questions, vous saurez si je peux proc�der � un diagnostic complet et � une tentative de r�paration. Une r�ponse favorable au questionnaire ne garantit en aucun cas une r�paration : elle permet seulement de filtrer les cas probablement hors de mon champ de comp�tence. Le d�lai de r�paration est d'environ deux semaines ; je consacre une demi-journ�e par semaine � ce projet.</p></div><figure className="landing-workflow-visual"><img src="/repair-workflow.png" alt="Parcours de r�paration : formulaire, v�rification de la prise en charge, d�p�t, tentative de r�paration, e-mail de r�sultat, retour au d�p�t, puis retrait de l'objet." /></figure><ol className="landing-step-list landing-sr-only">{processSteps.map((step) => <li key={step.title}><strong>{step.title}</strong><span>{step.description}</span></li>)}</ol></div></section>

      <section className="landing-section landing-decision-section"><div className="landing-container landing-decision-grid"><div><p className="landing-section-label">D�cision</p><h2>Ce qui influence la prise en charge.</h2><p>Le formulaire n'est pas une promesse de r�paration. Il sert surtout � �viter les cas dangereux, trop flous ou manifestement hors p�rim�tre.</p><a className="landing-primary-btn" href="/reparabilite">Lancer le diagnostic</a></div><ul className="landing-check-list">{decisionPoints.map((point) => <li key={point}>{point}</li>)}</ul></div></section>

      <section className="landing-section landing-faq-section"><div className="landing-container"><div className="landing-section-heading"><p className="landing-section-label">FAQ</p><h2>Les questions fr�quentes avant de d�poser un objet.</h2></div><div className="landing-faq-grid">{faqItems.map((item) => <article key={item.question} className="landing-faq-item"><h3>{item.question}</h3><p>{item.answer}</p></article>)}</div></div></section>

      <section className="landing-section landing-resource-strip"><div className="landing-container"><div className="landing-resource-header"><div><p className="landing-section-label">Ressources</p><h2>Et pourquoi ne pas r�parer vous-m�me ? Voici des ressources pour vous aider.</h2></div></div><div className="landing-resource-grid">{diySources.map((source) => <a key={source.name} className="landing-resource-card" href={source.href} target="_blank" rel="noreferrer"><strong>{source.name}</strong><span>{source.description}</span></a>)}</div></div></section>

      <section className="landing-section landing-about-section"><div className="landing-container landing-about-grid"><div className="landing-section-heading"><p className="landing-section-label">A propos</p><h2>Le r�parateur ? C'est moi !</h2><p>Moi, c'est Sylvain. Je suis ing�nieur de formation et b�n�vole dans des Repair Caf�s depuis plusieurs ann�es. J'aime comprendre comment les objets fonctionnent, chercher les pannes, apprendre au passage et donner un peu de temps pour �viter que des appareils r�parables finissent trop vite � la poubelle.</p><p>Ce service reste b�n�vole : je tente les r�parations quand elles sont raisonnables, dans mon p�rim�tre de comp�tence et sans garantie de r�sultat. L'objectif est simple : aider quand c'est possible, �tre clair quand �a ne l'est pas et continuer � progresser r�paration apr�s r�paration.</p></div><div className="landing-about-card" aria-label="Profil du r�parateur"><img src="/me.jpg" alt="Portrait de Sylvain, r�parateur b�n�vole" /><span>Ing�nieur a�ro</span><span>B�n�vole Repair Caf�</span><span>Service gratuit</span><span>Curieux d'apprendre</span></div></div></section>
    </main>
  );
}
