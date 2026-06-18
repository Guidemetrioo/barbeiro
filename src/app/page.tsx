import type { Metadata } from "next";
import LandingPageClient from "@/components/LandingPageClient";

// 1. Server-Side Metadata for Search Engines (SEO)
export const metadata: Metadata = {
  title: "Aura Barber & Co. | Barbearia Premium Itaim Bibi, São Paulo",
  description:
    "Agende seu horário na melhor barbearia premium do Itaim Bibi, SP. Especialistas em corte de cabelo visagista masculino, degradê navalhado, platinado/nevou e barboterapia relaxante com toalha quente e navalha afiada. Cerveja gelada cortesia.",
  keywords: [
    "barbearia itaim bibi",
    "barbearia faria lima",
    "corte de cabelo visagista",
    "platinado masculino sp",
    "degradê masculino navalhado",
    "barboterapia toalha quente",
    "corte masculino sao paulo",
    "barba de luxo sp",
  ],
  alternates: {
    canonical: "https://barbeiro-git-master-h2wnjznr7j-8776s-projects.vercel.app/",
  },
  openGraph: {
    title: "Aura Barber & Co. | Barbearia Premium Itaim Bibi, São Paulo",
    description:
      "Agende seu corte visagista online na melhor barbearia do Itaim Bibi. Toalha quente, cerveja artesanal e os melhores barbeiros de São Paulo.",
    url: "https://barbeiro-git-master-h2wnjznr7j-8776s-projects.vercel.app/",
    siteName: "Aura Barber & Co.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800",
        width: 800,
        height: 600,
        alt: "Aura Barber & Co. Salão Principal",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export default function Home() {
  // 2. Structured Data (JSON-LD) for Local SEO & Rich Snippets
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    "name": "Aura Barber & Co.",
    "image": "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800",
    "@id": "https://barbeiro-git-master-h2wnjznr7j-8776s-projects.vercel.app/#barbershop",
    "url": "https://barbeiro-git-master-h2wnjznr7j-8776s-projects.vercel.app/",
    "telephone": "+5511998765432",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Av. Brigadeiro Faria Lima, 1500",
      "addressLocality": "Itaim Bibi",
      "addressRegion": "SP",
      "postalCode": "01451-001",
      "addressCountry": "BR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -23.5785,
      "longitude": -46.6896
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "21:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "20:00"
      }
    ],
    "sameAs": [
      "https://www.instagram.com/aurabarber",
      "https://www.facebook.com/aurabarber"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Preciso agendar com antecedência ou posso ir direto?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Recomendamos fortemente o agendamento prévio online para evitar filas e garantir atendimento com seu barbeiro preferido, porém atendemos clientes sem horário marcado conforme a disponibilidade de encaixes."
        }
      },
      {
        "@type": "Question",
        "name": "Quais as formas de pagamento aceitas?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Aceitamos Pix, Dinheiro, Cartões de Débito e Crédito (Visa, Mastercard, Elo, Amex). Parcelamos combos e pacotes de serviços no cartão."
        }
      },
      {
        "@type": "Question",
        "name": "Como funciona a política de cancelamento ou remarcação?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Você pode alterar ou cancelar seu horário com até 2 horas de antecedência diretamente entrando em contato conosco via WhatsApp."
        }
      },
      {
        "@type": "Question",
        "name": "O café ou cerveja de cortesia estão inclusos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sim! Todos os nossos clientes têm direito a um café espresso de grãos nobres ou a uma cerveja artesanal gelada como cortesia durante o atendimento."
        }
      }
    ]
  };

  return (
    <>
      {/* Visual H1 specifically styled for SEO crawler hierarchy */}
      <h1 className="sr-only">Aura Barber &amp; Co. | Barbearia Premium no Itaim Bibi, São Paulo</h1>

      {/* Injecting Local Business JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      {/* Injecting FAQ JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Interactive UI Page component */}
      <LandingPageClient />
    </>
  );
}
