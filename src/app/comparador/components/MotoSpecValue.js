import React from 'react';
import { unit_medida } from '../utils';

// Função auxiliar para verificar se um valor é vazio (null, undefined ou string vazia)
const isEmpty = (val) => val === null || val === undefined || val === '';

const MotoSpecValue = ({ data, group, chave }) => {
    if (!data || !group || !chave) return '-';

    const value = data[chave];
    if (isEmpty(value)) return '-';

    const isPowerOrTorque = ['Potencia', 'Torque'].includes(chave.split(' ')[0]);
    
    const unidade = unit_medida[group]?.[chave] ?? '';

    if (isPowerOrTorque) {
        return `${value}`.replace(" ", ` ${unidade} `);
    } else if (chave === 'Preço Fipe') {
        return `${Number(value).toLocaleString('pt-BR')} ${unidade}`;
    } else if (group !== 'Extras') {
        return `${value} ${unidade}`;
    }
    return `${value}`;
};

export default MotoSpecValue; 