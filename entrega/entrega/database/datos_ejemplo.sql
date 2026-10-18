
USE proyecto_back;

INSERT IGNORE INTO plantas (id, nombreComun, nombreCientifico, familiaBotanica, tipoCultivo, secuenciaGenetica) VALUES
  (1, 'Papa', 'Solanum tuberosum', 'Solanaceae', 'hortaliza', 'AGACTTTCAAAGATATGCTGGGTAGAGGTCGAGGTT'),
  (2, 'Tomate', 'Solanum lycopersicum', 'Solanaceae', 'hortaliza', 'ATTATTTGTTACCAATTCTCATTGTGTTTCGGAACT'),
  (3, 'Maiz', 'Zea mays', 'Poaceae', 'cereal', 'TGCGTTTTAGGTATGTCTTAGTGACTCTAAATACCA'),
  (4, 'Cafe', 'Coffea arabica', 'Rubiaceae', 'otro', 'AGGCAGTCCTCGATCCGTTCCTAATAAGGAATGGTG'),
  (5, 'Banano', 'Musa acuminata', 'Musaceae', 'frutal', 'ATTCCCTGTCATACCAATCTACCCCCTGTTATGCGC'),
  (6, 'Aguacate Hass', 'Persea americana', 'Lauraceae', 'frutal', 'GTTTGTCGTTAGACCAATGTCAGCGCAGCGGCAGAT'),
  (7, 'Rosa', 'Rosa hybrida', 'Rosaceae', 'ornamental', 'CAAGCAGGAGGCGGAATGTAAACAGAAGGTATGCTT'),
  (8, 'Arroz', 'Oryza sativa', 'Poaceae', 'cereal', 'AGGTGGATAGGGAGTGAGCAACAAACGGATCGTTTC'),
  (9, 'Fresa', 'Fragaria x ananassa', 'Rosaceae', 'frutal', 'TCCCATGCCAAGTTGGCACAGGGAACTACCTGCGGC');

INSERT IGNORE INTO patogenos (id, nombre, nombreCientifico, tipo, transmision, secuenciaGenetica) VALUES
  (1, 'Tizon tardio', 'Phytophthora infestans', 'oomiceto', 'viento', 'GGTTTGCCTCTAGTACAGGGCAACGATTCAACTGGG'),
  (2, 'Fusarium del suelo', 'Fusarium oxysporum', 'hongo', 'suelo', 'ACCGGGGCTCATTGCACGCCAAAGAGGCCCCAGTAA'),
  (3, 'Mancha bacteriana', 'Xanthomonas campestris', 'bacteria', 'agua', 'TGGAGTTACGTGAAATGGCCGTGGTTGCCTCGGTTC'),
  (4, 'Virus del enrulamiento amarillo del tomate', 'Tomato yellow leaf curl virus', 'virus', 'insectos vectores', 'CTCTGGAGGTGCGCGCAGGTTTAGTGATCTGGATCA'),
  (5, 'Roya del cafeto', 'Hemileia vastatrix', 'hongo', 'viento', 'GGCGTTTGAACAGGACTGGACAACGCTCCGATCAAG'),
  (6, 'Nematodo agallador', 'Meloidogyne incognita', 'nematodo', 'suelo', 'TACCTGGGGTGTGGATCATGGTCGGTGCATAGTAGT'),
  (7, 'Mosca blanca', 'Bemisia tabaci', 'insecto', 'contacto', 'GGGCACGTACATCCTCCGTCGGTCCCCCAAGGCCGG'),
  (8, 'Pudricion de raiz', 'Pythium ultimum', 'oomiceto', 'agua', 'CTCCACCTTAGCGATTCGCATAAAGGGACCATTCCC'),
  (9, 'Oidio de las rosas', 'Podosphaera pannosa', 'hongo', 'viento', 'CTCGCTTTGCGTTACCAAGCACCTCTACGGGTATTG');

