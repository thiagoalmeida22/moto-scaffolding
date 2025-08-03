'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import './style.css';
import ComparisonBlock from './components/ComparisonBlock';

function Comparador() {
    const searchParams = useSearchParams();
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
    
    // Estados para controlar os valores selecionados nos dropdowns da Moto 1
    const [selectedMarca1, setSelectedMarca1] = useState('');
    const [selectedAno1, setSelectedAno1] = useState('');

    useEffect(() => {
        const fetchMarcas = async () => {
            const response = await fetch('/api/db/marca');
            const data = await response.json();
            setMarcas(data);
            
            // Verificar se há query parameters para carregar moto da página de motos
            const marcaParam = searchParams.get('marca');
            const modeloParam = searchParams.get('modelo');
            const anoParam = searchParams.get('ano');
            
            if (marcaParam && modeloParam && anoParam) {
                carregarMotoDaPaginaMotos({
                    marca: marcaParam,
                    modelo: modeloParam,
                    ano: anoParam
                }, data);
            }
        };
        fetchMarcas();
    }, [searchParams]);

    const carregarMotoDaPaginaMotos = async (motoParams, marcasData) => {
        try {
            // Encontrar a marca pelo ID
            const marcaEncontrada = marcasData.find(marca => marca.id === parseInt(motoParams.marca));
            if (marcaEncontrada) {
                // Definir marca selecionada no dropdown
                setSelectedMarca1(marcaEncontrada.id);
                
                // Carregar modelos da marca
                const responseModelos = await fetch(`/api/db/marca/${marcaEncontrada.id}`);
                const dataModelos = await responseModelos.json();
                setModelos1(dataModelos);
                
                // Definir modelo selecionado
                setSelectedModelo1(motoParams.modelo);
                
                // Carregar anos do modelo
                const responseAnos = await fetch(`/api/db/modelo/${motoParams.modelo}`);
                const dataAnos = await responseAnos.json();
                setAnos1(dataAnos);
                
                // Definir ano selecionado no dropdown
                setSelectedAno1(motoParams.ano);
                
                // Carregar dados da moto
                const responseMoto = await fetch(`/api/db/moto?modelo=${motoParams.modelo}&ano=${motoParams.ano}`);
                const motoData = await responseMoto.json();
                setSelectedMoto1(motoData);
            }
        } catch (error) {
            console.error('Erro ao carregar moto da página de motos:', error);
        }
    };

    useEffect(() => {
        setNumSelectedMotos(selectedMoto1 && selectedMoto2 && selectedMoto3 ? 3 : selectedMoto1 && selectedMoto2 ? 2 : 0);
    }, [selectedMoto1, selectedMoto2, selectedMoto3]);

    const handleChangeMarca1 = async (event) => {
        console.log("handleChangeMarca1", event.target.value);
        setSelectedMarca1(event.target.value);
        const response = await fetch(`/api/db/marca/${event.target.value}`);
        const data = await response.json();
        setModelos1(data);
        // Limpar seleções dependentes
        setSelectedModelo1(null);
        setSelectedAno1('');
        setSelectedMoto1(null);
    };

    const handleChangeMarca2 = async (event) => {
        const response = await fetch(`/api/db/marca/${event.target.value}`);
        const data = await response.json();
        setModelos2(data);
    };

    const handleChangeMarca3 = async (event) => {
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
        setSelectedModelo1(selectedModelo);
        const response = await fetch(`/api/db/modelo/${event.target.value}`);
        const data = await response.json();
        setAnos1(data);
        // Limpar ano selecionado
        setSelectedAno1('');
        setSelectedMoto1(null);
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
        setSelectedAno1(event.target.value);
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo1}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id;
        setSelectedMoto1(data);
    };

    const handleChangeAno2 = async (event) => {
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo2}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id;
        setSelectedMoto2(data);
    };

    const handleChangeAno3 = async (event) => {
        const response = await fetch(`/api/db/moto?modelo=${selectedModelo3}&ano=${event.target.value}`);
        const data = await response.json();
        delete data.id;
        setSelectedMoto3(data);
    };

    return (
        <div className="comparador-container">
            <h1>Comparador de Motos</h1>
            
            {/* Selectors */}
            <div className="selectors">
                <div className="selector-group">
                    <h4>Moto 1</h4>
                    <label htmlFor="marca1">Marca:</label>
                    <select 
                        id="marca1" 
                        value={selectedMarca1}
                        onChange={handleChangeMarca1}
                    >
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(marca => (
                            <option key={marca.id} value={marca.id}>{marca.nome}</option>
                        ))}
                    </select>
                    <label htmlFor="modelo1">Modelo:</label>
                    <select 
                        id="modelo1" 
                        value={selectedModelo1 || ''}
                        onChange={handleChangeModelo1} 
                        disabled={!modelos1}
                    >
                        <option value="">Selecione um modelo</option>
                        {modelos1?.map(modelo => (
                            <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                        ))}
                    </select>
                    <label htmlFor="ano1">Ano:</label>
                    <select 
                        id="ano1" 
                        value={selectedAno1}
                        onChange={handleChangeAno1} 
                        disabled={!anos1}
                    >
                        <option value="">Selecione um ano</option>
                        {anos1?.map(ano => (
                            <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                        ))}
                    </select>
                </div>

                <div className="selector-group">
                    <h4>Moto 2</h4>
                    <label htmlFor="marca2">Marca:</label>
                    <select id="marca2" onChange={handleChangeMarca2}>
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(marca => (
                            <option key={marca.id} value={marca.id}>{marca.nome}</option>
                        ))}
                    </select>
                    <label htmlFor="modelo2">Modelo:</label>
                    <select id="modelo2" onChange={handleChangeModelo2} disabled={!modelos2}>
                        <option value="">Selecione um modelo</option>
                        {modelos2?.map(modelo => (
                            <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                        ))}
                    </select>
                    <label htmlFor="ano2">Ano:</label>
                    <select id="ano2" onChange={handleChangeAno2} disabled={!anos2}>
                        <option value="">Selecione um ano</option>
                        {anos2?.map(ano => (
                            <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                        ))}
                    </select>
                </div>

                <div className="selector-group">
                    <h4>Moto 3 (Opcional)</h4>
                    <label htmlFor="marca3">Marca:</label>
                    <select id="marca3" onChange={handleChangeMarca3}>
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(marca => (
                            <option key={marca.id} value={marca.id}>{marca.nome}</option>
                        ))}
                    </select>
                    <label htmlFor="modelo3">Modelo:</label>
                    <select id="modelo3" onChange={handleChangeModelo3} disabled={!modelos3}>
                        <option value="">Selecione um modelo</option>
                        {modelos3?.map(modelo => (
                            <option key={modelo.modelo} value={modelo.modelo}>{modelo.modelo}</option>
                        ))}
                    </select>
                    <label htmlFor="ano3">Ano:</label>
                    <select id="ano3" onChange={handleChangeAno3} disabled={!anos3}>
                        <option value="">Selecione um ano</option>
                        {anos3?.map(ano => (
                            <option key={ano.ano} value={ano.ano}>{ano.ano}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Comparison Display */}
            {numSelectedMotos >= 2 && (
                <div className="comparison-display">
                    {/* Moto Names */}
                    <div className="moto-names">
                        <div className="moto-name">
                            {selectedMoto1['Especificacoes']['Marca']} {selectedMoto1['Especificacoes']['Modelo']} - {selectedMoto1['Especificacoes']['Ano']}
                        </div>
                        <div className="moto-name">
                            {selectedMoto2['Especificacoes']['Marca']} {selectedMoto2['Especificacoes']['Modelo']} - {selectedMoto2['Especificacoes']['Ano']}
                        </div>
                        {selectedMoto3 && (
                            <div className="moto-name">
                                {selectedMoto3['Especificacoes']['Marca']} {selectedMoto3['Especificacoes']['Modelo']} - {selectedMoto3['Especificacoes']['Ano']}
                            </div>
                        )}
                    </div>

                    {/* Data Display */}
                    <div className="comparison-row-container">
                        <ComparisonBlock 
                            title="Especificacoes" 
                            data1={selectedMoto1.Especificacoes} 
                            data2={selectedMoto2.Especificacoes} 
                            data3={selectedMoto3?.Especificacoes} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                        <ComparisonBlock 
                            title="Motor" 
                            data1={selectedMoto1.Motor} 
                            data2={selectedMoto2.Motor} 
                            data3={selectedMoto3?.Motor} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={9} 
                        />
                    </div>
                    
                    <div className="comparison-row-container">
                        <ComparisonBlock 
                            title="Transmissão" 
                            data1={selectedMoto1.Transmissão} 
                            data2={selectedMoto2.Transmissão} 
                            data3={selectedMoto3?.Transmissão} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                        <ComparisonBlock 
                            title="Suspensão" 
                            data1={selectedMoto1.Suspensão} 
                            data2={selectedMoto2.Suspensão} 
                            data3={selectedMoto3?.Suspensão} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                    </div>
                    
                    <div className="comparison-row-container">
                        <ComparisonBlock 
                            title="Freio" 
                            data1={selectedMoto1.Freio} 
                            data2={selectedMoto2.Freio} 
                            data3={selectedMoto3?.Freio} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                        <ComparisonBlock 
                            title="Pneu" 
                            data1={selectedMoto1.Pneu} 
                            data2={selectedMoto2.Pneu} 
                            data3={selectedMoto3?.Pneu} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                    </div>
                    
                    <div className="comparison-row-container">
                        <ComparisonBlock 
                            title="Dimensoes" 
                            data1={selectedMoto1.Dimensoes} 
                            data2={selectedMoto2.Dimensoes} 
                            data3={selectedMoto3?.Dimensoes} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={8} 
                        />
                        <ComparisonBlock 
                            title="Desempenho" 
                            data1={selectedMoto1.Desempenho} 
                            data2={selectedMoto2.Desempenho} 
                            data3={selectedMoto3?.Desempenho} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={8} 
                        />
                    </div>
                    
                    <div className="comparison-row-container">
                        <ComparisonBlock 
                            title="Combustível" 
                            data1={selectedMoto1.Combustível} 
                            data2={selectedMoto2.Combustível} 
                            data3={selectedMoto3?.Combustível} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                        <ComparisonBlock 
                            title="Extras" 
                            data1={selectedMoto1.Extras} 
                            data2={selectedMoto2.Extras} 
                            data3={selectedMoto3?.Extras} 
                            numSelectedMotos={numSelectedMotos} 
                            maxRows={6} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Comparador;