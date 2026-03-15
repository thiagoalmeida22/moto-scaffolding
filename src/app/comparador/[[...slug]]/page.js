'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { sortAlphabetically } from '@/utils/valueHelpers.js';
import { motoSlug } from '@/utils/slug';
import AdSidebar from '@/components/AdSidebar';
import '../style.css';
import ComparisonBlock from '../components/ComparisonBlock';
import SearchableModeloSelect from '../components/SearchableModeloSelect';

const VS_SEP = '-vs-';

function buildComparadorSlug(marcas, marcaId, modelo, ano) {
    if (!marcaId || !modelo || !ano || !marcas.length) return null;
    const marcaNome = marcas.find((m) => String(m.id) === String(marcaId))?.nome;
    return marcaNome ? motoSlug(marcaNome, modelo, ano) : null;
}

function ComparadorContent() {
    const searchParams = useSearchParams();
    const params = useParams();
    const router = useRouter();
    const slugParam = params?.slug;
    const slugStr = Array.isArray(slugParam) ? slugParam.join('/') : (slugParam || '');
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
    
    const [selectedMarca1, setSelectedMarca1] = useState('');
    const [selectedAno1, setSelectedAno1] = useState('');
    const [selectedMarca2, setSelectedMarca2] = useState('');
    const [selectedAno2, setSelectedAno2] = useState('');
    const [selectedMarca3, setSelectedMarca3] = useState('');
    const [selectedAno3, setSelectedAno3] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    
    const [moto1Fotos, setMoto1Fotos] = useState([]);
    const [moto2Fotos, setMoto2Fotos] = useState([]);
    const [moto3Fotos, setMoto3Fotos] = useState([]);
    const [moto1Id, setMoto1Id] = useState(null);
    const [moto2Id, setMoto2Id] = useState(null);
    const [moto3Id, setMoto3Id] = useState(null);

    const loadMotoFotos = async (motoId, setter) => {
        if (!motoId) { setter([]); return; }
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
            } else setter([]);
        } catch (error) { setter([]); }
    };

    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                setIsLoading(true);
                setHasError(false);
                const response = await fetch('/api/db/marca');
                if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                if (!Array.isArray(data)) throw new Error('Formato inválido');
                setMarcas(sortAlphabetically(data, 'nome'));
                const marcaParam = searchParams.get('marca');
                const modeloParam = searchParams.get('modelo');
                const anoParam = searchParams.get('ano');
                if (marcaParam && modeloParam && anoParam) {
                    carregarMotoDaPaginaMotos({ marca: marcaParam, modelo: modeloParam, ano: anoParam }, data);
                }
            } catch (error) {
                setHasError(true);
                setErrorMessage(error.message || 'Erro de conexão');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarcas();
    }, [searchParams]);

    useEffect(() => {
        if (!slugStr || !marcas.length) return;
        const motoSlugs = slugStr.split(VS_SEP).filter(Boolean);
        if (motoSlugs.length < 1) return;

        const loadFromSlug = async () => {
            try {
                const motosData = [];
                for (const s of motoSlugs.slice(0, 3)) {
                    const res = await fetch(`/api/db/moto/by-slug-full?slug=${encodeURIComponent(s.trim())}`);
                    const data = await res.json();
                    if (!res.ok) return;
                    motosData.push(data);
                }
                if (motosData.length >= 1) {
                    const applyMoto = async (motoData, idx) => {
                        const esp = motoData.Especificacoes;
                        const marcaId = motoData.marcaId;
                        if (idx === 0) {
                            setSelectedMarca1(String(marcaId));
                            const resM = await fetch(`/api/db/marca/${marcaId}`);
                            const mods = await resM.json();
                            setModelos1(Array.isArray(mods) ? mods.sort((a, b) => a.modelo.localeCompare(b.modelo)) : mods);
                            setSelectedModelo1(esp.Modelo);
                            const resA = await fetch(`/api/db/modelo/${encodeURIComponent(esp.Modelo)}`);
                            setAnos1(await resA.json());
                            setSelectedAno1(String(esp.Ano));
                            setSelectedMoto1(motoData);
                            setMoto1Id(motoData.id);
                            if (motoData.id) loadMotoFotos(motoData.id, setMoto1Fotos);
                        } else if (idx === 1) {
                            setSelectedMarca2(String(marcaId));
                            const resM = await fetch(`/api/db/marca/${marcaId}`);
                            const mods = await resM.json();
                            setModelos2(Array.isArray(mods) ? mods.sort((a, b) => a.modelo.localeCompare(b.modelo)) : mods);
                            setSelectedModelo2(esp.Modelo);
                            const resA = await fetch(`/api/db/modelo/${encodeURIComponent(esp.Modelo)}`);
                            setAnos2(await resA.json());
                            setSelectedAno2(String(esp.Ano));
                            setSelectedMoto2(motoData);
                            setMoto2Id(motoData.id);
                            if (motoData.id) loadMotoFotos(motoData.id, setMoto2Fotos);
                        } else if (idx === 2) {
                            setSelectedMarca3(String(marcaId));
                            const resM = await fetch(`/api/db/marca/${marcaId}`);
                            const mods = await resM.json();
                            setModelos3(Array.isArray(mods) ? mods.sort((a, b) => a.modelo.localeCompare(b.modelo)) : mods);
                            setSelectedModelo3(esp.Modelo);
                            const resA = await fetch(`/api/db/modelo/${encodeURIComponent(esp.Modelo)}`);
                            setAnos3(await resA.json());
                            setSelectedAno3(String(esp.Ano));
                            setSelectedMoto3(motoData);
                            setMoto3Id(motoData.id);
                            if (motoData.id) loadMotoFotos(motoData.id, setMoto3Fotos);
                        }
                    };
                    for (let i = 0; i < motosData.length; i++) await applyMoto(motosData[i], i);
                }
            } catch (err) { console.error('Erro ao carregar comparador do slug:', err); }
        };
        loadFromSlug();
    }, [slugStr, marcas.length]);

    // Redirecionar para URL com slug quando moto1 e moto2 forem selecionados (sem carregar dados da moto na base)
    useEffect(() => {
        if (!marcas.length) return;
        const s1 = buildComparadorSlug(marcas, selectedMarca1, selectedModelo1, selectedAno1);
        const s2 = buildComparadorSlug(marcas, selectedMarca2, selectedModelo2, selectedAno2);
        if (!s1 || !s2) return;
        let newUrl = `/comparador/${s1}${VS_SEP}${s2}`;
        const s3 = buildComparadorSlug(marcas, selectedMarca3, selectedModelo3, selectedAno3);
        if (s3) newUrl += `${VS_SEP}${s3}`;
        const currentPath = slugStr ? `/comparador/${slugStr}` : '/comparador';
        if (newUrl !== currentPath) router.replace(newUrl);
    }, [marcas, selectedMarca1, selectedModelo1, selectedAno1, selectedMarca2, selectedModelo2, selectedAno2, selectedMarca3, selectedModelo3, selectedAno3, slugStr, router]);

    const carregarMotoDaPaginaMotos = async (motoParams, marcasData) => {
        try {
            const marcaEncontrada = marcasData.find(m => m.id === parseInt(motoParams.marca));
            if (marcaEncontrada) {
                setSelectedMarca1(String(marcaEncontrada.id));
                const resM = await fetch(`/api/db/marca/${marcaEncontrada.id}`);
                const mods = await resM.json();
                setModelos1(Array.isArray(mods) ? mods.sort((a, b) => a.modelo.localeCompare(b.modelo)) : mods);
                setSelectedModelo1(motoParams.modelo);
                const resA = await fetch(`/api/db/modelo/${encodeURIComponent(motoParams.modelo)}`);
                setAnos1(await resA.json());
                setSelectedAno1(motoParams.ano);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        setNumSelectedMotos(selectedMoto1 && selectedMoto2 && selectedMoto3 ? 3 : selectedMoto1 && selectedMoto2 ? 2 : 0);
    }, [selectedMoto1, selectedMoto2, selectedMoto3]);

    useEffect(() => { if (moto1Id) loadMotoFotos(moto1Id, setMoto1Fotos); }, [moto1Id]);
    useEffect(() => { if (moto2Id) loadMotoFotos(moto2Id, setMoto2Fotos); }, [moto2Id]);
    useEffect(() => { if (moto3Id) loadMotoFotos(moto3Id, setMoto3Fotos); }, [moto3Id]);

    const handleChangeMarca1 = async (e) => {
        const v = e.target.value;
        setSelectedMarca1(v);
        if (!v) { setModelos1(null); setSelectedModelo1(null); setSelectedAno1(''); setAnos1(null); setSelectedMoto1(null); setHasError(false); return; }
        try {
            const res = await fetch(`/api/db/marca/${v}`);
            const data = await res.json();
            setModelos1(Array.isArray(data) ? data.sort((a, b) => a.modelo.localeCompare(b.modelo)) : data);
            setSelectedModelo1(null); setSelectedAno1(''); setSelectedMoto1(null);
        } catch (err) { setHasError(true); setErrorMessage('Erro ao carregar modelos'); }
    };

    const handleChangeMarca2 = async (e) => {
        const v = e.target.value;
        setSelectedMarca2(v);
        if (!v) { setModelos2(null); setSelectedModelo2(null); setAnos2(null); setSelectedAno2(''); setSelectedMoto2(null); setHasError(false); return; }
        try {
            const res = await fetch(`/api/db/marca/${v}`);
            const data = await res.json();
            setModelos2(Array.isArray(data) ? data.sort((a, b) => a.modelo.localeCompare(b.modelo)) : data);
            setSelectedModelo2(null); setSelectedMoto2(null);
        } catch (err) { setHasError(true); setErrorMessage('Erro ao carregar modelos'); }
    };

    const handleChangeMarca3 = async (e) => {
        const v = e.target.value;
        setSelectedMarca3(v);
        if (!v) { setModelos3(null); setSelectedModelo3(null); setAnos3(null); setSelectedAno3(''); setSelectedMoto3(null); setHasError(false); return; }
        try {
            const res = await fetch(`/api/db/marca/${v}`);
            const data = await res.json();
            setModelos3(Array.isArray(data) ? data.sort((a, b) => a.modelo.localeCompare(b.modelo)) : data);
            setSelectedModelo3(null); setSelectedMoto3(null);
        } catch (err) { setHasError(true); setErrorMessage('Erro ao carregar modelos'); }
    };

    const handleChangeModelo1 = async (e) => {
        try {
            const m = modelos1?.find(x => x.modelo === e.target.value)?.modelo;
            setSelectedModelo1(m);
            const res = await fetch(`/api/db/modelo/${encodeURIComponent(e.target.value)}`);
            const data = await res.json();
            setAnos1(data); setSelectedAno1(''); setSelectedMoto1(null);
        } catch (err) { setHasError(true); }
    };

    const handleChangeModelo2 = async (e) => {
        try {
            const m = modelos2?.find(x => x.modelo === e.target.value)?.modelo;
            setSelectedModelo2(m);
            const res = await fetch(`/api/db/modelo/${encodeURIComponent(e.target.value)}`);
            const data = await res.json();
            setAnos2(data); setSelectedAno2(''); setSelectedMoto2(null);
        } catch (err) { setHasError(true); }
    };

    const handleChangeModelo3 = async (e) => {
        try {
            const m = modelos3?.find(x => x.modelo === e.target.value)?.modelo;
            setSelectedModelo3(m);
            const res = await fetch(`/api/db/modelo/${encodeURIComponent(e.target.value)}`);
            const data = await res.json();
            setAnos3(data); setSelectedAno3(''); setSelectedMoto3(null);
        } catch (err) { setHasError(true); }
    };

    const handleChangeAno1 = (e) => {
        const v = e.target.value;
        setSelectedAno1(v);
        if (!v) { setSelectedMoto1(null); setMoto1Id(null); setMoto1Fotos([]); setHasError(false); }
    };

    const handleChangeAno2 = (e) => {
        const v = e.target.value;
        setSelectedAno2(v);
        if (!v) { setSelectedMoto2(null); setMoto2Id(null); setMoto2Fotos([]); setHasError(false); }
    };

    const handleChangeAno3 = (e) => {
        const v = e.target.value;
        setSelectedAno3(v);
        if (!v) { setSelectedMoto3(null); setMoto3Id(null); setMoto3Fotos([]); setHasError(false); }
    };

    return (
        <div className="comparador-container">
            <h1>Comparador de Motos</h1>
            {isLoading && <div className="loading-container"><div className="loading-spinner"></div><p>Carregando dados do comparador...</p></div>}
            {hasError && <div className="error-container"><p>{errorMessage}</p><button onClick={() => window.location.reload()}>Tentar Novamente</button></div>}
            {!isLoading && !hasError && (
                <>
                <div className="selectors">
                <div className="selector-group"><h4>Moto 1</h4>
                    <label htmlFor="marca1">Marca:</label>
                    <select id="marca1" value={selectedMarca1} onChange={handleChangeMarca1}>
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                    <label htmlFor="modelo1">Modelo:</label>
                    <SearchableModeloSelect id="modelo1" labelId="modelo1" modelos={modelos1 || []} value={selectedModelo1 || ''} onChange={handleChangeModelo1} disabled={!modelos1} placeholder="Digite para buscar..." />
                    <label htmlFor="ano1">Ano:</label>
                    <select id="ano1" value={selectedAno1} onChange={handleChangeAno1} disabled={!anos1}>
                        <option value="">Selecione um ano</option>
                        {anos1?.map(a => <option key={a.ano} value={a.ano}>{a.ano}</option>)}
                    </select>
                </div>
                <div className="selector-group"><h4>Moto 2</h4>
                    <label htmlFor="marca2">Marca:</label>
                    <select id="marca2" value={selectedMarca2} onChange={handleChangeMarca2}>
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                    <label htmlFor="modelo2">Modelo:</label>
                    <SearchableModeloSelect id="modelo2" labelId="modelo2" modelos={modelos2 || []} value={selectedModelo2 || ''} onChange={handleChangeModelo2} disabled={!modelos2} placeholder="Digite para buscar..." />
                    <label htmlFor="ano2">Ano:</label>
                    <select id="ano2" value={selectedAno2} onChange={handleChangeAno2} disabled={!anos2}>
                        <option value="">Selecione um ano</option>
                        {anos2?.map(a => <option key={a.ano} value={a.ano}>{a.ano}</option>)}
                    </select>
                </div>
                <div className="selector-group"><h4>Moto 3 (Opcional)</h4>
                    <label htmlFor="marca3">Marca:</label>
                    <select id="marca3" value={selectedMarca3} onChange={handleChangeMarca3}>
                        <option value="">Selecione uma marca</option>
                        {marcas?.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                    <label htmlFor="modelo3">Modelo:</label>
                    <SearchableModeloSelect id="modelo3" labelId="modelo3" modelos={modelos3 || []} value={selectedModelo3 || ''} onChange={handleChangeModelo3} disabled={!modelos3} placeholder="Digite para buscar..." />
                    <label htmlFor="ano3">Ano:</label>
                    <select id="ano3" value={selectedAno3} onChange={handleChangeAno3} disabled={!anos3}>
                        <option value="">Selecione um ano</option>
                        {anos3?.map(a => <option key={a.ano} value={a.ano}>{a.ano}</option>)}
                    </select>
                </div>
            </div>
                {selectedMoto1 && selectedMoto2 && (
                <div className="comparison-display-wrapper">
                    <div className="ad-sidebar-left"><AdSidebar /></div>
                    <div className="comparison-display">
                    {(() => {
                        const nomes = [
                            `${selectedMoto1.Especificacoes.Marca} ${selectedMoto1.Especificacoes.Modelo} ${selectedMoto1.Especificacoes.Ano}`,
                            `${selectedMoto2.Especificacoes.Marca} ${selectedMoto2.Especificacoes.Modelo} ${selectedMoto2.Especificacoes.Ano}`,
                            ...(selectedMoto3 ? [`${selectedMoto3.Especificacoes.Marca} ${selectedMoto3.Especificacoes.Modelo} ${selectedMoto3.Especificacoes.Ano}`] : []),
                        ];
                        const tituloVs = nomes.join(' vs ');
                        const introTexto = nomes.length === 2
                            ? `Compare as especificações da ${nomes[0]} com a ${nomes[1]} e veja lado a lado motor, transmissão, consumo e mais.`
                            : `Compare as especificações ${nomes.slice(0, -1).map(n => `da ${n}`).join(', ')} e da ${nomes[nomes.length - 1]} e veja lado a lado motor, transmissão, consumo e mais.`;
                        return (
                            <div className="comparador-intro">
                                <h2 className="comparador-titulo-vs">{tituloVs}</h2>
                                <p>{introTexto}</p>
                            </div>
                        );
                    })()}
                    <div className="moto-names">
                        <div className="moto-label-spacer"></div>
                        <div className="moto-names-values">
                            <div className="moto-name-wrapper"><div className="moto-medal-spacer"></div><div className="moto-name">{selectedMoto1.Especificacoes.Marca} {selectedMoto1.Especificacoes.Modelo} - {selectedMoto1.Especificacoes.Ano}</div></div>
                            <div className="moto-name-wrapper"><div className="moto-medal-spacer"></div><div className="moto-name">{selectedMoto2.Especificacoes.Marca} {selectedMoto2.Especificacoes.Modelo} - {selectedMoto2.Especificacoes.Ano}</div></div>
                            {selectedMoto3 && <div className="moto-name-wrapper"><div className="moto-medal-spacer"></div><div className="moto-name">{selectedMoto3.Especificacoes.Marca} {selectedMoto3.Especificacoes.Modelo} - {selectedMoto3.Especificacoes.Ano}</div></div>}
                        </div>
                    </div>
                    <h2 className="comparador-specs-title">Especificações técnicas</h2>
                    <div className="comparison-row-container">
                        <ComparisonBlock title="Especificacoes" data1={selectedMoto1.Especificacoes} data2={selectedMoto2.Especificacoes} data3={selectedMoto3?.Especificacoes} numSelectedMotos={numSelectedMotos} maxRows={6} />
                        <ComparisonBlock title="Motor" data1={selectedMoto1.Motor} data2={selectedMoto2.Motor} data3={selectedMoto3?.Motor} numSelectedMotos={numSelectedMotos} maxRows={9} />
                    </div>
                    <div className="comparison-row-container">
                        <ComparisonBlock title="Transmissão" data1={selectedMoto1.Transmissão} data2={selectedMoto2.Transmissão} data3={selectedMoto3?.Transmissão} numSelectedMotos={numSelectedMotos} maxRows={6} />
                        <ComparisonBlock title="Suspensão" data1={selectedMoto1.Suspensão} data2={selectedMoto2.Suspensão} data3={selectedMoto3?.Suspensão} numSelectedMotos={numSelectedMotos} maxRows={6} />
                    </div>
                    <div className="comparison-row-container">
                        <ComparisonBlock title="Freio" data1={selectedMoto1.Freio} data2={selectedMoto2.Freio} data3={selectedMoto3?.Freio} numSelectedMotos={numSelectedMotos} maxRows={6} />
                        <ComparisonBlock title="Pneu" data1={selectedMoto1.Pneu} data2={selectedMoto2.Pneu} data3={selectedMoto3?.Pneu} numSelectedMotos={numSelectedMotos} maxRows={6} />
                    </div>
                    <div className="comparison-row-container">
                        <ComparisonBlock title="Dimensoes" data1={selectedMoto1.Dimensoes} data2={selectedMoto2.Dimensoes} data3={selectedMoto3?.Dimensoes} numSelectedMotos={numSelectedMotos} maxRows={8} />
                        <ComparisonBlock title="Desempenho" data1={selectedMoto1.Desempenho} data2={selectedMoto2.Desempenho} data3={selectedMoto3?.Desempenho} numSelectedMotos={numSelectedMotos} maxRows={8} />
                    </div>
                    <div className="comparison-row-container">
                        <ComparisonBlock title="Combustível" data1={selectedMoto1.Combustível} data2={selectedMoto2.Combustível} data3={selectedMoto3?.Combustível} numSelectedMotos={numSelectedMotos} maxRows={6} />
                        <ComparisonBlock title="Extras" data1={selectedMoto1.Extras} data2={selectedMoto2.Extras} data3={selectedMoto3?.Extras} numSelectedMotos={numSelectedMotos} maxRows={6} />
                    </div>
                    {(moto1Fotos.length > 0 || moto2Fotos.length > 0 || moto3Fotos.length > 0) && (
                        <div className="motos-fotos-section motos-fotos-comparador">
                            <h2 className="motos-fotos-section-title">Fotos das Motos</h2>
                            <div className="motos-fotos-desktop">
                                <div className="motos-fotos-header" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px', marginBottom: '20px' }}>
                                    {selectedMoto1 && <h3 className="moto-foto-header-name">{selectedMoto1.Especificacoes.Marca} {selectedMoto1.Especificacoes.Modelo}</h3>}
                                    {selectedMoto2 && <h3 className="moto-foto-header-name">{selectedMoto2.Especificacoes.Marca} {selectedMoto2.Especificacoes.Modelo}</h3>}
                                    {selectedMoto3 && <h3 className="moto-foto-header-name">{selectedMoto3.Especificacoes.Marca} {selectedMoto3.Especificacoes.Modelo}</h3>}
                                </div>
                                <div className="fotos-row fotos-row-desktop" style={{ display: 'grid', gridTemplateColumns: `repeat(${numSelectedMotos}, 1fr)`, gap: '20px' }}>
                                    {selectedMoto1 && <div className="foto-container">{moto1Fotos[0] ? <Image src={moto1Fotos[0]} alt={`Foto 1 - ${selectedMoto1.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /> : <div className="foto-placeholder"></div>}</div>}
                                    {selectedMoto2 && <div className="foto-container">{moto2Fotos[0] ? <Image src={moto2Fotos[0]} alt={`Foto 1 - ${selectedMoto2.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /> : <div className="foto-placeholder"></div>}</div>}
                                    {selectedMoto3 && <div className="foto-container">{moto3Fotos[0] ? <Image src={moto3Fotos[0]} alt={`Foto 1 - ${selectedMoto3.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /> : <div className="foto-placeholder"></div>}</div>}
                                </div>
                            </div>
                            <div className="motos-fotos-mobile">
                                {selectedMoto1 && (
                                    <div className="moto-fotos-block">
                                        <h3 className="moto-fotos-block-name">{selectedMoto1.Especificacoes.Marca} {selectedMoto1.Especificacoes.Modelo}</h3>
                                        <div className="moto-fotos-sequencia">
                                            {[0, 1, 2].map((i) => moto1Fotos[i] ? (
                                                <div key={i} className="foto-container"><Image src={moto1Fotos[i]} alt={`Foto ${i + 1} - ${selectedMoto1.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /></div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}
                                {selectedMoto2 && (
                                    <div className="moto-fotos-block">
                                        <h3 className="moto-fotos-block-name">{selectedMoto2.Especificacoes.Marca} {selectedMoto2.Especificacoes.Modelo}</h3>
                                        <div className="moto-fotos-sequencia">
                                            {[0, 1, 2].map((i) => moto2Fotos[i] ? (
                                                <div key={i} className="foto-container"><Image src={moto2Fotos[i]} alt={`Foto ${i + 1} - ${selectedMoto2.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /></div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}
                                {selectedMoto3 && (
                                    <div className="moto-fotos-block">
                                        <h3 className="moto-fotos-block-name">{selectedMoto3.Especificacoes.Marca} {selectedMoto3.Especificacoes.Modelo}</h3>
                                        <div className="moto-fotos-sequencia">
                                            {[0, 1, 2].map((i) => moto3Fotos[i] ? (
                                                <div key={i} className="foto-container"><Image src={moto3Fotos[i]} alt={`Foto ${i + 1} - ${selectedMoto3.Especificacoes.Modelo}`} width={427} height={320} style={{ objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} unoptimized /></div>
                                            ) : null)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    </div>
                    <div className="ad-sidebar-right"><AdSidebar /></div>
                </div>
                )}
                </>
            )}
        </div>
    );
}

export default function Comparador() {
    return (
        <Suspense fallback={<div className="comparador-container"><h1>Comparador de Motos</h1><p style={{ padding: '60px 20px', textAlign: 'center' }}>Carregando comparador...</p></div>}>
            <ComparadorContent />
        </Suspense>
    );
}
