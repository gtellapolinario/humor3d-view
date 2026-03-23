import { MoodCategory, MoodNode, MoodNodeId, MoodPanelContentMap, TimePoint } from './types';

// 3D Coordinate System Mapping:
// X: Valence (Negative Left -> Positive Right)
// Y: Energy/Arousal (Low Bottom -> High Top)
// Z: Stability/Control (Chaotic Front -> Stable Back)

export const DEFAULT_MOOD_ID: MoodNodeId = 'euthymia';

export const MOOD_NODES: MoodNode[] = [
	{
		id: 'euthymia',
		label: 'Eutimia (Normalidade)',
		description: 'O ponto zero. Equilíbrio entre energia e emoção, com reatividade apropriada aos eventos e estabilidade.',
		category: MoodCategory.Euthymic,
		position: { x: 0, y: 0, z: 0 },
	  color: '#007222',
		clinicalRisk: 5,
		neuroplasticity: 95,
	},
	{
		id: 'cyclothymia',
		label: 'Ciclotimia',
		description: 'Instabilidade persistente do humor envolvendo numerosos períodos de sintomas hipomaníacos e depressivos leves. Flutuação crônica que não atinge critérios para Episódio Maior, mas causa sofrimento.',
		category: MoodCategory.Mixed,
		position: { x: 0.8, y: 0.5, z: -1.8 },
		color: '#FFBF77',
		clinicalRisk: 25,
		neuroplasticity: 60,
	},
	{
		id: 'major-depression',
		label: 'Depressão Maior',
		description: 'Estado caracterizado por humor deprimido profundo, anedonia (perda de prazer) e energia extremamente baixa. Isolamento e desesperança são comuns.',
		category: MoodCategory.Depressive,
		position: { x: -3.5, y: -3.0, z: 0.5 },
		color: '#144BFF',
		clinicalRisk: 85,
		neuroplasticity: 30,
	},
	{
		id: 'dysthymia',
		label: 'Distimia',
		description: 'Depressão crônica de leve a moderada intensidade. Persistente, mas com funcionalidade preservada, embora reduzida.',
		category: MoodCategory.Depressive,
		position: { x: -1.5, y: -1.2, z: 1.0 },
		color: '#00027C',
		clinicalRisk: 40,
		neuroplasticity: 50,
	},
	{
		id: 'hypomania',
		label: 'Hipomania',
		description: 'Elevação do humor e energia. Produtividade aumentada, otimismo, sem sintomas psicóticos. Muitas vezes percebido como agradável pelo paciente.',
		category: MoodCategory.Manic,
		position: { x: 2.0, y: 2.0, z: 1.0 },
		color: '#f59e0b',
		clinicalRisk: 35,
		neuroplasticity: 70,
	},
	{
		id: 'mania',
		label: 'Mania Franca',
		description: 'Elevação extrema do humor, grandiosidade, aceleração do pensamento, impulsividade e risco. Pode incluir sintomas psicóticos.',
		category: MoodCategory.Manic,
		position: { x: 4.0, y: 4.5, z: -2.5 },
		color: '#ef4444',
		clinicalRisk: 90,
		neuroplasticity: 25,
	},
	{
		id: 'mixed-state',
		label: 'Estado Misto',
		description: 'Coexistência de sintomas maníacos (energia, aceleração) e depressivos (disforia, desespero). Altíssimo risco de suicídio devido à energia para agir combinada com sofrimento.',
		category: MoodCategory.Mixed,
		position: { x: -2.5, y: 3.5, z: -3.0 },
		color: '#7235FF',
		clinicalRisk: 98,
		neuroplasticity: 15,
	},
	{
		id: 'agitated-depression',
		label: 'Depressão Agitada',
		description: 'Humor depressivo acompanhado de inquietação psicomotora severa, angústia e irritabilidade.',
		category: MoodCategory.Mixed,
		position: { x: -3.0, y: 1.5, z: -1.5 },
		color: '#EC9511',
		clinicalRisk: 92,
		neuroplasticity: 20,
	},
	{
		id: 'catatonia',
		label: 'Catatonia',
		description: 'Imobilidade motora ou atividade motora excessiva sem propósito, negativismo extremo. Pode ocorrer na depressão ou mania.',
		category: MoodCategory.Mixed,
		position: { x: -0.5, y: -3.5, z: -2.0 },
		color: 'rgb(185 87 42)',
		clinicalRisk: 88,
		neuroplasticity: 10,
	},
];