INSERT IGNORE INTO enfermedades (id, nombre, descripcionSintomas, epocaRiesgo, patogenoId) VALUES
  (1, 'Tizon tardio de la papa', 'Manchas oscuras acuosas en hojas y tallos, moho blanco en el enves y pudricion del tuberculo', 'invierno', 1),
  (2, 'Tizon tardio del tomate', 'Lesiones grandes irregulares verde oscuro en hojas y frutos con pudricion firme', 'invierno', 1),
  (3, 'Marchitez por Fusarium', 'Amarillamiento de hojas bajas, marchitez unilateral y oscurecimiento de los vasos del tallo', 'verano', 2),
  (4, 'Mancha bacteriana del tomate', 'Pequenas manchas oscuras con halo amarillo en hojas y costras en los frutos', 'primavera', 3),
  (5, 'Enrulamiento amarillo de la hoja', 'Hojas enrolladas hacia arriba, amarillamiento de bordes y enanismo de la planta', 'todo_el_año', 4),
  (6, 'Roya del cafeto', 'Manchas amarillas en el haz de la hoja y polvo anaranjado en el enves con caida de hojas', 'otoño', 5),
  (7, 'Agallamiento de raices', 'Agallas en las raices, planta con bajo vigor y marchitez en horas de calor', 'todo_el_año', 6),
  (8, 'Dano por mosca blanca', 'Presencia de adultos en el enves, melaza y fumagina sobre las hojas', 'verano', 7),
  (9, 'Oidio de la rosa', 'Polvillo blanco sobre hojas, botones y tallos tiernos con deformacion de brotes', 'primavera', 9);

INSERT IGNORE INTO tratamientos (id, nombre, descripcionAplicacion, tipo, enfermedadId) VALUES
  (1, 'Fungicida protectante de cobre', 'Aplicar cada 7 dias en horas frescas, mojando bien el follaje, desde la aparicion de las primeras manchas', 'quimico', 1),
  (2, 'Rotacion con cereales', 'Alternar el lote con maiz o avena durante dos temporadas antes de volver a sembrar papa', 'cultural', 1),
  (3, 'Variedades resistentes', 'Sembrar variedades con resistencia comprobada y semilla certificada libre de la enfermedad', 'cultural', 2),
  (4, 'Trichoderma harzianum', 'Aplicar al suelo en el trasplante y repetir cada 30 dias para colonizar la zona de la raiz', 'biologico', 3),
  (5, 'Solarizacion del suelo', 'Cubrir el suelo humedo con plastico transparente durante seis semanas antes de sembrar', 'cultural', 3),
  (6, 'Bactericida a base de cobre', 'Aplicar cada 10 dias en la etapa vegetativa evitando mojar el follaje en horas de calor', 'quimico', 4),
  (7, 'Control de mosca blanca con trampas', 'Instalar trampas amarillas adhesivas a la altura del cultivo y revisarlas cada semana', 'cultural', 5),
  (8, 'Beauveria bassiana', 'Aspersion al enves de las hojas al atardecer, tres aplicaciones con intervalo de siete dias', 'biologico', 8),
  (9, 'Fungicida sistemico triazol', 'Aplicar segun el nivel de infeccion en el primer tercio del ciclo de floracion', 'quimico', 6),
  (10, 'Poda de saneamiento y sombrio', 'Eliminar hojas afectadas y regular el sombrio para reducir la humedad dentro del cafetal', 'cultural', 6),
  (11, 'Paecilomyces lilacinus', 'Incorporar al suelo en el trasplante para reducir la poblacion de nematodos', 'biologico', 7),
  (12, 'Azufre mojable', 'Aplicar cada 10 dias al aparecer los primeros sintomas, evitando horas de sol fuerte', 'quimico', 9);

INSERT IGNORE INTO susceptibilidades (id, plantaId, enfermedadId, nivel) VALUES
  (1, 1, 1, 'alta'),
  (2, 2, 2, 'alta'),
  (3, 2, 3, 'media'),
  (4, 2, 4, 'media'),
  (5, 2, 5, 'alta'),
  (6, 1, 3, 'baja'),
  (7, 4, 6, 'alta'),
  (8, 4, 7, 'media'),
  (9, 5, 3, 'alta'),
  (10, 5, 7, 'baja'),
  (11, 6, 8, 'media'),
  (12, 7, 9, 'alta'),
  (13, 2, 8, 'media'),
  (14, 1, 7, 'media'),
  (15, 3, 3, 'baja');

