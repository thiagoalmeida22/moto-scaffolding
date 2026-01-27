CREATE DATABASE IF NOT EXISTS motos;
USE motos;

CREATE TABLE IF NOT EXISTS motofotos (
    id INT NOT NULL AUTO_INCREMENT,
    moto_id INT NOT NULL,
    foto_id INT NOT NULL,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_moto_foto_moto FOREIGN KEY (moto_id) REFERENCES motos(id) ON DELETE CASCADE,
    CONSTRAINT fk_moto_foto_foto FOREIGN KEY (foto_id) REFERENCES fotos(id) ON DELETE CASCADE,
    INDEX idx_moto_id (moto_id),
    INDEX idx_foto_id (foto_id),
    INDEX idx_ordem (ordem)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
