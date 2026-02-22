-- ============================================
-- SNACKSMASHER BAR - BASE DE DATOS COMPLETA
-- ============================================

USE master;
GO

-- Eliminar BD si existe
IF EXISTS (SELECT * FROM sys.databases WHERE name = 'SnackSmasherBar')
BEGIN
    ALTER DATABASE SnackSmasherBar SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE SnackSmasherBar;
END
GO

-- Crear base de datos
CREATE DATABASE SnackSmasherBar
COLLATE SQL_Latin1_General_CP1_CI_AS;
GO

USE SnackSmasherBar;
GO

-- ============================================
-- 1. TABLA: Users
-- ============================================
CREATE TABLE Users (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Username    NVARCHAR(50) UNIQUE NOT NULL,
    Password    NVARCHAR(255) NOT NULL,   -- siempre guardado como hash BCrypt
    Email       NVARCHAR(100),
    FirstName   NVARCHAR(100),
    LastName    NVARCHAR(100),
    Role        INT DEFAULT 2,            -- 1 = Admin, 2 = Usuario
    CreatedAt   DATETIME2 DEFAULT GETDATE(),
    IsActive    BIT DEFAULT 1,

    INDEX idx_username (Username)
);
GO

-- ============================================
-- 2. TABLA: Videogames
-- ============================================
CREATE TABLE Videogames (
    Id                  INT PRIMARY KEY IDENTITY(1,1),
    Title               NVARCHAR(150) NOT NULL,
    Description         NVARCHAR(500),
    Genre               NVARCHAR(80) NOT NULL,
    Platform            NVARCHAR(50) NOT NULL
                        CHECK (Platform IN ('PS5', 'Xbox', 'Switch', 'PC', 'Multiplataforma')),
    IsMultiplayer       BIT NOT NULL DEFAULT 0,
    TotalCopies         INT NOT NULL DEFAULT 1,
    AvailableCopies     INT NOT NULL DEFAULT 1,
    MaxSessionMinutes   INT NOT NULL DEFAULT 60,
    ImageUrl            NVARCHAR(500),
    IsAvailable         BIT NOT NULL DEFAULT 1,
    CreatedAt           DATETIME2 DEFAULT GETDATE(),
    UpdatedAt           DATETIME2 DEFAULT GETDATE(),

    INDEX idx_vg_title    (Title),
    INDEX idx_vg_genre    (Genre),
    INDEX idx_vg_platform (Platform)
);
GO

-- ============================================
-- 3. TABLA: GameReservations
-- ============================================
CREATE TABLE GameReservations (
    Id              INT PRIMARY KEY IDENTITY(1,1),
    UserId          INT NOT NULL,
    VideogameId     INT NOT NULL,
    ReservationDate DATE NOT NULL,
    StartTime       TIME NOT NULL,
    EndTime         TIME NOT NULL,
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Active'
                    CHECK (Status IN ('Active', 'Completed', 'Cancelled')),
    Notes           NVARCHAR(300),
    CreatedAt       DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_GameRes_Users      FOREIGN KEY (UserId)      REFERENCES Users(Id)      ON DELETE NO ACTION,
    CONSTRAINT FK_GameRes_Videogames FOREIGN KEY (VideogameId) REFERENCES Videogames(Id) ON DELETE NO ACTION,
    CONSTRAINT CHK_GameTimes         CHECK (EndTime > StartTime),

    INDEX idx_gr_userid  (UserId),
    INDEX idx_gr_gameid  (VideogameId),
    INDEX idx_gr_date    (ReservationDate),
    INDEX idx_gr_status  (Status)
);
GO

-- ============================================
-- 4. TABLA: Tables (Mesas)
-- ============================================
CREATE TABLE Tables (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Number      INT NOT NULL UNIQUE,
    Capacity    INT NOT NULL,
    Description NVARCHAR(200),
    IsActive    BIT NOT NULL DEFAULT 1
);
GO

