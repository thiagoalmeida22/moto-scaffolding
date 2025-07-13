'use client';

import React, { useState, useEffect } from 'react';
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

    return (
        <div className="admin-dashboard" style={{ display: 'flex' }}>
            {/* Sidebar com os botões de navegação entre Motos e Marcas */}
            <div className="sidebar" style={{ marginRight: '20px' }}>
                <button onClick={() => setActiveTab('motos')}>Motos</button>
                <button onClick={() => setActiveTab('marcas')}>Marcas</button>
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
                                type="submit"
                                onClick={() => motoForm.action = 'delete'}
                                disabled={!selectedMoto}
                            >
                                Delete Moto
                            </button>
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
                </div>
            </div>
        </div >
    );
};

export default AdminDashboard;