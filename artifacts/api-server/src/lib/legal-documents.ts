/**
 * Legal Documents — Complete Professional Brazilian Content
 *
 * All documents comply with LGPD (Lei 13.709/2018), Marco Civil da Internet
 * (Lei 12.965/2014), CLT applicable provisions, and Brazilian consumer law.
 *
 * Version: 1.0 — Effective July 2025
 */

export interface LegalDocumentSeed {
  type: string;
  version: string;
  title: string;
  content: string;
}

const EFFECTIVE_DATE = "01 de julho de 2025";
const PLATFORM_NAME = "extraGO";
const CNPJ_PLATFORM = "XX.XXX.XXX/0001-XX"; // placeholder until registration
const JURISDICTION = "Comarca de Porto Alegre, Estado do Rio Grande do Sul";
const EMAIL_LEGAL = "juridico@extrago.com.br";
const EMAIL_DPO = "dpo@extrago.com.br";

export const LEGAL_DOCUMENTS: LegalDocumentSeed[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 1. TERMS OF USE
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "terms_of_use",
    version: "1.0",
    title: "Termos de Uso — extraGO",
    content: `# TERMOS DE USO — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}
**Última atualização:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO E ACEITAÇÃO

Bem-vindo à **${PLATFORM_NAME}** ("Plataforma", "nós", "nos" ou "nosso"), uma plataforma digital de intermediação de serviços temporários e por demanda que conecta profissionais independentes ("Freelancers" ou "Extras") a empresas e contratantes ("Empresas" ou "Contratantes").

Ao criar uma conta, acessar, utilizar ou navegar pela Plataforma, você ("Usuário") declara ter lido, compreendido e aceito integralmente estes Termos de Uso e todos os documentos a eles incorporados por referência, incluindo nossa Política de Privacidade, Política LGPD, Política de Pagamentos e Diretrizes da Comunidade.

**Caso não concorde com qualquer disposição destes Termos, não utilize a Plataforma.**

A ${PLATFORM_NAME} é operada por [Razão Social] (CNPJ: ${CNPJ_PLATFORM}), com sede em Porto Alegre, Rio Grande do Sul, Brasil.

---

## 2. DEFINIÇÕES

Para os fins destes Termos:

- **"Plataforma"**: todos os serviços, aplicativos, interfaces, APIs e funcionalidades oferecidos pela ${PLATFORM_NAME};
- **"Freelancer" / "Extra"**: pessoa física cadastrada na Plataforma que oferece serviços temporários ou por demanda;
- **"Empresa" / "Contratante"**: pessoa jurídica ou física cadastrada que contrata serviços por meio da Plataforma;
- **"Extra" (vaga)**: oportunidade de trabalho temporário publicada por uma Empresa na Plataforma;
- **"Contrato de Serviço"**: acordo firmado entre Freelancer e Empresa por meio da Plataforma;
- **"Taxa de Plataforma"**: percentual retido pela ${PLATFORM_NAME} sobre cada pagamento processado;
- **"Carteira Digital"**: conta de créditos virtuais do Usuário na Plataforma;
- **"KYC"** (Know Your Customer): processo de verificação de identidade;
- **"LGPD"**: Lei Geral de Proteção de Dados Pessoais (Lei 13.709/2018).

---

## 3. ELEGIBILIDADE E CADASTRO

### 3.1 Requisitos
Para se cadastrar, o Usuário deve:
- Ter no mínimo 18 anos de idade;
- Ser pessoa física com CPF válido (Freelancers) ou representante legal de pessoa jurídica com CNPJ válido (Empresas);
- Fornecer informações verdadeiras, precisas e completas;
- Possuir capacidade civil plena para celebrar contratos.

### 3.2 Verificação de Identidade (KYC)
A ${PLATFORM_NAME} realiza verificação obrigatória de identidade para todos os usuários antes de liberar o acesso completo à Plataforma. O processo inclui:
- Verificação de e-mail;
- Verificação de telefone;
- Envio de documentos de identidade;
- Selfie com documento;
- Comprovante de residência;
- Dados bancários (para recebimento).

A ${PLATFORM_NAME} reserva-se o direito de recusar, suspender ou encerrar contas que não passem pelo processo de verificação ou que apresentem informações inconsistentes.

### 3.3 Dados da Conta
O Usuário é responsável por manter suas informações cadastrais atualizadas e sua senha confidencial. A ${PLATFORM_NAME} não se responsabiliza por danos decorrentes do uso não autorizado da conta do Usuário.

---

## 4. SERVIÇOS DA PLATAFORMA

### 4.1 Intermediação
A ${PLATFORM_NAME} é uma plataforma de intermediação. Não somos empregador dos Freelancers, não somos agência de emprego e não garantimos volume de trabalho ou renda mínima aos Freelancers, nem garantimos disponibilidade de profissionais às Empresas.

### 4.2 Funcionalidades disponíveis após verificação
- Candidatura e aceitação de Extras;
- Publicação de Extras (Empresas);
- Pagamentos e recebimentos pela Carteira Digital;
- Chat entre Freelancers e Empresas;
- Acesso ao marketplace;
- Programa de progressão de carreira (Freelancers);
- Programa de indicações.

### 4.3 Limitações
A ${PLATFORM_NAME} pode, a seu exclusivo critério:
- Modificar, suspender ou descontinuar qualquer funcionalidade;
- Estabelecer limites de uso;
- Bloquear o acesso de Usuários que violem estes Termos.

---

## 5. OBRIGAÇÕES DOS USUÁRIOS

### 5.1 Todos os Usuários comprometem-se a:
- Fornecer informações verdadeiras e atualizadas;
- Não se fazer passar por outra pessoa ou entidade;
- Não utilizar a Plataforma para fins ilegais;
- Não tentar acessar sistemas ou dados não autorizados;
- Respeitar os outros Usuários e as Diretrizes da Comunidade;
- Não publicar conteúdo ofensivo, discriminatório ou ilegal;
- Cumprir todas as obrigações fiscais decorrentes dos serviços prestados.

### 5.2 Freelancers comprometem-se adicionalmente a:
- Prestar os serviços acordados com qualidade e pontualidade;
- Possuir habilitação legal para os serviços que oferecem;
- Comunicar antecipadamente qualquer impossibilidade de comparecer;
- Emitir documentos fiscais quando exigido pela legislação.

### 5.3 Empresas comprometem-se adicionalmente a:
- Fornecer informações verdadeiras sobre os Extras publicados;
- Pagar pelos serviços utilizando os canais da Plataforma;
- Tratar os Freelancers com respeito e dignidade;
- Cumprir as condições publicadas nos Extras.

---

## 6. PAGAMENTOS E TAXAS

As condições de pagamento, taxas de plataforma, prazos de repasse e demais aspectos financeiros são integralmente regulados pela **Política de Pagamentos**, que é parte integrante destes Termos.

---

## 7. PROPRIEDADE INTELECTUAL

### 7.1 Da Plataforma
Todo o conteúdo da ${PLATFORM_NAME} — incluindo, sem limitação, marca, logotipo, código-fonte, interfaces, algoritmos, textos, imagens e design — é protegido por direitos autorais e de propriedade intelectual. É vedada a reprodução, distribuição ou engenharia reversa sem autorização prévia e por escrito.

### 7.2 Conteúdo do Usuário
O Usuário concede à ${PLATFORM_NAME} licença não exclusiva, mundial, gratuita e transferível para utilizar, reproduzir e distribuir o conteúdo que publicar na Plataforma, exclusivamente para fins de operação e promoção dos serviços.

---

## 8. PROTEÇÃO DE DADOS

O tratamento de dados pessoais pela ${PLATFORM_NAME} é regido pela nossa **Política de Privacidade** e **Política LGPD**, em conformidade com a Lei 13.709/2018. Contate nosso DPO pelo e-mail: ${EMAIL_DPO}.

---

## 9. LIMITAÇÃO DE RESPONSABILIDADE

A ${PLATFORM_NAME} não se responsabiliza por:
- Danos decorrentes de relação direta entre Freelancers e Empresas fora da Plataforma;
- Perdas de negócio, lucros cessantes ou danos indiretos;
- Falhas de terceiros (gateways de pagamento, operadoras de telecom, etc.);
- Conteúdo publicado por Usuários;
- Disputas entre Usuários.

A responsabilidade máxima da ${PLATFORM_NAME} está limitada ao valor das taxas pagas pelo Usuário nos últimos 3 meses.

---

## 10. RESCISÃO

A ${PLATFORM_NAME} pode suspender ou encerrar a conta do Usuário, a qualquer momento e sem aviso prévio, em caso de:
- Violação destes Termos ou demais políticas;
- Atividade fraudulenta ou suspeita;
- Solicitação de autoridade competente;
- Inatividade superior a 12 meses.

O Usuário pode encerrar sua conta a qualquer momento pelo suporte. Valores já ganhos e disponíveis serão pagos conforme a Política de Pagamentos.

---

## 11. RESOLUÇÃO DE DISPUTAS

Em caso de conflito com outro Usuário, as partes devem:
1. Tentar resolver diretamente;
2. Acionar o suporte da ${PLATFORM_NAME};
3. Utilizar mediação ou conciliação conforme a Lei 13.140/2015;
4. Recorrer ao Poder Judiciário, com foro eleito na ${JURISDICTION}.

---

## 12. DISPOSIÇÕES GERAIS

- Estes Termos são regidos pela legislação brasileira;
- A invalidade de uma cláusula não invalida as demais;
- A tolerância de um descumprimento não implica renúncia de direitos;
- A ${PLATFORM_NAME} pode ceder estes Termos em caso de fusão ou aquisição;
- Notificações serão feitas pelo e-mail cadastrado pelo Usuário.

---

## 13. CONTATO

**${PLATFORM_NAME}**
E-mail jurídico: ${EMAIL_LEGAL}
CNPJ: ${CNPJ_PLATFORM}
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PRIVACY POLICY
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "privacy_policy",
    version: "1.0",
    title: "Política de Privacidade — extraGO",
    content: `# POLÍTICA DE PRIVACIDADE — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO

A **${PLATFORM_NAME}** valoriza e respeita a privacidade dos seus Usuários. Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos, compartilhamos e protegemos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei 13.709/2018), o Marco Civil da Internet (Lei 12.965/2014) e demais normas aplicáveis.

