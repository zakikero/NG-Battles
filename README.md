# ⚔️ NG-Battles - Multiplayer Turn-Based Strategy Game

<div align="center">

![Angular](https://img.shields.io/badge/Angular-18.2-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.5-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

_A full-stack real-time multiplayer tactical RPG with intelligent AI, custom map editor, and dual game modes_

[Features](#-key-features) • [Architecture](#-technical-architecture) • [Getting Started](#-getting-started) • [Screenshots](#-game-features) • [Tech Stack](#-technology-stack)

</div>

---

## 📋 Project Overview

**NG-Battles** is a sophisticated turn-based multiplayer strategy game built as a full-stack web application. Players engage in tactical combat on customizable grid-based maps, collecting items, battling opponents, and competing in both **Classic** and **Capture The Flag (CTF)** game modes. The project showcases advanced software engineering practices including real-time communication, AI opponents, comprehensive testing, and cloud deployment.

### 🎯 Project Highlights

-   **Real-time multiplayer** gameplay supporting 2-4 players with WebSocket communication
-   **Intelligent AI opponents** with adaptive behavior (aggressive/defensive strategies)
-   **Custom map editor** with validation and tile-based design system
-   **Dual game modes**: Classic (combat-based) and Capture The Flag
-   **Complete player progression** system with stats tracking and global leaderboards
-   **Turn-based combat** system with dice mechanics and item effects
-   **Cloud deployment** on AWS EC2 with MongoDB Atlas integration
-   **95%+ test coverage** with unit and end-to-end testing

---

## ✨ Key Features

### 🎮 Game Mechanics

-   **Turn-Based Tactical Movement**: Grid-based pathfinding with shortest path calculation using BFS algorithm
-   **Dynamic Combat System**: Dice-roll based combat with attack/defense mechanics and escape probability
-   **Item Collection**: Power-ups affecting attack, defense, speed, and health attributes
-   **Environmental Effects**: Special tiles (water, ice, doors) affecting movement and combat
-   **Virtual Players (AI)**: Intelligent bots with decision-making algorithms for movement, combat, and item collection
-   **Timer System**: Configurable turn timers with cooldown periods and combat phases

### 🎲 Game Modes

1. **Classic Mode**: Defeat opponents through combat - first player to win 3 battles wins the match
2. **Capture The Flag (CTF)**: Capture the enemy flag and return it to your base while defending your own

### 🗺️ Map Creation & Management

-   **Visual Map Editor**: Drag-and-drop interface for creating custom game maps
-   **Tile System**: 7 different tile types (floor, wall, door, water, ice, etc.)
-   **Item Placement**: Strategic positioning of power-ups and flags
-   **Map Validation**: Real-time validation ensuring playable maps (accessible tiles, valid starting points)
-   **Import/Export**: JSON-based map serialization for sharing and storage
-   **MongoDB Persistence**: Maps saved to database with versioning and visibility controls

### 👥 Multiplayer Features

-   **Room-based Matchmaking**: Create or join game rooms with unique IDs
-   **Real-time Chat**: In-game communication system
-   **Player Customization**: Avatar selection and attribute allocation
-   **Spectator Mode**: Observe ongoing matches
-   **Global Statistics**: Track total games, wins, combat encounters across all players
-   **Admin Controls**: Game master privileges for managing matches

### 📊 Player Statistics & Progression

-   **Individual Stats**: Combat count, victories/defeats, health metrics, unique items collected
-   **Match Statistics**: Turn count, map exploration percentage, door usage tracking
-   **Leaderboard**: Real-time rankings based on performance
-   **Replay System**: Game logs with action history

---

## 🏗️ Technical Architecture

This project demonstrates enterprise-level full-stack development with clear separation of concerns:

```
NG-Battles/
├── client/              # Angular 18 Frontend (SPA)
│   ├── components/      # 30+ reusable UI components
│   ├── pages/           # Route-based page components
│   ├── services/        # Business logic & API communication
│   └── assets/          # Game sprites and resources
│
├── server/              # NestJS Backend (REST + WebSockets)
│   ├── controllers/     # HTTP endpoints (REST API)
│   ├── gateways/        # WebSocket gateways (4 channels)
│   ├── services/        # Business logic layer (20+ services)
│   ├── model/           # MongoDB schemas & data models
│   └── data-structures/ # Game state management
│
└── common/              # Shared TypeScript interfaces & types
    ├── game-structure.ts
    ├── player.ts
    ├── combat-actions.ts
    └── tile-types.ts
```

### 🔌 Real-Time Communication Architecture

The application uses **Socket.IO** with 4 specialized WebSocket gateways:

1. **MatchGateway**: Room creation, player joining, turn management
2. **ActionGateway**: Movement, actions, turn progression
3. **CombatGateway**: Combat initiation, attacks, escape attempts
4. **InventoryGateway**: Item management and usage

### 🧩 Key Design Patterns

-   **State Pattern**: Game states (Not Playing, Moving, Action, Combat) with dedicated service classes
-   **Strategy Pattern**: Virtual player behavior (aggressive vs. defensive)
-   **Observer Pattern**: Event-driven architecture with Socket.IO subscriptions
-   **Dependency Injection**: NestJS and Angular DI containers for loose coupling
-   **Repository Pattern**: Database abstraction with Mongoose models
-   **Gateway Pattern**: WebSocket communication layer separation

---

## 🛠️ Technology Stack

### Frontend

-   **Angular 18.2**: Component-based SPA framework
-   **Angular Material**: UI component library (dialogs, buttons, cards, tabs)
-   **RxJS 7.8**: Reactive programming for state management
-   **Socket.IO Client 4.7**: Real-time bidirectional communication
-   **TypeScript 5.0**: Type-safe development

### Backend

-   **NestJS 10.3**: Progressive Node.js framework
-   **Express**: HTTP server foundation
-   **Socket.IO 4.7**: WebSocket server implementation
-   **Mongoose 8.5**: MongoDB ODM for data persistence
-   **Class-validator**: DTO validation and transformation

### Database & Infrastructure

-   **MongoDB Atlas**: Cloud-hosted NoSQL database
-   **AWS EC2**: Elastic cloud compute for server hosting
-   **GitLab Pages**: Static site hosting for client
-   **GitLab CI/CD**: Automated testing and deployment pipelines

### Testing & Quality Assurance

-   **Jasmine & Karma**: Frontend unit and integration testing
-   **Jest**: Backend testing framework
-   **Supertest**: HTTP endpoint testing
-   **ESLint & Prettier**: Code quality and formatting
-   **95%+ Code Coverage**: Comprehensive test suites

---

## 🎮 Game Features

### Combat System

The game features a sophisticated turn-based combat system with:

-   **Dice-based mechanics** with configurable dice types per player
-   **Attribute modifiers**: Attack/defense bonuses from collected items
-   **Escape mechanics**: Probability-based retreat with token system
-   **Environmental effects**: Ice tiles penalize combat, tiles affect movement cost
-   **Health tracking**: Persistent health across combats with damage calculation
-   **Victory conditions**: First to 3 combat wins or successful flag capture

### Intelligent AI (Virtual Players)

Virtual players feature advanced decision-making algorithms:

-   **Personality types**: Aggressive (prioritizes combat) vs. Defensive (focuses on items)
-   **Pathfinding**: Uses Dijkstra's algorithm for optimal movement
-   **Strategic decision-making**: Evaluates item priorities, combat opportunities, and flag objectives
-   **Randomized behavior**: Unpredictable actions to simulate human play
-   **Action management**: Handles movement, combat, item usage, and turn progression autonomously

### Movement & Pathfinding

-   **BFS shortest path algorithm** with weighted tiles
-   **Visual path preview** showing accessible tiles and optimal routes
-   **Movement budget system** based on player speed attribute
-   **Obstacle avoidance**: Walls, closed doors, water, and ice affect pathfinding
-   **Player collision detection**: Cannot move to occupied tiles

### Map Editor

A complete level design tool featuring:

-   **Grid-based editor** with intuitive drag-and-drop interface
-   **7 tile types**: Floor, walls, doors (open/closed), water, ice
-   **10+ item types**: Attack boosts, defense boosts, speed items, flags
-   **Real-time validation**: Ensures maps are playable before saving
-   **JSON import/export**: Share custom maps
-   **Map gallery**: Browse and select from saved maps

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB instance (local or Atlas)
```

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/zakikero/NG-Battles.git
cd NG-Battles
```

2. **Install dependencies for both client and server**

```bash
# Install root dependencies
npm ci

# Install client dependencies
cd client
npm ci

# Install server dependencies
cd ../server
npm ci
```

3. **Configure environment variables**

Create a `.env` file in the `server/` directory:

```env
DATABASE_CONNECTION_STRING=mongodb://localhost:27017/ng-battles
# Or use MongoDB Atlas:
# DATABASE_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/ng-battles
```

### Running the Application

**Start the backend server:**

```bash
cd server
npm start
```

Server runs on `http://localhost:3000`

**Start the frontend client:**

```bash
cd client
npm start
```

Client runs on `http://localhost:4200` and opens automatically in your browser

### Testing

**Run all tests:**

```bash
# Client tests
cd client
npm test

# Server tests
cd server
npm test
```

**Generate coverage reports:**

```bash
# Client coverage
cd client
npm run coverage

# Server coverage
cd server
npm run coverage
```

### Building for Production

```bash
# Build client
cd client
npm run build

# Build server
cd server
npm run build
```

---

## 📂 Project Structure Details

### Frontend Architecture (`/client`)

**Components (30+ reusable components)**

-   **Pages**: Game page, character selection, map editor, waiting room, admin panel
-   **Game Components**: Map renderer, combat interface, inventory, player panels, timer
-   **UI Components**: Chat, leaderboard, logs, modals, dialogs
-   **Map Components**: Tile renderer, flag objects, map preview, edit tools

**Services (20+ injectable services)**

-   **State Management**: Game state machine (NotPlaying → Moving → Action → Combat)
-   **Communication**: Socket service (WebSocket), HTTP client service (REST)
-   **Game Logic**: Movement state, combat state, action state, game controller
-   **Map Services**: Map editor service, map game service, drag-drop service
-   **Utilities**: ID generation, time service, player service

### Backend Architecture (`/server`)

**Controllers**

-   `GameController`: RESTful API for CRUD operations on game maps

**Gateways (WebSocket Handlers)**

-   `MatchGateway`: Room management, player joining, turn system
-   `ActionGateway`: Movement, actions, turn progression, end game
-   `CombatGateway`: Combat initialization, attack/escape actions
-   `InventoryGateway`: Item pickup, usage, and management

**Services (20+ business logic services)**

-   **Core Services**: Game service, match service, active games service
-   **Validation**: Map validation, game validation (CTF rules, tile placement)
-   **Game Mechanics**: Movement service (pathfinding), combat service, action handler
-   **AI**: Virtual player service with strategy patterns
-   **Support**: Timer service, inventory service, log sender, global stats

**Data Layer**

-   **MongoDB Models**: Game schema with Mongoose
-   **Data Structures**: Player, game instance, room, tile types

### Shared Code (`/common`)

TypeScript interfaces and enums shared between client and server:

-   Game structures and tile types
-   Player attributes and statistics
-   Combat actions and game states
-   Message interfaces for communication

---

## 🎯 Software Engineering Practices

### Code Quality

-   **TypeScript Strict Mode**: Type safety across entire codebase
-   **ESLint**: Enforced coding standards with custom rules
-   **Prettier**: Consistent code formatting
-   **Max Lines/Complexity Rules**: Maintained code readability

### Testing Strategy

-   **Unit Tests**: 164+ test files with Jasmine (client) and Jest (server)
-   **Integration Tests**: Socket communication, database operations
-   **End-to-End Tests**: Complete game flow testing
-   **Mocking**: Sinon.js for service mocking and stubbing
-   **Code Coverage**: 95%+ coverage maintained throughout development

### Version Control & CI/CD

-   **Git Workflow**: Feature branches, pull requests, code reviews
-   **GitLab CI/CD**: Automated testing pipeline on every commit
-   **Deployment Pipeline**: Manual deployment stages with tags
-   **Environment Management**: Separate dev/prod configurations

### Architecture Patterns

-   **Clean Architecture**: Clear separation of concerns (presentation, business, data)
-   **Dependency Injection**: Loose coupling and testability
-   **State Pattern**: Game state management with dedicated handlers
-   **Strategy Pattern**: AI behavior selection
-   **Observer Pattern**: Event-driven real-time updates

---

## 🌐 API Documentation

The server exposes a RESTful API and WebSocket endpoints:

### REST API Endpoints

```
GET    /api/games          # Retrieve all games
GET    /api/games/:id      # Get specific game
POST   /api/games          # Create new game
PUT    /api/games/:id      # Update existing game
DELETE /api/games/:id      # Delete game
PATCH  /api/games/:id/visibility  # Toggle game visibility
```

**API Documentation**: Access interactive Swagger documentation at `http://localhost:3000/api/docs`

### WebSocket Events

**Match Events**

-   `createRoom`: Initialize new game room
-   `joinRoom`: Join existing room
-   `startGame`: Begin match with all players
-   `nextTurn`: Progress to next player's turn
-   `quitGame`: Leave active match

**Action Events**

-   `move`: Move player to new tile
-   `endTurn`: Complete current turn
-   `toggleDoor`: Open/close door tiles
-   `useItem`: Activate item from inventory

**Combat Events**

-   `combat`: Initiate combat between players
-   `attack`: Execute attack action
-   `escape`: Attempt to flee combat
-   `endCombat`: Resolve combat conclusion

**Inventory Events**

-   `pickItem`: Add item to player inventory
-   `dropItem`: Remove item from inventory

---

## 🎨 Game Design Highlights

### Visual Design

-   Custom sprite-based tile system
-   Avatar selection with multiple character options
-   Color-coded UI elements for player distinction
-   Responsive grid-based layout
-   Material Design components for consistent UX

### User Experience

-   Intuitive drag-and-drop map editor
-   Real-time turn indicators
-   Visual feedback for available moves
-   Chat system for player communication
-   Toast notifications for game events
-   Kick/abandon player management

### Game Balance

-   Configurable attribute allocation during character creation
-   Item rarity and strategic placement
-   Combat dice mechanics with statistical balance
-   Movement costs balanced across tile types
-   Turn timer to maintain game pace

---

## 🚀 Deployment

The application is deployed using automated CI/CD pipelines with GitLab:

### Production Environment

-   **Frontend**: GitLab Pages with production-optimized Angular build
-   **Backend**: AWS EC2 instance with PM2 process management
-   **Database**: MongoDB Atlas cloud cluster
-   **Monitoring**: AWS CloudWatch for performance tracking and logs
-   **CI/CD**: Automated testing and deployment via GitLab pipelines

### Development Practices

-   Code reviews for all changes
-   Test-driven development with 95%+ coverage
-   Automated linting and formatting checks
-   Continuous integration with automated testing
-   Adherence to SOLID principles and design patterns

---

## 📝 License & Academic Context

This project was developed as part of the LOG2990 (Software Engineering Project) course at Polytechnique Montréal. It demonstrates full-stack development capabilities, software architecture design, and modern web development practices.

---

## 👨‍💻 Technical Skills Demonstrated

### Frontend Development

✅ Angular 18 with TypeScript  
✅ Reactive programming with RxJS  
✅ Component-based architecture  
✅ State management patterns  
✅ Real-time WebSocket communication  
✅ Angular Material UI implementation

### Backend Development

✅ NestJS framework with dependency injection  
✅ RESTful API design  
✅ WebSocket servers with Socket.IO  
✅ MongoDB database design and queries  
✅ Service-oriented architecture  
✅ Express middleware and routing

### Software Engineering

✅ Design patterns (State, Strategy, Observer, Repository)  
✅ Test-driven development (95%+ coverage)  
✅ Clean code principles  
✅ CI/CD pipelines  
✅ Git version control workflows  
✅ Cloud deployment (AWS EC2, MongoDB Atlas)

### Algorithms & Data Structures

✅ Pathfinding algorithms (BFS, Dijkstra)  
✅ Game AI decision trees  
✅ Grid-based spatial data structures  
✅ Real-time game state synchronization  
✅ Event-driven architecture

---
