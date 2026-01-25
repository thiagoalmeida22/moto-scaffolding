import React from 'react';
import { unit_medida } from '../utils';

const MotoSpecValue = ({ data, group, chave }) => {
    if (!data || !group || !chave) return '-';

    const value = data[chave];
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