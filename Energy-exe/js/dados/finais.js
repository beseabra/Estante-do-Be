// ============================================================
//  ★ FINAIS
//  estilo: 'bsod' (tela azul) ou 'festa' (janela de parabéns)
//  Os finais que você já viu ficam guardados no navegador.
// ============================================================
F.FINAIS = {
  promocao: {
    titulo: '🤑 Final: Promoção', estilo: 'festa',
    texto: (S) => (S.cargo === 'diretor' ? 'Você virou Diretor(a). Agora a sua agenda tem reuniões de 3 horas sobre reuniões de 1 hora.' : 'Você virou Gerente.'),
    sub: 'Parabéns! Agora você participa de reuniões que poderiam ser e-mails.',
    conquista: 'Desbloqueado: Crachá dourado (abre a catraca de primeira)',
  },
  tecnico: {
    titulo: '🧠 Final: Especialista Sênior', estilo: 'festa',
    texto: () => 'Você virou Especialista Sênior. Agora todo mundo te pergunta tudo. Inclusive o que aconteceu em 2019.',
    sub: 'Você é a pessoa que diz "depende". E sempre depende.',
    conquista: 'Desbloqueado: "Isso já aconteceu em 2019" (frase oficial)',
  },
  excel: {
    titulo: '📊 Final: Caminho alternativo', estilo: 'festa',
    texto: () => 'Seu cargo oficial agora é: "Pessoa que todo mundo chama quando o Excel quebra".',
    sub: 'Seu telefone toca 40 vezes por dia. Você é indispensável e ninguém sabe o seu sobrenome.',
    conquista: 'Desbloqueado: PROCV nível divino',
  },
  aumento: {
    titulo: '💰 Final: Aumento', estilo: 'festa',
    texto: () => 'Você conseguiu um aumento. +R$ 500.',
    sub: 'E descobriu que o salário aumentou, mas a responsabilidade aumentou mais.',
    conquista: 'Desbloqueado: Holerite com um número novo',
  },
  automacao: {
    titulo: '🤖 Final: Automação', estilo: 'festa',
    texto: () => 'Você automatizou tanto trabalho que ninguém sabe mais o que você faz. Nem você.',
    sub: 'Seu novo cargo: "Especialista em Transformação Digital".',
    conquista: 'Desbloqueado: Um robô que responde "conforme alinhado" por você',
  },
  empreendedor: {
    titulo: '🚀 Final: Empreendedor(a)', estilo: 'festa',
    texto: () => 'Você percebeu que a empresa é caótica demais e abriu a sua própria empresa.',
    sub: 'Na primeira semana, você marcou uma reunião de alinhamento consigo. Durou 3 horas.',
    conquista: 'Desbloqueado: CNPJ e boletos',
  },
  sobrevivente: {
    titulo: '☕ Final: Sobrevivência', estilo: 'festa',
    texto: () => 'Você sobreviveu ao trimestre. Ninguém sabe exatamente o que você fez. Nem você.',
    sub: 'Isso, na Voltagem S.A., é uma vitória.',
    conquista: 'Desbloqueado: Caneca "Sobrevivi a mais um trimestre"',
  },
  secreto: {
    titulo: '🏆 Final secreto', estilo: 'festa',
    texto: () => 'Promoção, aumento, estresse baixo, reputação alta e amizade com todos os departamentos.',
    sub: 'Você descobriu o verdadeiro segredo da vida corporativa. Ninguém sabe como você conseguiu.',
    conquista: 'Desbloqueado: O segredo (você não pode contar para ninguém)',
  },
  demissao: {
    titulo: 'GAME OVER', estilo: 'bsod',
    texto: () => 'Agradecemos todo o seu empenho.',
    sub: 'A empresa encontrou um problema e precisou desligar você.',
    conquista: 'Você desbloqueou: CLT EXPERIENCE +100',
  },
  'modo-aviao': {
    titulo: 'MODO AVIÃO', estilo: 'bsod',
    texto: () => 'Seu estresse chegou a 100. O seu corpo pediu férias e não aceitou "vamos alinhar".',
    sub: 'Trinta dias depois, você volta. Ninguém tinha percebido que você saiu.',
    conquista: 'Você desbloqueou: Desligar e ligar de novo (em você)',
  },
};
