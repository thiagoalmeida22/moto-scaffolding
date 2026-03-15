'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchableModeloSelect from '../comparador/components/SearchableModeloSelect';
import { sortAlphabetically } from '@/utils/valueHelpers.js';
import { slugify } from '@/utils/slug.js';
import './style.css';

function MotosPage() {
    const router = useRouter();
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [anos, setAnos] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('');
    const [selectedModelo, setSelectedModelo] = useState('');
    const [selectedAno, setSelectedAno] = useState('');

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

    // Redirecionar para a ficha técnica individual assim que marca, modelo e ano forem selecionados
    useEffect(() => {
        if (!selectedMarca || !selectedModelo || !selectedAno || !marcas.length) return;
        const marcaNome = marcas.find((m) => String(m.id) === selectedMarca)?.nome;
        if (marcaNome) {
            const marcaSlug = slugify(marcaNome);
            const modeloSlug = slugify(selectedModelo);
            router.replace(`/motos/${marcaSlug}/${modeloSlug}/${selectedAno}`);
        }
    }, [selectedMarca, selectedModelo, selectedAno, marcas, router]);

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

    const handleMarcaChange = (event) => {
        setSelectedMarca(event.target.value);
    };

    const handleModeloChange = (event) => {
        setSelectedModelo(event.target.value);
    };

    const handleAnoChange = (event) => {
        setSelectedAno(event.target.value);
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
                    <SearchableModeloSelect
                        id="modelo"
                        labelId="modelo"
                        modelos={modelos}
                        value={selectedModelo}
                        onChange={handleModeloChange}
                        disabled={!selectedMarca}
                        placeholder="Digite para buscar..."
                    />
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
            </div>
        </div>
    );
}

export default MotosPage; 