---

## 2. DEFINIÇÕES

- **Dados Pessoais**: informações relacionadas a pessoa natural identificada ou identificável;
- **Dados Sensíveis**: dados sobre origem racial, convicção religiosa, saúde, vida sexual, dado genético ou biométrico;
- **Titular**: pessoa a quem os dados pessoais se referem;
- **Controlador**: ${PLATFORM_NAME} — determina as finalidades e meios do tratamento;
- **Operador**: entidade que realiza o tratamento em nome do Controlador;
- **DPO** (Encarregado): responsável pela proteção de dados pessoais.

---

## 3. DADOS QUE COLETAMOS

### 3.1 Dados fornecidos diretamente
- Nome completo, e-mail, telefone;
- CPF ou CNPJ;
- Documentos de identidade (RG, CNH, etc.);
- Selfie com documento;
- Comprovante de residência;
- Dados bancários e chave PIX;
- Foto de perfil e informações profissionais;
- Histórico de mensagens na Plataforma.

### 3.2 Dados coletados automaticamente
- Endereço IP, data e hora de acesso;
- Tipo de dispositivo, sistema operacional e navegador;
- Páginas visitadas e ações realizadas;
- Localização geográfica aproximada (com consentimento);
- Cookies e tecnologias similares.

### 3.3 Dados de terceiros
- Referências de outros Usuários;
- Dados de verificação de antecedentes (quando aplicável);
- Dados de provedores de autenticação.