-- ============================================
-- 5. TABLA: TableReservations
-- ============================================
CREATE TABLE TableReservations (
    Id              INT PRIMARY KEY IDENTITY(1,1),
    UserId          INT NOT NULL,
    TableId         INT NOT NULL,
    ReservationDate DATE NOT NULL,
    StartTime       TIME NOT NULL,
    EndTime         TIME NOT NULL,
    GuestCount      INT NOT NULL DEFAULT 1,
    IsMatchEvent    BIT NOT NULL DEFAULT 0,
    Notes           NVARCHAR(300),
    Status          NVARCHAR(20) NOT NULL DEFAULT 'Confirmed'
                    CHECK (Status IN ('Confirmed', 'Cancelled', 'Completed')),
    CreatedAt       DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_TableRes_Users  FOREIGN KEY (UserId)  REFERENCES Users(Id)  ON DELETE NO ACTION,
    CONSTRAINT FK_TableRes_Tables FOREIGN KEY (TableId) REFERENCES Tables(Id) ON DELETE NO ACTION,
    CONSTRAINT CHK_TableTimes     CHECK (EndTime > StartTime),

    INDEX idx_tr_userid  (UserId),
    INDEX idx_tr_tableid (TableId),
    INDEX idx_tr_date    (ReservationDate, TableId)
);
GO

-- ============================================
-- 6. TABLA: Reviews
-- ============================================
CREATE TABLE Reviews (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    UserId      INT NOT NULL,
    VideogameId INT NOT NULL,
    Rating      INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Comment     NVARCHAR(500),
    CreatedAt   DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_Reviews_Users      FOREIGN KEY (UserId)      REFERENCES Users(Id)      ON DELETE NO ACTION,
    CONSTRAINT FK_Reviews_Videogames FOREIGN KEY (VideogameId) REFERENCES Videogames(Id) ON DELETE NO ACTION,
    CONSTRAINT UQ_OneReviewPerUser   UNIQUE (UserId, VideogameId),

    INDEX idx_rev_gameid (VideogameId),
    INDEX idx_rev_rating (Rating)
);
GO

-- ============================================
-- 7. TABLA: MenuCategories
-- ============================================
CREATE TABLE MenuCategories (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(80) NOT NULL UNIQUE,
    Description NVARCHAR(200)
);
GO

-- ============================================
-- 8. TABLA: MenuItems
-- ============================================
CREATE TABLE MenuItems (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Name        NVARCHAR(150) NOT NULL,
    Description NVARCHAR(300),
    Price       DECIMAL(10,2) NOT NULL,
    ImageUrl    NVARCHAR(500),
    CategoryId  INT NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETDATE(),

    CONSTRAINT FK_MenuItems_Categories FOREIGN KEY (CategoryId)
        REFERENCES MenuCategories(Id) ON DELETE CASCADE,

    INDEX idx_menu_category (CategoryId)
);
GO

-- ============================================
-- 9. TABLA: Events (Partidos y eventos)
-- ============================================
CREATE TABLE Events (
    Id          INT PRIMARY KEY IDENTITY(1,1),
    Title       NVARCHAR(200) NOT NULL,
    Description NVARCHAR(400),
    EventDate   DATE NOT NULL,
    StartTime   TIME NOT NULL,
    EndTime     TIME,
    ImageUrl    NVARCHAR(500),
    IsActive    BIT NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2 DEFAULT GETDATE()
);
GO

-- ============================================
-- 10. TRIGGER: UpdatedAt en Videogames
-- ============================================
CREATE TRIGGER trg_Videogames_UpdatedAt
ON Videogames
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Videogames
    SET UpdatedAt = GETDATE()
    FROM Videogames v
    INNER JOIN inserted i ON v.Id = i.Id;
END;
GO

