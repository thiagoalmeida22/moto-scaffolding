'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import MotoSpecValue from '@/app/comparador/components/MotoSpecValue';
import { getDisplayLabel } from '@/app/comparador/utils';
import SearchableModeloSelect from '@/app/comparador/components/SearchableModeloSelect';
import { sortAlphabetically } from '@/utils/valueHelpers';
import { slugify, motoSlug } from '@/utils/slug';
import AdSidebar from '@/components/AdSidebar';
import '@/app/motos/style.css';

function MotoFichaPage() {
  const params = useParams();
  const router = useRouter();
  const marcaSlug = params.marca;
  const modeloSlug = params.modelo;
  const ano = params.ano;

  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [selectedMarca, setSelectedMarca] = useState('');
  const [selectedModelo, setSelectedModelo] = useState('');
  const [selectedAno, setSelectedAno] = useState('');
  const [motoData, setMotoData] = useState(null);
  const [motoFotos, setMotoFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!marcaSlug || !modeloSlug || !ano) return;

    const fetchMoto = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/db/moto/by-slug?marca=${encodeURIComponent(marcaSlug)}&modelo=${encodeURIComponent(modeloSlug)}&ano=${encodeURIComponent(ano)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || 'Moto não encontrada');
          setMotoData(null);
          return;
        }

        setMotoData(data);
      } catch (err) {
        console.error(err);
        setError('Erro ao carregar dados da moto');
        setMotoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMoto();
  }, [marcaSlug, modeloSlug, ano]);

  // Preencher selectors e listas quando motoData carregar
  useEffect(() => {
    if (!motoData?.Especificacoes) return;
    setSelectedMarca(String(motoData.marcaId ?? ''));
    setSelectedModelo(motoData.Especificacoes.Modelo ?? '');
    setSelectedAno(String(motoData.Especificacoes.Ano ?? ''));
  }, [motoData]);

  // Fetch marcas (uma vez)
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const res = await fetch('/api/db/marca');
        const data = await res.json();
        setMarcas(sortAlphabetically(data, 'nome'));
      } catch (err) {
        console.error(err);
      }
    };
    fetchMarcas();
  }, []);

  // Fetch modelos quando marca mudar
  useEffect(() => {
    if (selectedMarca) {
      const fetchModelos = async () => {
        try {
          const res = await fetch(`/api/db/marca/${selectedMarca}`);
          const data = await res.json();
          const modelosOrdenados = Array.isArray(data)
            ? data.sort((a, b) => a.modelo.localeCompare(b.modelo))
            : data;
          setModelos(modelosOrdenados ?? []);
        } catch (err) {
          console.error(err);
          setModelos([]);
        }
      };
      fetchModelos();
    } else {
      setModelos([]);
      setSelectedModelo('');
    }
  }, [selectedMarca]);

  // Fetch anos quando modelo mudar
  useEffect(() => {
    if (selectedModelo) {
      const fetchAnos = async () => {
        try {
          const res = await fetch(`/api/db/modelo/${encodeURIComponent(selectedModelo)}`);
          const data = await res.json();
          setAnos(data ?? []);
        } catch (err) {
          console.error(err);
          setAnos([]);
        }
      };
      fetchAnos();
    } else {
      setAnos([]);
      setSelectedAno('');
    }
  }, [selectedModelo]);

  // Redirecionar quando usuário selecionar outro ano-modelo (marca, modelo e ano)
  useEffect(() => {
    if (!selectedMarca || !selectedModelo || !selectedAno || !marcas.length) return;
    const marcaNome = marcas.find((m) => String(m.id) === selectedMarca)?.nome;
    if (!marcaNome) return;
    const newMarcaSlug = slugify(marcaNome);
    const newModeloSlug = slugify(selectedModelo);
    const isDifferent =
      newMarcaSlug !== marcaSlug || newModeloSlug !== modeloSlug || String(selectedAno) !== String(ano);
    if (isDifferent) {
      router.replace(`/motos/${newMarcaSlug}/${newModeloSlug}/${selectedAno}`);
    }
  }, [selectedMarca, selectedModelo, selectedAno, marcas, marcaSlug, modeloSlug, ano, router]);

  useEffect(() => {
    if (!motoData?.id) return;

    const loadFotos = async () => {
      try {
        const res = await fetch(`/api/db/moto-fotos/get?motoId=${motoData.id}`);
        const data = await res.json();
        if (data.success && data.fotos?.length > 0) {
          const fotos = data.fotos.slice(0, 3).map((f) => {
            const path = f.foto_path;
            if (path.startsWith('/api/pictures')) return path;
            if (path.startsWith('/pictures')) return path.replace('/pictures', '/api/pictures');
            if (path.startsWith('pictures/')) return `/api/${path}`;
            return path;
          });
          setMotoFotos(fotos);
        } else {
          setMotoFotos([]);
        }
      } catch {
        setMotoFotos([]);
      }
    };

    loadFotos();
  }, [motoData?.id]);

  // Título e meta description dinâmicos
  useEffect(() => {
    if (motoData?.Especificacoes) {
      const marca = motoData.Especificacoes.Marca ?? '';
      const modelo = motoData.Especificacoes.Modelo ?? '';
      const anoVal = motoData.Especificacoes.Ano ?? ano;
      document.title = `${marca} ${modelo} ${anoVal} - Ficha Técnica - Motoinfo`;

      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const potencia = motoData.Motor?.['Potencia (Gasolina)'] ?? motoData.Motor?.['Potencia (Alcool)'] ?? '';
        const cilindrada = motoData.Motor?.Cilindrada ?? '';
        const consumo = motoData.Combustível?.['Consumo (Gasolina)'] ?? motoData.Combustível?.['Consumo (Alcool)'] ?? '';
        const addUnidade = (val, u) => (val != null && val !== '' ? `${val}${typeof val === 'number' ? u : ''}` : '');
        const partes = [];
        if (potencia) partes.push(addUnidade(potencia, ' cv'));
        if (cilindrada) partes.push(addUnidade(cilindrada, ' cc'));
        if (consumo) partes.push(consumo ? `consumo ${addUnidade(consumo, ' km/l')}`.trim() : '');
        const specsStr = partes.length > 0 ? partes.join(', ') : 'especificações completas';
        metaDesc.setAttribute('content', `Ficha técnica da ${marca} ${modelo} ${anoVal}: ${specsStr}. Confira especificações, preço FIPE e fotos.`.slice(0, 160));
      }
    } else if (!loading && !error) {
      document.title = 'Ficha Técnica de Moto - Motoinfo';
    }
  }, [motoData, ano, loading, error]);

  const isEmpty = (val) => val === null || val === undefined || val === '';

  const renderDataBlock = (title, data, maxRows = 0) => {
    if (!data) return null;
    const entries = Object.entries(data);
    const allRows = maxRows > 0 ? entries.slice(0, maxRows) : entries;
    const rowsToRender = allRows.filter(([, value]) => !isEmpty(value));

    return (
      <div className="data-block">
        <h3>{title}</h3>
        <div className="data-content">
          {rowsToRender.map(([key, value]) => (
            <div key={key} className="data-row">
              <span className="data-label">{getDisplayLabel(key, title)}:</span>
              <span className="data-value">
                <MotoSpecValue data={data} group={title} chave={key} />
              </span>
            </div>
          ))}
          {maxRows > 0 &&
            rowsToRender.length < maxRows &&
            Array.from({ length: maxRows - rowsToRender.length }).map((_, i) => (
              <div key={`empty-${i}`} className="data-row empty">
                <span className="data-label" />
                <span className="data-value" />
              </div>
            ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="motos-container">
        <h1>Especificações da Moto</h1>
        <p style={{ textAlign: 'center', padding: '60px 20px' }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="motos-container">
        <h1>Moto não encontrada</h1>
        <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{error}</p>
        <p style={{ textAlign: 'center' }}>
          <Link href="/motos" style={{ color: '#d53829', textDecoration: 'underline' }}>
            Voltar ao seletor de motos
          </Link>
        </p>
      </div>
    );
  }

  const handleMarcaChange = (e) => {
    setSelectedMarca(e.target.value);
    setSelectedModelo('');
    setSelectedAno('');
  };

  const handleModeloChange = (e) => {
    setSelectedModelo(e.target?.value ?? e);
    setSelectedAno('');
  };

  const handleAnoChange = (e) => {
    setSelectedAno(e.target.value);
  };

  const handleComparar = () => {
    const s = motoSlug(
      motoData.Especificacoes?.Marca,
      motoData.Especificacoes?.Modelo,
      motoData.Especificacoes?.Ano
    );
    if (s) router.push(`/comparador/${s}`);
    else router.push('/comparador');
  };

  const esp = motoData.Especificacoes;
  const motor = motoData.Motor;
  const categoria = esp?.Categoria ?? '';
  const cilindrada = motor?.Cilindrada ?? '';
  const potencia = motor?.['Potencia (Gasolina)'] ?? motor?.['Potencia (Alcool)'] ?? '';
  const addUnidade = (val, u) => (val != null && val !== '' ? `${val}${typeof val === 'number' ? u : ''}` : '');
  const nomeMoto = `${esp?.Marca ?? ''} ${esp?.Modelo ?? ''} ${esp?.Ano ?? ''}`.trim();
  let introTexto = `Confira a ficha técnica completa da ${nomeMoto} com todas as especificações.`;
  if (categoria || cilindrada || potencia) {
    const partes = [];
    if (categoria) partes.push(`moto ${categoria.toLowerCase()}`);
    if (cilindrada) partes.push(`motor de ${addUnidade(cilindrada, ' cc')}`);
    if (potencia) partes.push(`${addUnidade(potencia, ' cv')}`);
    const desc = partes.length >= 2
      ? `${partes.slice(0, -1).join(' com ')} e ${partes[partes.length - 1]}`
      : partes.join(' com ');
    introTexto = `A ${nomeMoto} é uma ${desc}. Confira abaixo todas as especificações técnicas completas.`;
  }

  return (
    <div className="motos-container">
      <h1>Ficha Técnica da {esp?.Marca} {esp?.Modelo} {esp?.Ano}</h1>

      <div className="motos-intro" role="article">
        <p>{introTexto}</p>
      </div>

      <div className="selectors">
        <div className="selector-group">
          <label htmlFor="marca">Marca:</label>
          <select id="marca" value={selectedMarca} onChange={handleMarcaChange}>
            <option value="">Selecione uma marca</option>
            {marcas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
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
          <select id="ano" value={selectedAno} onChange={handleAnoChange} disabled={!selectedModelo}>
            <option value="">Selecione um ano</option>
            {anos.map((a) => (
              <option key={a.ano} value={a.ano}>
                {a.ano}
              </option>
            ))}
          </select>
        </div>
        <div className="selector-group">
          <button className="comparar-button" onClick={handleComparar}>
            Comparar
          </button>
        </div>
      </div>

      <div className="data-display-wrapper">
        <div className="ad-sidebar-left">
          <AdSidebar />
        </div>
        <div className="data-display">
          <h2 className="motos-specs-title">Especificações técnicas</h2>
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
        <div className="ad-sidebar-right">
          <AdSidebar />
        </div>
      </div>

      {motoFotos.length > 0 && (
        <div className="motos-fotos-section">
          <h2 className="motos-fotos-header">
            Fotos da {motoData.Especificacoes?.Marca} {motoData.Especificacoes?.Modelo}
          </h2>
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
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
    </div>
  );
}

export default MotoFichaPage;
