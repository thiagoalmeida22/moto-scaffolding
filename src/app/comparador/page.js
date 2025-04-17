'use client';

import React, { useState } from 'react';
import { motos } from '@/data/motos';
import './style.css';

function Comparador() {
    const [moto1, setMoto1] = useState(null);
    const [moto2, setMoto2] = useState(null);

    const handleChangeMoto1 = (event) => {
        const selectedMoto = motos.find(moto => moto.id === parseInt(event.target.value));
        setMoto1(selectedMoto);
    };

    const handleChangeMoto2 = (event) => {
        const selectedMoto = motos.find(moto => moto.id === parseInt(event.target.value));
        setMoto2(selectedMoto);
    };

    const getComparisonArrow = (value1, value2) => {
        if (value1 > value2) {
            return '→'; // Apontando para a direita
        } else if (value2 > value1) {
            return '←'; // Apontando para a esquerda
        }
        return '='; // Se forem iguais, não retorna nada
    };

    return (
        <div>
            <h1>Comparador de Motos</h1>
            <div>
                <label htmlFor="moto1">Selecione a Moto 1:</label>
                <select id="moto1" onChange={handleChangeMoto1}>
                    <option value="">--Selecione--</option>
                    {motos.map(moto => (
                        <option key={moto.id} value={moto.id}>{moto.nome}</option>
                    ))}
                </select>

                <label htmlFor="moto2">Selecione a Moto 2:</label>
                <select id="moto2" onChange={handleChangeMoto2}>
                    <option value="">--Selecione--</option>
                    {motos.map(moto => (
                        <option key={moto.id} value={moto.id}>{moto.nome}</option>
                    ))}
                </select>
            </div>

            {moto1 && moto2 && (
                <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: '20px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2>{moto1.nome}</h2>
                        <p>
                            Potência: {moto1.potencia} cv
                        </p>
                        <p>
                            Peso: {moto1.peso} kg
                        </p>
                        <p>Tipo: {moto1.tipo}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '50px' }}>
                        {/* Setas de comparação */}
                        <span style={{ fontSize: '24px' }}>
                            {getComparisonArrow(moto1.potencia, moto2.potencia)}
                        </span>
                        <span style={{ fontSize: '24px' }}>
                            {getComparisonArrow(moto1.peso, moto2.peso)}
                        </span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2>{moto2.nome}</h2>
                        <p>
                            Potência: {moto2.potencia} cv
                        </p>
                        <p>
                            Peso: {moto2.peso} kg
                        </p>
                        <p>Tipo: {moto2.tipo}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comparador;