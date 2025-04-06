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

# Example usage:
puzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
]

candidates = initialize_candidates(puzzle)

# Print the candidates for each empty cell
for pos, nums in candidates.items():
    print(f"Position {pos} could be: {nums}")