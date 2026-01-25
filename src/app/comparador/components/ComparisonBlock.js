import React from 'react';
import Image from 'next/image';
import MotoSpecValue from './MotoSpecValue';

// Função auxiliar para extrair número de uma string (ex: "16 cv a 8500 rpm" -> 16)
const extractNumber = (str, pattern) => {
    if (!str || typeof str !== 'string') return null;
    const match = str.match(pattern);
    return match ? parseFloat(match[1].replace(',', '.')) : null;
};

// Objeto de callbacks para ordenação
const comparisonCallbacks = {
    // Especificacoes
    'Modelo': null,
    'Marca': null,
    'Ano': (...args) => {
        const values = args.filter(v => v != null).map(v => parseInt(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Categoria': null,
    'Preço Fipe': (...args) => {
        const values = args.filter(v => v != null).map(v => {
            const num = typeof v === 'string' ? parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.')) : parseFloat(v);
            return isNaN(num) ? 0 : num;
        });
        return values.sort((a, b) => a - b); // Crescente
    },
    
    // Motor
    'Tipo': null,
    'Cilindrada': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Potencia (Gasolina)': (...args) => {
        const values = args.filter(v => v != null).map(v => {
            const num = extractNumber(v, /([\d,]+)\s*cv/i);
            return num || 0;
        });
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Potencia (Alcool)': (...args) => {
        const values = args.filter(v => v != null).map(v => {
            const num = extractNumber(v, /([\d,]+)\s*cv/i);
            return num || 0;
        });
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Torque (Gasolina)': (...args) => {
        const values = args.filter(v => v != null).map(v => {
            const num = extractNumber(v, /([\d,]+)\s*kgf\.m/i);
            return num || 0;
        });
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Torque (Alcool)': null,
    'Partida': null,
    'Refrigeração': null,
    
    // Transmissão
    'Cambio': null,
    'Embreagem': null,
    
    // Suspensão
    'Dianteira': null,
    'Traseira': null,
    
    // Freio
    'Tipo': null,
    'Dianteiro': null,
    'Traseiro': null,
    
    // Pneu
    'Dianteiro': null,
    'Traseiro': null,
    
    // Dimensoes
    'Tipo de Chassi': null,
    'Altura do Assento': null,
    'Altura': null,
    'Comprimento': null,
    'Largura': null,
    'Distância entre Eixos': null,
    'Peso': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => a - b); // Crescente
    },
    'Capacidade de Carga': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    
    // Desempenho
    'Velocidade Máx. (Aprox. Painel)': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Aceleração 0-100': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => a - b); // Crescente
    },
    
    // Combustível
    'Tipo': null,
    'Consumo (Gasolina)': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Consumo (Alcool)': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Autonomia (Gasolina)': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Autonomia (Alcool)': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
    'Tanque': (...args) => {
        const values = args.filter(v => v != null).map(v => parseFloat(v) || 0);
        return values.sort((a, b) => b - a); // Decrescente
    },
};

// Função para calcular ranking com empates
const calculateRanking = (sortedValues, originalValues) => {
    const ranking = {};
    const processedIndices = new Set();
    let currentRank = 1;
    
    // Função auxiliar para comparar valores (considerando null)
    const valuesEqual = (a, b) => {
        if (a === null && b === null) return true;
        if (a === null || b === null) return false;
        return Math.abs(a - b) < 0.0001;
    };
    
    // Processar valores ordenados
    for (let i = 0; i < sortedValues.length; i++) {
        const sortedValue = sortedValues[i];
        
        // Encontrar todos os índices que têm este valor e ainda não foram processados
        const indices = [];
        for (let j = 0; j < originalValues.length; j++) {
            if (!processedIndices.has(j) && valuesEqual(originalValues[j], sortedValue)) {
                indices.push(j);
            }
        }
        
        if (indices.length > 0) {
            // Atribuir o mesmo ranking para valores iguais
            indices.forEach(idx => {
                ranking[idx] = currentRank;
                processedIndices.add(idx);
            });
            
            // Avançar o ranking baseado no número de valores iguais
            currentRank += indices.length;
        }
    }
    
    return ranking;
};