---

## 4. FINALIDADES DO TRATAMENTO

Tratamos seus dados para:

| Finalidade | Base Legal |
|------------|-----------|
| Criar e gerenciar sua conta | Execução de contrato |
| Verificar sua identidade (KYC) | Obrigação legal / Legítimo interesse |
| Processar pagamentos | Execução de contrato |
| Conectar Freelancers e Empresas | Execução de contrato |
| Prevenir fraudes e garantir segurança | Legítimo interesse |
| Cumprir obrigações regulatórias | Obrigação legal |
| Enviar comunicações sobre serviços | Execução de contrato / Legítimo interesse |
| Marketing (com consentimento) | Consentimento |
| Melhorar nossos serviços | Legítimo interesse |

---

## 5. COMPARTILHAMENTO DE DADOS

Seus dados podem ser compartilhados com:
- **Outros Usuários**: informações de perfil visíveis conforme suas configurações;
- **Parceiros de pagamento**: para processar transações financeiras;
- **Provedores de infraestrutura**: servidores em nuvem (com garantias de segurança equivalentes);
- **Autoridades competentes**: quando exigido por lei ou ordem judicial;
- **Auditores e assessores jurídicos**: sujeitos a sigilo profissional.

**Não vendemos dados pessoais.**

---

## 6. RETENÇÃO DE DADOS

Mantemos seus dados pelo período necessário para as finalidades declaradas:
- Dados de conta: enquanto a conta estiver ativa + 5 anos após encerramento;
- Dados financeiros: 5 anos (obrigação fiscal);
- Dados de KYC: 5 anos após o fim do relacionamento;
- Logs de acesso: 6 meses (Marco Civil da Internet);
- Marketing: até revogação do consentimento.

---

## 7. SEGURANÇA

Adotamos medidas técnicas e organizacionais para proteger seus dados:
- Criptografia em trânsito (TLS 1.3) e em repouso;
- Controle de acesso por função (RBAC);
- Auditoria de acessos e alterações;
- Testes regulares de segurança;
- Plano de resposta a incidentes.

Em caso de violação de dados que possa causar risco significativo, notificaremos a ANPD e os Titulares afetados no prazo de 72 horas.

---

## 8. SEUS DIREITOS (LGPD — art. 18)

Você tem direito a:
- **Confirmação** da existência de tratamento;
- **Acesso** aos seus dados;
- **Correção** de dados incompletos ou desatualizados;
- **Anonimização, bloqueio ou eliminação** de dados desnecessários;
- **Portabilidade** dos dados;
- **Eliminação** dos dados tratados com consentimento;
- **Informação** sobre compartilhamentos;
- **Revogação do consentimento** a qualquer momento;
- **Oposição** a tratamentos em desacordo com a lei.

Para exercer seus direitos: ${EMAIL_DPO}

---

## 9. COOKIES

Utilizamos cookies essenciais (necessários para o funcionamento), analíticos (com consentimento) e de preferências. Você pode gerenciar cookies nas configurações do seu navegador.

---

## 10. ENCARREGADO (DPO)

DPO da ${PLATFORM_NAME}: ${EMAIL_DPO}

---

## 11. ALTERAÇÕES

Esta Política pode ser atualizada. Notificaremos Usuários sobre alterações materiais por e-mail ou notificação na Plataforma com antecedência mínima de 15 dias.

---

## 12. CONTATO

${EMAIL_DPO} | ${EMAIL_LEGAL}
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3. LGPD POLICY
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "lgpd",
    version: "1.0",
    title: "Política LGPD — Proteção de Dados Pessoais",
    content: `# POLÍTICA LGPD — PROTEÇÃO DE DADOS PESSOAIS

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO

Este documento complementa nossa Política de Privacidade e detalha o cumprimento da **Lei Geral de Proteção de Dados Pessoais (LGPD — Lei 13.709/2018)** pela ${PLATFORM_NAME}.

---

## 2. CONTROLADOR DOS DADOS

**${PLATFORM_NAME}**
CNPJ: ${CNPJ_PLATFORM}
E-mail DPO: ${EMAIL_DPO}

---

## 3. BASES LEGAIS DO TRATAMENTO

O tratamento de dados pessoais pela ${PLATFORM_NAME} é fundamentado nas seguintes bases legais previstas no art. 7º da LGPD:

### 3.1 Execução de contrato (art. 7º, V)
- Cadastro e verificação de conta;
- Processar candidaturas e Extras;
- Realizar e receber pagamentos;
- Fornecer suporte técnico.

### 3.2 Cumprimento de obrigação legal (art. 7º, II)
- Manutenção de registros de acesso (Marco Civil, art. 15);
- Prevenção à lavagem de dinheiro (Lei 9.613/1998);
- Obrigações tributárias e contábeis;
- Atendimento a ordens judiciais ou administrativas.

### 3.3 Legítimo interesse (art. 7º, IX)
- Prevenção a fraudes e segurança da plataforma;
- Melhoria contínua dos serviços;
- Comunicações operacionais sobre conta;
- Programa de indicações.

### 3.4 Consentimento (art. 7º, I)
- Comunicações de marketing;
- Cookies analíticos e de publicidade;
- Localização geográfica precisa.

---

## 4. TRANSFERÊNCIA INTERNACIONAL

Seus dados podem ser processados por servidores localizados fora do Brasil. Garantimos que essas transferências ocorrem somente para países com nível adequado de proteção ou mediante garantias contratuais equivalentes às exigidas pela LGPD (cláusulas contratuais padrão ou certificações equivalentes).

---

## 5. DECISÕES AUTOMATIZADAS (art. 20)

Utilizamos sistemas automatizados para:
- Análise de risco de fraude;
- Detecção de comportamentos suspeitos;
- Pontuação de reputação.

Você tem o direito de solicitar revisão humana de decisões automatizadas que afetem significativamente seus interesses. Contate: ${EMAIL_DPO}

---

## 6. DADOS SENSÍVEIS

Não coletamos dados sensíveis (art. 5º, II, LGPD) de forma intencional. Em caso de envio acidental de tais dados, você deve nos notificar imediatamente pelo e-mail ${EMAIL_DPO} para exclusão.

---

## 7. RELATÓRIO DE IMPACTO (RIPD)

Mantemos Relatório de Impacto à Proteção de Dados Pessoais (RIPD) para operações de tratamento de alto risco, conforme art. 38 da LGPD. O relatório pode ser solicitado pela ANPD.

---

## 8. INCIDENTES DE SEGURANÇA

Em caso de violação de dados pessoais:
1. Identificação e contenção imediata;
2. Avaliação de impacto e riscos;
3. Notificação à ANPD em até 72 horas (quando aplicável);
4. Notificação aos Titulares afetados;
5. Medidas corretivas e preventivas.

Reporte suspeitas de incidentes: ${EMAIL_DPO}

---

## 9. REGISTRO DE OPERAÇÕES (art. 37)

Mantemos registro das operações de tratamento de dados pessoais, incluindo:
- Natureza dos dados tratados;
- Finalidade, periodicidade e duração;
- Indicação de transferências internacionais;
- Medidas de segurança adotadas.

---

## 10. EXERCÍCIO DE DIREITOS

Para exercer seus direitos (acesso, correção, eliminação, portabilidade, etc.):

**Canal oficial:** ${EMAIL_DPO}
**Prazo de resposta:** até 15 dias úteis
**Identificação:** pode ser solicitada para autenticar o pedido

Caso insatisfeito com nossa resposta, você pode peticionar à **ANPD (Autoridade Nacional de Proteção de Dados)**: www.gov.br/anpd

---

## 11. DPO — ENCARREGADO

Nosso Encarregado de Proteção de Dados (DPO) é ponto de contato para:
- Comunicações de Titulares;
- Comunicações da ANPD;
- Orientação sobre práticas de proteção de dados.

**Contato DPO:** ${EMAIL_DPO}
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4. FREELANCER AGREEMENT
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "freelancer_agreement",
    version: "1.0",
    title: "Contrato de Profissional Independente — extraGO",
    content: `# CONTRATO DE PROFISSIONAL INDEPENDENTE

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. PARTES

