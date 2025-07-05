#!/usr/bin/env python3
"""
Create the correct test sequence for sickle cell mutation
"""

def create_sickle_cell_test_sequence():
    """Create the correct test sequence for sickle cell mutation"""
    
    # Reference sequence (normal)
    ref_seq = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"
    
    print("=== Sickle Cell Test Sequences ===")
    print(f"Reference sequence (normal):")
    print(f"{ref_seq}")
    print()
    
    # Create variant with G->A at position 5 (0-indexed, which is position 6 in coding sequence)
    var_seq_1 = list(ref_seq)
    var_seq_1[5] = 'A'  # Change G to A at position 5
    var_seq_1 = ''.join(var_seq_1)
    
    print(f"Variant sequence 1 (G->A at position 5):")
    print(f"{var_seq_1}")
    print()
    
    # Create variant with G->A at position 60 (the one that was detected)
    var_seq_2 = list(ref_seq)
    var_seq_2[60] = 'A'  # Change G to A at position 60
    var_seq_2 = ''.join(var_seq_2)
    
    print(f"Variant sequence 2 (G->A at position 60):")
    print(f"{var_seq_2}")
    print()
    
    # Show differences
    print("=== Differences ===")
    for i, (ref, var1, var2) in enumerate(zip(ref_seq, var_seq_1, var_seq_2)):
        if ref != var1 or ref != var2:
            print(f"Position {i}: {ref} -> {var1} (var1), {var2} (var2)")
    
    return ref_seq, var_seq_1, var_seq_2

if __name__ == "__main__":
    create_sickle_cell_test_sequence() 