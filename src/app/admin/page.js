'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motoInitialState } from './helper';
import './style.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('');
    const [marcas, setMarcas] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [anos, setAnos] = useState([]);
    const [selectedMarca, setSelectedMarca] = useState('0');
    const [selectedModelo, setSelectedModelo] = useState('');
    const [selectedMoto, setSelectedMoto] = useState(false);
    const [motoForm, setMotoForm] = useState(motoInitialState);
    const [marcaForm, setMarcaForm] = useState({
        action: '',
        id: '0',
        marca: '',
    });
    
    // Estados para aba de Fotos
    const [fotoMarca, setFotoMarca] = useState('0');
    const [fotoModelo, setFotoModelo] = useState('');
    const [fotoModelos, setFotoModelos] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [fotosListadas, setFotosListadas] = useState([]);
    const [isLoadingFotosList, setIsLoadingFotosList] = useState(false);
    
    // Estados para linkagem de fotos à moto
    const [availableFotos, setAvailableFotos] = useState([]);
    const [selectedFotos, setSelectedFotos] = useState([]);
    const [isLoadingFotos, setIsLoadingFotos] = useState(false);

    /* ===== Funções para os selects (modo Motos) ===== */
    const handleChangeMarca = async (event) => {
        if (event.target.value === '') {
            clearSelectedData();
            return;
        }
        const marcaId = event.target.value;
        setSelectedMarca(marcaId);
        // Chamando a API para buscar os modelos da marca selecionada
        const response = await fetch(`/api/db/marca/${marcaId}`);
        const data = await response.json();
        console.log(data);
        setModelos(data);
    };

    const handleChangeModelo = async (event) => {
        if (event.target.value === '') {
            clearSelectedData();
            return;
        }
        const modeloSel = event.target.value;
        setSelectedModelo(modeloSel);
        // Chamando a API para buscar os anos referentes ao modelo selecionado
        const response = await fetch(`/api/db/modelo/${modeloSel}`);
        const data = await response.json();
        console.log(data);
        setAnos(data);
    };

    const handleChangeAno = async (event) => {
        if (event.target.value === '') {
            clearSelectedData();
            return;
        }
        const ano = event.target.value;
        const response = await fetch(
            `/api/db/moto/getWithId?modelo=${selectedModelo}&ano=${ano}`
        );
        const data = await response.json();
        data.marca = marcas.find((ele) => ele.nome === data.marca).id
        setSelectedMoto(true);
        if (data) {
            setMotoForm({
                action: '',
                id: data.id,
                modelo: data.modelo,
                marca: data.marca,
                ano: data.ano,
                categoria: data.categoria,
                preco_fipe: data['preço_fipe'],
                tipo_motor: data.tipo_motor,
                cilindrada: data.cilindrada,
                potencia_A: data.potencia_A,
                potencia_G: data.potencia_G,
                torque_A: data.torque_A,
                torque_G: data.torque_G,
                partida: data.partida,
                refrigeracao: data.refrigeracao,
                cambio: data.cambio,
                embreagem: data.embreagem,
                suspensao_d: data.suspensao_d,
                suspensao_t: data.suspensao_t,
                tipo_freio: data.tipo_freio,
                freio_d: data.freio_d,
                freio_t: data.freio_t,
                pneu_d: data.pneu_d,
                pneu_t: data.pneu_t,
                chassi: data.chassi,
                alt_assento: data.alt_assento,
                altura: data.altura,
                comprimento: data.comprimento,
                largura: data.largura,
                dist_eixos: data.dist_eixos,
                peso: data.peso,
                cap_carga: data.cap_carga,
                vel_max: data.vel_max,
                acel_100: data.acel_100,
                combustivel: data.combustivel,
                consumo_A: data.consumo_A,
                consumo_G: data.consumo_G,
                autonomia_A: data.autonomia_A,
                autonomia_G: data.autonomia_G,
                tanque: data.tanque,
                aditional: data.aditional
            });
            
            // Carregar fotos disponíveis e já linkadas
            await loadFotosForMoto(data.marca, data.modelo, data.id);
        }
    };

    const loadFotosForMoto = async (marcaId, modelo, motoId) => {
        try {
            setIsLoadingFotos(true);
            
            // Carregar fotos disponíveis
            const fotosResponse = await fetch(`/api/db/moto-fotos/list?marca=${marcaId}&modelo=${encodeURIComponent(modelo)}`);
            const fotosData = await fotosResponse.json();
            
            if (fotosData.success) {
                setAvailableFotos(fotosData.fotos || []);
            }
            
            // Carregar fotos já linkadas à moto
            const linkedResponse = await fetch(`/api/db/moto-fotos/get?motoId=${motoId}`);
            const linkedData = await linkedResponse.json();
            
            if (linkedData.success) {
                setSelectedFotos(linkedData.fotos.map(f => f.foto_path) || []);
            }
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
        } finally {
            setIsLoadingFotos(false);
        }
    };

    const handleToggleFoto = (fotoPath) => {
        setSelectedFotos(prev => {
            if (prev.includes(fotoPath)) {
                return prev.filter(p => p !== fotoPath);
            } else if (prev.length < 3) {
                return [...prev, fotoPath];
            } else {
                alert('Máximo de 3 fotos por moto');
                return prev;
            }
        });
    };

    const handleFotoDragStart = (e, index) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', index);
    };

    const handleFotoDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleFotoDrop = (e, dropIndex) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
        
        if (dragIndex === dropIndex) return;
        
        setSelectedFotos(prev => {
            const newFotos = [...prev];
            const draggedFoto = newFotos[dragIndex];
            newFotos.splice(dragIndex, 1);
            newFotos.splice(dropIndex, 0, draggedFoto);
            return newFotos;
        });
    };

    const handleLinkFotos = async () => {
        if (!motoForm.id) {
            alert('Selecione uma moto');
            return;
        }

        // Se não há fotos selecionadas, confirmar remoção
        if (selectedFotos.length === 0) {
            if (!confirm('Tem certeza que deseja remover todas as fotos linkadas a esta moto?')) {
                return;
            }
        }

        try {
            const response = await fetch('/api/db/moto-fotos/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    motoId: motoForm.id,
                    fotoPaths: selectedFotos
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                if (selectedFotos.length === 0) {
                    alert('Todas as fotos foram removidas com sucesso!');
                } else {
                    alert(`${selectedFotos.length} foto(s) linkada(s) com sucesso!`);
                }
                // Limpar os dados selecionados (mesmo comportamento do botão CLEAR)
                clearSelectedData();
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao linkar fotos:', error);
            alert('Erro ao linkar fotos');
        }
    };

    const clearSelectedData = () => {
        setModelos([]);
        setAnos([]);
        setSelectedMarca('0');
        setSelectedModelo('');
        setSelectedMoto(false);
        setMarcaForm({
            id: '0',
            marca: '',
        });
        setMotoForm(motoInitialState);
        setAvailableFotos([]);
        setSelectedFotos([]);
    }

    const fetchMarcas = async () => {
        const response = await fetch('/api/db/marca');
        const data = await response.json();
        console.log(data);
        setMarcas(data);
    };

    /* ===== useEffect para popular as Marcas ===== */
    useEffect(() => {
        fetchMarcas();
        clearSelectedData();
    }, [activeTab]);

    /* ===== Handlers para atualização dos campos dos formulários ===== */
    const handleMotoFormChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value)
        setMotoForm({ ...motoForm, [name]: value });
    };

    const handleMarcaFormChange = (e) => {
        console.log(e.target);
        const { name, value } = e.target;
        setMarcaForm({ ...marcaForm, [name]: value });
    };

    /* ===== Funções de Submissão dos formulários ===== */
    const handleMotoSubmit = async (e) => {
        e.preventDefault();
        let endpoint = '';
        let httpMethod = '';

        if (motoForm.action === 'delete') {
            endpoint = '/api/db/moto/delete';
            httpMethod = 'POST';
        } else if (motoForm.action === 'createOrEdit') {
            if (selectedMoto) {
                endpoint = '/api/db/moto/edit';
                httpMethod = 'PUT';
            } else {
                endpoint = '/api/db/moto/create';
                httpMethod = 'POST';
            }
        }
        if (!endpoint) return;

        await fetch(endpoint, {
            method: httpMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(motoForm)
        });

        setActiveTab('');
    };

    /* ===== Função para deletar moto com bypass das validações do formulário ===== */
    const handleDeleteMoto = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedMoto || !motoForm.id) {
            alert('Nenhuma moto selecionada para deletar');
            return;
        }

        const confirmMessage = `Tem certeza que deseja deletar a moto "${motoForm.modelo}" (${motoForm.ano})?\n\nEsta ação não pode ser desfeita!`;
        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await fetch('/api/db/moto/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: motoForm.id })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Moto deletada com sucesso!');
                clearSelectedData();
                setActiveTab('');
            } else {
                alert(`Erro ao deletar moto: ${data.message || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao deletar moto:', error);
            alert('Erro ao deletar moto. Verifique o console para mais detalhes.');
        }
    };

    const handleMarcaSubmit = async (e) => {
        e.preventDefault();
        let endpoint = '';
        let httpMethod = '';

        if (marcaForm.action === 'delete') {
            endpoint = '/api/db/marca/delete';
            httpMethod = 'POST';
        } else if (marcaForm.action === 'createOrEdit') {
            if (marcaForm.id != 0) {
                endpoint = '/api/db/marca/edit';
                httpMethod = 'PUT';
            } else {
                endpoint = '/api/db/marca/create';
                httpMethod = 'POST';
            }
        }
        if (!endpoint || marcaForm.marca === '') return;

        await fetch(endpoint, {
            method: httpMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(marcaForm)
        });

        setActiveTab('');
        clearSelectedData();
    };

    /* ===== Handlers para aba de Fotos ===== */
    const handleFotoMarcaChange = async (event) => {
        const marcaId = event.target.value;
        setFotoMarca(marcaId);
        setFotoModelo('');
        setFotoModelos([]);
        
        if (marcaId && marcaId !== '0') {
            const response = await fetch(`/api/db/marca/${marcaId}`);
            const data = await response.json();
            setFotoModelos(data);
        }
    };

    const handleFotoModeloChange = async (event) => {
        const modelo = event.target.value;
        setFotoModelo(modelo);
        
        // Carregar fotos do modelo selecionado
        if (fotoMarca && fotoMarca !== '0' && modelo) {
            await loadFotosDoModelo(fotoMarca, modelo);
        } else {
            setFotosListadas([]);
        }
    };

    const loadFotosDoModelo = async (marcaId, modelo) => {
        try {
            setIsLoadingFotosList(true);
            const response = await fetch(`/api/db/moto-fotos/list?marca=${marcaId}&modelo=${encodeURIComponent(modelo)}`);
            const data = await response.json();
            
            if (data.success) {
                setFotosListadas(data.fotos || []);
            } else {
                setFotosListadas([]);
            }
        } catch (error) {
            console.error('Erro ao carregar fotos:', error);
            setFotosListadas([]);
        } finally {
            setIsLoadingFotosList(false);
        }
    };

    const handleUpdateDescricao = async (fotoPath, descricao) => {
        try {
            // Converter path da API para path do banco de dados
            // De: /api/pictures/Marca/Modelo/file.jpg
            // Para: /pictures/Marca/Modelo/file.jpg
            const dbPath = fotoPath.replace('/api', '');
            
            const response = await fetch('/api/db/moto-fotos/update-descricao', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    foto_path: dbPath,
                    descricao: descricao.trim() || null
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                // Atualizar localmente a descrição na lista
                setFotosListadas(prev => prev.map(foto => 
                    foto.path === fotoPath 
                        ? { ...foto, descricao: descricao.trim() || '' }
                        : foto
                ));
            } else {
                console.error('Erro ao atualizar descrição:', result.error);
            }
        } catch (error) {
            console.error('Erro ao atualizar descrição:', error);
        }
    };

    const handleDeleteFoto = async (fotoPath) => {
        if (!confirm('Tem certeza que deseja deletar esta foto? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`/api/db/moto-fotos/delete?fotoPath=${encodeURIComponent(fotoPath)}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('Foto deletada com sucesso!');
                // Recarregar a lista de fotos
                if (fotoMarca && fotoMarca !== '0' && fotoModelo) {
                    await loadFotosDoModelo(fotoMarca, fotoModelo);
                }
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao deletar foto:', error);
            alert('Erro ao deletar foto');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (!fotoMarca || fotoMarca === '0' || !fotoModelo) {
            alert('Por favor, selecione uma Marca e um Modelo antes de fazer upload.');
            return;
        }

        const files = Array.from(e.dataTransfer.files);
        await uploadFiles(files);
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        await uploadFiles(files);
    };

    const uploadFiles = async (files) => {
        if (!fotoMarca || fotoMarca === '0' || !fotoModelo) {
            alert('Por favor, selecione uma Marca e um Modelo antes de fazer upload.');
            return;
        }

        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        const formData = new FormData();
        formData.append('marca', fotoMarca);
        formData.append('modelo', fotoModelo);
        
        imageFiles.forEach((file, index) => {
            formData.append(`photos`, file);
        });

        try {
            const response = await fetch('/api/upload/photos', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Sucesso! ${result.uploaded} foto(s) enviada(s).`);
                setUploadedFiles(prev => [...prev, ...result.files]);
                // Recarregar a lista de fotos
                await loadFotosDoModelo(fotoMarca, fotoModelo);
            } else {
                alert(`Erro: ${result.error}`);
            }
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
            alert('Erro ao fazer upload das fotos.');
        }
    };

    return (
        <div className="admin-dashboard" style={{ display: 'flex' }}>
            {/* Sidebar com os botões de navegação entre Motos e Marcas */}
            <div className="sidebar" style={{ marginRight: '20px' }}>
                <button onClick={() => setActiveTab('motos')}>Motos</button>
                <button onClick={() => setActiveTab('marcas')}>Marcas</button>
                <button onClick={() => setActiveTab('fotos')}>Fotos</button>
            </div>

            {/* Conteúdo principal */}
            <div className="main-content" style={{ flex: 1 }}>
                {/* Área dos seletores */}
                <div className="selectors">
                    {activeTab === 'motos' && (
                        <div className='selectors-main__div'>
                            <div className='selectors-main__collumn'>
                                <h4>Selecione a Moto 1:</h4>
                                <div className="selector-input__div">
                                    <label htmlFor="marca">Marca:</label>
                                    <select id="marca"
                                        value={selectedMarca}
                                        onChange={handleChangeMarca}
                                        className="selector-input__select"
                                    >
                                        <option value="0" disabled hidden>--Selecione--</option>
                                        {marcas?.map((marca) => (
                                            <option key={marca.id} value={marca.id}>
                                                {marca.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="selector-input__div">
                                    <label htmlFor="modelo">Modelo:</label>
                                    <select className="selector-input__select" id="modelo" onChange={handleChangeModelo}>
                                        <option value="">--Selecione--</option>
                                        {modelos?.map((modelo) => (
                                            <option key={modelo.modelo} value={modelo.modelo}>
                                                {modelo.modelo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="selector-input__div">
                                    <label htmlFor="ano">Ano:</label>
                                    <select className="selector-input__select" id="ano" onChange={handleChangeAno}>
                                        <option value="">--Selecione--</option>
                                        {anos?.map((ano) => (
                                            <option key={ano.ano} value={ano.ano}>
                                                {ano.ano}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                style={{ width: '40px', margin: 'auto 10px', height: '40px' }}
                                onClick={clearSelectedData}>
                                Clear
                            </button>
                        </div>
                    )}
                    {activeTab === 'marcas' && (
                        <>
                            <h4>Selecione a Marca:</h4>
                            <div className="selector-input__div">
                                <label htmlFor="marcaSelect">Marca:</label>
                                <select
                                    className="selector-input__select"
                                    id="marcaSelect"
                                    value={marcaForm.id}
                                    onChange={(e) => {
                                        const marcaNome = marcas.find((ele) => ele.id === Number(e.target.value))?.nome
                                        setMarcaForm({ ...marcaForm, ['id']: e.target.value, ['marca']: marcaNome });
                                    }}
                                >
                                    <option value="0" disabled hidden>--Selecione--</option>
                                    {marcas?.map((marca) => (
                                        <option key={marca.id} value={marca.id}>
                                            {marca.nome}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    style={{ marginLeft: '10px', height: '20px' }}
                                    onClick={() => {
                                        setSelectedMarca('0');
                                        setMarcaForm({ id: '0', marca: '' });
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Formulário */}
                <div className="form-container" style={{ marginTop: '20px' }}>
                    {activeTab === 'motos' && (
                        <form onSubmit={handleMotoSubmit}>
                            <h3>{selectedMoto ? 'Editar Moto' : 'Criar Moto'}</h3>
                            {/* Para cada coluna, renderizamos um input com label */}
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="modelo">Modelo:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="modelo"
                                    name="modelo"
                                    maxLength="50"
                                    value={motoForm.modelo}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div--inline">
                                <label className="form-input__label" htmlFor="marca">Marca:</label>
                                <select
                                    id="marca"
                                    name="marca"
                                    value={motoForm.marca}
                                    onChange={handleMotoFormChange}
                                    required
                                >
                                    <option value="">--Selecione--</option>
                                    {marcas.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="ano">
                                    Ano: <span className="form-input__label-format">(Número)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="ano"
                                    name="ano"
                                    value={motoForm.ano}
                                    onChange={handleMotoFormChange}
                                    min="1900"
                                    max="3000"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="categoria">Categoria:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="categoria"
                                    name="categoria"
                                    maxLength="50"
                                    value={motoForm.categoria}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="preco_fipe">
                                    Preço Fipe: <span className="form-input__label-format">(Número sem . ou ,)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="preco_fipe"
                                    name="preco_fipe"
                                    value={motoForm.preco_fipe}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="tipo_motor">Tipo Motor:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="tipo_motor"
                                    name="tipo_motor"
                                    maxLength="50"
                                    value={motoForm.tipo_motor}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="cilindrada">
                                    Cilindrada: <span className="form-input__label-format">(Número)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="cilindrada"
                                    name="cilindrada"
                                    value={motoForm.cilindrada}
                                    onChange={handleMotoFormChange}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="potencia_A">
                                    Potência G: <span className="form-input__label-format">(XX.X a YYYYrpm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="potencia_G"
                                    name="potencia_G"
                                    maxLength="50"
                                    value={motoForm.potencia_G}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="potencia_G">
                                    Potência A: <span className="form-input__label-format">(XX.X a YYYYrpm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="potencia_A"
                                    name="potencia_A"
                                    maxLength="50"
                                    value={motoForm.potencia_A}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="torque_A">
                                    Torque G: <span className="form-input__label-format">(XX.X a YYYYrpm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="torque_G"
                                    name="torque_G"
                                    maxLength="50"
                                    value={motoForm.torque_G}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="torque_G">
                                    Torque A: <span className="form-input__label-format">(XX.X a YYYYrpm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="torque_A"
                                    name="torque_A"
                                    maxLength="50"
                                    value={motoForm.torque_A}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="partida">Partida:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="partida"
                                    name="partida"
                                    maxLength="50"
                                    value={motoForm.partida}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="refrigeracao">Refrigeração:</label>
                                <input
                                    className="form__input"
                                    id="refrigeraçao"
                                    name="refrigeracao"
                                    maxLength="50"
                                    value={motoForm.refrigeracao}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="cambio">
                                    Transmissão: <span className="form-input__label-format">(Número)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="cambio"
                                    name="cambio"
                                    value={motoForm.cambio}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="embreagem">Embreagem:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="embreagem"
                                    name="embreagem"
                                    maxLength="50"
                                    value={motoForm.embreagem}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="suspensao_d">Suspensão Dianteira:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="suspensao_d"
                                    name="suspensao_d"
                                    maxLength="50"
                                    value={motoForm.suspensao_d}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="suspensao_t">Suspensão Traseira:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="suspensao_t"
                                    name="suspensao_t"
                                    maxLength="50"
                                    value={motoForm.suspensao_t}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="tipo_freio">Tipo do Freio:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="tipo_freio"
                                    name="tipo_freio"
                                    maxLength="50"
                                    value={motoForm.tipo_freio}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="freio_d">Freio Dianteiro:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="freio_d"
                                    name="freio_d"
                                    maxLength="50"
                                    value={motoForm.freio_d}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="freio_t">Freio Traseiro:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="freio_t"
                                    name="freio_t"
                                    maxLength="50"
                                    value={motoForm.freio_t}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="pneu_d">
                                    Pneu Dianteiro: <span className="form-input__label-format">(xx/yyy-zz)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="pneu_d"
                                    name="pneu_d"
                                    maxLength="50"
                                    value={motoForm.pneu_d}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="pneu_t">
                                    Pneu Traseiro: <span className="form-input__label-format">(xx/yyy-zz)</span>
                                </label>
                                <input
                                    className="form__input"
                                    id="pneu_t"
                                    name="pneu_t"
                                    maxLength="50"
                                    value={motoForm.pneu_t}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="chassi">Chassi:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="chassi"
                                    name="chassi"
                                    maxLength="50"
                                    value={motoForm.chassi}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="alt_assento">
                                    Altura do Assento: <span className="form-input__label-format">(mm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="alt_assento"
                                    name="alt_assento"
                                    value={motoForm.alt_assento}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="altura">
                                    Altura: <span className="form-input__label-format">(mm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="altura"
                                    name="altura"
                                    value={motoForm.altura}
                                    onChange={handleMotoFormChange}
                                    required

                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="comprimento">
                                    Comprimento: <span className="form-input__label-format">(mm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="comprimento"
                                    name="comprimento"
                                    value={motoForm.comprimento}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="largura">
                                    Largura: <span className="form-input__label-format">(mm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    id="largura"
                                    name="largura"
                                    value={motoForm.largura}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="dist_eixos">
                                    Distância entre Eixos: <span className="form-input__label-format">(mm)</span>
                                </label>
                                <input
                                    className="form__input"
                                    id="dist_eixos"
                                    name="dist_eixos"
                                    value={motoForm.dist_eixos}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="peso">
                                    Peso: <span className="form-input__label-format">(kg)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="peso"
                                    name="peso"
                                    value={motoForm.peso}
                                    onChange={handleMotoFormChange}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="cap_carga">
                                    Capacidade de Carga: <span className="form-input__label-format">(kg)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="cap_carga"
                                    name="cap_carga"
                                    value={motoForm.cap_carga}
                                    onChange={handleMotoFormChange}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="vel_max">
                                    Velocidade Máxima: <span className="form-input__label-format">(km/h)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="vel_max"
                                    name="vel_max"
                                    value={motoForm.vel_max}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="acel_100">
                                    Aceleração 0 a 100: <span className="form-input__label-format">(s)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="acel_100"
                                    name="acel_100"
                                    value={motoForm.acel_100}
                                    onChange={handleMotoFormChange}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="combustivel">Combustível:</label>
                                <input
                                    className="form__input"
                                    id="combustivel"
                                    name="combustivel"
                                    maxLength="50"
                                    value={motoForm.combustivel}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="consumo_A">
                                    Consumo G: <span className="form-input__label-format">(km/l)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="consumo_G"
                                    name="consumo_G"
                                    value={motoForm.consumo_G}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="consumo_G">
                                    Consumo A: <span className="form-input__label-format">(km/l)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="consumo_A"
                                    name="consumo_A"
                                    value={motoForm.consumo_A}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="autonomia_A">
                                    Autonomia G: <span className="form-input__label-format">(km)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="autonomia_G"
                                    name="autonomia_G"
                                    value={motoForm.autonomia_G}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="autonomia_G">
                                    Autonomia A: <span className="form-input__label-format">(km)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="autonomia_A"
                                    name="autonomia_A"
                                    value={motoForm.autonomia_A}
                                    onChange={handleMotoFormChange}
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="tanque">
                                    Tanque: <span className="form-input__label-format">(L)</span>
                                </label>
                                <input
                                    className="form__input"
                                    type="number"
                                    id="tanque"
                                    name="tanque"
                                    value={motoForm.tanque}
                                    onChange={handleMotoFormChange}
                                    step="0.1"
                                    required
                                />
                            </div>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="aditional">Adicionais:</label>
                                <textarea
                                    className="form__textarea"
                                    id="aditional"
                                    name="aditional"
                                    value={motoForm.aditional}
                                    onChange={handleMotoFormChange}
                                />
                            </div>
                            <input type="hidden" id="action" name="action" value={motoForm.action} />
                            <button
                                type="submit"
                                style={{ marginRight: '15px' }}
                                onClick={() => motoForm.action = 'createOrEdit'}
                            >
                                {selectedMoto ? 'Editar Moto' : 'Criar Moto'}
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteMoto}
                                disabled={!selectedMoto}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '10px 20px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: selectedMoto ? 'pointer' : 'not-allowed',
                                    opacity: selectedMoto ? 1 : 0.6
                                }}
                            >
                                Delete Moto
                            </button>
                            
                            {/* Seção de Linkagem de Fotos */}
                            {selectedMoto && (
                                <div className="fotos-link-section" style={{ marginTop: '40px', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                                    <h3>Linkar Fotos à Moto</h3>
                                    <p style={{ marginBottom: '15px', color: '#666' }}>
                                        Selecione até 3 fotos para linkar com esta moto ({selectedFotos.length}/3 selecionadas)
                                    </p>
                                    
                                    {isLoadingFotos ? (
                                        <p>Carregando fotos...</p>
                                    ) : availableFotos.length === 0 ? (
                                        <p style={{ color: '#999' }}>Nenhuma foto disponível para este modelo. Faça upload de fotos na aba &quot;Fotos&quot; primeiro.</p>
                                    ) : (
                                        <>
                                            <div className="fotos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                                {availableFotos.map((foto, index) => (
                                                    <div
                                                        key={index}
                                                        className={`foto-thumbnail ${selectedFotos.includes(foto.path) ? 'selected' : ''}`}
                                                        onClick={() => handleToggleFoto(foto.path)}
                                                        style={{
                                                            position: 'relative',
                                                            cursor: 'pointer',
                                                            border: selectedFotos.includes(foto.path) ? '3px solid #d53829' : '2px solid #ddd',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            aspectRatio: '4/3'
                                                        }}
                                                    >
                                                        <Image
                                                            src={foto.path}
                                                            alt={foto.filename}
                                                            fill
                                                            style={{
                                                                objectFit: 'cover'
                                                            }}
                                                            unoptimized
                                                        />
                                                        {selectedFotos.includes(foto.path) && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '5px',
                                                                right: '5px',
                                                                background: '#d53829',
                                                                color: 'white',
                                                                borderRadius: '50%',
                                                                width: '24px',
                                                                height: '24px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ✓
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Seção de Fotos Selecionadas (com reordenação) */}
                                            {selectedFotos.length > 0 && (
                                                <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                                                    <h4 style={{ marginBottom: '10px', color: '#333' }}>Fotos Selecionadas (Arraste para reordenar)</h4>
                                                    <div id="motos-fotos-section" style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedFotos.length}, 1fr)`, gap: '15px' }}>
                                                        {selectedFotos.map((fotoPath, index) => {
                                                            const foto = availableFotos.find(f => f.path === fotoPath);
                                                            return (
                                                                <div
                                                                    key={fotoPath}
                                                                    draggable
                                                                    onDragStart={(e) => handleFotoDragStart(e, index)}
                                                                    onDragOver={handleFotoDragOver}
                                                                    onDrop={(e) => handleFotoDrop(e, index)}
                                                                    style={{
                                                                        position: 'relative',
                                                                        cursor: 'move',
                                                                        border: '2px solid #d53829',
                                                                        borderRadius: '8px',
                                                                        overflow: 'hidden',
                                                                        width: '120px',
                                                                        height: '90px',
                                                                        flexShrink: 0
                                                                    }}
                                                                >
                                                                    <Image
                                                                        src={foto?.path || fotoPath}
                                                                        alt={`Foto ${index + 1}`}
                                                                        width={120}
                                                                        height={90}
                                                                        style={{
                                                                            objectFit: 'cover'
                                                                        }}
                                                                        unoptimized
                                                                    />
                                                                    <div style={{
                                                                        position: 'absolute',
                                                                        bottom: '0',
                                                                        left: '0',
                                                                        right: '0',
                                                                        background: 'rgba(213, 56, 41, 0.9)',
                                                                        color: 'white',
                                                                        textAlign: 'center',
                                                                        padding: '2px 0',
                                                                        fontSize: '12px',
                                                                        fontWeight: 'bold'
                                                                    }}>
                                                                        {index + 1}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleToggleFoto(fotoPath)}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            top: '5px',
                                                                            right: '5px',
                                                                            background: 'rgba(0,0,0,0.7)',
                                                                            color: 'white',
                                                                            border: 'none',
                                                                            borderRadius: '50%',
                                                                            width: '20px',
                                                                            height: '20px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '12px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}
                                                                        title="Remover foto"
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <button
                                                    type="button"
                                                    onClick={handleLinkFotos}
                                                    style={{
                                                        padding: '10px 20px',
                                                        backgroundColor: '#d53829',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    {selectedFotos.length === 0 ? 'Remover Todas as Fotos' : `Linkar ${selectedFotos.length} Foto(s)`}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </form>
                    )}
                    {activeTab === 'marcas' && (
                        // Formulário para Marcas
                        <form onSubmit={handleMarcaSubmit}>
                            <h3>{selectedMarca != 0 ? 'Editar Marca' : 'Criar Marca'}</h3>
                            <div className="form-input__div">
                                <label className="form-input__label" htmlFor="marca">Marca:</label>
                                <input
                                    className="form__input"
                                    type="text"
                                    id="marca"
                                    name="marca"
                                    value={marcaForm.marca || ''}
                                    onChange={handleMarcaFormChange}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                style={{ marginRight: '15px' }}
                                onClick={() => marcaForm.action = 'createOrEdit'}
                            >
                                {marcaForm.id != 0 ? 'Editar Marca' : 'Criar Marca'}
                            </button>
                            <button
                                type="submit"
                                onClick={() => marcaForm.action = 'delete'}
                                disabled={marcaForm.id == 0}
                            >
                                Delete Marca
                            </button>
                        </form>
                    )}

                    {activeTab === 'fotos' && (
                        <div className="fotos-upload-section">
                            <h3>Upload de Fotos</h3>
                            
                            {/* Seletores de Marca e Modelo */}
                            <div className="selector-input__div" style={{ marginBottom: '20px' }}>
                                <label htmlFor="fotoMarca">Marca:</label>
                                <select
                                    className="selector-input__select"
                                    id="fotoMarca"
                                    value={fotoMarca}
                                    onChange={handleFotoMarcaChange}
                                >
                                    <option value="0" disabled hidden>--Selecione uma Marca--</option>
                                    {marcas?.map((marca) => (
                                        <option key={marca.id} value={marca.id}>
                                            {marca.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="selector-input__div" style={{ marginBottom: '20px' }}>
                                <label htmlFor="fotoModelo">Modelo:</label>
                                <select
                                    className="selector-input__select"
                                    id="fotoModelo"
                                    value={fotoModelo}
                                    onChange={handleFotoModeloChange}
                                    disabled={!fotoMarca || fotoMarca === '0'}
                                >
                                    <option value="" disabled hidden>--Selecione um Modelo--</option>
                                    {fotoModelos?.map((modelo) => (
                                        <option key={modelo.modelo} value={modelo.modelo}>
                                            {modelo.modelo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Área de Upload */}
                            {(fotoMarca && fotoMarca !== '0' && fotoModelo) && (
                                <div
                                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="upload-content">
                                        <p className="upload-icon">📸</p>
                                        <p className="upload-text">
                                            Arraste e solte fotos aqui ou
                                        </p>
                                        <label htmlFor="file-input" className="upload-button">
                                            Selecione arquivos
                                        </label>
                                        <input
                                            id="file-input"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <p className="upload-hint">
                                            Formatos aceitos: JPG, PNG, GIF, WEBP
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Lista de Fotos */}
                            {(fotoMarca && fotoMarca !== '0' && fotoModelo) && (
                                <div style={{ marginTop: '30px' }}>
                                    <h3 style={{ marginBottom: '15px', color: '#333' }}>Fotos Enviadas</h3>
                                    
                                    {isLoadingFotosList ? (
                                        <p>Carregando fotos...</p>
                                    ) : fotosListadas.length === 0 ? (
                                        <p style={{ color: '#999' }}>Nenhuma foto enviada para este modelo ainda.</p>
                                    ) : (
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                                            gap: '20px' 
                                        }}>
                                            {fotosListadas.map((foto, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        border: '2px solid #ddd',
                                                        borderRadius: '8px',
                                                        overflow: 'hidden',
                                                        background: '#f9f9f9'
                                                    }}
                                                >
                                                    <div style={{
                                                        position: 'relative',
                                                        aspectRatio: '4/3',
                                                        background: '#f9f9f9'
                                                    }}>
                                                        <Image
                                                            src={foto.path}
                                                            alt={foto.filename}
                                                            fill
                                                            style={{
                                                                objectFit: 'cover'
                                                            }}
                                                            unoptimized
                                                        />
                                                        <button
                                                            onClick={() => handleDeleteFoto(foto.path)}
                                                            style={{
                                                                position: 'absolute',
                                                                top: '5px',
                                                                right: '5px',
                                                                background: 'rgba(213, 56, 41, 0.9)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '50%',
                                                                width: '30px',
                                                                height: '30px',
                                                                cursor: 'pointer',
                                                                fontSize: '18px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                            }}
                                                            title="Deletar foto"
                                                        >
                                                            ×
                                                        </button>
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '0',
                                                            left: '0',
                                                            right: '0',
                                                            background: 'rgba(0,0,0,0.7)',
                                                            color: 'white',
                                                            padding: '5px',
                                                            fontSize: '12px',
                                                            textAlign: 'center',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {foto.filename}
                                                        </div>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={foto.descricao || ''}
                                                        onChange={(e) => {
                                                            const newDescricao = e.target.value;
                                                            // Atualizar localmente primeiro para feedback imediato
                                                            setFotosListadas(prev => prev.map(f => 
                                                                f.path === foto.path 
                                                                    ? { ...f, descricao: newDescricao }
                                                                    : f
                                                            ));
                                                        }}
                                                        onBlur={(e) => {
                                                            // Salvar no backend quando perder o foco
                                                            handleUpdateDescricao(foto.path, e.target.value);
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        placeholder="Descrição (max 20)"
                                                        maxLength={20}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px',
                                                            border: 'none',
                                                            borderTop: '1px solid #ddd',
                                                            fontSize: '13px',
                                                            outline: 'none',
                                                            backgroundColor: 'white'
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {(!fotoMarca || fotoMarca === '0' || !fotoModelo) && (
                                <div className="upload-placeholder">
                                    <p>Por favor, selecione uma Marca e um Modelo para fazer upload de fotos.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;