const ComparisonBlock = ({ 
    title, 
    data1, 
    data2, 
    data3, 
    numSelectedMotos, 
    maxRows = 0 
}) => {
    const getComparisonRanking = (key, value1, value2, value3 = null) => {
        const callback = comparisonCallbacks[key];
        
        // Se não há callback, retornar null
        if (!callback) {
            return null;
        }
        
        // Preparar valores para processamento
        const values = [value1, value2];
        if (value3 !== null) {
            values.push(value3);
        }
        
        // Executar callback para obter valores ordenados
        const sortedValues = callback(...values);
        
        if (!sortedValues || sortedValues.length === 0) {
            return null;
        }
        
        // Criar array com valores originais (incluindo nulls)
        const originalValues = values.map(v => {
            if (v == null) return null;
            
            // Aplicar a mesma lógica de extração do callback
            if (key === 'Preço Fipe') {
                const num = typeof v === 'string' ? parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.')) : parseFloat(v);
                return isNaN(num) ? null : num;
            } else if (key === 'Potencia (Gasolina)' || key === 'Potencia (Alcool)') {
                return extractNumber(v, /([\d,]+)\s*cv/i);
            } else if (key === 'Torque (Gasolina)') {
                return extractNumber(v, /([\d,]+)\s*kgf\.m/i);
            } else if (key === 'Ano') {
                return parseInt(v) || null;
            } else {
                return parseFloat(v) || null;
            }
        });
        
        // Calcular ranking
        const ranking = calculateRanking(sortedValues, originalValues);
        
        return ranking;
    };
    
    const getMedalForRank = (rank) => {
        if (rank === null || rank === undefined) return null;
        if (rank === 1) return '/Medal1-removebg-preview.png';
        if (rank === 2) return '/Medal2-removebg-preview.png';
        if (rank === 3) return '/Medal3-removebg-preview.png';
        return null;
    };

    if (!data1 || !data2) return null;
    
    const entries = Object.entries(data1);
    const rows = maxRows > 0 ? entries.slice(0, maxRows) : entries;
    
    return (
        <div className="comparison-block">
            <h3>{title}</h3>
            <div className="comparison-content">
                {rows.map(([key, _value]) => {
                    const value1 = data1[key];
                    const value2 = data2[key];
                    const value3 = data3?.[key];
                    
                    // Função auxiliar para verificar se um valor é vazio (null, undefined ou string vazia)
                    const isEmpty = (val) => val === null || val === undefined || val === '';
                    
                    // Não renderizar se todos os valores forem vazios
                    const allEmpty = isEmpty(value1) && isEmpty(value2) && (value3 === undefined || isEmpty(value3));
                    
                    if (allEmpty) {
                        return null;
                    }
                    
                    const ranking = getComparisonRanking(key, value1, value2, value3);
                    const rank1 = ranking ? ranking[0] : null;
                    const rank2 = ranking ? ranking[1] : null;
                    const rank3 = ranking ? ranking[2] : null;
                    
                    return (
                        <div key={key} className="comparison-row">
                            <span className="comparison-label">{key}:</span>
                            <div className="comparison-values">
                                <div className="comparison-value-wrapper">
                                    {rank1 !== null && getMedalForRank(rank1) ? (
                                        <Image
                                            src={getMedalForRank(rank1)}
                                            alt={`Medalha ${rank1}`}
                                            width={30}
                                            height={30}
                                            style={{ objectFit: 'contain' }}
                                            unoptimized
                                        />
                                    ) : (
                                        <div style={{ width: '30px', height: '30px', flexShrink: 0 }}></div>
                                    )}
                                    <span className={`comparison-value ${isEmpty(value1) ? 'hidden' : ''}`}>
                                        <MotoSpecValue
                                            data={data1}
                                            group={title}
                                            chave={key}
                                        />
                                    </span>
                                </div>
                                <div className="comparison-value-wrapper">
                                    {rank2 !== null && getMedalForRank(rank2) ? (
                                        <Image
                                            src={getMedalForRank(rank2)}
                                            alt={`Medalha ${rank2}`}
                                            width={30}
                                            height={30}
                                            style={{ objectFit: 'contain' }}
                                            unoptimized
                                        />
                                    ) : (
                                        <div style={{ width: '30px', height: '30px', flexShrink: 0 }}></div>
                                    )}
                                    <span className={`comparison-value ${isEmpty(value2) ? 'hidden' : ''}`}>
                                        <MotoSpecValue
                                            data={data2}
                                            group={title}
                                            chave={key}
                                        />
                                    </span>
                                </div>
                                {data3 && (
                                    <div className="comparison-value-wrapper">
                                        {rank3 !== null && getMedalForRank(rank3) ? (
                                            <Image
                                                src={getMedalForRank(rank3)}
                                                alt={`Medalha ${rank3}`}
                                                width={30}
                                                height={30}
                                                style={{ objectFit: 'contain' }}
                                                unoptimized
                                            />
                                        ) : (
                                            <div style={{ width: '30px', height: '30px', flexShrink: 0 }}></div>
                                        )}
                                        <span className={`comparison-value ${isEmpty(value3) ? 'hidden' : ''}`}>
                                            <MotoSpecValue
                                                data={data3}
                                                group={title}
                                                chave={key}
                                            />
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ComparisonBlock;