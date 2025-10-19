## 🎮 The Game Rules

Before we dive into the distributed systems concepts, let's understand the game you're building:

**Setup:**

- 5x5 board (25 squares)
- All squares start at 0
- First player is the **Odd Player**, second player is the **Even Player**

**Gameplay:**

- Click any square to increment its number by 1 (0→1→2→3→4...)
- Both players can click any square at any time (no turns!)
- Multiple clicks on the same square keep incrementing it

**Winning:**

- **Odd Player wins** if any row, column, or diagonal has all 5 odd numbers
    - Example: [1, 3, 5, 7, 9] or [1, 1, 1, 1, 1]
- **Even Player wins** if any row, column, or diagonal has all 5 even numbers
    - Example: [2, 4, 6, 8, 10] or [4, 6, 8, 8, 8]

**Strategy:**

- Odd player clicks squares to make/keep them odd
- Even player clicks squares to make/keep them even
- Fighting over the same squares is the game!
- If both players click a square with 5, it becomes 7 (stays odd)
- If both players click a square with 4, it becomes 6 (stays even)

## Installation

1. Clone repo:
   ```bash
   git clone https://github.com/huyle44/Multiplayer-Odd-Even-Tic-Tac-Toe
2. Install dependencies for both client and server:
   ```bash
   npm i
3. Run server:
   ```bash
   npm run dev
5. Run 1st client:
   ```bash
   npm start
7. Run 2nd client:
   ```bash
   npm start

## 🎥 Demo Video
Demo video link: https://youtu.be/M1gLvEwnfyk
  
