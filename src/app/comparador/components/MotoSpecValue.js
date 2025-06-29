import React from 'react';
import { unit_medida } from '../utils';

const MotoSpecValue = ({ selectedMoto, group, chave }) => {
    if (!selectedMoto || !group || !chave) return null;

    const value = selectedMoto[group][chave];
    const isPowerOrTorque = ['Potencia', 'Torque'].includes(chave.split(' ')[0]);

    if (isPowerOrTorque) {
        return (
            <p>
                {`${value}`.replace(" ", ` ${unit_medida[group][chave]} `)}
            </p>
        );
    } else if (chave === 'Preço Fipe') {
        return (
            <p>
                {`${Number(value).toLocaleString('pt-BR')} ${unit_medida[group][chave]}`}
            </p>
        );
    } else if (group !== 'Extras') {
        return (
            <p>
                {`${value} ${unit_medida[group][chave]}`}
            </p>
        );
    }
    return (
        <p>
            {`${value}`}
        </p>
    );
};

export default MotoSpecValue; 