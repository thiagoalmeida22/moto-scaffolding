'use client';

import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import MotoSpecValue from './components/MotoSpecValue';

function Comparador() {
    const [marcas, setMarcas] = useState([]);
    const [modelos1, setModelos1] = useState(null);
    const [modelos2, setModelos2] = useState(null);
    const [modelos3, setModelos3] = useState(null);
    const [selectedModelo1, setSelectedModelo1] = useState(null);
    const [selectedModelo2, setSelectedModelo2] = useState(null);
    const [selectedModelo3, setSelectedModelo3] = useState(null);
    const [anos1, setAnos1] = useState(null);
    const [anos2, setAnos2] = useState(null);
    const [anos3, setAnos3] = useState(null);
    const [selectedMoto1, setSelectedMoto1] = useState(null);
    const [selectedMoto2, setSelectedMoto2] = useState(null);
    const [selectedMoto3, setSelectedMoto3] = useState(null);
    const [numSelectedMotos, setNumSelectedMotos] = useState(0);
    // Tempo de expiração em milissegundos (3 horas)
    const CACHE_EXPIRATION = 3 * 60 * 60 * 1000;
    const keysRef = useRef(null);

    useEffect(() => {
        const fetchMarcas = async () => {
            const response = await fetch('/api/db/marca');
            const data = await response.json();
            setMarcas(data);
        };
        fetchMarcas();
    }, []);

    useEffect(() => {
        setNumSelectedMotos(selectedMoto1 && selectedMoto2 && selectedMoto3 ? 3 : selectedMoto1 && selectedMoto2 ? 2 : 0);
    }, [selectedMoto1, selectedMoto2, selectedMoto3]);

    useEffect(() => {
        if (selectedMoto1 && selectedMoto2) {
            // Adiciona um pequeno delay para garantir que o DOM esteja completamente renderizado
            setTimeout(() => {
                const keyElements = document.querySelectorAll('.comparator__keys p');
                let maxWidth = 0;

                keyElements.forEach(element => {
                    // Força o cálculo do layout
                    const width = element.getBoundingClientRect().width;
                    maxWidth = Math.max(maxWidth, width);
                });

                // Aplica a largura mínima a todos os elementos .comparator__keys
                const keyContainers = document.querySelectorAll('.comparator__keys');
                keyContainers.forEach(container => {
                    container.style.minWidth = `${maxWidth + 10}px`;
                });
            }, 100);
        }
    }, [selectedMoto1, selectedMoto2, selectedMoto3]);

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

    const handleChangeMarca3 = async (event) => {
        console.log('MOTO3', event.target.value);
        if (event.target.value === "") {
            setSelectedMoto3(null);
            setAnos3(null);
            setSelectedModelo3(null);
            return;
        }
        const response = await fetch(`/api/db/marca/${event.target.value}`);
        const data = await response.json();
        setModelos3(data);
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

    const handleChangeModelo3 = async (event) => {
        const selectedModelo = modelos3.find(modelo => modelo.modelo === event.target.value).modelo;
        const response = await fetch(`/api/db/modelo/${event.target.value}`);
        const data = await response.json();
        setSelectedModelo3(selectedModelo);
        setAnos3(data);
    };

    const handleChangeAno1 = async (event) => {
        const selectedAno = anos1.find(ano => ano.ano === event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo1}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id
        console.log(data);
        setSelectedMoto1(data);
    };

    const handleChangeAno2 = async (event) => {
        const selectedAno = anos2.find(ano => ano.ano === event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo2}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id
        console.log(data);
        setSelectedMoto2(data);
    };

    const handleChangeAno3 = async (event) => {
        const selectedAno = anos3.find(ano => ano.ano === event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo3}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id
        console.log(data);
        setSelectedMoto3(data);
    };

    const getComparisonArrow = (value1, value2, value3 = null) => {
        if (!value3) {
            if (value1 > value2) return '→';
            if (value2 > value1) return '←';
            return '=';
        }

        const values = [value1, value2, value3];
        const maxIndex = values.indexOf(Math.max(...values));
        const minIndex = values.indexOf(Math.min(...values));

        if (maxIndex === minIndex) return '=';
        if (maxIndex === 0) return '→';
        if (maxIndex === 1) return '↔';
        if (maxIndex === 2) return '←';
    };

    return (
        <div className='comparator__container'>
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
                        <select id="modelo1" onChange={handleChangeModelo1}>
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
                        <select id="modelo2" onChange={handleChangeModelo2}>
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

                <div className='selector__div'>
                    <h4>Selecione a Moto 3 (Opcional):</h4>
                    <div className='selector-input__div'>
                        <label htmlFor="marca3">Marca:</label>
                        <select id="marca3" onChange={handleChangeMarca3}>
                            <option value="">--Selecione--</option>
                            {marcas?.map(marca => (
                                <option key={marca.id} value={marca.id}>{marca.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="modelo3">Modelo:</label>
                        <select id="modelo3" onChange={handleChangeModelo3}>
                            <option value="">--Selecione--</option>
                            {modelos3?.map(modelo => (
                                <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                            ))}
                        </select>
                    </div>
                    <div className='selector-input__div'>
                        <label htmlFor="ano3">Ano:</label>
                        <select id="ano3" onChange={handleChangeAno3}>
                            <option value="">--Selecione--</option>
                            {anos3?.map(ano => (
                                <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {numSelectedMotos >= 2 && (
                <div>
                    <div className='comparator__row'>
                        <div className='comparator__names'>
                            <h2>{selectedMoto1['Especificacoes']['Marca']} {selectedMoto1['Especificacoes']['Modelo']} - {selectedMoto1['Especificacoes']['Ano']}</h2>
                            <h2>{selectedMoto2['Especificacoes']['Marca']} {selectedMoto2['Especificacoes']['Modelo']} - {selectedMoto2['Especificacoes']['Ano']}</h2>
                            {selectedMoto3 && (
                                <h2>{selectedMoto3['Especificacoes']['Marca']} {selectedMoto3['Especificacoes']['Modelo']} - {selectedMoto3['Especificacoes']['Ano']}</h2>
                            )}
                        </div>
                    </div>
                    {Object.entries(selectedMoto1).map(([group, data]) => (
                        <div key={group}>
                            <div className='comparator__group-header'>
                                <div className='comparator__keys' ref={keysRef} /> {/* Apenas para espaçamento cosmetico */}
                                <h3>{group}</h3>
                            </div>
                            {Object.entries(data).map(([key, _value], index) => (
                                <div className={`comparator__row ${index % 2 === 0 ? 'even' : 'odd'}`} key={`${group}-${key}`}>
                                    <div className='comparator__keys' ref={keysRef}>
                                        <p>{key}:</p>
                                    </div>
                                    <div className='comparator__values'>
                                        <MotoSpecValue
                                            selectedMoto={selectedMoto1}
                                            group={group}
                                            key={key + '1'}
                                            chave={key}
                                        />
                                        {numSelectedMotos === 2 && <span className='comparator__arrow'>
                                            {getComparisonArrow(
                                                selectedMoto1[group][key],
                                                selectedMoto2[group][key]
                                            )}
                                        </span>}
                                        <MotoSpecValue
                                            selectedMoto={selectedMoto2}
                                            group={group}
                                            key={key + '2'}
                                            chave={key}
                                        />
                                        {selectedMoto3 && (
                                            <MotoSpecValue
                                                selectedMoto={selectedMoto3}
                                                group={group}
                                                key={key + '3'}
                                                chave={key}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div >
    );
}

export default Comparador;