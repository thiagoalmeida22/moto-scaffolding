import React from 'react';
import { unit_medida } from '../utils';

const MotoSpecValue = ({ data, group, chave }) => {
    if (!data || !group || !chave) return '-';

    const value = data[chave];
    const isPowerOrTorque = ['Potencia', 'Torque'].includes(chave.split(' ')[0]);

    if (isPowerOrTorque) {
        return `${value}`.replace(" ", ` ${unit_medida[group][chave]} `);
    } else if (chave === 'Preço Fipe') {
        return `${Number(value).toLocaleString('pt-BR')} ${unit_medida[group][chave]}`;
    } else if (group !== 'Extras') {
        return `${value} ${unit_medida[group][chave]}`;
    }
    return `${value}`;
};

export default MotoSpecValue; 