-- ============================================
-- 11. TRIGGER: Disponibilidad de juegos
-- ============================================
CREATE TRIGGER trg_GameReservations_UpdateAvailability
ON GameReservations
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Reserva activa: reducir copias disponibles
    UPDATE Videogames
    SET AvailableCopies = AvailableCopies - 1,
        IsAvailable     = CASE WHEN (AvailableCopies - 1) > 0 THEN 1 ELSE 0 END
    FROM Videogames v
    INNER JOIN inserted i ON v.Id = i.VideogameId
    WHERE i.Status = 'Active';

    -- Cancelada o completada: devolver copia
    UPDATE Videogames
    SET AvailableCopies = AvailableCopies + 1,
        IsAvailable     = 1
    FROM Videogames v
    INNER JOIN inserted i ON v.Id = i.VideogameId
    WHERE i.Status IN ('Cancelled', 'Completed');
END;
GO

-- ============================================
-- 12. DATOS INICIALES
-- ============================================

-- El hash corresponde a la contraseña: Admin123!
-- (BCrypt lo generará automáticamente en el backend para usuarios nuevos)
INSERT INTO Users (Username, Password, Email, FirstName, LastName, Role) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLHJ8zri', 'admin@snacksmasher.com', 'Admin', 'SnackSmasher', 1),
('alejandro', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLHJ8zri', 'alejandro@email.com', 'Alejandro', 'Juárez', 2),
('maria', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLHJ8zri', 'maria@email.com', 'María', 'Arroniz', 2);
GO

-- Videojuegos
INSERT INTO Videogames (Title, Description, Genre, Platform, IsMultiplayer, TotalCopies, AvailableCopies, MaxSessionMinutes) VALUES
('FIFA 25', 'El clásico fútbol de EA Sports', 'Deportes', 'PS5', 1, 3, 3, 60),
('Mortal Kombat 1', 'Juego de peleas brutal y espectacular', 'Pelea', 'PS5', 1, 2, 2, 60),
('Mario Kart 8 Deluxe','Carreras con personajes de Nintendo', 'Carreras', 'Switch',1, 4, 4, 45),
('Elden Ring', 'RPG de acción en un mundo abierto oscuro', 'RPG', 'PC', 0, 2, 2, 120),
('Rocket League', 'Fútbol con autos cohete', 'Deportes', 'PC', 1, 4, 4, 60),
('Street Fighter 6', 'El rey de los juegos de pelea', 'Pelea', 'PS5', 1, 2, 2, 45),
('FIFA 24', 'Fútbol competitivo de EA Sports', 'Deportes', 'PS5', 1, 3, 3, 60),
('Mario Party Superstars', 'Minijuegos clásicos de Mario Party', 'Party', 'Switch', 1, 3, 3, 60),
('Fortnite', 'Battle Royale competitivo', 'Battle Royale', 'PC', 1, 4, 4, 90),
('Minecraft', 'Juego sandbox creativo', 'Sandbox', 'PC', 1, 4, 4, 120),
('Super Smash Bros Ultimate', 'Peleas con personajes de Nintendo', 'Pelea', 'Switch', 1, 3, 3, 60),
('Fall Guys', 'Competencia divertida tipo party', 'Party', 'PC', 1, 3, 3, 60),
('Call of Duty', 'Shooter militar moderno', 'Shooter', 'PS5', 1, 3, 3, 90),
('Grand Theft Auto V', 'Acción y mundo abierto', 'Acción', 'PS5', 1, 3, 3, 120),
('Counter-Strike 2', 'Shooter táctico competitivo', 'Shooter', 'PC', 1, 4, 4, 90),
('NBA 2K26', 'Simulador oficial de la NBA', 'Deportes', 'PS5', 1, 3, 3, 60),
('Just Dance', 'Juego musical para fiestas', 'Musical', 'Switch', 1, 2, 2, 45),
('Tekken 8', 'Juego de pelea 3D', 'Pelea', 'PS5', 1, 3, 3, 60),
('FIFA 26', 'Nueva temporada del fútbol EA', 'Deportes', 'PS5', 1, 3, 3, 60),
('Overcooked! All You Can Eat', 'Cocina cooperativa caótica', 'Party', 'PS5', 1, 3, 3, 45),
('Cuphead', 'Acción estilo cartoon clásico', 'Plataformas', 'PC', 1, 2, 2, 60),
('Helldivers 2', 'Shooter cooperativo intenso', 'Shooter', 'PS5', 1, 3, 3, 90),
('Mortal Kombat 11', 'Entrega anterior de MK', 'Pelea', 'PS5', 1, 2, 2, 60),
('Valorant', 'Shooter táctico competitivo', 'Shooter', 'PC', 1, 4, 4, 90),
('League of Legends', 'MOBA competitivo online', 'MOBA', 'PC', 1, 5, 5, 120),
('Warioware: Move It!', 'Minijuegos rápidos y locos', 'Party', 'Switch', 1, 2, 2, 45);
GO

-- Mesas
INSERT INTO Tables (Number, Capacity, Description) VALUES
(1, 4, 'Mesa frente a la pantalla principal'),
(2, 6, 'Mesa zona gaming con 2 consolas PS5'),
(3, 2, 'Mesa íntima lateral'),
(4, 8, 'Mesa grande para grupos y eventos'),
(5, 4, 'Mesa zona bar'),
(6, 4, 'Mesa zona retro gaming'),
(7, 6, 'Mesa VIP frente a pantalla gigante'),
(8, 2, 'Mesa rápida para parejas'),
(9, 10, 'Mesa para cumpleaños y torneos'),
(10, 4, 'Mesa cerca del escenario de eventos');
GO

-- Categorías del menú
INSERT INTO MenuCategories (Name, Description) VALUES
('Bebidas',      'Refrescos, bebidas energéticas y bebidas sin alcohol'),
('Snacks',       'Papitas, nachos y snacks salados'),
('Combos Gamer', 'Combos pensados para largas sesiones de juego'),
('Comida',       'Hamburguesas, hot dogs y más'),
('Postres', 'Dulces y opciones para compartir'),
('Cocteles', 'Bebidas alcohólicas especiales'),
('Cervezas', 'Cervezas nacionales e importadas'),
('Mocktails', 'Cocteles sin alcohol'),
('Cafetería', 'Café y bebidas calientes'),
('Entradas Premium', 'Entradas especiales para compartir');
GO

-- Ítems del menú
INSERT INTO MenuItems (Name, Description, Price, CategoryId) VALUES
-- 1. Bebidas
('Coca-Cola 500ml', 'Refresco clásico bien frío', 2.50, 1),
('Pepsi 500ml', 'Refresco clásico', 2.50, 1),
('Sprite', 'Refresco lima-limón', 2.50, 1),
('Red Bull', 'Energética clásica', 3.00, 1),
('Agua Mineral', 'Agua con gas', 2.00, 1),
('Fanta Naranja', 'Refresco sabor naranja', 2.50, 1),
('Ice Tea', 'Té frío sabor limón', 2.50, 1),
('Powerade', 'Bebida isotónica', 2.80, 1),
('Monster Energy', 'Bebida energética para gamers', 3.00, 1),
-- 2. Snacks
('Nachos con queso', 'Nachos crujientes con salsa de queso', 5.00, 2),
('Doritos', 'Nachos sabor queso', 3.50, 2),
('Maní salado', 'Clásico snack', 2.50, 2),
('Palomitas grandes', 'Perfectas para eventos', 4.00, 2),
('Aros de cebolla', 'Crujientes', 5.50, 2),
('Tequeños', 'Con salsa especial', 6.00, 2),
('Alitas BBQ', 'Alitas con salsa BBQ', 8.00, 2),
-- 3. Combos Gamer
('Combo Gamer Básico', 'Refresco + nachos + snack a elegir', 8.50, 3),
('Combo Pro Player', 'Hamburguesa clásica + papas + refresco grande', 12.50, 3),
('Combo Squad', '2 refrescos + nachos grandes + alitas', 16.00, 3),
('Combo Battle Royale', 'Hot dog + papas + energética', 11.00, 3),
('Combo Streamer', 'Wrap de pollo + mocktail + papas', 13.00, 3),
('Combo Ultimate Party', 'Pizza personal + refresco + postre pequeño', 14.50, 3),
-- 4. Comida
('Hamburguesa Clásica','Carne, lechuga, tomate y queso', 9.00, 4),
('Hamburguesa Doble Smash', 'Doble carne, doble queso y salsa especial', 11.50, 4),
('Hot Dog Especial', 'Salchicha premium con papas y salsas', 8.50, 4),
('Wrap de Pollo Crispy', 'Pollo empanizado con lechuga y salsa gamer', 9.50, 4),
('Pizza Personal Pepperoni', 'Pizza individual estilo italiano', 10.00, 4),
('Sandwich BBQ Pulled Pork', 'Cerdo desmenuzado con salsa BBQ', 10.50, 4),
-- 5. Postres
('Brownie con helado', 'Chocolate caliente con helado', 6.50, 5),
('Cheesecake', 'Clásico de frutos rojos', 6.00, 5),
('Torta tres leches', 'Postre tradicional', 5.50, 5),
('Churros', 'Con chocolate', 4.50, 5),
('Galletas gamer', 'Cookies temáticas', 3.50, 5),
('Helado doble scoop', 'Dos sabores a elección', 4.00, 5),
('Milkshake Oreo', 'Batido cremoso', 5.00, 5),
-- 6. Cocteles
('Mojito', 'Ron, menta y limón', 7.50, 6),
('Piña Colada', 'Ron con coco y piña', 8.00, 6),
('Margarita', 'Tequila y limón', 7.50, 6),
('Cuba Libre', 'Ron con cola', 7.00, 6),
('Tequila Sunrise', 'Tequila con jugo de naranja', 7.50, 6),
('Blue Lagoon', 'Vodka y curaçao azul', 8.50, 6),
('Long Island Iced Tea', 'Mezcla potente clásica', 9.00, 6),
-- 7. Cervezas
('Cerveza Artesanal', 'Variedad del día en barril', 4.00, 7),
('Corona', 'Cerveza importada con limón', 4.50, 7),
('Heineken', 'Cerveza premium', 4.50, 7),
('Budweiser', 'Cerveza americana clásica', 4.00, 7),
('Stella Artois', 'Cerveza belga suave', 4.80, 7),
('IPA Local', 'Cerveza artesanal intensa', 5.50, 7),
('Pilsener', 'Cerveza nacional refrescante', 3.50, 7),
-- 8. Mocktails
('Virgin Mojito', 'Menta, limón y soda', 5.50, 8),
('Sunset Tropical', 'Piña y naranja', 5.00, 8),
('Blue Ocean', 'Bebida azul refrescante', 5.00, 8),
('Fresa Spark', 'Fresa con soda', 5.50, 8),
('Limonada Frappé', 'Limonada helada', 4.50, 8),
('Mango Freeze', 'Mango con hielo triturado', 5.50, 8),
('Energy Gamer Mix', 'Energética sin alcohol premium', 6.00, 8),
-- 9. Cafetería
('Espresso', 'Café corto intenso', 2.00, 9),
('Americano', 'Café clásico', 2.50, 9),
('Capuccino', 'Café con espuma de leche', 3.00, 9),
('Latte', 'Café con leche cremoso', 3.50, 9),
('Chocolate caliente', 'Con malvaviscos', 3.50, 9),
('Frappuccino', 'Café frío estilo gamer', 4.50, 9),
('Matcha Latte', 'Té verde con leche', 4.00, 9),
-- 10. Entradas premium
('Tabla Mixta', 'Quesos, jamones y frutos secos', 14.00, 10),
('Mini Burgers', '3 sliders especiales', 12.00, 10),
('Sampler Gamer', 'Nachos + alitas + tequeños', 15.00, 10),
('Quesadilla Especial', 'Pollo y queso fundido', 11.00, 10),
('Papas Loaded', 'Papas con queso y bacon', 10.00, 10),
('Tacos Mix', 'Carne y pollo', 13.00, 10),
('Mega Nachos Supreme', 'Para compartir', 16.00, 10);
GO

-- Evento de ejemplo
INSERT INTO Events (Title, Description, EventDate, StartTime, EndTime) VALUES
('Final Champions League 2026', '¡La gran final en pantalla gigante! Ven a vivirla con nosotros.', '2026-05-31', '20:00', '23:00'),
('Torneo FIFA 26', 'Competencia oficial con premios', '2026-06-15', '18:00', '22:00'),
('Noche Retro Gaming', 'Consolas clásicas y arcade', '2026-04-10', '19:00', '23:00'),
('Torneo Mortal Kombat 1', 'Demuestra tu habilidad', '2026-03-20', '18:30', '22:30'),
('Final Mundial Valorant', 'Transmisión en vivo', '2026-07-05', '17:00', '21:00'),
('Fiesta Mario Party', 'Minijuegos y premios', '2026-08-12', '18:00', '22:00'),
('Final Copa del Mundo 2026', 'La gran final del mundial en pantalla gigante', '2026-07-19', '16:00', '20:00'),
('Final Copa América 2026', 'La definición del continente', '2026-07-10', '19:00', '22:00'),
('Final Eurocopa 2028', 'La final europea más esperada', '2028-07-12', '20:00', '23:00'),
('Final Copa Libertadores', 'La gloria sudamericana', '2026-11-28', '18:00', '22:00'),
('Final Premier League', 'Última jornada decisiva', '2026-05-24', '15:00', '18:00'),
('Final La Liga Española', 'El campeón de España se define', '2026-05-30', '16:00', '19:00'),
('Final Serie A', 'El campeón italiano', '2026-05-29', '16:00', '19:00'),
('Final Bundesliga', 'El campeón alemán', '2026-05-23', '15:30', '18:00');
GO

-- ============================================
-- 13. VISTAS ÚTILES
-- ============================================

-- Videojuegos con su puntuación promedio
CREATE VIEW vw_VideogamesWithRating AS
SELECT
    v.Id,
    v.Title,
    v.Genre,
    v.Platform,
    v.IsMultiplayer,
    v.AvailableCopies,
    v.TotalCopies,
    v.MaxSessionMinutes,
    v.IsAvailable,
    v.ImageUrl,
    ROUND(AVG(CAST(r.Rating AS FLOAT)), 1) AS AverageRating,
    COUNT(r.Id)                             AS TotalReviews
FROM Videogames v
LEFT JOIN Reviews r ON v.Id = r.VideogameId
GROUP BY
    v.Id, v.Title, v.Genre, v.Platform, v.IsMultiplayer,
    v.AvailableCopies, v.TotalCopies, v.MaxSessionMinutes,
    v.IsAvailable, v.ImageUrl;
GO

-- Reservas de mesas con detalle
CREATE VIEW vw_TableReservationsDetail AS
SELECT
    tr.Id,
    t.Number        AS TableNumber,
    t.Capacity,
    u.Username,
    u.FirstName,
    u.LastName,
    tr.ReservationDate,
    tr.StartTime,
    tr.EndTime,
    tr.GuestCount,
    tr.IsMatchEvent,
    tr.Status,
    tr.Notes
FROM TableReservations tr
INNER JOIN Tables t ON tr.TableId = t.Id
INNER JOIN Users  u ON tr.UserId  = u.Id;
GO

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO