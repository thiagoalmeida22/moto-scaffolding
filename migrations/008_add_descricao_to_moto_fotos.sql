CREATE DATABASE IF NOT EXISTS motos;
USE motos;

-- Verificar e adicionar coluna descricao
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'motos' 
    AND TABLE_NAME = 'MotoFotos' 
    AND COLUMN_NAME = 'descricao'
);

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE MotoFotos ADD COLUMN descricao VARCHAR(20) DEFAULT NULL AFTER foto_path',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Remover constraint de foreign key temporariamente para permitir moto_id NULL
SET @constraint_exists = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'motos' 
    AND TABLE_NAME = 'MotoFotos' 
    AND CONSTRAINT_NAME = 'fk_moto_foto'
);

SET @sql = IF(@constraint_exists > 0,
    'ALTER TABLE MotoFotos DROP FOREIGN KEY fk_moto_foto',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Tornar moto_id nullable para permitir descrições sem moto associada
ALTER TABLE MotoFotos 
MODIFY COLUMN moto_id INT NULL;

-- Adicionar índice único no foto_path para facilitar atualizações (se não existir)
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'motos' 
    AND TABLE_NAME = 'MotoFotos' 
    AND INDEX_NAME = 'idx_foto_path'
);

SET @sql = IF(@index_exists = 0,
    'ALTER TABLE MotoFotos ADD UNIQUE INDEX idx_foto_path (foto_path)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Recriar constraint de foreign key (agora permitindo NULL)
SET @constraint_exists_after = (
    SELECT COUNT(*) 
    FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'motos' 
    AND TABLE_NAME = 'MotoFotos' 
    AND CONSTRAINT_NAME = 'fk_moto_foto'
);

SET @sql = IF(@constraint_exists_after = 0,
    'ALTER TABLE MotoFotos ADD CONSTRAINT fk_moto_foto FOREIGN KEY (moto_id) REFERENCES Motos(id) ON DELETE CASCADE',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
