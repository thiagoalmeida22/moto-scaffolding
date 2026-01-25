-- ============================================
-- Script SQL para gerar INSERTs de uma tabela
-- ============================================
-- 
-- INSTRUÇÕES:
-- 1. Conecte ao MySQL: mysql -u root -p motos
-- 2. Copie e cole o comando abaixo (ajuste o nome da tabela)
-- 3. Copie os resultados e cole em um arquivo .sql na pasta migrations/
--
-- ============================================

-- Para tabela FOTOS:
SELECT CONCAT(
    'INSERT INTO Fotos (id, foto_path, descricao, created_at) VALUES (',
    id, ', ',
    QUOTE(foto_path), ', ',
    IFNULL(QUOTE(descricao), 'NULL'), ', ',
    QUOTE(created_at),
    ');'
) AS insert_statement
FROM Fotos;

-- Para tabela MOTOFOTOS:
-- SELECT CONCAT(
--     'INSERT INTO MotoFotos (id, moto_id, foto_id, ordem, created_at) VALUES (',
--     id, ', ',
--     moto_id, ', ',
--     foto_id, ', ',
--     ordem, ', ',
--     QUOTE(created_at),
--     ');'
-- ) AS insert_statement
-- FROM MotoFotos;

-- ============================================
-- DICA: Para salvar diretamente em arquivo:
-- ============================================
-- SELECT CONCAT(...) AS insert_statement
-- FROM Fotos
-- INTO OUTFILE 'C:/temp/fotos_inserts.sql'
-- FIELDS TERMINATED BY '\n'
-- LINES TERMINATED BY '\n';
--
-- (Nota: O MySQL precisa ter permissão de escrita no caminho)