- **${PLATFORM_NAME}** (CNPJ: ${CNPJ_PLATFORM}) — doravante "Plataforma";
- **Profissional Independente** — pessoa física cadastrada como Freelancer/Extra, doravante "Profissional".

---

## 2. OBJETO

Este Contrato regula a relação entre o Profissional e a Plataforma, descrevendo os direitos e obrigações decorrentes do uso dos serviços de intermediação de trabalho temporário oferecidos pela ${PLATFORM_NAME}.

---

## 3. NATUREZA DA RELAÇÃO

### 3.1 Ausência de vínculo empregatício
A relação entre o Profissional e a ${PLATFORM_NAME} é de **prestação de serviços autônoma**. Não existe, em hipótese alguma, relação de emprego, subordinação, pessoalidade obrigatória ou não eventualidade entre as partes.

### 3.2 Profissional autônomo
O Profissional:
- Gerencia sua própria agenda e disponibilidade;
- Pode recusar Extras sem justificativa;
- Pode trabalhar para outras plataformas ou clientes;
- É responsável pelo recolhimento de seus tributos (ISS, INSS autônomo, Imposto de Renda, etc.);
- Não tem direito a férias, 13º salário, FGTS ou quaisquer benefícios trabalhistas por parte da Plataforma.

### 3.3 Relação com Empresas
Os contratos de prestação de serviço são firmados diretamente entre o Profissional e a Empresa, sendo a ${PLATFORM_NAME} mera intermediadora.

---

## 4. CADASTRO E VERIFICAÇÃO

O Profissional deve:
- Fornecer dados verdadeiros e documentos válidos;
- Passar pelo processo de verificação KYC;
- Manter seus dados cadastrais atualizados;
- Notificar a Plataforma sobre qualquer alteração relevante.

---

## 5. PRESTAÇÃO DE SERVIÇOS

### 5.1 Candidatura a Extras
O Profissional pode candidatar-se a Extras disponíveis na Plataforma. A aceitação da candidatura pela Empresa gera um Contrato de Serviço vinculante.

### 5.2 Obrigações do Profissional
- Comparecer no local e horário acordados;
- Possuir os equipamentos, ferramentas e habilitações necessários;
- Prestar serviços com qualidade, diligência e boa-fé;
- Comunicar antecipadamente eventuais impedimentos;
- Agir em conformidade com as Diretrizes da Comunidade.

### 5.3 Cancelamentos
O cancelamento após aceitação pode resultar em:
- Penalização na pontuação de reputação;
- Restrição temporária de candidaturas;
- Suspensão da conta em casos recorrentes.

---

## 6. REMUNERAÇÃO E PAGAMENTOS

### 6.1 Valores
Os valores são definidos pela Empresa em cada Extra. O Profissional concorda com o valor antes de confirmar participação.

### 6.2 Taxa de Plataforma
A ${PLATFORM_NAME} retém uma taxa sobre o valor bruto de cada serviço. A taxa varia conforme o nível de progressão do Profissional:
- Bronze: 20%
- Prata: 18%
- Ouro: 15%
- Elite: 12%
- Diamante: 10%

### 6.3 Repasse
O valor líquido é creditado na Carteira Digital do Profissional após a conclusão e confirmação do serviço, conforme a Política de Pagamentos.

### 6.4 Saque
O Profissional pode solicitar saque para sua conta bancária ou via PIX, sujeito a prazos e limites definidos na Política de Pagamentos.

---

## 7. PROGRAMA DE PROGRESSÃO

