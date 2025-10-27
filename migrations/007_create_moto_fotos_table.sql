CREATE DATABASE IF NOT EXISTS motos;
USE motos;

CREATE TABLE IF NOT EXISTS MotoFotos (
    id INT NOT NULL AUTO_INCREMENT,
    moto_id INT NOT NULL,
    foto_path VARCHAR(500) NOT NULL,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_moto_foto FOREIGN KEY (moto_id) REFERENCES Motos(id) ON DELETE CASCADE,
    INDEX idx_moto_id (moto_id),
    INDEX idx_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

