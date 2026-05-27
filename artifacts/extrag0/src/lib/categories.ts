export interface CategoryEntry {
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subspecialties: string[];
}

export const CATEGORIES: CategoryEntry[] = [
  {
    slug: "garcom",
    name: "Garçom",
    icon: "UtensilsCrossed",
    color: "#7CFC00",
    description: "Atendimento em mesas, serviço de alimentos e bebidas em eventos e restaurantes.",
    subspecialties: ["Garçom de Banquete", "Garçom de Restaurante", "Garçom de Bar", "Sommelier"],
  },
  {
    slug: "barman",
    name: "Barman",
    icon: "Wine",
    color: "#00CFFF",
    description: "Preparo e serviço de drinks, coquetéis e bebidas especiais.",
    subspecialties: ["Bartender Clássico", "Mixologista", "Barista", "Flair Bartender"],
  },
  {
    slug: "recepcionista",
    name: "Recepcionista",
    icon: "ConciergeBell",
    color: "#FF6B6B",
    description: "Recepção e boas-vindas de convidados em eventos corporativos e sociais.",
    subspecialties: ["Recepcionista de Evento", "Recepcionista Corporativa", "Hostess de Stands"],
  },
  {
    slug: "hostess",
    name: "Hostess",
    icon: "Star",
    color: "#FFD700",
    description: "Acolhimento, orientação e relacionamento com convidados em eventos premium.",
    subspecialties: ["Hostess de Balada", "Hostess de Casamento", "Hostess Corporativa"],
  },
  {
    slug: "cumim",
    name: "Cumim",
    icon: "ClipboardList",
    color: "#FF8C00",
    description: "Auxílio ao garçom no atendimento e organização de mesas.",
    subspecialties: ["Cumim de Restaurante", "Cumim de Banquete"],
  },
  {
    slug: "auxiliar-eventos",
    name: "Auxiliar de Eventos",
    icon: "CalendarCheck",
    color: "#9B59B6",
    description: "Apoio geral em montagem, execução e desmontagem de eventos.",
    subspecialties: ["Montagem e Desmontagem", "Staff de Apoio", "Recepção Geral"],
  },
  {
    slug: "promoter",
    name: "Promoter",
    icon: "Megaphone",
    color: "#E91E8C",
    description: "Divulgação, abordagem e promoção de marcas, produtos e eventos.",
    subspecialties: ["Promoter de Ação", "Demonstrador PDV", "Sampling Promoter"],
  },
  {
    slug: "manobrista",
    name: "Manobrista",
    icon: "Car",
    color: "#1ABC9C",
    description: "Estacionamento e manobra de veículos em eventos, hotéis e restaurantes.",
    subspecialties: ["Manobrista de Evento", "Valet Premium", "Manobrista Hospitalar"],
  },
  {
    slug: "bombeiro",
    name: "Bombeiro Civil",
    icon: "Flame",
    color: "#E74C3C",
    description: "Segurança e prevenção de incêndios em eventos e estabelecimentos.",
    subspecialties: ["Bombeiro de Evento", "Brigadista", "Socorrista"],
  },
  {
    slug: "seguranca",
    name: "Segurança",
    icon: "Shield",
    color: "#2C3E50",
    description: "Controle de acesso, vigilância e segurança patrimonial em eventos.",
    subspecialties: ["Segurança de Evento", "Porteiro", "Controlador de Acesso", "Seguança Patrimonial"],
  },
  {
    slug: "babysitter",
    name: "Baby-sitter",
    icon: "Baby",
    color: "#F39C12",
    description: "Cuidados com crianças durante eventos sociais e corporativos.",
    subspecialties: ["Babysitter de Evento", "Recreacionista Infantil", "Monitor Infantil"],
  },
  {
    slug: "mensageiro",
    name: "Mensageiro",
    icon: "Package",
    color: "#3498DB",
    description: "Entrega e transporte de materiais, documentos e encomendas em eventos.",
    subspecialties: ["Mensageiro de Evento", "Carregador", "Office Boy"],
  },
  {
    slug: "chef",
    name: "Chef de Cozinha",
    icon: "ChefHat",
    color: "#E67E22",
    description: "Preparo e elaboração de pratos, menus e experiências gastronômicas.",
    subspecialties: ["Chef Executivo", "Chef de Confeitaria", "Chef de Eventos", "Cozinheiro"],
  },
  {
    slug: "limpeza",
    name: "Limpeza",
    icon: "Sparkles",
    color: "#27AE60",
    description: "Serviços de limpeza e higienização antes, durante e após eventos.",
    subspecialties: ["Camareira", "Faxineira de Evento", "Copeiro", "Zelador"],
  },
  {
    slug: "producao-eventos",
    name: "Produção de Eventos",
    icon: "Calendar",
    color: "#8E44AD",
    description: "Coordenação e execução logística de eventos sociais e corporativos.",
    subspecialties: ["Assistente de Produção", "Coordenador de Eventos", "Cerimonialista"],
  },
  {
    slug: "dj",
    name: "DJ",
    icon: "Music",
    color: "#00CED1",
    description: "Mixagem musical, sonorização e animação de festas e eventos.",
    subspecialties: ["DJ de Casamento", "DJ de Balada", "DJ Corporativo", "VJ"],
  },
  {
    slug: "manutencionista",
    name: "Manutencionista",
    icon: "Wrench",
    color: "#95A5A6",
    description: "Serviços de manutenção, instalação e reparo em eventos e estabelecimentos.",
    subspecialties: ["Eletricista", "Montador de Palco", "Técnico de Som", "Técnico de Iluminação"],
  },
  {
    slug: "mestre-cerimonias",
    name: "Mestre de Cerimônias",
    icon: "Mic",
    color: "#C0392B",
    description: "Condução e animação de eventos com oratória e apresentação.",
    subspecialties: ["MC de Casamento", "MC Corporativo", "Animador de Eventos"],
  },
  {
    slug: "fotografo",
    name: "Fotógrafo",
    icon: "Camera",
    color: "#16A085",
    description: "Cobertura fotográfica de eventos, ensaios e produções.",
    subspecialties: ["Fotógrafo de Casamento", "Fotógrafo Corporativo", "Fotógrafo de Produto"],
  },
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export function getCategoryBySlug(slug: string): CategoryEntry | undefined {
  return CATEGORIES.find(c => c.slug === slug);
}

export function getCategoryByName(name: string): CategoryEntry | undefined {
  return CATEGORIES.find(c => c.name === name);
}

export function getCategoryColor(name: string): string {
  return getCategoryByName(name)?.color ?? "#7CFC00";
}