INSERT IGNORE INTO cultivos (id, plantaId, lote, region, fechaSiembra, codigoGeneticoSemilla) VALUES
  (1, 1, 'Finca La Esperanza lote 4', 'Boyaca', '2026-03-15', 'AGACTTTCAAAGATATGCTGGGTAGAGGTCGAGGTT'),
  (2, 1, 'Finca El Paramo lote 2', 'Cundinamarca', '2026-04-02', 'AGACTTTCAAAGATATGCTGGGAAGAGGTCGCGGTT'),
  (3, 2, 'Invernadero Los Cerezos 1', 'Cundinamarca', '2026-02-20', 'ATTATTTGTGACCAATTCTCATTGTGTTTCGGAACT'),
  (4, 2, 'Finca San Isidro lote 7', 'Antioquia', '2026-05-11', 'ATTATTTGTTACCAGTTCTCATGGTGTTTTGGAACT'),
  (5, 3, 'Hacienda El Rosal lote 9', 'Huila', '2026-03-01', 'TGCGTTTTAGGTATGTCTTAGTGACTCTAAATACCA'),
  (6, 4, 'Finca Buenavista lote 3', 'Caldas', '2026-01-18', 'AGGTAGTCCTCGATCCGTTCCTAATAAGGAATGGTG'),
  (7, 4, 'Finca La Cumbre lote 1', 'Caldas', '2026-06-09', 'AGGCAGTCCTCGATCCGTTCTTAATAAGGAATGGTC'),
  (8, 5, 'Plantacion Uraba lote 5', 'Antioquia', '2026-02-05', 'ATTCCCTGTCATACCAATCTACCCCCTGTTATGCGC'),
  (9, 6, 'Finca Aguacatales lote 6', 'Valle del Cauca', '2026-04-22', 'GTTTGCCGTTAGACCAATGTCAGCGCAGCGGCAGAT'),
  (10, 7, 'Cultivo Floricola Sabana 2', 'Cundinamarca', '2026-05-30', 'CAAGCAGGAGGCGGAATGTAAACAGAAGGTATGCTT'),
  (11, 1, 'LOTE-DEMO-LONGITUD', 'Boyaca', '2026-07-01', 'AGACTTTCAAAGATATGCTGGGTAGAGGTC');

INSERT IGNORE INTO brotes (id, plantaId, enfermedadId, fecha, region, hectareasAfectadas) VALUES
  (1, 1, 1, '2026-02-14', 'Boyaca', 4.5),
  (2, 1, 1, '2026-03-28', 'Boyaca', 12.25),
  (3, 1, 1, '2026-04-19', 'Cundinamarca', 8.0),
  (4, 1, 1, '2026-09-12', 'Boyaca', 15.75),
  (5, 2, 2, '2026-03-03', 'Cundinamarca', 2.5),
  (6, 2, 2, '2026-05-22', 'Antioquia', 6.0),
  (7, 2, 2, '2026-08-30', 'Cundinamarca', 3.25),
  (8, 2, 4, '2026-04-10', 'Antioquia', 1.75),
  (9, 2, 5, '2026-06-18', 'Antioquia', 5.5),
  (10, 2, 5, '2026-07-25', 'Cundinamarca', 9.0),
  (11, 2, 3, '2026-06-02', 'Cundinamarca', 2.0),
  (12, 4, 6, '2026-02-09', 'Caldas', 18.5),
  (13, 4, 6, '2026-03-14', 'Caldas', 22.75),
  (14, 4, 6, '2026-10-05', 'Caldas', 10.0),
  (15, 4, 6, '2026-04-27', 'Huila', 7.25),
  (16, 4, 7, '2026-05-16', 'Caldas', 3.5),
  (17, 5, 3, '2026-03-20', 'Antioquia', 11.0),
  (18, 5, 3, '2026-08-08', 'Antioquia', 14.5),
  (19, 6, 8, '2026-06-27', 'Valle del Cauca', 2.75),
  (20, 7, 9, '2026-05-04', 'Cundinamarca', 1.25),
  (21, 7, 9, '2026-09-21', 'Cundinamarca', 0.75),
  (22, 1, 7, '2026-07-09', 'Boyaca', 3.0),
  (23, 3, 3, '2026-08-17', 'Huila', 1.5),
  (24, 2, 8, '2026-09-02', 'Cundinamarca', 4.0);
