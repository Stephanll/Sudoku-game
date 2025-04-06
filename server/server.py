from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from copy import deepcopy

app = Flask(__name__)
CORS(app)

current_puzzles = {}



@app.route('/api/test-check', methods=['POST'])
def test_check():
    """Test endpoint to verify backend is working"""
    test_grid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
    
    return jsonify({
        'isComplete': True,
        'isValid': True,
        'errors': []
    })

@app.route('/api/new-puzzle', methods=['GET'])
def new_puzzle():
    difficulty = request.args.get('difficulty', 'easy')
    puzzle = generate_sudoku(difficulty)
    
    # Store puzzle and solution (for verification)
    puzzle_id = len(current_puzzles) + 1
    current_puzzles[puzzle_id] = {
        'puzzle': deepcopy(puzzle),
        'solution': solve_sudoku(puzzle)  # Implement your solver here
    }
    
    return jsonify({
        'puzzle': puzzle,
        'puzzle_id': puzzle_id,
        'difficulty': difficulty
    })

@app.route('/api/check-solution', methods=['POST'])
def check_solution():
    data = request.json
    user_grid = data['userGrid']
    
    # Validate grid structure
    if not isinstance(user_grid, list) or len(user_grid) != 9:
        return jsonify({'error': 'Invalid grid format'}), 400
    
    for row in user_grid:
        if len(row) != 9 or not all(isinstance(num, int) and 0 <= num <= 9 for num in row):
            return jsonify({'error': 'Invalid row format'}), 400
    
    is_complete = all(cell != 0 for row in user_grid for cell in row)
    is_valid = is_valid_solution(user_grid) if is_complete else False
    
    # Find error positions
    errors = []
    if is_complete and not is_valid:
        # Check row errors
        for row in range(9):
            if len(set(user_grid[row])) != 9:
                errors.extend({'row': row, 'col': col} for col in range(9))
        
        # Check column errors
        for col in range(9):
            column = [user_grid[row][col] for row in range(9)]
            if len(set(column)) != 9:
                errors.extend({'row': row, 'col': col} for row in range(9))
        
        # Check box errors
        for box_row in range(0, 9, 3):
            for box_col in range(0, 9, 3):
                box = [
                    user_grid[row][col]
                    for row in range(box_row, box_row + 3)
                    for col in range(box_col, box_col + 3)
                ]
                if len(set(box)) != 9:
                    errors.extend(
                        {'row': row, 'col': col}
                        for row in range(box_row, box_row + 3)
                        for col in range(box_col, box_col + 3)
                    )
        
        # Deduplicate errors
        errors = [dict(t) for t in {tuple(d.items()) for d in errors}]

    return jsonify({
        'isComplete': is_complete,
        'isValid': is_valid,
        'errors': errors
    })

def is_valid_solution(grid):
    """Check if a completed Sudoku grid is valid"""
    # Check all cells are filled (1-9)
    if any(cell == 0 or not 1 <= cell <= 9 for row in grid for cell in row):
        return False

    # Check all rows contain unique digits 1-9
    for row in grid:
        if len(set(row)) != 9:
            return False

    # Check all columns contain unique digits 1-9
    for col in zip(*grid):  # Transpose the grid
        if len(set(col)) != 9:
            return False

    # Check all 3x3 boxes contain unique digits 1-9
    for box_row in range(0, 9, 3):
        for box_col in range(0, 9, 3):
            box = [
                grid[row][col]
                for row in range(box_row, box_row + 3)
                for col in range(box_col, box_col + 3)
            ]
            if len(set(box)) != 9:
                return False

    return True

def generate_sudoku(difficulty="easy"):
    """Generate a Sudoku puzzle of specified difficulty"""
    # Create a solved puzzle first
    base = 3
    side = base * base
    
    # Pattern for a baseline valid solution
    def pattern(r, c): return (base * (r % base) + r // base + c) % side
    
    # Randomize rows, columns and numbers
    def shuffle(s): return random.sample(s, len(s))
    
    rBase = range(base)
    rows = [g * base + r for g in shuffle(rBase) for r in shuffle(rBase)]
    cols = [g * base + c for g in shuffle(rBase) for c in shuffle(rBase)]
    nums = shuffle(range(1, base * base + 1))
    
    # Produce board using randomized baseline pattern
    board = [[nums[pattern(r, c)] for c in cols] for r in rows]
    
    # Determine number of squares to remove based on difficulty
    diffs = {
        "easy": 30,   # ~35-40 remaining cells
        "medium": 45,  # ~25-30 remaining cells
        "hard": 55     # ~15-20 remaining cells
    }
    squares = side * side
    empties = diffs.get(difficulty, 30)
    
    # Remove numbers to create the puzzle
    for p in random.sample(range(squares), empties):
        board[p // side][p % side] = 0
    
    # Convert to box-major format for our frontend
    box_major = []
    for box_row in range(3):
        for box_col in range(3):
            box = []
            for i in range(3):
                for j in range(3):
                    box.append(board[box_row*3 + i][box_col*3 + j])
            box_major.append(box)
    
    return box_major


@app.route('/api/request-suggestion', methods=['POST'])
def get_suggestion():
    puzzle = request.json['puzzle']
    candidates = initialize_candidates(puzzle)
    
    # Find first cell with exactly one candidate
    suggestion = None
    for (row, col), nums in candidates.items():
        if len(nums) == 1:
            suggestion = {
                'row': row,
                'col': col,
                'possible_values': list(nums)
            }
            break
    
    return jsonify({
        'suggestion': suggestion,
        'message': 'No obvious suggestions found' if suggestion is None else None
    })

def initialize_candidates(puzzle):
    candidates = {}
    
    for row in range(9):
        for col in range(9):
            if puzzle[row][col] == 0:
                possible = set(range(1, 10))  # Start with 1-9
                
                # Check ROW constraints
                for num in puzzle[row]:
                    if num in possible:
                        possible.remove(num)
                
                # Check COLUMN constraints
                for r in range(9):
                    num = puzzle[r][col]
                    if num in possible:
                        possible.remove(num)
                
                # Check BOX constraints
                box_row = (row // 3) * 3  # Top row of the box
                box_col = (col // 3) * 3  # Left column of the box
                for i in range(3):
                    for j in range(3):
                        num = puzzle[box_row + i][box_col + j]
                        if num in possible:
                            possible.remove(num)
                
                candidates[(row, col)] = possible
                
    return candidates

def solve_sudoku(puzzle):
    # TODO: Implement your solver
    pass

def get_error_positions(user_grid, solution):
    errors = []
    for i in range(9):
        for j in range(9):
            if user_grid[i][j] != solution[i][j]:
                errors.append((i, j))
    return errors

def is_valid_solution(grid):
    # Check rows
    for row in grid:
        if len(set(row)) != 9 or 0 in row:
            return False
    
    # Check columns
    for col in zip(*grid):
        if len(set(col)) != 9:
            return False
    
    # Check 3x3 boxes
    for box_row in range(0, 9, 3):
        for box_col in range(0, 9, 3):
            box = [
                grid[row][col]
                for row in range(box_row, box_row + 3)
                for col in range(box_col, box_col + 3)
            ]
            if len(set(box)) != 9:
                return False
    return True

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Changed port