// Mapeamento de rótulos para exibição no frontend (apenas visual)
// Para mapeamentos específicos por seção, usar 'Seção.Key'
export const LABEL_DISPLAY_MAP = {
    'Consumo (Gasolina)': 'Consumo Médio (Gasolina)',
    'Consumo (Alcool)': 'Consumo Médio (Alcool)',
    'Velocidade Máx. (Aprox. Painel)': 'Velocidade Máx. Média (Painel)',
    'Freio.Tipo': 'Opcionais',
};

export const getDisplayLabel = (key, group) => {
    if (group && LABEL_DISPLAY_MAP[`${group}.${key}`]) {
        return LABEL_DISPLAY_MAP[`${group}.${key}`];
    }
    return LABEL_DISPLAY_MAP[key] ?? key;
};

export const unit_medida = {
    'Especificacoes': {
        'Modelo': '',
        'Marca': '',
        'Ano': '',
        'Categoria': '',
        'Preço Fipe': 'R$'
    },
    'Motor': {
        'Tipo': '',
        'Cilindrada': 'cc',
        'Potencia (Gasolina)': 'cv',
        'Potencia (Alcool)': 'cv',
        'Torque (Gasolina)': 'kgf.m',
        'Torque (Alcool)': 'kgf.m',
        'Partida': '',
        'Refrigeração': ''
    },
    'Transmissão': {
        'Cambio': '',
        'Embreagem': ''
    },
    'Suspensão': {
        'Dianteira': '',
        'Traseira': ''
    },
    'Freio': {
        'Tipo': '',
        'Dianteiro': '',
        'Traseiro': ''
    },
    'Pneu': {
        'Dianteiro': '',
        'Traseiro': ''
    },
    'Dimensoes': {
        'Tipo de Chassi': '',
        'Altura do Assento': 'mm',
        'Altura': 'mm',
        'Comprimento': 'mm',
        'Largura': 'mm',
        'Distância entre Eixos': 'mm',
        'Peso': 'kg',
        'Capacidade de Carga': 'kg',
    },
    'Desempenho': {
        'Velocidade Máx. (Aprox. Painel)': 'km/h',
        'Aceleração 0-100': 's',
    },
    'Combustível': {
        'Tipo': '',
        'Consumo (Gasolina)': 'km/l',
        'Consumo (Alcool)': 'km/l',
        'Autonomia (Gasolina)': 'km',
        'Autonomia (Alcool)': 'km',
        'Tanque': 'L',
    },
}