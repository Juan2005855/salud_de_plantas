CREATE DATABASE IF NOT EXISTS proyecto_back
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE proyecto_back;

CREATE TABLE IF NOT EXISTS plantas (
    id INT NOT NULL AUTO_INCREMENT,
    nombreComun VARCHAR(100) NOT NULL,
    nombreCientifico VARCHAR(150) NOT NULL,
    familiaBotanica VARCHAR(100) NOT NULL,
    tipoCultivo ENUM('hortaliza', 'frutal', 'cereal', 'ornamental', 'otro') NOT NULL,
    secuenciaGenetica LONGTEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_plantas_nombre_cientifico (nombreCientifico)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS patogenos (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    nombreCientifico VARCHAR(150) NOT NULL,
    tipo ENUM('virus', 'hongo', 'oomiceto', 'bacteria', 'insecto', 'nematodo') NOT NULL,
    transmision VARCHAR(100) NOT NULL,
    secuenciaGenetica LONGTEXT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_patogenos_nombre_cientifico (nombreCientifico)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enfermedades (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcionSintomas TEXT NOT NULL,
    epocaRiesgo ENUM('primavera', 'verano', 'otoño', 'invierno', 'todo_el_año') NOT NULL,
    patogenoId INT NOT NULL,
    PRIMARY KEY (id),
    KEY IDX_enfermedades_patogenoId (patogenoId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tratamientos (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcionAplicacion TEXT NOT NULL,
    tipo ENUM('quimico', 'biologico', 'cultural') NOT NULL,
    enfermedadId INT NOT NULL,
    PRIMARY KEY (id),
    KEY IDX_tratamientos_enfermedadId (enfermedadId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS susceptibilidades (
    id INT NOT NULL AUTO_INCREMENT,
    plantaId INT NOT NULL,
    enfermedadId INT NOT NULL,
    nivel ENUM('baja', 'media', 'alta') NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY UQ_susceptibilidades_planta_enfermedad (plantaId, enfermedadId),
    KEY IDX_susceptibilidades_enfermedadId (enfermedadId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cultivos (
    id INT NOT NULL AUTO_INCREMENT,
    plantaId INT NOT NULL,
    lote VARCHAR(100) NOT NULL,
    region VARCHAR(100) NOT NULL,
    fechaSiembra DATE NOT NULL,
    codigoGeneticoSemilla LONGTEXT NOT NULL,
    PRIMARY KEY (id),
    KEY IDX_cultivos_plantaId (plantaId)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brotes (
    id INT NOT NULL AUTO_INCREMENT,
    plantaId INT NOT NULL,
    enfermedadId INT NOT NULL,
    fecha DATE NOT NULL,
    region VARCHAR(100) NOT NULL,
    hectareasAfectadas DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    KEY IDX_brotes_plantaId (plantaId),
    KEY IDX_brotes_enfermedadId (enfermedadId)
) ENGINE=InnoDB;
