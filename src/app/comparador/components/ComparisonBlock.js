import React from 'react';
import MotoSpecValue from './MotoSpecValue';

const ComparisonBlock = ({ 
    title, 
    data1, 
    data2, 
    data3, 
    numSelectedMotos, 
    maxRows = 0 
}) => {
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

    if (!data1 || !data2) return null;
    
    const entries = Object.entries(data1);
    const rows = maxRows > 0 ? entries.slice(0, maxRows) : entries;
    
    return (
        <div className="comparison-block">
            <h3>{title}</h3>
            <div className="comparison-content">
                {rows.map(([key, _value]) => (
                    <div key={key} className="comparison-row">
                        <span className="comparison-label">{key}:</span>
                        <div className="comparison-values">
                            <span className="comparison-value">
                                <MotoSpecValue
                                    data={data1}
                                    group={title}
                                    chave={key}
                                />
                            </span>
                            {numSelectedMotos >= 2 && (
                                <span className="comparison-arrow">
                                    {getComparisonArrow(
                                        data1[key],
                                        data2[key],
                                        data3?.[key]
                                    )}
                                </span>
                            )}
                            <span className="comparison-value">
                                <MotoSpecValue
                                    data={data2}
                                    group={title}
                                    chave={key}
                                />
                            </span>
                            {data3 && (
                                <span className="comparison-value">
                                    <MotoSpecValue
                                        data={data3}
                                        group={title}
                                        chave={key}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComparisonBlock;