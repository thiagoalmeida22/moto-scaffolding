'use client';

import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown de modelo com busca por texto.
 * Ao digitar, filtra os modelos que contêm a sequência de caracteres (ex: "POR" encontra "SPORT").
 */
const SearchableModeloSelect = ({
    modelos = [],
    value = '',
    onChange,
    disabled = false,
    placeholder = 'Selecione um modelo',
    id = 'modelo',
    labelId = 'modelo',
}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const displayValue = isOpen ? search : (value || '');
    const searchLower = search.toLowerCase().trim();

    const filteredModelos = searchLower
        ? modelos.filter((m) => m.modelo?.toLowerCase().includes(searchLower))
        : modelos;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearch(value || '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    const handleSelect = (modelo) => {
        onChange?.({ target: { value: modelo } });
        setSearch('');
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        setSearch(e.target.value);
        if (!isOpen) setIsOpen(true);
    };

    const handleFocus = () => {
        if (!disabled) {
            setIsOpen(true);
            setSearch(value || '');
        }
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearch(value || '');
        } else if (e.key === 'Enter' && filteredModelos.length === 1) {
            handleSelect(filteredModelos[0].modelo);
        }
    };

    if (disabled) {
        return (
            <div className="searchable-modelo-select" ref={containerRef}>
                <input
                    type="text"
                    id={id}
                    aria-labelledby={labelId}
                    className="searchable-modelo-select__input"
                    value={value || ''}
                    readOnly
                    disabled
                    placeholder={placeholder}
                />
            </div>
        );
    }

    return (
        <div className="searchable-modelo-select" ref={containerRef}>
            <input
                type="text"
                id={id}
                aria-labelledby={labelId}
                aria-expanded={isOpen}
                aria-autocomplete="list"
                role="combobox"
                className="searchable-modelo-select__input"
                value={displayValue}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onKeyDown={handleInputKeyDown}
                placeholder={placeholder}
                autoComplete="off"
            />
            {isOpen && (
                <ul
                    className="searchable-modelo-select__dropdown"
                    role="listbox"
                >
                    {filteredModelos.length === 0 ? (
                        <li className="searchable-modelo-select__option searchable-modelo-select__option--empty">
                            Nenhum modelo encontrado
                        </li>
                    ) : (
                        filteredModelos.map((m) => (
                            <li
                                key={m.modelo}
                                role="option"
                                className="searchable-modelo-select__option"
                                onClick={() => handleSelect(m.modelo)}
                            >
                                {m.modelo}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default SearchableModeloSelect;
