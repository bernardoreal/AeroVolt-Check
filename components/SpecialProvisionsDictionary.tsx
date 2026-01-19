
import React, { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { 
  Book, 
  Search, 
  X, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Scale, 
  Lightbulb, 
  Tag, 
  PackageX, 
  Layers, 
  CheckSquare, 
  List, 
  Package, 
  Zap, 
  AlertTriangle,
  GraduationCap,
  Box,
  Menu,
  ShieldAlert,
  FolderOpen,
  Folder,
  LayoutGrid,
  ArrowLeft
} from 'lucide-react';

// --- DATASETS EXPANDIDOS ---

const BATTERY_GLOSSARY = [
  { 
    term: 'Ampère-hora (Ah)', 
    def: 'Unidade de capacidade de carga elétrica. Representa a quantidade de corrente que uma bateria pode fornecer continuamente por uma hora.', 
    context: 'Essencial para calcular a energia (Wh). Fórmula: Ah = mAh / 1000. Exemplo: 3000mAh é igual a 3Ah. Se a voltagem for 3.7V, a energia será 11.1Wh.' 
  },
  { 
    term: 'Bateria (Battery)', 
    def: 'Conjunto de duas ou mais células conectadas eletricamente, ou uma única célula encapsulada com circuitos de proteção, pronta para uso.', 
    context: 'Distinção IATA: Uma "Power Bank" é considerada uma Bateria. Um "Pack" de Laptop é uma Bateria. Se o dispositivo tem apenas uma unidade eletroquímica sem circuito complexo, é uma Célula.' 
  },
  { 
    term: 'Bateria de Botão (Button Cell)', 
    def: 'Pequena bateria redonda onde a altura é menor que o diâmetro. Comum em relógios e placas-mãe.', 
    context: 'Isenção Importante: Equipamentos contendo APENAS baterias de botão (como relógios) não precisam da Marca de Bateria de Lítio (DGR 7.1.5.5).' 
  },
  { 
    term: 'Célula (Cell)', 
    def: 'Uma única unidade eletroquímica envolta em um invólucro, com um terminal positivo e um negativo.', 
    context: 'Ex: Uma pilha AA, uma célula 18650, uma bateria de moeda (CR2032). O limite de Wh para Células (20Wh) é menor que para Baterias (100Wh).' 
  },
  { 
    term: 'Curto-Circuito', 
    def: 'Conexão direta acidental entre os terminais positivo e negativo, resultando em fluxo de corrente zero-resistência e calor extremo.', 
    context: 'Prevenção Mandatória: Terminais devem ser protegidos com fita isolante, capas plásticas, ou embalados em sacos individuais. A principal causa de incêndios em transporte é a falta dessa proteção.' 
  },
  { 
    term: 'DGD (Shippers Declaration)', 
    def: 'Declaração do Expedidor de Artigos Perigosos. Documento legal que atesta que a carga foi embalada, marcada e rotulada conforme o DGR.', 
    context: 'Requisitos L7: Deve ser preenchida em Inglês (obrigatório IATA) e pode ter segunda língua (PT/ES). Deve ter colunas laterais hachuradas em vermelho. 3 vias assinadas.' 
  },
  { 
    term: 'Embalagem Rígida', 
    def: 'Embalagem externa que mantém sua forma, estrutura e proteção sob estresse.', 
    context: 'Caixas de Papelão, Tambores ou Jerricans. Envelopes acolchoados (Bubble mailers) ou sacos plásticos (Polybags) são ESTRITAMENTE PROIBIDOS como embalagem externa para baterias de lítio, pois não protegem contra esmagamento.' 
  },
  { 
    term: 'Estado de Carga (SoC)', 
    def: 'Nível de energia armazenada na bateria expresso em porcentagem da capacidade total.', 
    context: 'Regra PI 965: Baterias de Íon-Lítio soltas (UN 3480) DEVEM ser enviadas com SoC ≤ 30%. Isso reduz a densidade energética disponível para alimentar um incêndio em caso de fuga térmica.' 
  },
  { 
    term: 'Fuga Térmica (Thermal Runaway)', 
    def: 'Reação exotérmica em cadeia onde o calor gerado pela bateria causa mais reações químicas, elevando a temperatura incontrolavelmente (>600°C).', 
    context: 'Pode ser causada por dano físico, sobrecarga ou defeito de fabricação. Uma única célula em fuga pode incendiar todo o pacote. Motivo da proibição rigorosa da SP A154.' 
  },
  { 
    term: 'MSDS / FISPQ / SDS', 
    def: 'Ficha de Dados de Segurança do Material. Documento técnico do fabricante.', 
    context: 'Auditoria: Verificar Seção 14 (Transporte) para confirmar o UN Number e Seção 9/11 para confirmar dados físicos. LATAM exige documento atualizado (< 5 anos).' 
  },
  { 
    term: 'Not Restricted (A199/A123)', 
    def: 'Status de cargas que possuem isenções especiais e não requerem tratamento completo de Artigo Perigoso.', 
    context: 'Exemplo Clássico: Baterias Ni-MH protegidas contra curto. Devem ter a frase "Not Restricted" no AWB para evitar bloqueio na triagem.' 
  },
  { 
    term: 'Overpack (Sobreembalagem)', 
    def: 'Invólucro usado por um único expedidor para conter um ou mais volumes e formar uma unidade de manuseio (Ex: Pallet, Caixa Master).', 
    context: 'Regra de Ouro: Se as etiquetas de perigo dos volumes internos não estiverem visíveis, elas DEVEM ser reproduzidas do lado de fora, junto com a palavra "OVERPACK" (min 12mm altura).' 
  },
  { 
    term: 'PED (Portable Electronic Device)', 
    def: 'Dispositivos Eletrônicos Portáteis (Laptops, Celulares, Câmeras) transportados por passageiros.', 
    context: 'Passageiros podem levar até 15 PEDs. Baterias sobressalentes para PEDs são limitadas a 20 unidades por pessoa (sob aprovação) e APENAS na bagagem de mão.' 
  },
  { 
    term: 'Power Bank', 
    def: 'Bateria portátil projetada para carregar outros dispositivos. Classificada tecnicamente como BATERIA, não equipamento.', 
    context: 'Classificação: SEMPRE UN 3480 (Íon) ou UN 3090 (Metal). Nunca "Packed With". Para passageiros, é PROIBIDO despachar na mala (apenas bagagem de mão).' 
  },
  { 
    term: 'Q Check (Verification)', 
    def: 'Verificação física mandatória da embalagem e documentação antes do embarque.', 
    context: 'Operadores usam o "Checklist IATA". Se houver um único "NÃO" nas perguntas mandatórias, a carga deve ser rejeitada.' 
  },
  { 
    term: 'UN 38.3 (Test Summary)', 
    def: 'Resumo de Testes do Manual de Critérios da ONU. Comprova que o "design type" da bateria é seguro.', 
    context: 'LATAM L7-04: Exige o documento físico/digital. O resumo deve listar os 8 testes (T1-T8) aprovados e ser assinado pelo fabricante/laboratório.' 
  },
  { 
    term: 'Watt-hora (Wh)', 
    def: 'Medida de energia. Diferencia baterias pequenas (Seção II) de grandes (Seção I). Fórmula: Volts (V) × Ampère-hora (Ah).', 
    context: 'Divisor de Águas: ≤ 100Wh (Geralmente aceito na Seção II com menos burocracia). > 100Wh (Exige DGD, Embalagem UN e manuseio completo de DG).' 
  },
];

const PACKAGING_CODES = [
  { 
    code: '4G', 
    type: 'Caixa de Fibra (Papelão)', 
    desc: 'Embalagem de papelão corrugado de alta resistência (Fiberboard Box).', 
    suitability: 'Uso Universal: A mais comum para eletrônicos. Deve ser fechada com fita de alta adesão. Não confundir com caixas de sapato ou caixas de arquivo leves.' 
  },
  { 
    code: '4D', 
    type: 'Caixa de Madeira Compensada', 
    desc: 'Caixa construída com lâminas de madeira coladas (Plywood).', 
    suitability: 'Uso Industrial: Comum para baterias pesadas (>20kg) ou equipamentos industriais onde o papelão falharia no teste de empilhamento.' 
  },
  { 
    code: '1A1 / 1A2', 
    type: 'Tambor de Aço', 
    desc: 'Cilindro metálico. 1A1 (Tampa Fixa) ou 1A2 (Tampa Removível).', 
    suitability: 'Uso Específico: 1A2 é padrão para baterias danificadas (DDR) pois permite conter fogo e é preenchido com vermiculita (isolante térmico).' 
  },
  { 
    code: '3H1 / 3H2', 
    type: 'Bombona Plástica (Jerrican)', 
    desc: 'Recipiente retangular de plástico reforçado.', 
    suitability: 'Uso Químico: Mais comum para eletrólitos líquidos, mas aceito para células pequenas se homologado.' 
  },
  { 
    code: 'UN Specification (POP)', 
    type: 'Homologada (Performance Oriented)', 
    desc: 'Embalagem testada em laboratório e certificada. Possui marcação codificada: Ex: "u/n 4G/Y14/S/..."', 
    suitability: 'OBRIGATÓRIA para Seção IA (Alta Energia) e IB. A marcação "Y" indica Grupo de Embalagem II (Risco Médio), exigido para Lítio.' 
  },
  { 
    code: 'Strong Rigid Packaging', 
    type: 'Embalagem Forte e Rígida', 
    desc: 'Caixa de boa qualidade que suporta queda de 1.2m e empilhamento, mas SEM a marcação "u/n".', 
    suitability: 'Permitida EXCLUSIVAMENTE para Seção II (Baterias Pequenas). Deve proteger o conteúdo contra esmagamento e não pode ser flexível (sacos/envelopes proibidos).' 
  },
];

export const SPECIAL_PROVISIONS_DATA = [
  { 
    code: 'A45', 
    title: 'Baterias Secas (Alcalinas/NiCd)', 
    risk: 'low',
    reference: 'DGR 4.4',
    desc: 'Isenção para baterias comuns, desde que protegidas.',
    details: 'Abrange tecnologias como Zinco-Carbono, Alcalinas e Níquel-Cádmio. A única exigência é a proteção dos terminais contra curto-circuito e uma embalagem externa capaz de suportar o peso (ex: não usar sacolas). Não requer DGD ou etiquetas de perigo.'
  },
  { 
    code: 'A88', 
    title: 'Protótipos (Pré-Produção)', 
    risk: 'high',
    reference: 'DGR 4.4 / PI 910',
    desc: 'Permissão especial para baterias que ainda não foram testadas (UN 38.3).',
    details: 'Aplicável a "novos designs" em fase de teste. Exige Aprovação da Autoridade Competente do país de origem (documento oficial). Transporte restrito a Cargo Aircraft Only (CAO). Deve usar embalagem de alta performance (PI 910) com isolamento térmico extra.'
  },
  { 
    code: 'A99', 
    title: 'Baterias Pesadas (>35kg)', 
    risk: 'high',
    reference: 'DGR 4.4 / PI 974',
    desc: 'Permissão para baterias grandes (ex: Carros Elétricos) que excedem o limite de 35kg.',
    details: 'Baterias de Íon-Lítio acima de 35kg não podem voar pela regra padrão. Requer Aprovação da Autoridade Competente. Embalagem deve seguir PI 974 (geralmente caixas de madeira ou metal customizadas). DGD deve citar "Special Provision A99".'
  },
  {
    code: 'A154', 
    title: 'Baterias Danificadas/Recall', 
    risk: 'forbidden',
    reference: 'DGR 3.9.2.6.1',
    desc: 'PROIBIÇÃO ABSOLUTA de embarque aéreo por risco de segurança.',
    details: 'Aplica-se a: 1) Baterias identificadas pelo fabricante como defeituosas por razões de segurança (Recall de segurança); 2) Baterias fisicamente danificadas (inchadas, perfuradas, vazando). O risco de incêndio espontâneo é inaceitável para o transporte aéreo.'
  },
  { 
    code: 'A164', 
    title: 'Proteção de Equipamentos', 
    risk: 'medium',
    reference: 'DGR 4.4',
    desc: 'Prevenção de ativação acidental e superaquecimento.',
    details: 'Baterias instaladas em equipamentos devem ser protegidas. Exemplos: Interruptores com tampas de segurança, travas físicas no gatilho, embalagens moldadas que impedem pressão nos botões, ou desconexão física dos terminais da bateria dentro do aparelho.'
  },
  { 
    code: 'A181', 
    title: 'Embalagens Mistas (Lítio)', 
    risk: 'medium',
    reference: 'DGR 4.4',
    desc: 'Combinação de tecnologias (Metal e Íon) no mesmo volume.',
    details: 'Permite colocar baterias de Metal Lítio e Íon-Lítio na mesma caixa. O pacote deve exibir as etiquetas de perigo aplicáveis a ambos (ou a etiqueta de risco mais restritiva). O cálculo de limite de peso (Q value) pode ser necessário se for Seção I.'
  },
  { 
    code: 'A199', 
    title: 'Ni-MH (Níquel-Hidreto)', 
    risk: 'low',
    reference: 'DGR 4.4',
    desc: 'Isenção regulatória para Ni-MH no modal Aéreo.',
    details: 'No transporte aéreo (IATA), baterias Ni-MH são "Not Restricted" desde que os terminais estejam protegidos. O UN 3496 e a Classe 9 aplicam-se apenas ao transporte Marítimo (IMDG). AWB deve citar: "Not Restricted per SP A199".'
  },
  { 
    code: 'A206', 
    title: 'Padrão de Etiquetas', 
    risk: 'medium',
    reference: 'DGR 7.2.2',
    desc: 'Especificações visuais rígidas para etiquetas de perigo.',
    details: 'As etiquetas (Classe 9A, Marca de Lítio, CAO) devem ser losangos perfeitos de 100x100mm. A redução para 100x70mm só é permitida se o tamanho do volume for fisicamente menor que a etiqueta padrão. Etiquetas dobradas (wrap-around) não podem comprometer a legibilidade dos símbolos.'
  },
  { 
    code: 'A212', 
    title: 'Data Loggers (Ativos)', 
    risk: 'low',
    reference: 'DGR 4.4',
    desc: 'Regra para rastreadores/sensores ativos anexados à carga.',
    details: 'Data Loggers, sensores de temperatura ou dispositivos de rastreamento alimentados por baterias pequenas (Seção II) que estejam "ATIVOS" durante o transporte. Não exigem que o volume de carga onde estão anexados seja marcado/etiquetado como DG, desde que o dispositivo em si esteja em conformidade.'
  },
  { 
    code: 'A213', 
    title: 'Baterias Instaladas em Carga', 
    risk: 'medium',
    reference: 'DGR 4.4',
    desc: 'Baterias de lítio instaladas em Unidades de Transporte de Carga (CTU).',
    details: 'Trata de grandes sistemas de armazenamento de energia (ex: containers de bateria) que contêm lítio. Devem ser classificados como UN 3536 "Lithium batteries installed in cargo transport unit", e não como baterias soltas comuns. Requer aprovação especial e inspeção.'
  },
  { 
    code: 'A331', 
    title: 'Limite SoC 30% (Íon-Lítio)', 
    risk: 'high',
    reference: 'DGR PI 965',
    desc: 'Restrição de carga para UN 3480 (Baterias Soltas) para mitigar fogo.',
    details: 'Baterias de Íon-Lítio (UN 3480) embaladas sozinhas não podem exceder 30% da capacidade nominal. Estudos mostram que abaixo de 30%, a probabilidade e severidade de uma fuga térmica são drasticamente reduzidas. A violação desta regra é um incidente grave de segurança.'
  },
  { 
    code: 'A334', 
    title: 'Proibição Correio Aéreo', 
    risk: 'forbidden',
    reference: 'DGR 2.4',
    desc: 'Restrição universal da UPU para baterias soltas no correio.',
    details: 'Baterias de lítio soltas (UN3480 e UN3090) são proibidas no fluxo postal internacional (Airmail/EMS). Elas só são aceitas se instaladas dentro de equipamentos (UN3481/3091) e se o operador postal local tiver autorização específica da autoridade de aviação civil.'
  }
];

const IMP_CODES = [
  { 
    code: 'ELI', 
    title: 'Lithium Ion (Section II)', 
    desc: 'Código para UN 3481 (Com/No Equipamento) cumprindo Seção II (Baixa Energia).', 
    context: 'Informação no AWB: Deve constar na caixa "Nature and Quantity" ou "Accounting Info". Indica ao comandante (NOTOC) que há baterias isentas a bordo, mas que requerem atenção em caso de fogo.' 
  },
  { 
    code: 'ELM', 
    title: 'Lithium Metal (Section II)', 
    desc: 'Código para UN 3091 (Com/No Equipamento) cumprindo Seção II (Baixa Quantidade).', 
    context: 'Similar ao ELI, mas para baterias não-recarregáveis. Isento de DGD, mas deve ter a marcação correta e declaração no AWB.' 
  },
  { 
    code: 'RLI', 
    title: 'Regulated Li-Ion (Class 9)', 
    desc: 'Carga Regulada: UN 3480 (Sempre) ou UN 3481 (Seção I - Alta Energia).', 
    context: 'Exige DGD, Embalagem UN Spec e Etiqueta Classe 9A. O código RLI dispara o alerta máximo no sistema da companhia aérea.' 
  },
  { 
    code: 'RLM', 
    title: 'Regulated Li-Metal (Class 9)', 
    desc: 'Carga Regulada: UN 3090 (Sempre) ou UN 3091 (Seção I - Alta Quantidade).', 
    context: 'Extremamente restrito. UN 3090 é proibido em passageiros (CAO). Exige manuseio de Artigo Perigoso Pleno.' 
  },
  { 
    code: 'CAO', 
    title: 'Cargo Aircraft Only', 
    desc: 'Instrução de carregamento: Proibido em aeronaves de passageiros.', 
    context: 'Deve ser etiquetado com a etiqueta laranja "Cargo Aircraft Only". No sistema, bloqueia o carregamento em voos PAX. Obrigatório para UN 3480 e UN 3090 na LATAM.' 
  }
];

const CHECKLIST_ITEMS = [
  { 
    title: 'DGD (Shippers Declaration)', 
    desc: 'Verificar conformidade com Seção I/IA/IB. Deve ser em Inglês, ter 3 vias, colunas hachuradas em vermelho e assinatura válida. Não aceitar rasuras.', 
    mandated: true 
  },
  { 
    title: 'Teste UN 38.3 (Resumo)', 
    desc: 'L7-04 Variation: O Resumo de Teste deve ser apresentado FISICAMENTE ou DIGITALMENTE no ato da aceitação. Links para sites ou "disponível se solicitado" não são aceitos pela LATAM.', 
    mandated: true 
  },
  { 
    title: 'Integridade da Embalagem', 
    desc: 'A caixa está rígida e intacta? Rejeitar qualquer embalagem com amassados, furos, umidade ou sinais de vazamento. O teste de "agitar" não deve revelar sons de peças soltas.', 
    mandated: true 
  },
  { 
    title: 'Etiqueta Classe 9A', 
    desc: 'Obrigatória para Seção I, IA, IB. Deve ser o modelo novo (baterias na metade inferior). Tamanho mínimo 100x100mm. Não pode estar dobrada nas quinas.', 
    mandated: true 
  },
  { 
    title: 'Marca de Bateria de Lítio', 
    desc: 'Obrigatória para Seção IB e II. O número UN deve ser legível e ter no mínimo 12mm de altura. O telefone de emergência deve ser válido e operar 24h (ou durante o trânsito).', 
    mandated: true 
  },
  { 
    title: 'Marcação Overpack', 
    desc: 'Se a carga está em pallet/unitizada e as etiquetas internas não são visíveis, deve haver a marca "OVERPACK" (letras de 12mm) e reprodução de todas as etiquetas de perigo externas.', 
    mandated: false 
  },
  { 
    title: 'Estado de Carga (SoC)', 
    desc: 'Para UN 3480: Declaração explicita no AWB ou documento anexo (Invoice/Packing List) confirmando que a carga não excede 30% de SoC. Sem isso, a carga é rejeitada.', 
    mandated: true 
  },
  { 
    title: 'Proteção de Terminais', 
    desc: 'Inspeção visual (se possível) ou declaração: Baterias soltas devem ter terminais isolados individualmente (tampas, fita, sacos) para evitar curto-circuito.', 
    mandated: true 
  },
];

const DGR_SECTIONS_DATA = [
  // SEÇÃO 1 - APLICABILIDADE
  { 
    section: '1.0', 
    topic: 'Seção 1', 
    title: 'Definição de DG', 
    desc: 'Artigos que representam risco à saúde, segurança, propriedade ou meio ambiente.',
    details: 'A definição fundamental da IATA/ICAO: Artigos Perigosos são objetos ou substâncias capazes de representar risco significativo à saúde, segurança, propriedade ou ao meio ambiente quando transportados por via aérea. A responsabilidade de classificar é do expedidor. Baterias de Lítio são consideradas DG (Classe 9) devido ao risco químico e elétrico.'
  },
  { 
    section: '1.2.7', 
    topic: 'Seção 1', 
    title: 'Exceções do Operador', 
    desc: 'Equipamentos da aeronave (ex: baterias do sistema de voo) isentos do DGR.',
    details: 'Equipamentos que são parte integrante da aeronave (baterias do sistema de navegação, botes salva-vidas, extintores de cockpit) estão ISENTOS do DGR, pois são certificados sob regras de aeronavegabilidade (airworthiness) e não como carga. Isso também se aplica a itens de "Company Material" (COMAT) essenciais para a operação imediata.'
  },
  { 
    section: '1.3.1', 
    topic: 'Seção 1', 
    title: 'Treinamento CBTA', 
    desc: 'Treinamento Baseado em Competência. Obrigatório a cada 24 meses para expedidores.',
    details: 'O modelo "Competency-Based Training and Assessment" (CBTA) substituiu as antigas categorias. Exige que o treinamento seja focado na função específica (function-specific) do funcionário. A validade é de 24 meses. Sem certificado válido, nenhuma pessoa pode assinar a DGD ou oferecer carga perigosa.'
  },
  { 
    section: '1.5', 
    topic: 'Seção 1', 
    title: 'Treinamento Geral', 
    desc: 'Exige avaliação de competência para expedidores e operadores.',
    details: 'Estabelece que todos os envolvidos na cadeia logística (Expedidor, Agente de Carga, Operador de Solo, Tripulação) devem ser treinados. O treinamento deve incluir: Familiarização Geral, Treinamento Específico de Função e Treinamento de Segurança (Safety). Registros devem ser mantidos por 36 meses.'
  },
  { 
    section: '1.6.1', 
    topic: 'Seção 1', 
    title: 'Variações (State/Operator)', 
    desc: 'Regras mais estritas impostas por Países (ex: USG) ou Cias Aéreas (ex: L7).',
    details: 'As variações (State/Operator Variations) são regras MAIS RESTRITIVAS que o DGR padrão. Elas têm precedência sobre a regra geral. Exemplo: A IATA permite UN3480 em passageiros (sob condições), mas a variação L7-01 (LATAM) PROÍBE totalmente. É mandatório checar as variações antes de aceitar qualquer carga.'
  },
  { 
    section: '1.7', 
    topic: 'Seção 1', 
    title: 'Segurança (Security)', 
    desc: 'Proteção da carga contra acesso não autorizado durante o transporte.',
    details: 'Difere de "Safety". Trata-se da proteção contra atos de interferência ilícita (terrorismo/roubo). Artigos Perigosos de "Alta Consequência" exigem planos de segurança específicos. Baterias de Lítio, embora perigosas, geralmente não exigem planos de segurança antiterrorismo complexos, mas devem ser armazenadas em áreas seguras.'
  },

  // SEÇÃO 2 - LIMITAÇÕES
  { 
    section: '2.1.1', 
    topic: 'Seção 2', 
    title: 'Proibidos (Forbidden)', 
    desc: 'Artigos proibidos (Ex: Baterias Recall/Inchadas - SP A154).',
    details: 'Lista itens que são inseguros demais para voar. Para Lítio, a regra de ouro é: Baterias sob RECALL de segurança do fabricante ou baterias fisicamente DANIFICADAS (inchadas, vazando, terminais corroídos) são "Forbidden under any circumstances". Não há exceção ou aprovação para estes itens.'
  },
  { 
    section: '2.2', 
    topic: 'Seção 2', 
    title: 'Perigo Oculto (Hidden DG)', 
    desc: 'Cargas suspeitas: Peças Auto, Brinquedos, Equipamento de Mergulho, Drones.',
    details: 'O pessoal de aceitação deve estar alerta para cargas declaradas como "Geral" que podem conter DG. Palavras-chave suspeitas: "Peças de Reposição" (pode ter baterias), "Equipamento de Mergulho" (luzes de alta intensidade), "Material de Camping", "Brinquedos Elétricos", "Instrumentos Musicais" (eletrônicos). Se houver suspeita, deve-se exigir uma carta de "Non-Dangerous Goods".'
  },
  { 
    section: '2.3.2', 
    topic: 'Seção 2', 
    title: 'Tabela 2.3.A', 
    desc: 'Artigos permitidos na bagagem de passageiros/tripulação.',
    details: 'A "Bíblia" do check-in. Define o que pode ir na mala de mão ou despachada. Baterias soltas (Power Banks) são EXCLUSIVAS de mão. Equipamentos com baterias podem ser despachados se o aparelho estiver totalmente desligado. O limite padrão é 100Wh por bateria.'
  },
  { 
    section: '2.3.2.2', 
    topic: 'Seção 2', 
    title: 'Cadeiras de Rodas (Mobility)', 
    desc: 'Regras para cadeiras de rodas elétricas com baterias de lítio removíveis ou fixas.',
    details: 'Se a bateria for removível (design colapsável), o passageiro DEVE remover a bateria, proteger os terminais e levá-la na cabine (max 300Wh). Se a bateria for fixa, ela deve ser desconectada e isolada, e a cadeira vai no porão. Requer notificação ao comandante.'
  },
  { 
    section: '2.3.5.8', 
    topic: 'Seção 2', 
    title: 'PEDs (Equipamentos)', 
    desc: 'Laptops/Celulares permitidos na bagagem de mão e despachada (< 100Wh).',
    details: 'Portable Electronic Devices. Passageiros podem levar até 15 PEDs (Câmeras, Celulares, Laptops). Se despachados, devem estar totalmente desligados (não em hibernação) e protegidos contra danos (embalados entre roupas macias, por exemplo).'
  },
  { 
    section: '2.3.5.9', 
    topic: 'Seção 2', 
    title: 'Baterias Sobressalentes', 
    desc: 'Power Banks e baterias soltas: APENAS bagagem de mão. Proibido despachar.',
    details: 'REGRA CARDINAL: Baterias de lítio "spare" (avulsas), incluindo Power Banks, JAMAIS podem ir no porão (bagagem despachada). Motivo: Se houver fogo no porão, os sistemas de halon podem não ser eficazes contra metal lítio ou grandes quantidades de íon-lítio. Na cabine, a tripulação pode combater o fogo.'
  },
  { 
    section: '2.4', 
    topic: 'Seção 2', 
    title: 'Correio Aéreo (Mail)', 
    desc: 'Baterias soltas proibidas. Apenas equipamentos aceitos (com aprovação da Cia).',
    details: 'A União Postal Universal (UPU) proíbe o transporte de Artigos Perigosos pelo correio aéreo internacional, COM EXCEÇÃO de baterias de lítio contidas em equipamentos (UN3481/3091), desde que a Autoridade de Aviação Civil e o Operador Postal tenham procedimentos aprovados.'
  },
  { 
    section: '2.6', 
    topic: 'Seção 2', 
    title: 'Quantidades Excetuadas (EQ)', 
    desc: 'Código "E0" (Não Permitido) aplica-se a quase todas as baterias de lítio.',
    details: 'O regime de "Excepted Quantities" (EQ) permite transporte simplificado para quantidades minúsculas (ex: 30ml de perfume). Para Baterias de Lítio, o código na coluna F da Página Azul é "E0", o que significa "Not Permitted". Não existe transporte de bateria de lítio via EQ.'
  },

  // SEÇÃO 3 - CLASSIFICAÇÃO
  { 
    section: '3.9.2.6', 
    topic: 'Seção 3', 
    title: 'Classificação Lítio', 
    desc: 'Requisitos de Teste UN 38.3 e Gestão da Qualidade na fabricação.',
    details: 'Define que todas as células e baterias transportadas devem ser de um tipo que provou atender aos requisitos de cada teste do Manual de Testes e Critérios da ONU, Parte III, subseção 38.3. Além disso, devem ser fabricadas sob um programa de gestão de qualidade (ISO 9001 ou similar) para evitar defeitos de série.'
  },
  { 
    section: '3.9.2.6.1', 
    topic: 'Seção 3', 
    title: 'Baterias Danificadas', 
    desc: 'Baterias com defeito de segurança são proibidas no transporte aéreo.',
    details: 'Reforça a proibição de baterias identificadas como defeituosas. Se uma bateria for removida de um aparelho devido a falha, ela não pode ser transportada via aérea para análise ou descarte. Deve seguir via terrestre como Resíduo Perigoso.'
  },

  // SEÇÃO 4 - IDENTIFICAÇÃO
  { 
    section: '4.2', 
    topic: 'Seção 4', 
    title: 'Lista de Artigos Perigosos', 
    desc: 'Páginas Azuis. UN Number, Proper Shipping Name, Classe, Pkg Group.',
    details: 'A tabela central do DGR (List of Dangerous Goods). Colunas cruciais: B (Proper Shipping Name), C (Class 9), E (Label), G/H (PAX Limits), J/K (CAO Limits). Para lítio, não há "Packing Group" atribuído (N/A), mas a embalagem deve atender ao nível de performance PG II.'
  },
  { 
    section: '4.4', 
    topic: 'Seção 4', 
    title: 'Disposições Especiais', 
    desc: 'Códigos "Axxx" (Ex: A154, A88, A99) que modificam requisitos.',
    details: 'Pequenos códigos na Coluna M que alteram drasticamente as regras. Podem conceder isenções (A199 para Ni-MH), impor proibições (A154 para defeituosas) ou exigir aprovações (A99 para >35kg). Sempre leia o texto completo da SP.'
  },

  // SEÇÃO 5 - EMBALAGEM
  { 
    section: '5.0.1.2', 
    topic: 'Seção 5', 
    title: 'Requisitos Gerais', 
    desc: 'Embalagens devem ser de boa qualidade, fechadas de forma segura e sem vazamentos.',
    details: 'As embalagens devem ser construídas, fechadas e preparadas de forma a evitar qualquer vazamento ou dano causado por vibração, temperatura, umidade ou pressão durante o voo. Não podem haver resíduos de DG na parte externa.'
  },
  { 
    section: '5.0.1.5', 
    topic: 'Seção 5', 
    title: 'Overpacks', 
    desc: 'Regras para consolidar volumes (marcação "OVERPACK" obrigatória se etiquetas ocultas).',
    details: 'Um Overpack é um invólucro usado para combinar um ou mais pacotes em uma única unidade de manuseio (ex: filme stretch em pallet). Regra crítica: Se as marcas e etiquetas dos volumes internos não forem visíveis, elas devem ser reproduzidas fora, junto com a palavra "OVERPACK" (min 12mm de altura).'
  },
  { 
    section: '5.0.2.11', 
    topic: 'Seção 5', 
    title: 'Incompatibilidade', 
    desc: 'Não misturar Classes de perigo que reagem entre si na mesma embalagem.',
    details: 'Embora Baterias de Lítio (Classe 9) sejam quimicamente estáveis em relação a outras cargas, elas não devem ser embaladas no mesmo volume externo com explosivos ou substâncias que possam agravar um incêndio (como Classe 3 Inflamáveis), a menos que permitido pela Tabela 9.3.A.'
  },
  { 
    section: '5.0.2.12', 
    topic: 'Seção 5', 
    title: 'Específico Lítio', 
    desc: 'Proteção contra curto-circuito, ativação acidental e movimentos internos.',
    details: 'Cada bateria deve ser protegida contra curto-circuito (terminais isolados). Células/Baterias devem ser imobilizadas dentro da embalagem externa para evitar danos aos terminais. Equipamentos devem ter meios de evitar ativação acidental (travas, tampas).'
  },
  { 
    section: 'PI 965-970', 
    topic: 'Seção 5', 
    title: 'Packing Instructions', 
    desc: 'Regras específicas para UN3480, 3481, 3090, 3091.',
    details: 'As Instruções de Embalagem (PI) detalham exatamente como montar o volume. PI 965 (Ion Solta), 966 (Ion Com), 967 (Ion No), 968 (Metal Solta), 969 (Metal Com), 970 (Metal No). Elas são divididas em Seção IA (Totalmente Regulado), IB (Pequenas Qtde Reguladas) e II (Isentas/Exceção).'
  },

  // SEÇÃO 6 - ESPECIFICAÇÕES DE EMBALAGEM
  { 
    section: '6.0.4', 
    topic: 'Seção 6', 
    title: 'Códigos UN', 
    desc: 'Entendendo a string de homologação (ex: 4G/Y14/S...).',
    details: 'O código "UN" impresso na caixa garante a qualidade. Ex: "u/n 4G/Y14/S/23/CN/..." significa: 4G (Caixa Papelão), Y (Grupo de Embalagem II/III), 14 (Peso Bruto Max Kg), S (Sólidos), 23 (Ano Fabricação), CN (País). Para Lítio, exige-se no mínimo nível de performance do Grupo de Embalagem II (Y).'
  },
  { 
    section: '6.3', 
    topic: 'Seção 6', 
    title: 'Testes de Performance', 
    desc: 'Testes exigidos para homologação UN: Queda (Drop), Empilhamento (Stacking).',
    details: 'Para obter a marca UN, a embalagem passa por: Drop Test (Queda de 1.2m em várias posições sem vazar/danificar), Stacking Test (Pilha de 3m por 24h) e testes de absorção de água (Cobb). Embalagens "Strong Rigid" (Seção II) não precisam da marca UN, mas devem suportar o Drop Test de 1.2m.'
  },

  // SEÇÃO 7 - MARCAÇÃO E ETIQUETAGEM
  { 
    section: '7.1.3', 
    topic: 'Seção 7', 
    title: 'Embalagens Vazias', 
    desc: 'Devem ter as etiquetas removidas ou cobertas se não contiverem perigo.',
    details: 'Se uma caixa homologada UN for reutilizada para transportar carga geral (não perigosa), todas as marcas de perigo (Etiquetas, Marca de Lítio, UN Number) devem ser OBLITERADAS, REMOVIDAS ou COBERTAS para não confundir os handlers.'
  },
  { 
    section: '7.1.5.5', 
    topic: 'Seção 7', 
    title: 'Marca de Lítio', 
    desc: 'Especificações da marca retangular hachurada (100x100mm).',
    details: 'A "Lithium Battery Mark" é usada para Seção IB e II. Deve ser um retângulo (min 100x100mm ou 100x70mm para pacotes pequenos) com borda hachurada em vermelho. Deve conter o símbolo da bateria, o número UN e um telefone para informações adicionais.'
  },
  { 
    section: '7.1.7', 
    topic: 'Seção 7', 
    title: 'Marcação Overpack', 
    desc: 'Letras de no mínimo 12mm de altura.',
    details: 'A palavra "OVERPACK" deve ser marcada na embalagem externa em letras com pelo menos 12mm de altura. Isso sinaliza que o volume é uma consolidação e que as embalagens internas cumprem os requisitos UN.'
  },
  { 
    section: '7.2.2.4', 
    topic: 'Seção 7', 
    title: 'Classe 9A', 
    desc: 'Etiqueta de risco específica para baterias de lítio.',
    details: 'Introduzida para diferenciar baterias de outros "Miscelâneos". Tem 7 listras verticais na metade superior e o símbolo de baterias na inferior. Obrigatória para Seção I, IA e IB. Não confundir com a Classe 9 genérica (sem o símbolo de bateria).'
  },
  { 
    section: '7.2.4.7', 
    topic: 'Seção 7', 
    title: 'Etiqueta CAO', 
    desc: 'Cargo Aircraft Only. Obrigatória para UN 3480/3090.',
    details: 'A etiqueta laranja "Cargo Aircraft Only" proíbe o carregamento em aviões de passageiros. Deve ser colocada na mesma face da etiqueta de risco (Classe 9A). Obrigatória para todas as baterias soltas (UN3480/3090) e para Seção I que exceda limites de PAX.'
  },
  { 
    section: '7.2.6', 
    topic: 'Seção 7', 
    title: 'Posicionamento', 
    desc: 'Etiquetas na mesma face, não dobradas, visíveis e seguras.',
    details: 'Todas as etiquetas devem estar na mesma face do volume (se o tamanho permitir), próximas à marcação do Proper Shipping Name. Não podem dobrar nas quinas (exceto em cilindros pequenos). Devem contrastar com o fundo.'
  },

  // SEÇÃO 8 - DOCUMENTAÇÃO
  { 
    section: '8.1.2', 
    topic: 'Seção 8', 
    title: 'DGD Formato', 
    desc: 'DGD deve ser preenchida em Inglês. Rasuras não são permitidas (L7).',
    details: 'A Shipper\'s Declaration for Dangerous Goods é um documento legal. Deve ser preenchida em Inglês (obrigatório IATA). Pode ter tradução. Rasuras ou uso de corretivo líquido invalidam o documento. Deve ser assinada por pessoa treinada.'
  },
  { 
    section: '8.1.6.9', 
    topic: 'Seção 8', 
    title: 'Preenchimento DGD', 
    desc: 'Natureza e Quantidade de Mercadorias (ex: UN3480, 1 Fibreboard Box x 10 kg).',
    details: 'A sequência de descrição é rígida: UN Number, Proper Shipping Name, Class, Packing Group (se houver). Em seguida, número de volumes, tipo de embalagem e quantidade líquida por volume. Para lítio, deve citar a PI correta (ex: "PI 965-IA").'
  },
  { 
    section: '8.1.6.11', 
    topic: 'Seção 8', 
    title: 'Declaração Adicional', 
    desc: 'Campo "Additional Handling Information" (ex: telefone 24h).',
    details: 'Espaço usado para informações extras exigidas por variações (Ex: "Emergency Contact: +55 11 9999-9999" para envios aos EUA) ou números de aprovação (Ex: "Special Provision A99 applied").'
  },
  { 
    section: '8.2.6', 
    topic: 'Seção 8', 
    title: 'Air Waybill (AWB)', 
    desc: 'Declarações "Nature and Quantity" (ex: Lithium Ion Batteries compliance with Section II...).',
    details: 'Para baterias da Seção II (Isentas de DGD), o AWB torna-se o principal documento de declaração. Deve conter frases padronizadas como "Lithium ion batteries in compliance with Section II of PI 965". Isso informa ao comandante para incluir a carga no NOTOC.'
  },

  // SEÇÃO 9 - MANUSEIO
  { 
    section: '9.3', 
    topic: 'Seção 9', 
    title: 'Aceitação', 
    desc: 'Uso obrigatório do Checklist. A carga não pode ser aceita se houver discrepâncias.',
    details: 'O operador é obrigado a usar um Checklist de Aceitação padronizado (IATA Lithium Battery Checklist). Cada item (etiquetas, embalagem, DGD) deve ser verificado. Se um único item falhar ("NO"), a carga inteira deve ser rejeitada até correção.'
  },
  { 
    section: '9.5', 
    topic: 'Seção 9', 
    title: 'NOTOC', 
    desc: 'Notificação ao Comandante. O piloto deve saber a localização das baterias a bordo.',
    details: 'Notification to Captain. Antes da decolagem, o piloto recebe uma lista com a localização e tipo de todo DG a bordo. Isso é vital para emergências: se houver alerta de fogo no porão dianteiro, o piloto consultará o NOTOC para saber se há baterias de lítio lá e decidir a estratégia de combate.'
  },
  { 
    section: '9.6', 
    topic: 'Seção 9', 
    title: 'Reporte de Incidentes', 
    desc: 'Obrigatório reportar: fogo, vazamento, ou baterias não declaradas encontradas.',
    details: 'Qualquer ocorrência envolvendo DG (fogo, fumaça, vazamento) ou a descoberta de DG não declarado (Hidden DG) deve ser reportada às autoridades locais (ANAC, FAA, etc.) e à IATA dentro de prazos estritos.'
  },
  { 
    section: '9.8', 
    topic: 'Seção 9', 
    title: 'Separação e Segregação', 
    desc: 'Distância mínima entre materiais radioativos ou animais vivos e baterias (geralmente não aplicável, mas regra geral).',
    details: 'Baterias de lítio devem ser segregadas de Animais Vivos (AVI) para evitar que o calor de uma possível fuga térmica fira os animais, e de materiais Radioativos categoria II/III para evitar dispersão em caso de fogo.'
  },
];

const SECTION_TITLES: Record<string, string> = {
  'Seção 1': 'Aplicabilidade e Treinamento',
  'Seção 2': 'Limitações (Proibidos/PAX)',
  'Seção 3': 'Classificação de Risco',
  'Seção 4': 'Identificação e Listas',
  'Seção 5': 'Instruções de Embalagem',
  'Seção 6': 'Especificações de Embalagem',
  'Seção 7': 'Marcação e Etiquetagem',
  'Seção 8': 'Documentação (DGD/AWB)',
  'Seção 9': 'Manuseio e Aceitação',
  'Seção 10': 'Material Radioativo'
};

type TabType = 'SP' | 'GLOSSARY' | 'PKG' | 'IMP' | 'CHK' | 'DGR';

export function SpecialProvisionsDictionary() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('SP');
  const [search, setSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // State for Detail View Navigation
  const [selectedSection, setSelectedSection] = useState<typeof DGR_SECTIONS_DATA[0] | null>(null);

  // Reset detail view when tab changes or drawer closes
  useEffect(() => {
    setSelectedSection(null);
  }, [activeTab, isOpen]);

  const toggleExpand = (code: string) => setExpandedItem(prev => prev === code ? null : code);

  const getRiskColor = (risk?: string) => {
    switch(risk) {
      case 'forbidden': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  // --- DETAIL VIEW RENDERER ---
  const renderDetailView = (item: typeof DGR_SECTIONS_DATA[0]) => (
    <div className="animate-in fade-in slide-in-from-right-8 duration-300 h-full flex flex-col">
       <button 
         onClick={() => setSelectedSection(null)}
         className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-6 hover:text-indigo-800 transition-colors w-fit group"
       >
         <div className="p-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
            <ArrowLeft size={16} />
         </div>
         Voltar para Lista
       </button>

       <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden flex-1 flex flex-col">
          <div className="bg-indigo-900 p-8 text-white relative overflow-hidden shrink-0">
             <div className="absolute top-0 right-0 w-32 h-32 bg-coral-500 opacity-20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
             
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <span className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-black tracking-widest backdrop-blur-sm">
                   {item.section}
                </span>
                <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest border-l border-white/20 pl-3">
                   {item.topic}
                </span>
             </div>
             
             <h2 className="text-2xl font-black tracking-tight leading-tight relative z-10 mb-2">
                {item.title}
             </h2>
          </div>

          <div className="p-8 overflow-y-auto custom-scrollbar">
             <div className="prose prose-sm prose-slate max-w-none">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Resumo</h3>
                <p className="text-sm font-medium text-slate-600 mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic">
                   "{item.desc}"
                </p>

                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Detalhamento Técnico</h3>
                <p className="text-base text-slate-800 leading-relaxed whitespace-pre-line">
                   {item.details || "Conteúdo detalhado não disponível para esta seção."}
                </p>
             </div>
          </div>
       </div>
    </div>
  );

  // --- REUSABLE RENDER FUNCTIONS ---
  
  const renderSP = (items: any[]) => (
    <div className="space-y-3">
       {items.map((sp) => {
         const isExpanded = expandedItem === sp.code;
         return (
           <div 
              key={sp.code} 
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}
           >
              <button 
                className="w-full text-left p-4 flex items-start gap-4"
                onClick={() => toggleExpand(sp.code)}
              >
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border text-xs font-black ${getRiskColor(sp.risk)}`}>
                   {sp.code}
                </div>
                <div className="flex-1 min-w-0">
                   <h3 className="font-bold text-slate-800 truncate">{sp.title}</h3>
                   <p className="text-xs text-slate-500 mt-1 line-clamp-2">{sp.desc}</p>
                </div>
                <ChevronRight size={18} className={`text-slate-300 mt-2 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
              </button>
              
              {isExpanded && (
                 <div className="px-4 pb-4 pt-0 animate-in fade-in slide-in-from-top-1">
                    <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Explicação Detalhada</span>
                          <p className="text-xs text-slate-700 leading-relaxed">{sp.details}</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Referência:</span>
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{sp.reference}</span>
                       </div>
                    </div>
                 </div>
              )}
           </div>
         );
       })}
    </div>
  );

  const renderGlossary = (items: any[]) => (
    <div className="grid gap-3">
       {items.map((item, idx) => (
         <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-coral-200 transition-colors group">
            <h3 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
               {item.term}
               <GraduationCap size={14} className="text-slate-300 group-hover:text-coral-400" />
            </h3>
            <p className="text-sm text-slate-700 font-medium leading-relaxed mb-2">{item.def}</p>
            <div className="bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 flex gap-2 items-start">
               <Lightbulb size={14} className="text-amber-500 mt-0.5 shrink-0" />
               <p className="text-xs text-slate-500 italic">{item.context}</p>
            </div>
         </div>
       ))}
    </div>
  );

  const renderPackaging = (items: any[]) => (
     <div className="grid gap-3">
        {items.map((pkg, idx) => (
           <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start">
              <div className="bg-slate-900 text-white px-3 py-2 rounded-lg font-mono font-bold text-sm text-center min-w-[60px]">
                 {pkg.code}
              </div>
              <div className="flex-1">
                 <h4 className="font-bold text-slate-800">{pkg.type}</h4>
                 <p className="text-xs text-slate-500 mt-1 mb-2">{pkg.desc}</p>
                 <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-100">
                    {pkg.suitability}
                 </span>
              </div>
           </div>
        ))}
     </div>
  );

  const renderIMP = (items: any[]) => (
      <div className="space-y-3">
         {items.map((imp, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
               <div className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg font-black text-sm tracking-widest min-w-[60px] text-center border border-slate-200">
                  {imp.code}
               </div>
               <div>
                  <h4 className="font-bold text-slate-800 text-sm">{imp.title}</h4>
                  <p className="text-xs text-slate-500">{imp.desc}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{imp.context}</p>
               </div>
            </div>
         ))}
      </div>
  );

  const renderChecklist = (items: any[]) => (
      <div className="space-y-3">
         {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
               <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${item.mandated ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckSquare size={14} />
               </div>
               <div>
                  <h4 className="text-xs font-bold text-slate-800">
                     {item.title}
                     {item.mandated && <span className="ml-2 text-[9px] text-red-500 font-black uppercase bg-red-50 px-1.5 py-0.5 rounded">Mandatório</span>}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
               </div>
            </div>
         ))}
      </div>
  );

  // Flat list render for search results in DGR
  const renderDGRFlat = (items: any[]) => (
      <div className="space-y-3">
         {items.map((dgr, idx) => (
            <button 
              key={idx} 
              onClick={() => setSelectedSection(dgr)}
              className="w-full text-left bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-start hover:border-indigo-400 hover:shadow-md transition-all group active:scale-[0.99]"
            >
               <div className="shrink-0 flex flex-col items-center gap-1 min-w-[80px]">
                   <div className="bg-indigo-600 text-white px-2 py-1.5 rounded-lg font-black text-xs text-center w-full shadow-sm group-hover:bg-indigo-700 transition-colors">
                      {dgr.section}
                   </div>
                   <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wide">
                      {dgr.topic}
                   </span>
               </div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{dgr.title}</h4>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">{dgr.desc}</p>
               </div>
            </button>
         ))}
      </div>
  );

  // Grouped render for DGR Tab (No Search)
  const renderDGRGrouped = () => {
     // Agrupamento de Seções
     const groupedSections = DGR_SECTIONS_DATA.reduce((acc, item) => {
       if (!acc[item.topic]) acc[item.topic] = [];
       acc[item.topic].push(item);
       return acc;
     }, {} as Record<string, typeof DGR_SECTIONS_DATA>);

     return (
        <div className="space-y-3">
          {Object.keys(groupedSections).sort().map((topic) => {
             const isExpanded = expandedItem === topic;
             const title = SECTION_TITLES[topic] || topic;
             
             return (
               <div key={topic} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
                   <button 
                     onClick={() => toggleExpand(topic)}
                     className="w-full text-left p-4 flex items-center gap-4 bg-slate-50/50 hover:bg-slate-100 transition-colors"
                   >
                      <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-400 border border-slate-200'}`}>
                         {isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />}
                      </div>
                      <div className="flex-1">
                         <h3 className={`font-bold text-sm ${isExpanded ? 'text-indigo-900' : 'text-slate-700'}`}>{topic}</h3>
                         <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                      </div>
                      <ChevronRight size={18} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-indigo-500' : ''}`} />
                   </button>

                   {isExpanded && (
                      <div className="p-4 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2">
                         <div className="h-px bg-slate-100 mb-3 mx-2"></div>
                         {groupedSections[topic].map((dgr, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => setSelectedSection(dgr)}
                              className="w-full text-left flex gap-3 items-start p-2 rounded-xl hover:bg-slate-50 transition-colors group active:scale-[0.98]"
                            >
                               <div className="bg-white border border-slate-200 text-indigo-600 px-2 py-1 rounded-md font-mono font-bold text-[10px] shadow-sm mt-0.5 min-w-[48px] text-center group-hover:border-indigo-300 group-hover:shadow-md transition-all">
                                  {dgr.section}
                               </div>
                               <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{dgr.title}</h4>
                                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{dgr.desc}</p>
                               </div>
                            </button>
                         ))}
                      </div>
                   )}
               </div>
             );
          })}
        </div>
     );
  };

  const filterData = (data: any[], keys: string[]) => {
    if (!search.trim()) return data;

    const fuse = new Fuse(data, {
      keys: keys,
      threshold: 0.3, // Slightly tighter threshold for better relevance
      distance: 100,
      ignoreLocation: true,
      minMatchCharLength: 2,
      shouldSort: true,
    });

    return fuse.search(search).map(res => res.item);
  };

  const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
     <button
       onClick={() => { setActiveTab(id); setSearch(''); }}
       className={`
         relative flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-wide transition-all whitespace-nowrap w-full
         ${activeTab === id 
           ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
           : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
         }
       `}
     >
       <Icon size={14} className={activeTab === id ? 'text-coral-400' : 'text-slate-400'} />
       {label}
     </button>
  );

  // Configuration for all searchable sections
  const ALL_SECTIONS = [
     { id: 'SP', label: 'Disposições Especiais', icon: Scale, data: SPECIAL_PROVISIONS_DATA, keys: ['code', 'title', 'desc', 'details'], render: renderSP },
     { id: 'GLOSSARY', label: 'Glossário', icon: GraduationCap, data: BATTERY_GLOSSARY, keys: ['term', 'def', 'context'], render: renderGlossary },
     { id: 'PKG', label: 'Embalagens', icon: Box, data: PACKAGING_CODES, keys: ['code', 'type', 'desc'], render: renderPackaging },
     { id: 'IMP', label: 'Códigos IMP', icon: Tag, data: IMP_CODES, keys: ['code', 'title', 'desc'], render: renderIMP },
     { id: 'CHK', label: 'Checklist', icon: CheckSquare, data: CHECKLIST_ITEMS, keys: ['title', 'desc'], render: renderChecklist },
     { id: 'DGR', label: 'Seções DGR', icon: List, data: DGR_SECTIONS_DATA, keys: ['section', 'title', 'desc', 'topic'], render: renderDGRFlat }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 w-14 h-14 rounded-full shadow-[0_8px_25px_rgba(227,6,19,0.35)] hover:shadow-[0_12px_35px_rgba(227,6,19,0.5)] transition-all duration-300 z-50 flex items-center justify-center group ${isOpen ? 'scale-0 opacity-0 translate-y-10' : 'scale-100 opacity-100 translate-y-0 bg-coral-500 border border-coral-500'}`}
        title="Dicionário IATA"
      >
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Book size={24} className="text-white group-hover:text-coral-500 transition-colors duration-300 relative z-10" strokeWidth={2} />
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-indigo-950/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-full md:w-[600px] bg-slate-50 shadow-2xl z-50 transition-transform duration-500 cubic-bezier(0.19, 1, 0.22, 1) flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 relative shrink-0 z-10">
           <div className="p-6 pb-2">
              <div className="flex items-start justify-between mb-4">
                 <div>
                   <h2 className="text-2xl font-black text-indigo-950 tracking-tight flex items-center gap-2">
                     <Book className="text-coral-500" size={24} />
                     Wiki IATA
                   </h2>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Regras, Definições & Códigos</p>
                 </div>
                 <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-indigo-600 transition-colors"
                 >
                   <X size={24} />
                 </button>
              </div>

              {/* Search Bar - Hidden when viewing Detail */}
              {!selectedSection && (
                <div className="relative group animate-in fade-in slide-in-from-top-1">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Buscar termo, código ou regra..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-slate-100/50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    />
                </div>
              )}
           </div>
           
           {/* Navigation Tabs - Hide when searching or viewing detail */}
           {!search && !selectedSection && (
             <div className="px-6 pb-4 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-1">
                <TabButton id="SP" label="Disposições" icon={Scale} />
                <TabButton id="GLOSSARY" label="Glossário" icon={GraduationCap} />
                <TabButton id="PKG" label="Embalagens" icon={Box} />
                <TabButton id="IMP" label="Códigos IMP" icon={Tag} />
                <TabButton id="CHK" label="Checklist" icon={CheckSquare} />
                <TabButton id="DGR" label="Seções" icon={List} />
             </div>
           )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 scroll-smooth">
           
           {/* If selected section active, show detail view */}
           {selectedSection ? (
              renderDetailView(selectedSection)
           ) : (
             /* Else show list views */
             <>
               {/* GLOBAL SEARCH RESULTS VIEW */}
               {search ? (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {(() => {
                       let hasAnyResults = false;
                       return (
                         <>
                            {ALL_SECTIONS.map((section) => {
                               const results = filterData(section.data, section.keys);
                               if (results.length === 0) return null;
                               hasAnyResults = true;
                               
                               return (
                                 <div key={section.id} className="space-y-3">
                                    <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                                       <section.icon size={16} className="text-coral-500" />
                                       <h3 className="text-sm font-black text-indigo-900 uppercase tracking-wide">{section.label}</h3>
                                       <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">{results.length}</span>
                                    </div>
                                    {section.render(results)}
                                 </div>
                               );
                            })}

                            {!hasAnyResults && (
                               <div className="text-center py-12">
                                  <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                     <Search className="text-slate-400" />
                                  </div>
                                  <h3 className="text-slate-600 font-bold">Nenhum resultado encontrado</h3>
                                  <p className="text-xs text-slate-400 mt-1">Tente buscar por código (ex: A154) ou termo chave.</p>
                               </div>
                            )}
                         </>
                       );
                    })()}
                  </div>
               ) : (
                  /* TABBED VIEW (Single Category) */
                  <>
                     {activeTab === 'SP' && renderSP(SPECIAL_PROVISIONS_DATA)}
                     {activeTab === 'GLOSSARY' && renderGlossary(BATTERY_GLOSSARY)}
                     {activeTab === 'PKG' && (
                        <div className="space-y-4">
                           <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                              <Box className="text-indigo-600 shrink-0" />
                              <div>
                                 <h4 className="font-bold text-indigo-900 text-sm">Códigos de Embalagem UN</h4>
                                 <p className="text-xs text-indigo-800 mt-1">Estrutura: [Tipo][Material][Categoria]. Ex: 4G = Caixa (4) de Papelão (G).</p>
                              </div>
                           </div>
                           {renderPackaging(PACKAGING_CODES)}
                        </div>
                     )}
                     {activeTab === 'IMP' && renderIMP(IMP_CODES)}
                     {activeTab === 'CHK' && (
                        <div className="space-y-3">
                           <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-4">
                              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Pontos Críticos de Aceitação</h3>
                              {renderChecklist(CHECKLIST_ITEMS)}
                           </div>
                        </div>
                     )}
                     {activeTab === 'DGR' && renderDGRGrouped()}
                  </>
               )}
             </>
           )}

        </div>
      </div>
    </>
  );
}