O Profissional participa do programa de progressão de carreira da Plataforma, que prevê avanço de nível conforme desempenho, volume de serviços e reputação. Maiores detalhes estão disponíveis na área "Minha Carreira" na Plataforma.

---

## 8. PROGRAMA DE INDICAÇÕES

O Profissional pode participar do programa de indicações e receber comissões sobre serviços realizados por indicados, conforme regras disponíveis na Plataforma.

---

## 9. OBRIGAÇÕES FISCAIS E PREVIDENCIÁRIAS

O Profissional é exclusivamente responsável por:
- Recolhimento do INSS na modalidade autônomo (ou MEI/empresa, conforme o caso);
- Declaração e pagamento do Imposto de Renda;
- Emissão de Nota Fiscal quando exigida pela legislação ou pela Empresa;
- Recolhimento do ISS quando aplicável.

A ${PLATFORM_NAME} fornecerá extrato de recebimentos para fins de declaração fiscal quando solicitado.

---

## 10. CONFIDENCIALIDADE

O Profissional compromete-se a:
- Não divulgar informações confidenciais das Empresas obtidas durante a prestação de serviços;
- Não utilizar dados de clientes ou usuários da Plataforma fora do contexto dos serviços contratados;
- Manter sigilo sobre informações internas da Plataforma.

---

## 11. RESPONSABILIDADE

O Profissional é responsável por:
- Danos causados às Empresas durante a prestação de serviços;
- Erros, omissões ou negligências na execução dos serviços;
- Acidente de trabalho sofrido durante a prestação de serviços (recomendamos contratação de seguro).

A ${PLATFORM_NAME} não se responsabiliza por danos sofridos ou causados pelo Profissional durante a prestação de serviços.

---

## 12. SUSPENSÃO E ENCERRAMENTO

A conta do Profissional pode ser suspensa ou encerrada por:
- Violação destes Termos ou das políticas da Plataforma;
- Má conduta reportada por Empresas;
- Fraude ou tentativa de fraude;
- Solicitação do próprio Profissional.

Em caso de encerramento, valores disponíveis na Carteira Digital serão pagos conforme a Política de Pagamentos.

---

## 13. FORO

Foro eleito: ${JURISDICTION}.

---

## 14. VIGÊNCIA

Este Contrato vigora a partir do aceite pelo Profissional e permanece válido enquanto a conta estiver ativa.
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5. COMPANY AGREEMENT
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "company_agreement",
    version: "1.0",
    title: "Contrato de Empresa Parceira — extraGO",
    content: `# CONTRATO DE EMPRESA PARCEIRA

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. PARTES

- **${PLATFORM_NAME}** (CNPJ: ${CNPJ_PLATFORM}) — doravante "Plataforma";
- **Empresa Parceira** — pessoa jurídica cadastrada como Empresa/Contratante, doravante "Empresa".

---

## 2. OBJETO

Este Contrato regula o uso da Plataforma ${PLATFORM_NAME} pela Empresa para publicação de oportunidades de trabalho temporário e contratação de Profissionais Independentes.

---

## 3. ELEGIBILIDADE

Para cadastrar-se como Empresa, o representante deve:
- Ser representante legal da pessoa jurídica;
- Possuir poderes para contratar em nome da empresa;
- Fornecer CNPJ válido e documentação societária;
- Passar pelo processo de verificação KYC empresarial.

---

## 4. PUBLICAÇÃO DE EXTRAS

### 4.1 Informações obrigatórias
Cada Extra publicado deve conter:
- Descrição clara das atividades;
- Data, horário e local de realização;
- Remuneração oferecida (valor bruto);
- Número de profissionais necessários;
- Requisitos e qualificações necessárias.

### 4.2 Proibições
É vedado publicar Extras que:
- Exijam atividades ilegais;
- Discriminem candidatos por origem, raça, gênero, religião, etc.;
- Não correspondam à realidade;
- Tentem desviar o relacionamento para fora da Plataforma.

### 4.3 Moderação
A ${PLATFORM_NAME} reserva-se o direito de remover, editar ou rejeitar Extras que violem estas regras.

---

## 5. SELEÇÃO E CONTRATAÇÃO

A Empresa é responsável por:
- Selecionar os Profissionais adequados para cada Extra;
- Verificar as qualificações e documentos dos Profissionais quando necessário;
- Confirmar a chegada e a realização do serviço;
- Avaliar o Profissional após o serviço.

---

## 6. PAGAMENTOS

### 6.1 Carteira Digital
Os pagamentos aos Profissionais são realizados exclusivamente pela Carteira Digital da Plataforma. A Empresa deve manter saldo suficiente para cobrir os serviços contratados.

### 6.2 Depósito
A Empresa realiza depósitos na sua Carteira Digital via PIX ou transferência bancária, conforme procedimentos definidos na Política de Pagamentos.

### 6.3 Taxa de Plataforma
O valor total pago ao Profissional inclui a taxa de plataforma, que é calculada sobre o valor bruto do serviço conforme o nível do Profissional.

### 6.4 Cancelamentos
Em caso de cancelamento de Extra pela Empresa após aceitação de Profissionais, podem incidir taxas de cancelamento conforme a Política de Cancelamento.

---

## 7. OBRIGAÇÕES DA EMPRESA

- Tratar os Profissionais com respeito e dignidade;
- Fornecer condições de trabalho adequadas e seguras;
- Cumprir a legislação trabalhista aplicável à relação com autônomos;
- Confirmar a conclusão dos serviços de forma honesta;
- Avaliar os Profissionais de forma justa;
- Não tentar contratar Profissionais fora da Plataforma durante 12 meses após o primeiro contato pela Plataforma.

---

## 8. RESPONSABILIDADES DA EMPRESA

A Empresa é responsável por:
- Danos causados aos Profissionais em suas instalações;
- Cumprimento das normas de segurança e saúde ocupacional;
- Impostos de sua responsabilidade (como ISS, quando for tomadora de serviços);
- Informações incorretas publicadas nos Extras.

---

## 9. CONFIDENCIALIDADE

A Empresa compromete-se a não divulgar dados pessoais dos Profissionais obtidos pela Plataforma para fins distintos da execução dos serviços contratados.

---

## 10. RESOLUÇÃO DE DISPUTAS

Disputas com Profissionais devem ser encaminhadas ao suporte da ${PLATFORM_NAME} antes de qualquer medida extrajudicial ou judicial.

---

## 11. SUSPENSÃO E ENCERRAMENTO

A conta da Empresa pode ser suspensa por:
- Publicação de Extras fraudulentos ou enganosos;
- Não pagamento de serviços utilizados;
- Mau tratamento de Profissionais;
- Violação das políticas da Plataforma.

---

## 12. FORO

Foro eleito: ${JURISDICTION}.
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6. PAYMENT POLICY
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "payment_policy",
    version: "1.0",
    title: "Política de Pagamentos — extraGO",
    content: `# POLÍTICA DE PAGAMENTOS — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO

Esta Política descreve todos os aspectos financeiros da Plataforma ${PLATFORM_NAME}, incluindo taxas, prazos, métodos de pagamento, repasses e saques.

---

## 2. CARTEIRA DIGITAL

Todos os usuários possuem uma Carteira Digital na ${PLATFORM_NAME}. Empresas depositam fundos para pagar Profissionais. Profissionais recebem valores na Carteira e podem sacar para suas contas bancárias.

---

## 3. DEPÓSITOS (EMPRESAS)

### 3.1 Métodos aceitos
- **PIX**: crédito imediato após confirmação pela equipe financeira;
- **TED/DOC**: prazo de até 1 dia útil para confirmação.

### 3.2 Procedimento
1. A Empresa solicita o depósito na Plataforma;
2. Realiza a transferência para a conta bancária da ${PLATFORM_NAME};
3. A equipe financeira confirma o recebimento;
4. O saldo é creditado na Carteira Digital.

### 3.3 Depósito mínimo
O depósito mínimo é de R$ 100,00 (cem reais).

---

## 4. TAXAS DE PLATAFORMA

A ${PLATFORM_NAME} retém uma taxa sobre o valor bruto de cada serviço concluído:

| Nível do Profissional | Taxa |
|-----------------------|------|
| Bronze                | 20%  |
| Prata                 | 18%  |
| Ouro                  | 15%  |
| Elite                 | 12%  |
| Diamante              | 10%  |

A taxa é descontada do valor pago pela Empresa antes do repasse ao Profissional.

---

## 5. REPASSE AOS PROFISSIONAIS

### 5.1 Prazo
O valor líquido é creditado na Carteira do Profissional em até **2 dias úteis** após a confirmação da conclusão do serviço pela Empresa.

### 5.2 Contestação
Em caso de contestação pela Empresa, o repasse fica suspenso até resolução da disputa (prazo máximo de 5 dias úteis para análise).

---

## 6. SAQUES (PROFISSIONAIS)

### 6.1 Métodos disponíveis
- **PIX**: processamento em até 24 horas úteis;
- **TED**: processamento em até 2 dias úteis.

### 6.2 Limites
- Saque mínimo: R$ 50,00 (cinquenta reais);
- Saque máximo diário: R$ 10.000,00 (dez mil reais);
- Saques acima de R$ 5.000,00 podem exigir confirmação adicional.

### 6.3 Período de carência
Para novas contas, pode haver período de carência de até 7 dias úteis para o primeiro saque.

---

## 7. RETENÇÃO EM GARANTIA (ESCROW)

Para serviços de alto valor (acima de R$ 1.000,00), os fundos ficam retidos em conta de garantia até a confirmação do serviço. Em caso de disputa não resolvida em 10 dias, a ${PLATFORM_NAME} pode arbitrar a liberação.

---

## 8. COMISSÃO DE INDICAÇÃO

Profissionais participantes do programa de indicações recebem:
- **Nível 1 (Bronze)**: 2% dos serviços realizados por indicados diretos;
- **Nível 2 (Prata/Ouro)**: 3% dos serviços realizados por indicados diretos;
- **Nível 3 (Elite/Diamante)**: 5% dos serviços realizados por indicados diretos.

As comissões são creditadas automaticamente na Carteira Digital.

---

## 9. REEMBOLSOS

### 9.1 Para Empresas
Reembolso de saldo não utilizado pode ser solicitado mediante:
- Solicitação formal ao suporte;
- Inexistência de disputas pendentes;
- Taxa de processamento de 2% sobre o valor solicitado.
- Prazo de processamento: até 10 dias úteis.

### 9.2 Para Profissionais
Valores creditados indevidamente serão estornados da Carteira Digital, notificando-se o Profissional com antecedência.

---

## 10. TRIBUTOS

Cada parte é responsável pelos tributos de sua competência. A ${PLATFORM_NAME} fornecerá informes de rendimentos conforme legislação aplicável.

---

## 11. MOEDA E PRECISÃO

Todos os valores são em Reais (BRL). Centavos são arredondados para baixo nos cálculos de repasse.

---

## 12. ALTERAÇÕES

A ${PLATFORM_NAME} pode alterar taxas e condições com aviso prévio de 15 dias. Serviços em andamento são regidos pelas taxas vigentes na data de início.
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CANCELLATION POLICY
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "cancellation_policy",
    version: "1.0",
    title: "Política de Cancelamento — extraGO",
    content: `# POLÍTICA DE CANCELAMENTO — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO

Esta Política estabelece as regras para cancelamento de Extras, candidaturas e contratos de serviço na ${PLATFORM_NAME}.

---

## 2. CANCELAMENTO PELO PROFISSIONAL

### 2.1 Antes da confirmação
O Profissional pode retirar sua candidatura a qualquer momento antes da confirmação pela Empresa, sem penalidade.

### 2.2 Após confirmação — com antecedência mínima de 24 horas
- Sem penalidade financeira;
- Redução de 5 pontos na pontuação de reputação;
- Notificação automática à Empresa.

### 2.3 Após confirmação — menos de 24 horas antes do serviço
- Redução de 15 pontos na pontuação de reputação;
- Restrição temporária de candidaturas por 48 horas;
- Notificação à Empresa.

### 2.4 No-show (não comparecimento sem aviso)
- Redução de 30 pontos na pontuação de reputação;
- Bloqueio temporário de candidaturas por 7 dias;
- Possível suspensão da conta em casos recorrentes (3 ou mais no-shows em 90 dias).

---

## 3. CANCELAMENTO PELA EMPRESA

### 3.1 Antes de qualquer candidatura aceita
Sem penalidade.

### 3.2 Após aceitação de candidaturas — mais de 48 horas antes
- Notificação aos Profissionais confirmados;
- Taxa de cancelamento de 5% do valor do Extra.

### 3.3 Após aceitação de candidaturas — menos de 48 horas antes
- Notificação imediata aos Profissionais;
- Taxa de cancelamento de 15% do valor do Extra;
- Avaliação negativa potencial no perfil da Empresa.

### 3.4 No-show da Empresa (local inadequado, não abertura, etc.)
- Taxa de cancelamento de 25% do valor do Extra;
- Avaliação da situação pelo suporte da ${PLATFORM_NAME};
- Possível suspensão de publicação de novos Extras.

---

## 4. DISPUTAS DE CANCELAMENTO

Em caso de discordância sobre as circunstâncias do cancelamento:
1. Qualquer parte aciona o suporte da ${PLATFORM_NAME} em até 48 horas;
2. A ${PLATFORM_NAME} analisa evidências (mensagens, logs de presença, etc.);
3. Decisão comunicada em até 5 dias úteis;
4. Decisão da ${PLATFORM_NAME} é vinculante para ambas as partes.

---

## 5. FORÇA MAIOR

Cancelamentos por força maior (catástrofes naturais, pandemias, greves, etc.) são analisados caso a caso pelo suporte, podendo resultar em isenção de penalidades.

---

## 6. DEVOLUÇÕES FINANCEIRAS

Em caso de cancelamento pela Empresa que gere devolução:
- O saldo é devolvido à Carteira Digital da Empresa (já descontadas as taxas de cancelamento aplicáveis);
- Saques do saldo devolvido seguem a Política de Pagamentos normal.

---

## 7. REINCIDÊNCIA

Usuários com padrão de cancelamentos frequentes podem ter suas contas suspensas ou encerradas, a critério da ${PLATFORM_NAME}.
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 8. COMMUNITY GUIDELINES
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "community_guidelines",
    version: "1.0",
    title: "Diretrizes da Comunidade — extraGO",
    content: `# DIRETRIZES DA COMUNIDADE — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. NOSSA MISSÃO

A ${PLATFORM_NAME} existe para conectar profissionais e empresas de forma justa, segura e transparente. Para isso, precisamos de uma comunidade baseada em respeito, honestidade e profissionalismo.

---

## 2. PRINCÍPIOS FUNDAMENTAIS

### 2.1 Respeito
Trate todos os membros da comunidade com dignidade e respeito, independentemente de origem, etnia, gênero, orientação sexual, religião, faixa etária, deficiência ou qualquer outra característica pessoal.

### 2.2 Honestidade
Forneça informações verdadeiras sobre si mesmo, suas habilidades e seus serviços. Não faça promessas que não pode cumprir.

### 2.3 Profissionalismo
Mantenha um padrão profissional nas suas interações, comunicações e na execução dos serviços.

### 2.4 Segurança
Priorize a segurança de todas as partes envolvidas em cada serviço.

---

## 3. CONDUTAS PROIBIDAS

### 3.1 Discriminação e Assédio
É terminantemente proibido:
- Discriminar usuários por qualquer característica pessoal;
- Assédio moral, sexual ou de qualquer natureza;
- Linguagem ofensiva, ameaças ou intimidação;
- Bullying ou perseguição.

### 3.2 Fraude e Desonestidade
- Fornecer documentos falsos ou adulterados;
- Criar perfis falsos ou múltiplos perfis;
- Manipular avaliações (próprias ou de terceiros);
- Realizar serviços sem a intenção de pagamento;
- Cobrar por serviços não realizados;
- Acordos fora da plataforma para fugir das taxas.

### 3.3 Atividades Ilegais
- Publicar ou aceitar Extras que envolvam atividades ilegais;
- Lavagem de dinheiro ou uso da Plataforma para fins ilícitos;
- Violação de direitos autorais ou propriedade intelectual.

### 3.4 Conteúdo Inadequado
- Conteúdo pornográfico ou sexualmente explícito;
- Conteúdo que promova violência;
- Spam, correntes ou comunicações em massa não solicitadas.

---

## 4. AVALIAÇÕES E REPUTAÇÃO

As avaliações devem ser:
- **Honestas**: baseadas na experiência real;
- **Construtivas**: focadas em ajudar a melhorar;
- **Respeitosas**: sem linguagem ofensiva ou difamatória.

É proibido manipular o sistema de avaliações, seja coagindo outros Usuários, comprando avaliações ou criando avaliações falsas.

---

## 5. COMUNICAÇÃO NA PLATAFORMA

O chat da ${PLATFORM_NAME} é exclusivo para assuntos relacionados à prestação de serviços. É proibido:
- Solicitar ou fornecer dados de contato pessoal antes da confirmação do serviço;
- Realizar negociações para pagamentos fora da Plataforma;
- Enviar conteúdo publicitário não solicitado;
- Compartilhar links maliciosos.

---

## 6. SEGURANÇA DURANTE OS SERVIÇOS