export const MOOD_PANEL_CONTENT: MoodPanelContentMap = {
	euthymia: {
		elevation: 0.51, // Amanhecer claro / Manhã agradável. O sol já saiu da água, refletindo clareza e estabilidade.
		insight:
			'Na eutimia, o sistema afetivo ocupa o ponto de melhor regulação relativa: humor, energia e estabilidade se articulam sem excesso nem colapso. Não se trata de ausência de sofrimento, mas de elasticidade psíquica suficiente para metabolizar perdas, frustrações e excitações sem ruptura importante da continuidade do eu. No modelo PAD, é a região de referência clínica a partir da qual os demais estados podem ser comparados.',
	},
	cyclothymia: {
		elevation: 0.5, // Exatamente na linha do horizonte. A dualidade perfeita: não se sabe se o sol está nascendo ou se pondo (oscilação).
		insight:
			'Na ciclotimia, o núcleo clínico não é a intensidade máxima dos episódios, mas a cronicidade da oscilação. O sujeito permanece em trânsito: nunca cai inteiramente no episódio depressivo maior, nem ascende de modo franco à mania, mas vive num regime de instabilidade persistente. Isso costuma produzir desgaste relacional, sensação de imprevisibilidade e dificuldades na construção de continuidade subjetiva.',
	},
	'major-depression': {
		elevation: 0.15, // Noite profunda. Pouquíssima luz, refletindo o rebaixamento vital e a desesperança.
		insight:
			'Na depressão maior, há rebaixamento marcado da valência afetiva e da energia vital. O mundo perde investimento, o tempo torna-se pesado, o futuro se fecha e o desejo retrai. Clinicamente, importam anedonia, lentificação, culpa, desesperança e risco suicida. No espaço dimensional, é um estado de forte deslocamento para o polo negativo do humor, associado a importante colapso da ativação.',
	},
	dysthymia: {
		elevation: 0.35, // Crepúsculo / Fim de tarde nublado. O sol já sumiu, há uma luz fraca e crônica, mas o paciente ainda funciona.
		insight:
			'Na distimia, o sofrimento é menos explosivo do que na depressão maior, mas mais tenaz. O problema aqui é a duração: o humor baixo se torna paisagem. O sujeito continua funcionando, porém com redução crônica do tônus existencial, da espontaneidade e da capacidade de prazer. É um quadro de erosão lenta, frequentemente subestimado justamente por não produzir ruptura dramática imediata.',
	},
	hypomania: {
		elevation: 0.75, // Dia ensolarado e brilhante. Muita energia, clareza e produtividade, mas ainda suportável aos olhos.
		insight:
			'Na hipomania, observa-se aumento do humor, da energia e da iniciativa, geralmente sem perda completa do juízo de realidade. O sujeito pode se perceber mais produtivo, criativo e confiante. O ponto clínico delicado é que o estado pode ser vivido como vantajoso, o que reduz crítica e adesão ao tratamento. Trata-se de elevação real do sistema afetivo, mas ainda aquém da desorganização maníaca franca.',
	},
	mania: {
		elevation: 0.95, // Sol a pino (meio-dia). Uma luz ofuscante, excesso de energia que chega a "queimar" e desorganizar o ambiente.
		insight:
			'Na mania franca, o sujeito vive expansão indômita do eu, aceleração ideativa, redução da necessidade de sono, grandiosidade e impulsividade crescente. Fenomenologicamente, há um empuxo à ação e ao gozo que atropela limites, cálculo e prudência. O risco clínico é amplo: ruína social, financeira, sexual, física e, em alguns casos, psicose. No mapa dimensional, é o extremo de alta valência aparente e ativação massiva, com instabilidade relevante.',
	},
	'mixed-state': {
		elevation: 0.65, // Final de tarde com luz forte, mas "torta". Sol no céu (muita energia), mas começando a escurecer o humor.
		insight:
			'O estado misto é um dos arranjos mais perigosos em psiquiatria: sofrimento depressivo intenso coexistindo com energia suficiente para agir. Em vez do rebaixamento motor que às vezes contém o ato na depressão grave, aqui há aceleração, irritabilidade e tensão interna. É uma configuração de alta combustibilidade clínica, na qual a combinação entre desespero e ativação aumenta de modo expressivo o risco de autoagressão.',
	},
	'agitated-depression': {
		elevation: 0.25, // Noite escura, mas com uma fresta de luz (agitação/angústia rasgando a escuridão da depressão).
		insight:
			'Na depressão agitada, o sofrimento depressivo não aparece como pura lentificação, mas como tormenta psicomotora. O paciente não apenas sofre: ele sofre em movimento, em angústia, em inquietação, em atrito consigo mesmo. Essa forma clínica corrige a caricatura de que toda depressão grave é silenciosa ou inibida. Aqui, o desespero pode vir acompanhado de tensão, irritabilidade e urgência subjetiva.',
	},
	catatonia: {
		elevation: 0.05, // Breu total / Fundo do poço. Ausência quase completa de luz e movimento.
		insight:
			'Na catatonia, a dimensão motora torna-se central: imobilidade, negativismo, mutismo, posturas estranhas ou atividade sem finalidade podem aparecer como expressão extrema de desorganização do campo psíquico. O quadro exige leitura médica cuidadosa, pois o risco não é apenas psiquiátrico, mas também clínico geral: desidratação, tromboembolismo, infecção, exaustão. No espaço dimensional, a energia subjetiva parece congelada ou paradoxalmente desligada da ação organizada.',
	},
};

export const MOOD_NODE_BY_ID: Record<MoodNodeId, MoodNode> = MOOD_NODES.reduce(
	(acc, node) => {
		acc[node.id] = node;
		return acc;
	},
	{} as Record<MoodNodeId, MoodNode>,
);

export const MOCK_TIMELINE_DATA: TimePoint[] = [];

