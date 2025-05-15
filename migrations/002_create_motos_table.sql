CREATE DATABASE IF NOT EXISTS motos;
USE motos;

CREATE TABLE Motos (
    id INT NOT NULL AUTO_INCREMENT,
    modelo VARCHAR(50),
    marca INT,
    ano INT,
    cilindrada FLOAT,
    potencia FLOAT,
    torque FLOAT,
    transmissao INT,
    partida VARCHAR(50),
    combustivel VARCHAR(50),
    tanque FLOAT,
    chassi VARCHAR(50),
    freio_d VARCHAR(50),
    freio_t VARCHAR(50),
    pneu_d VARCHAR(50),
    pneu_t VARCHAR(50),
    peso_seco FLOAT,
    peso_odm FLOAT,
    PRIMARY KEY (id),
    CONSTRAINT fk_moto_marca FOREIGN KEY (marca) REFERENCES Marcas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;