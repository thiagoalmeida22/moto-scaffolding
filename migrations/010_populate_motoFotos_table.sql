CREATE DATABASE IF NOT EXISTS motos;
USE motos;

-- Migration para popular tabela MotoFotos com dados atuais
-- Gerado em: 2026-01-24 23:51:02
-- Dados da tabela MotoFotos
INSERT INTO `motofotos` (`id`, `moto_id`, `foto_id`, `ordem`, `created_at`) VALUES (1,1,1,2,'2026-01-25 02:32:23');
INSERT INTO `motofotos` (`id`, `moto_id`, `foto_id`, `ordem`, `created_at`) VALUES (2,1,2,1,'2026-01-25 02:32:23');
INSERT INTO `motofotos` (`id`, `moto_id`, `foto_id`, `ordem`, `created_at`) VALUES (3,1,3,0,'2026-01-25 02:36:38');

