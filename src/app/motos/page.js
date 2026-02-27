'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import MotoSpecValue from '../comparador/components/MotoSpecValue';
import { sortAlphabetically } from '@/utils/valueHelpers.js';
import './style.css';

function MotosPage() {
    const router = useRouter();
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [anos, setAnos] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedModelo, setSelectedModelo] = useState('');
    const [selectedAno, setSelectedAno] = useState('');
    const [motoData, setMotoData] = useState(null);
    const [motoFotos, setMotoFotos] = useState([]);

    // Fetch marcas on component mount
    useEffect(() => {
        fetchMarcas();
    }, []);

    // Fetch modelos when marca changes
    useEffect(() => {
        if (selectedMarca) {
            fetchModelos(selectedMarca);
        } else {
            setModelos([]);
            setSelectedModelo('');
        }
    }, [selectedMarca]);

    // Fetch anos when modelo changes
    useEffect(() => {
        if (selectedModelo) {
            fetchAnos(selectedModelo);
        } else {
            setAnos([]);
            setSelectedAno('');
        }
    }, [selectedModelo]);

    // Fetch moto data when ano changes
    useEffect(() => {
        if (selectedAno) {
            fetchMotoData(selectedModelo, selectedAno);
        } else {
            setMotoData(null);
        }
    }, [selectedAno, selectedModelo]);

    const fetchMarcas = async () => {
        try {
            const response = await fetch('/api/db/marca');
            const data = await response.json();
            const marcasOrdenadas = sortAlphabetically(data, 'nome');
            setMarcas(marcasOrdenadas);
        } catch (error) {
            console.error('Error fetching marcas:', error);
        }
    };

    const fetchModelos = async (marcaId) => {
        try {
            const response = await fetch(`/api/db/marca/${marcaId}`);
            const data = await response.json();
            // Ordenar modelos alfabeticamente
            const modelosOrdenados = Array.isArray(data) 
                ? data.sort((a, b) => a.modelo.localeCompare(b.modelo))
                : data;
            setModelos(modelosOrdenados);
        } catch (error) {
            console.error('Error fetching modelos:', error);
        }
    };

    const fetchAnos = async (modelo) => {
        try {
            const response = await fetch(`/api/db/modelo/${encodeURIComponent(modelo)}`);
            const data = await response.json();
            setAnos(data);
        } catch (error) {
            console.error('Error fetching anos:', error);
        }
    };

    const fetchMotoData = async (modelo, ano) => {
        try {
            const response = await fetch(`/api/db/moto?modelo=${encodeURIComponent(modelo)}&ano=${ano}`);
            const data = await response.json();
            setMotoData(data);
        } catch (error) {
            console.error('Error fetching moto data:', error);
        }
    };

    const loadMotoFotos = async (motoId, setter) => {
        if (!motoId) {
            setter([]);
            return;
        }
        try {
            const response = await fetch(`/api/db/moto-fotos/get?motoId=${motoId}`);
            const data = await response.json();
            if (data.success && data.fotos && data.fotos.length > 0) {
                const fotosComCaminho = data.fotos.slice(0, 3).map(f => {
                    const path = f.foto_path;
                    if (path.startsWith('/api/pictures')) return path;
                    if (path.startsWith('/pictures')) return path.replace('/pictures', '/api/pictures');
                    if (path.startsWith('pictures/')) return `/api/${path}`;
                    return path;
                });
                setter(fotosComCaminho);
            } else {
                setter([]);
            }
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
            setter([]);
        }
    };

    useEffect(() => {
        if (motoData?.id) {
            loadMotoFotos(motoData.id, setMotoFotos);
        } else {
            setMotoFotos([]);
        }
    }, [motoData?.id]);

    const handleMarcaChange = (event) => {
        setSelectedMarca(event.target.value);
    };

    const handleModeloChange = (event) => {
        setSelectedModelo(event.target.value);
    };

    const handleAnoChange = (event) => {
        setSelectedAno(event.target.value);
    };

    const handleCompararClick = () => {
        if (motoData) {
            // Criar query parameters
            const params = new URLSearchParams({
                marca: selectedMarca, // ID da marca (numérico)
                modelo: selectedModelo,
                ano: selectedAno
            });
            
            // Redirecionar para o comparador com query parameters
            router.push(`/comparador?${params.toString()}`);
        }
    };

    const renderDataBlock = (title, data, maxRows = 0) => {
        if (!data) return null;
        
        const entries = Object.entries(data);
        const rows = maxRows > 0 ? entries.slice(0, maxRows) : entries;
        
        return (
            <div className="data-block">
                <h3>{title}</h3>
                <div className="data-content">
                    {rows.map(([key, value]) => (
                        <div key={key} className="data-row">
                            <span className="data-label">{key}:</span>
                            <span className="data-value">
                                <MotoSpecValue
                                    data={data}
                                    group={title}
                                    chave={key}
                                />
                            </span>
                        </div>
                    ))}
                    {/* Fill empty rows if needed */}
                    {maxRows > 0 && rows.length < maxRows && 
                        Array.from({ length: maxRows - rows.length }).map((_, index) => (
                            <div key={`empty-${index}`} className="data-row empty">
                                <span className="data-label"></span>
                                <span className="data-value"></span>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="motos-container">
            <h1>Especificações da Moto</h1>
            
            {/* Selectors */}
            <div className="selectors">
                <div className="selector-group">
                    <label htmlFor="marca">Marca:</label>
                    <select 
                        id="marca" 
                        value={selectedMarca} 
                        onChange={handleMarcaChange}
                    >
                        <option value="">Selecione uma marca</option>
                        {marcas.map((marca) => (
                            <option key={marca.id} value={marca.id}>
                                {marca.nome}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selector-group">
                    <label htmlFor="modelo">Modelo:</label>
                    <select 
                        id="modelo" 
                        value={selectedModelo} 
                        onChange={handleModeloChange}
                        disabled={!selectedMarca}
                    >
                        <option value="">Selecione um modelo</option>
                        {modelos.map((modelo) => (
                            <option key={modelo.modelo} value={modelo.modelo}>
                                {modelo.modelo}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="selector-group">
                    <label htmlFor="ano">Ano:</label>
                    <select 
                        id="ano" 
                        value={selectedAno} 
                        onChange={handleAnoChange}
                        disabled={!selectedModelo}
                    >
                        <option value="">Selecione um ano</option>
                        {anos.map((ano) => (
                            <option key={ano.ano} value={ano.ano}>
                                {ano.ano}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Botão Comparar */}
                {motoData && (
                    <div className="selector-group">
                        <button 
                            className="comparar-button"
                            onClick={handleCompararClick}
                        >
                            Comparar
                        </button>
                    </div>
                )}
            </div>

            {/* Data Display */}
            {motoData && (
                <>
                    <div className="data-display">
                        {renderDataBlock('Especificacoes', motoData.Especificacoes, 6)}
                        {renderDataBlock('Motor', motoData.Motor, 9)}
                        {renderDataBlock('Transmissão', motoData.Transmissão, 6)}
                        {renderDataBlock('Suspensão', motoData.Suspensão, 6)}
                        {renderDataBlock('Freio', motoData.Freio, 6)}
                        {renderDataBlock('Pneu', motoData.Pneu, 6)}
                        {renderDataBlock('Dimensoes', motoData.Dimensoes, 8)}
                        {renderDataBlock('Desempenho', motoData.Desempenho, 8)}
                        {renderDataBlock('Combustível', motoData.Combustível, 6)}
                        {renderDataBlock('Extras', motoData.Extras, 6)}
                    </div>

                    {/* Seção de Fotos */}
                    {motoFotos.length > 0 && (
                        <div className="motos-fotos-section">
                            <h3 className="motos-fotos-header">
                                {marcas.find(m => String(m.id) === selectedMarca)?.nome ?? motoData.Especificacoes?.Marca} {motoData.Especificacoes?.Modelo}
                            </h3>
                            <div className="fotos-grid-comparison">
                                {motoFotos.map((foto, index) => (
                                    <div key={index} className="fotos-row fotos-row-single">
                                        <div className="foto-container">
                                            <Image
                                                src={foto}
                                                alt={`Foto ${index + 1} - ${motoData.Especificacoes?.Modelo}`}
                                                width={427}
                                                height={320}
                                                style={{
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                                unoptimized
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default MotosPage; 