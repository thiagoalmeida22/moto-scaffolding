import dbPool from '@/utils/database.js';
import { slugify } from '@/utils/slug.js';

/**
 * GET /api/db/moto/by-slug?marca=honda&modelo=cb-500&ano=2024
 * Resolve slugs para dados da moto.
 */
export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const marcaSlug = searchParams.get('marca');
  const modeloSlug = searchParams.get('modelo');
  const ano = searchParams.get('ano');

  if (!marcaSlug || !modeloSlug || !ano) {
    return Response.json(
      { error: 'Parâmetros marca, modelo e ano são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    // 1. Buscar marca pelo slug (comparar nome slugificado)
    const [marcas] = await dbPool.query(
      'SELECT id, nome FROM motos.marcas'
    );

    const marca = marcas.find(
      (m) => slugify(m.nome) === marcaSlug.toLowerCase()
    );
    if (!marca) {
      return Response.json({ error: 'Marca não encontrada' }, { status: 404 });
    }

    // 2. Buscar modelos da marca e encontrar o que bate com o slug
    const [modelos] = await dbPool.query(
      'SELECT DISTINCT modelo FROM motos.motos WHERE marca = ?',
      [marca.id]
    );

    const modeloMatch = modelos.find(
      (m) => slugify(m.modelo) === modeloSlug.toLowerCase()
    );
    if (!modeloMatch) {
      return Response.json({ error: 'Modelo não encontrado' }, { status: 404 });
    }

    // 3. Buscar moto por modelo e ano
    const [results] = await dbPool.query(
      `SELECT m.id, m.marca AS marca_id, m.modelo, marcas.nome AS marca, m.ano, m.categoria, m.preco_fipe, m.tipo_motor, m.cilindrada, m.potencia_A, m.potencia_G, m.torque_A, 
       m.torque_G, m.partida, m.refrigeracao, m.cambio, m.embreagem, m.suspensao_d, m.suspensao_t, m.tipo_freio, m.freio_d, m.freio_t, m.pneu_d, 
       m.pneu_t, m.chassi, m.alt_assento, m.altura, m.comprimento, m.largura, m.dist_eixos, m.peso, m.cap_carga, m.vel_max, m.acel_100, m.combustivel, 
       m.consumo_A, m.consumo_G, m.autonomia_A, m.autonomia_G, m.tanque, m.aditional
       FROM motos.motos AS m
       JOIN marcas ON m.marca = marcas.id
       WHERE m.modelo = ? AND m.ano = ?`,
      [modeloMatch.modelo, ano]
    );

    if (!results || results.length === 0) {
      return Response.json({ error: 'Moto não encontrada' }, { status: 404 });
    }

    const r = results[0];
    return Response.json({
      id: r.id,
      marcaId: r.marca_id,
      Especificacoes: {
        Modelo: r.modelo,
        Marca: r.marca,
        Ano: r.ano,
        Categoria: r.categoria,
        'Preço Fipe': r.preco_fipe,
      },
      Motor: {
        Tipo: r.tipo_motor,
        Cilindrada: r.cilindrada,
        'Potencia (Gasolina)': r.potencia_G,
        'Potencia (Alcool)': r.potencia_A,
        'Torque (Gasolina)': r.torque_G,
        'Torque (Alcool)': r.torque_A,
        Partida: r.partida,
        Refrigeração: r.refrigeracao,
      },
      Transmissão: {
        Cambio: r.cambio,
        Embreagem: r.embreagem,
      },
      Suspensão: {
        Dianteira: r.suspensao_d,
        Traseira: r.suspensao_t,
      },
      Freio: {
        Tipo: r.tipo_freio,
        Dianteiro: r.freio_d,
        Traseiro: r.freio_t,
      },
      Pneu: {
        Dianteiro: r.pneu_d,
        Traseiro: r.pneu_t,
      },
      Dimensoes: {
        'Tipo de Chassi': r.chassi,
        'Altura do Assento': r.alt_assento,
        Altura: r.altura,
        Comprimento: r.comprimento,
        Largura: r.largura,
        'Distância entre Eixos': r.dist_eixos,
        Peso: r.peso,
        'Capacidade de Carga': r.cap_carga,
      },
      Desempenho: {
        'Velocidade Máx. (Aprox. Painel)': r.vel_max,
        'Aceleração 0-100': r.acel_100,
      },
      Combustível: {
        Tipo: r.combustivel,
        'Consumo (Gasolina)': r.consumo_G,
        'Consumo (Alcool)': r.consumo_A,
        'Autonomia (Gasolina)': r.autonomia_G,
        'Autonomia (Alcool)': r.autonomia_A,
        Tanque: r.tanque,
      },
      Extras:
        r.aditional && r.aditional.trim() !== ''
          ? JSON.parse(r.aditional)
          : {},
    });
  } catch (err) {
    console.error(err);
    return Response.json(
      { error: 'Erro ao buscar dados da moto' },
      { status: 500 }
    );
  }
}
