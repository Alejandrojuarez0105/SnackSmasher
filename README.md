# SnackSmasher

## Concepto

**SnackSmasher** no es solo un restaurante/bar. Es el punto de encuentro donde el fútbol se grita, las partidas se celebran y los momentos se vuelven memorables.

Imagina un espacio amplio, moderno y lleno de energía, con pantallas gigantes transmitiendo los mejores partidos en vivo mientras, a pocos pasos, tus amigos están compitiendo en una partida intensa de videojuegos. Aquí no solo vienes a comer o a tomar algo: vienes a vivir la experiencia.

El concepto combina lo mejor de dos mundos: la pasión deportiva y la cultura gamer. Un lugar diseñado para que puedas disfrutar tanto en pareja como en grupo o incluso solo, pero nunca sentirte fuera de lugar. Desde una tarde tranquila con snacks y una consola, hasta una noche vibrante de clásicos, torneos improvisados y goles en el último minuto.

SnackSmasher apuesta por:

- 🎮 Zonas gamer equipadas con consolas y pantallas de alta calidad.
- ⚽ Transmisión en vivo de partidos importantes en un ambiente envolvente.
- 🍔 Snacks y comida pensados para compartir (o no).
- 🍻 Bebidas que acompañan cada victoria y cada celebración.
- 🔥 Un ambiente amplio, cómodo y dinámico que invita a quedarse.

El propósito de presentar este concepto aquí es desarrollar la base para el diseño y programación de la página web del restaurante, transmitiendo desde el primer vistazo la identidad del lugar: diversión, comunidad y entretenimiento en un solo espacio.

SnackSmasher no es solo un lugar al que vas.
Es el lugar al que quieres volver.

## Estructura del proyecto hasta ahora:

```
Proyecto/
├── Database/
│   └── SnackSmasherDB_Script.sql
│
├── SnackSmasherCore/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── EventsController.cs
│   │   ├── GameReservationsController.cs
│   │   ├── MenuController.cs
│   │   ├── ReviewsController.cs
│   │   ├── TableReservationsController.cs
│   │   ├── TablesController.cs
│   │   ├── UsersController.cs
│   │   └── VideogamesController.cs
│   │
│   ├── Data/
│   │   └── ApplicationDbContext.cs
│   │
│   ├── DTOs/
│   │   ├── AuthDto.cs
│   │   ├── EventDto.cs
│   │   ├── GameReservationDto.cs
│   │   ├── MenuDto.cs
│   │   ├── ReviewDto.cs
│   │   ├── TableDto.cs
│   │   ├── TableReservationDto.cs
│   │   ├── UserDto.cs
│   │   └── VideogameDto.cs
│   │
│   ├── Models/
│   │   ├── Event.cs
│   │   ├── GameReservation.cs
│   │   ├── MenuCategory.cs
│   │   ├── MenuItem.cs
│   │   ├── Review.cs
│   │   ├── Table.cs
│   │   ├── TableReservation.cs
│   │   ├── User.cs
│   │   └── Videogame.cs
│   │
│   ├── Properties/
│   │   └── launchSettings.json
│   │
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── EventService.cs
│   │   ├── GameReservationService.cs
│   │   ├── IAuthService.cs
│   │   ├── IEventService.cs
│   │   ├── IGameReservation.cs
│   │   ├── IMenuService.cs
│   │   ├── IReviewService.cs
│   │   ├── ITableReservationService.cs
│   │   ├── ITableService.cs
│   │   ├── IUserService.cs
│   │   ├── IVideogameService.cs
│   │   ├── MenuService.cs
│   │   ├── ReviewService.cs
│   │   ├── TableReservationService.cs
│   │   ├── TableService.cs
│   │   ├── UserService.cs
│   │   └── VideogameService.cs
│   │
│   ├── appsettings.json
│   ├── Program.cs
│   ├── SnackSmasherCore.csproj
│   └── SnackSmasherCore.sln
│
├── SnackSmasherPortal/ (en producción)
│
├── .gitignore
└── README.md
```
