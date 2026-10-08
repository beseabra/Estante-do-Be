// ============================================================
//  ★ CARREIRA
//  Três trilhas a partir de Analista:
//    gestão:      Coordenador(a) → Gerente → Diretor(a)
//    técnica:     Especialista → Especialista Sênior
//    alternativa: Automatizador(a) → "Pessoa que todo mundo chama
//                 quando o Excel quebra"
//  Avaliação de desempenho no fim de cada mês (dias 10, 20 e 30).
// ============================================================
F.CARGOS = {
  estagiario:   { nome: 'Estagiário(a)', nivel: 0, salario: 1800, prox: ['junior'] },
  junior:       { nome: 'Analista Júnior', nivel: 1, salario: 4200, prox: ['analista'] },
  analista:     { nome: 'Analista', nivel: 2, salario: 6000, prox: ['coordenador', 'especialista', 'automatizador'] },
  coordenador:  { nome: 'Coordenador(a)', nivel: 3, salario: 10000, trilha: 'gestao', prox: ['gerente'],
    req: (S) => S.inf >= 30 && S.rep >= 50, reqTxt: 'influência 30 e reputação 50' },
  gerente:      { nome: 'Gerente', nivel: 4, salario: 15000, trilha: 'gestao', prox: ['diretor'] },
  diretor:      { nome: 'Diretor(a)', nivel: 5, salario: 26000, trilha: 'gestao', prox: [] },
  especialista: { nome: 'Especialista', nivel: 3, salario: 9000, trilha: 'tecnica', prox: ['especialistaSr'],
    req: (S) => S.prod >= 55, reqTxt: 'produtividade 55' },
  especialistaSr: { nome: 'Especialista Sênior', nivel: 4, salario: 13000, trilha: 'tecnica', prox: [] },
  automatizador: { nome: 'Automatizador(a)', nivel: 3, salario: 8500, trilha: 'alternativa', prox: ['excel'],
    req: (S) => S.cont.automacoes >= 3, reqTxt: '3 automações funcionando' },
  excel:        { nome: 'Pessoa que todo mundo chama quando o Excel quebra', nivel: 4, salario: 11000, trilha: 'alternativa', prox: [] },
};

F.Carreira = {
  cargo: (S) => F.CARGOS[S.cargo],
  nivel: (S) => F.CARGOS[S.cargo].nivel,
  // a nota da avaliação de desempenho
  nota(S) {
    const t = Math.min(S.cont.tarefasMes || 0, 8) * 2;
    return S.rep * 0.45 + S.prod * 0.35 + S.inf * 0.2 + t - Math.max(0, S.est - 70) * 0.6;
  },
  // nota mínima para chegar a cada nível
  corte: [0, 30, 40, 52, 62, 76],
  opcoes(S) {
    return F.CARGOS[S.cargo].prox.filter((id) => { const c = F.CARGOS[id]; return !c.req || c.req(S); });
  },
  trilha(S) {
    const c = F.CARGOS[S.cargo];
    if (c.trilha === 'tecnica') return ['junior', 'analista', 'especialista', 'especialistaSr'];
    if (c.trilha === 'alternativa') return ['junior', 'analista', 'automatizador', 'excel'];
    return ['estagiario', 'junior', 'analista', 'coordenador', 'gerente', 'diretor'];
  },
};
