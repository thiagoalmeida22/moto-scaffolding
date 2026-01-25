'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import './style.css';
import ComparisonBlock from './components/ComparisonBlock';

function ComparadorContent() {
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
    
    // Estados para tratamento de erro
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    
    // Estados para fotos das motos
    const [moto1Fotos, setMoto1Fotos] = useState([]);
    const [moto2Fotos, setMoto2Fotos] = useState([]);
    const [moto3Fotos, setMoto3Fotos] = useState([]);
    const [moto1Id, setMoto1Id] = useState(null);
    const [moto2Id, setMoto2Id] = useState(null);
    const [moto3Id, setMoto3Id] = useState(null);

    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                setIsLoading(true);
                setHasError(false);
                
                const response = await fetch('/api/db/marca');
                
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // Verificar se a resposta contém erro
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Verificar se data é um array válido
                if (!Array.isArray(data)) {
                    throw new Error('Formato de dados inválido recebido do servidor');
                }
                
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
            } catch (error) {
                console.error('Erro ao carregar marcas:', error);
                setHasError(true);
                setErrorMessage(error.message || 'Erro de conexão com o banco de dados');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarcas();
    }, [searchParams]);

    // Função para tentar novamente
    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
        
        // Recarregar a página após um pequeno delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    // Função para carregar fotos de uma moto (limita a 3 fotos)
    const loadMotoFotos = async (motoId, setter) => {
        if (!motoId) {
            setter([]);
            return;
        }
        
        try {
            const response = await fetch(`/api/db/moto-fotos/get?motoId=${motoId}`);
            const data = await response.json();
            
            if (data.success && data.fotos && data.fotos.length > 0) {
                // Garantir que o caminho está correto (precisa começar com /api/pictures)
                // E limitar a 3 fotos
                const fotosComCaminho = data.fotos.slice(0, 3).map(f => {
                    const path = f.foto_path;
                    // Se o caminho já começa com /api/pictures, usar como está
                    if (path.startsWith('/api/pictures')) {
                        return path;
                    }
                    // Se começa com /pictures, converter para /api/pictures
                    if (path.startsWith('/pictures')) {
                        return path.replace('/pictures', '/api/pictures');
                    }
                    // Se é apenas o caminho relativo, adicionar /api/pictures
                    if (path.startsWith('pictures/')) {
                        return `/api/${path}`;
                    }
                    // Caso contrário, assumir que já está completo
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
                // Ordenar modelos alfabeticamente
                const modelosOrdenados = Array.isArray(dataModelos) 
                    ? dataModelos.sort((a, b) => a.modelo.localeCompare(b.modelo))
                    : dataModelos;
                setModelos1(modelosOrdenados);
                
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

    // Recarregar fotos quando os IDs das motos mudarem
    useEffect(() => {
        if (moto1Id) {
            loadMotoFotos(moto1Id, setMoto1Fotos);
        }
    }, [moto1Id]);

    useEffect(() => {
        if (moto2Id) {
            loadMotoFotos(moto2Id, setMoto2Fotos);
        }
    }, [moto2Id]);

    useEffect(() => {
        if (moto3Id) {
            loadMotoFotos(moto3Id, setMoto3Fotos);
        }
    }, [moto3Id]);

    const handleChangeMarca1 = async (event) => {
        try {
            setSelectedMarca1(event.target.value);
            
            const response = await fetch(`/api/db/marca/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar modelos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Ordenar modelos alfabeticamente
            const modelosOrdenados = Array.isArray(data) 
                ? data.sort((a, b) => a.modelo.localeCompare(b.modelo))
                : data;
            setModelos1(modelosOrdenados);
            // Limpar seleções dependentes
            setSelectedModelo1(null);
            setSelectedAno1('');
            setSelectedMoto1(null);
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar modelos da marca selecionada');
        }
    };

    const handleChangeMarca2 = async (event) => {
        try {
            const response = await fetch(`/api/db/marca/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar modelos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Ordenar modelos alfabeticamente
            const modelosOrdenados = Array.isArray(data) 
                ? data.sort((a, b) => a.modelo.localeCompare(b.modelo))
                : data;
            setModelos2(modelosOrdenados);
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar modelos da marca selecionada');
        }
    };

    const handleChangeMarca3 = async (event) => {
        try {
            if (event.target.value === "") {
                setSelectedMoto3(null);
                setAnos3(null);
                setSelectedModelo3(null);
                return;
            }
            
            const response = await fetch(`/api/db/marca/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar modelos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Ordenar modelos alfabeticamente
            const modelosOrdenados = Array.isArray(data) 
                ? data.sort((a, b) => a.modelo.localeCompare(b.modelo))
                : data;
            setModelos3(modelosOrdenados);
        } catch (error) {
            console.error('Erro ao carregar modelos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar modelos da marca selecionada');
        }
    };

    const handleChangeModelo1 = async (event) => {
        try {
            const selectedModelo = modelos1.find(modelo => modelo.modelo === event.target.value).modelo;
            setSelectedModelo1(selectedModelo);
            
            const response = await fetch(`/api/db/modelo/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar anos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setAnos1(data);
            // Limpar ano selecionado
            setSelectedAno1('');
            setSelectedMoto1(null);
        } catch (error) {
            console.error('Erro ao carregar anos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar anos do modelo selecionado');
        }
    };

    const handleChangeModelo2 = async (event) => {
        try {
            const selectedModelo = modelos2.find(modelo => modelo.modelo === event.target.value).modelo;
            
            const response = await fetch(`/api/db/modelo/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar anos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setSelectedModelo2(selectedModelo);
            setAnos2(data);
        } catch (error) {
            console.error('Erro ao carregar anos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar anos do modelo selecionado');
        }
    };

    const handleChangeModelo3 = async (event) => {
        try {
            const selectedModelo = modelos3.find(modelo => modelo.modelo === event.target.value).modelo;
            
            const response = await fetch(`/api/db/modelo/${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar anos: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            setSelectedModelo3(selectedModelo);
            setAnos3(data);
        } catch (error) {
            console.error('Erro ao carregar anos:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar anos do modelo selecionado');
        }
    };

    const handleChangeAno1 = async (event) => {
        try {
            setSelectedAno1(event.target.value);
            
            const response = await fetch(`/api/db/moto?modelo=${selectedModelo1}&ano=${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados da moto: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            const motoId = data.id;
            setMoto1Id(motoId);
            if (motoId) {
                await loadMotoFotos(motoId, setMoto1Fotos);
            }
            
            delete data.id;
            setSelectedMoto1(data);
        } catch (error) {
            console.error('Erro ao carregar dados da moto:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar dados da moto selecionada');
        }
    };

    const handleChangeAno2 = async (event) => {
        try {
            const response = await fetch(`/api/db/moto?modelo=${selectedModelo2}&ano=${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados da moto: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            const motoId = data.id;
            setMoto2Id(motoId);
            if (motoId) {
                await loadMotoFotos(motoId, setMoto2Fotos);
            }
            
            delete data.id;
            setSelectedMoto2(data);
        } catch (error) {
            console.error('Erro ao carregar dados da moto:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar dados da moto selecionada');
        }
    };

    const handleChangeAno3 = async (event) => {
        try {
            const response = await fetch(`/api/db/moto?modelo=${selectedModelo3}&ano=${event.target.value}`);
            
            if (!response.ok) {
                throw new Error(`Erro ao carregar dados da moto: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            const motoId = data.id;
            setMoto3Id(motoId);
            if (motoId) {
                await loadMotoFotos(motoId, setMoto3Fotos);
            }
            
            delete data.id;
            setSelectedMoto3(data);
        } catch (error) {
            console.error('Erro ao carregar dados da moto:', error);
            setHasError(true);
            setErrorMessage('Erro ao carregar dados da moto selecionada');
        }
    };

    // Componente de Loading
    const LoadingComponent = () => (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Carregando dados do comparador...</p>
        </div>
    );

    // Componente de Erro
    const ErrorComponent = () => (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Ops! Algo deu errado</h2>
            <p className="error-message">{errorMessage}</p>
            <p className="error-description">
                Não foi possível conectar com o banco de dados. Isso pode acontecer devido a:
            </p>
            <ul className="error-list">
                <li>Problemas de conexão com a internet</li>
                <li>Servidor temporariamente indisponível</li>
                <li>Manutenção em andamento</li>
            </ul>
            <div className="error-actions">
                <button onClick={handleRetry} className="retry-button">
                    🔄 Tentar Novamente
                </button>
                <p className="retry-info">
                    Tentativa {retryCount + 1} de reconexão
                </p>
            </div>
        </div>
    );

    return (
        <div className="comparador-container">
            <h1>Comparador de Motos</h1>
            
            {/* Loading State */}
            {isLoading && <LoadingComponent />}
            
            {/* Error State */}
            {hasError && <ErrorComponent />}
            
            {/* Normal State - Selectors */}
            {!isLoading && !hasError && (
                <>
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
                        <div className="moto-label-spacer"></div>
                        <div className="moto-names-values">
                            <div className="moto-name-wrapper">
                                <div className="moto-medal-spacer"></div>
                                <div className="moto-name">
                                    {selectedMoto1['Especificacoes']['Marca']} {selectedMoto1['Especificacoes']['Modelo']} - {selectedMoto1['Especificacoes']['Ano']}
                                </div>
                            </div>
                            <div className="moto-name-wrapper">
                                <div className="moto-medal-spacer"></div>
                                <div className="moto-name">
                                    {selectedMoto2['Especificacoes']['Marca']} {selectedMoto2['Especificacoes']['Modelo']} - {selectedMoto2['Especificacoes']['Ano']}
                                </div>
                            </div>
                            {selectedMoto3 && (
                                <div className="moto-name-wrapper">
                                    <div className="moto-medal-spacer"></div>
                                    <div className="moto-name">
                                        {selectedMoto3['Especificacoes']['Marca']} {selectedMoto3['Especificacoes']['Modelo']} - {selectedMoto3['Especificacoes']['Ano']}
                                    </div>
                                </div>
                            )}
                        </div>
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
                    
                    {/* Seção de Fotos */}
                    {(moto1Fotos.length > 0 || moto2Fotos.length > 0 || moto3Fotos.length > 0) && (
                        <div className="motos-fotos-section" style={{ marginTop: '40px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <h2 style={{ marginBottom: '20px', color: '#333', textAlign: 'center' }}>Fotos das Motos</h2>
                            
                            {/* Cabeçalhos das Motos */}
                            <div className="motos-fotos-header" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px', marginBottom: '20px' }}>
                                {selectedMoto1 && (
                                    <h3 style={{ margin: 0, color: '#d53829', textAlign: 'center' }}>
                                        {selectedMoto1['Especificacoes']['Marca']} {selectedMoto1['Especificacoes']['Modelo']}
                                    </h3>
                                )}
                                {selectedMoto2 && (
                                    <h3 style={{ margin: 0, color: '#d53829', textAlign: 'center' }}>
                                        {selectedMoto2['Especificacoes']['Marca']} {selectedMoto2['Especificacoes']['Modelo']}
                                    </h3>
                                )}
                                {selectedMoto3 && (
                                    <h3 style={{ margin: 0, color: '#d53829', textAlign: 'center' }}>
                                        {selectedMoto3['Especificacoes']['Marca']} {selectedMoto3['Especificacoes']['Modelo']}
                                    </h3>
                                )}
                            </div>

                            {/* Grid de Fotos - Organizado por Linhas */}
                            <div className="fotos-grid-comparison" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Linha 1 */}
                                <div className="fotos-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px' }}>
                                    {selectedMoto1 && (
                                        <div className="foto-container">
                                            {moto1Fotos[0] ? (
                                                <Image
                                                    src={moto1Fotos[0]}
                                                    alt={`Foto 1 - ${selectedMoto1['Especificacoes']['Modelo']}`}
                                                    width={427}
                                                    height={320}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="foto-placeholder" style={{
                                                    width: '427px',
                                                    height: '320px',
                                                    borderRadius: '8px'
                                                }}></div>
                                            )}
                                        </div>
                                    )}
                                    {selectedMoto2 && (
                                        <div className="foto-container">
                                            {moto2Fotos[0] ? (
                                                <Image
                                                    src={moto2Fotos[0]}
                                                    alt={`Foto 1 - ${selectedMoto2['Especificacoes']['Modelo']}`}
                                                    width={427}
                                                    height={320}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="foto-placeholder" style={{
                                                    width: '427px',
                                                    height: '320px',
                                                    borderRadius: '8px'
                                                }}></div>
                                            )}
                                        </div>
                                    )}
                                    {selectedMoto3 && (
                                        <div className="foto-container">
                                            {moto3Fotos[0] ? (
                                                <Image
                                                    src={moto3Fotos[0]}
                                                    alt={`Foto 1 - ${selectedMoto3['Especificacoes']['Modelo']}`}
                                                    width={427}
                                                    height={320}
                                                    style={{
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="foto-placeholder" style={{
                                                    width: '427px',
                                                    height: '320px',
                                                    borderRadius: '8px'
                                                }}></div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Linha 2 */}
                                {(moto1Fotos.length > 1 || moto2Fotos.length > 1 || moto3Fotos.length > 1) && (
                                    <div className="fotos-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px' }}>
                                        {selectedMoto1 && (
                                            <div className="foto-container">
                                                {moto1Fotos[1] ? (
                                                    <Image
                                                        src={moto1Fotos[1]}
                                                        alt={`Foto 2 - ${selectedMoto1['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                        {selectedMoto2 && (
                                            <div className="foto-container">
                                                {moto2Fotos[1] ? (
                                                    <Image
                                                        src={moto2Fotos[1]}
                                                        alt={`Foto 2 - ${selectedMoto2['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                        {selectedMoto3 && (
                                            <div className="foto-container">
                                                {moto3Fotos[1] ? (
                                                    <Image
                                                        src={moto3Fotos[1]}
                                                        alt={`Foto 2 - ${selectedMoto3['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Linha 3 */}
                                {(moto1Fotos.length > 2 || moto2Fotos.length > 2 || moto3Fotos.length > 2) && (
                                    <div className="fotos-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px' }}>
                                        {selectedMoto1 && (
                                            <div className="foto-container">
                                                {moto1Fotos[2] ? (
                                                    <Image
                                                        src={moto1Fotos[2]}
                                                        alt={`Foto 3 - ${selectedMoto1['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                        {selectedMoto2 && (
                                            <div className="foto-container">
                                                {moto2Fotos[2] ? (
                                                    <Image
                                                        src={moto2Fotos[2]}
                                                        alt={`Foto 3 - ${selectedMoto2['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                        {selectedMoto3 && (
                                            <div className="foto-container">
                                                {moto3Fotos[2] ? (
                                                    <Image
                                                        src={moto3Fotos[2]}
                                                        alt={`Foto 3 - ${selectedMoto3['Especificacoes']['Modelo']}`}
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
                                                ) : (
                                                    <div className="foto-placeholder" style={{
                                                        width: '427px',
                                                        height: '320px',
                                                        borderRadius: '8px'
                                                    }}></div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                )}
                </>
            )}
        </div>
    );
}

function Comparador() {
    return (
        <Suspense fallback={
            <div className="comparador-container">
                <h1>Comparador de Motos</h1>
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <p>Carregando comparador...</p>
                </div>
            </div>
        }>
            <ComparadorContent />
        </Suspense>
    );
}

export default Comparador;