Profissionais e Empresas devem:
- Respeitar as normas de segurança do local de trabalho;
- Reportar situações de risco ao suporte da ${PLATFORM_NAME};
- Não realizar serviços em condições que coloquem sua integridade em risco.

---

## 7. DENÚNCIAS

Todos os Usuários têm o dever de reportar violações dessas Diretrizes. Denúncias podem ser feitas pelo suporte da Plataforma. Garantimos confidencialidade ao denunciante.

---

## 8. CONSEQUÊNCIAS

Violações dessas Diretrizes podem resultar em:
- Aviso formal;
- Remoção de conteúdo;
- Restrição de funcionalidades;
- Suspensão temporária da conta;
- Encerramento permanente da conta;
- Comunicação às autoridades competentes em casos graves.

---

## 9. APELAÇÃO

Usuários podem contestar decisões da ${PLATFORM_NAME} pelo suporte. As apelações são analisadas por nossa equipe de compliance em até 10 dias úteis.
`,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 9. ANTI-FRAUD POLICY
  // ─────────────────────────────────────────────────────────────────────────
  {
    type: "anti_fraud_policy",
    version: "1.0",
    title: "Política Antifraude — extraGO",
    content: `# POLÍTICA ANTIFRAUDE — extraGO

**Versão:** 1.0
**Data de vigência:** ${EFFECTIVE_DATE}

---

## 1. INTRODUÇÃO

A ${PLATFORM_NAME} adota uma postura de tolerância zero contra fraudes. Esta Política descreve nossas práticas de prevenção, detecção e resposta a atividades fraudulentas na Plataforma.

---

## 2. DEFINIÇÃO DE FRAUDE

Para os fins desta Política, fraude inclui qualquer ato intencional que vise:
- Obter vantagem financeira indevida;
- Prejudicar outros usuários da Plataforma;
- Burlar os sistemas de segurança, verificação ou pagamento;
- Fornecer informações falsas;
- Manipular processos da Plataforma.

---

## 3. MEDIDAS DE PREVENÇÃO

### 3.1 Verificação de Identidade (KYC)
Todos os usuários passam por verificação obrigatória de identidade, incluindo:
- Validação de CPF/CNPJ em base de dados oficiais;
- Verificação de documentos por sistemas automatizados e revisão manual;
- Análise de selfie com documento;
- Verificação de e-mail e telefone.

### 3.2 Monitoramento Contínuo
A ${PLATFORM_NAME} monitora continuamente:
- Padrões de comportamento anormais;
- Transações suspeitas (valores incomuns, frequência elevada, etc.);
- Múltiplos cadastros com os mesmos dados;
- Acesso de localizações geográficas inconsistentes;
- Tentativas de login mal-sucedidas.

### 3.3 Análise de Risco
Cada transação passa por análise de risco automatizada. Transações de alto risco podem ser retidas para revisão manual.

### 3.4 Listas de Restrição
Mantemos listas internas de documentos, dispositivos e endereços IP associados a atividades fraudulentas.

---

## 4. TIPOS DE FRAUDE IDENTIFICADOS

### 4.1 Fraude de Identidade
- Uso de documentos falsos ou de terceiros;
- Criação de múltiplas contas;
- Falsificação de informações cadastrais.

### 4.2 Fraude Financeira
- Uso de dados bancários de terceiros;
- Solicitação de saque após cancelamento fraudulento;
- Manipulação de transações para lavagem de dinheiro.

### 4.3 Fraude Operacional
- Confirmação de serviços não realizados;
- Acordos fora da plataforma para evitar taxas;
- Manipulação do sistema de avaliações;
- Abuso do programa de indicações.

### 4.4 Fraude por Phishing
- Criação de páginas falsas similares à ${PLATFORM_NAME};
- Tentativas de obter credenciais de outros usuários.

---

## 5. DETECÇÃO E INVESTIGAÇÃO

Ao detectar atividade suspeita, a ${PLATFORM_NAME}:
1. **Suspende preventivamente** a ação ou conta suspeita;
2. **Coleta evidências** (logs, transações, comunicações);
3. **Notifica o usuário** (salvo quando a notificação comprometeria a investigação);
4. **Analisa o caso** em até 5 dias úteis;
5. **Aplica as medidas** cabíveis.

---

## 6. CONSEQUÊNCIAS

Usuários que praticarem fraude estão sujeitos a:
- Encerramento imediato e permanente da conta;
- Bloqueio de todos os valores pendentes;
- Comunicação às autoridades policiais e Ministério Público;
- Ação civil para ressarcimento de danos;
- Inclusão em listas de restrição internas e do setor.

---

## 7. LAVAGEM DE DINHEIRO

A ${PLATFORM_NAME} adota as seguintes medidas de prevenção à lavagem de dinheiro (Lei 9.613/1998):
- Identificação e verificação de todos os usuários;
- Monitoramento de transações incomuns;
- Comunicação ao COAF quando exigido;
- Treinamento da equipe interna.

---

## 8. CANAIS DE DENÚNCIA

Para reportar atividades suspeitas:
- **E-mail:** ${EMAIL_LEGAL} (confidencial e seguro)
- **Suporte na Plataforma:** disponível 24/7

A identidade do denunciante é protegida. Denúncias de boa-fé não resultarão em penalidades.

---

## 9. COOPERAÇÃO COM AUTORIDADES

A ${PLATFORM_NAME} coopera integralmente com:
- Autoridades policiais (Polícia Civil, Federal);
- Ministério Público;
- Banco Central do Brasil;
- COAF (Conselho de Controle de Atividades Financeiras);
- ANPD;
- Outros órgãos reguladores.

---

## 10. RESPONSABILIDADE DO USUÁRIO

O usuário que tomar conhecimento de atividade fraudulenta e não reportar assume responsabilidade solidária pelos danos causados.

---

## 11. ATUALIZAÇÃO

Esta Política é revisada semestralmente e sempre que novas ameaças forem identificadas.
`,
  },
];
