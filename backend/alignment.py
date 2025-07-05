def needleman_wunsch(seq1, seq2, match_score=1, mismatch_score=-1, gap_penalty=-2):
    """
    Implement Needleman-Wunsch algorithm for global sequence alignment.
    Returns the alignment score and aligned sequences.
    """
    # Initialize score matrix
    n, m = len(seq1), len(seq2)
    score_matrix = [[0 for _ in range(m + 1)] for _ in range(n + 1)]
    
    # Initialize traceback matrix
    traceback = [['' for _ in range(m + 1)] for _ in range(n + 1)]
    
    # Initialize first row and column
    for i in range(n + 1):
        score_matrix[i][0] = gap_penalty * i
        traceback[i][0] = 'up'
    for j in range(m + 1):
        score_matrix[0][j] = gap_penalty * j
        traceback[0][j] = 'left'
    
    # Fill the matrices
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            # Calculate scores for all possible moves
            match = score_matrix[i-1][j-1] + (match_score if seq1[i-1] == seq2[j-1] else mismatch_score)
            delete = score_matrix[i-1][j] + gap_penalty
            insert = score_matrix[i][j-1] + gap_penalty
            
            # Find the maximum score and its corresponding move
            score_matrix[i][j] = max(match, delete, insert)
            
            if score_matrix[i][j] == match:
                traceback[i][j] = 'diag'
            elif score_matrix[i][j] == delete:
                traceback[i][j] = 'up'
            else:
                traceback[i][j] = 'left'
    
    # Traceback to find aligned sequences
    aligned1, aligned2 = [], []
    i, j = n, m
    
    while i > 0 or j > 0:
        if traceback[i][j] == 'diag':
            aligned1.append(seq1[i-1])
            aligned2.append(seq2[j-1])
            i -= 1
            j -= 1
        elif traceback[i][j] == 'up':
            aligned1.append(seq1[i-1])
            aligned2.append('-')
            i -= 1
        else:
            aligned1.append('-')
            aligned2.append(seq2[j-1])
            j -= 1
    
    # Reverse the sequences
    aligned1 = ''.join(reversed(aligned1))
    aligned2 = ''.join(reversed(aligned2))
    
    # Calculate alignment statistics
    matches = sum(1 for a, b in zip(aligned1, aligned2) if a == b)
    alignment_length = len(aligned1)
    match_percentage = (matches / alignment_length) * 100
    mutations = sum(1 for a, b in zip(aligned1, aligned2) if a != b and a != '-' and b != '-')
    gaps = aligned1.count('-') + aligned2.count('-')
    
    return {
        'score': score_matrix[n][m],
        'aligned_seq1': aligned1,
        'aligned_seq2': aligned2,
        'match_percentage': match_percentage,
        'mutations': mutations,
        'gaps': gaps,
        'alignment_length': alignment_length
    } 