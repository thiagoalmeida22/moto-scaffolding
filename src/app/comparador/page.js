'use client';

import React, { useState, useEffect } from 'react';
import './style.css';

function Comparador() {
    const [marcas, setMarcas] = useState([]);
    const [modelos1, setModelos1] = useState(null);
    const [modelos2, setModelos2] = useState(null);
    const [selectedModelo1, setSelectedModelo1] = useState(null);
    const [selectedModelo2, setSelectedModelo2] = useState(null);
    const [anos1, setAnos1] = useState(null);
    const [anos2, setAnos2] = useState(null);
    const [selectedMoto1, setSelectedMoto1] = useState(null);
    const [selectedMoto2, setSelectedMoto2] = useState(null);
    // Tempo de expiração em milissegundos (3 horas)
    const CACHE_EXPIRATION = 3 * 60 * 60 * 1000;

    useEffect(() => {
        const fetchMarcas = async () => {
            // const cachedMarcas = localStorage.getItem('marcas');
            // const cachedTimestamp = localStorage.getItem('marcas_timestamp');
            // const now = new Date().getTime();

            // // Verifica se há dados armazenados e se não expiraram
            // if (cachedMarcas && cachedTimestamp) {
            //     const age = now - parseInt(cachedTimestamp, 10);
            //     if (age < CACHE_EXPIRATION) {
            //         setMarcas(JSON.parse(cachedMarcas));
            //         return;
            //     }
            // }
            // Se não houver cache ou ele estiver expirado, busca os dados da API
            const response = await fetch('/api/db/marca');
            const data = await response.json();

            setMarcas(data);

            // // Armazena os dados e a marca de tempo no localStorage
            // localStorage.setItem('marcas', JSON.stringify(data));
            // localStorage.setItem('marcas_timestamp', now.toString());
        };

        fetchMarcas();
    }, []);

    const handleChangeMarca1 = async (event) => {
        // const selectedMarca = marcas.find(marca => marca.id === parseInt(event.target.value));
        const response = await fetch(`/api/db/marca/${event.target.value}`);
        const data = await response.json();
        setModelos1(data);
    };

    const handleChangeMarca2 = async (event) => {
        // const selectedMarca = marcas.find(marca => marca.id === parseInt(event.target.value));
        const response = await fetch(`/api/db/marca/${event.target.value}`);
        const data = await response.json();
        setModelos2(data);
    };

    const handleChangeModelo1 = async (event) => {
        const selectedModelo = modelos1.find(modelo => modelo.modelo === event.target.value).modelo;
        const response = await fetch(`/api/db/modelo/${event.target.value}`);
        const data = await response.json();
        setSelectedModelo1(selectedModelo);
        setAnos1(data);
    };

    const handleChangeModelo2 = async (event) => {
        const selectedModelo = modelos2.find(modelo => modelo.modelo === event.target.value).modelo;
        const response = await fetch(`/api/db/modelo/${event.target.value}`);
        const data = await response.json();
        setSelectedModelo2(selectedModelo);
        setAnos2(data);
    };

    const handleChangeAno1 = async (event) => {
        const selectedAno = anos1.find(ano => ano.ano === event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo1}&ano=${event.target.value}`);
        const data = await response.json();
        console.log(data);
        setSelectedMoto1(data);
    };

    const handleChangeAno2 = async (event) => {
        const selectedAno = anos2.find(ano => ano.ano === event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo2}&ano=${event.target.value}`);
        const data = await response.json();
        console.log(data);
        setSelectedMoto2(data);
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
            <div className='comparator__div'>
                <div className='selector__div'>
                    <h4>Selecione a Moto 1:</h4>
                    <div className='selector-input__div'>
                        <label htmlFor="marca1">Marca:</label>
                        <select id="marca1" onChange={handleChangeMarca1}>
                            <option value="">--Selecione--</option>
                            {marcas?.map(marca => (
                                <option key={marca.id} value={marca.id}>{marca.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="modelo1">Modelo:</label>
                        <select id="marca1" onChange={handleChangeModelo1}>
                            <option value="">--Selecione--</option>
                            {modelos1?.map(modelo => (
                                <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="ano1">Ano:</label>
                        <select id="ano1" onChange={handleChangeAno1}>
                            <option value="">--Selecione--</option>
                            {anos1?.map(ano => (
                                <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='selector__div'>
                    <h4>Selecione a Moto 2:</h4>
                    <div className='selector-input__div'>
                        <label htmlFor="marca2">Marca:</label>
                        <select id="marca2" onChange={handleChangeMarca2}>
                            <option value="">--Selecione--</option>
                            {marcas?.map(marca => (
                                <option key={marca.id} value={marca.id}>{marca.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="modelo2">Modelo:</label>
                        <select id="marca2" onChange={handleChangeModelo2}>
                            <option value="">--Selecione--</option>
                            {modelos2?.map(modelo => (
                                <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="ano2">Ano:</label>
                        <select id="ano2" onChange={handleChangeAno2}>
                            <option value="">--Selecione--</option>
                            {anos2?.map(ano => (
                                <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedMoto1 && selectedMoto2 && (
                <div>
                    <div className='comparator__row'>
                        <h2>{selectedMoto1.marca} {selectedMoto1.modelo} - {selectedMoto1.ano}</h2>
                        <h2>{selectedMoto2.marca} {selectedMoto2.modelo} - {selectedMoto2.ano}</h2>
                    </div>
                    {Object.keys(selectedMoto1)?.map((key, index) => (
                        <div className={`comparator__row ${index % 2 === 0 ? 'even' : 'odd'}`} key={key}>
                            <p>{key}: {selectedMoto1[key]}</p>
                            <span style={{ fontSize: '24px' }}>
                                {getComparisonArrow(selectedMoto1[key], selectedMoto2[key])}
                            </span>
                            <p>{key}: {selectedMoto2[key]}</p>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    );
}

export default Comparador;