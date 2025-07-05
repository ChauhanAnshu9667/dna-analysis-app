#!/usr/bin/env python3
"""
Debug script to test mutation detection
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from mutation_analysis import MutationAnalyzer
from alignment import needleman_wunsch

def debug_mutation_detection():
    """Debug mutation detection step by step"""
    
    # Initialize the analyzer
    analyzer = MutationAnalyzer()
    
    # HBB sickle cell test
    print("=== HBB Sickle Cell Mutation Test ===")
    
    # Reference sequence (normal)
    ref_seq = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"
    
    # Create a variant sequence with the correct sickle cell mutation
    # The sickle cell mutation is G->A at position 6 in the coding sequence
    # Let's create a sequence with G->A at position 5 (0-indexed)
    var_seq = list(ref_seq)
    var_seq[5] = 'A'  # Change G to A at position 5 (Glu6Val mutation)
    var_seq = ''.join(var_seq)
    
    print(f"Reference sequence: {ref_seq}")
    print(f"Variant sequence:  {var_seq}")
    print(f"Length: {len(ref_seq)}")
    
    # Find the difference
    for i, (ref, var) in enumerate(zip(ref_seq, var_seq)):
        if ref != var:
            print(f"Difference at position {i}: {ref} -> {var}")
    
    # Test alignment
    print("\n=== Alignment Test ===")
    alignment_result = needleman_wunsch(var_seq, ref_seq)
    print(f"Aligned query: {alignment_result['aligned_seq1']}")
    print(f"Aligned ref:   {alignment_result['aligned_seq2']}")
    print(f"Match %: {alignment_result['match_percentage']}")
    print(f"Mutations: {alignment_result['mutations']}")
    
    # Test mutation detection
    print("\n=== Mutation Detection Test ===")
    
    hbb_snp = {
        "gene": "HBB",
        "position": 5227002,
        "reference": "G",
        "variant": "A",
        "rsid": "rs334",
        "trait": "Sickle Cell Trait",
        "position_start": 5227002,
        "position_end": 5227098,
        "reference_sequence": ref_seq
    }
    
    # Test the mutation detection
    mutations = analyzer.test_mutation_detection()
    print(f"Found {len(mutations)} mutations")
    
    # Test with the actual analyze_sequence method
    print("\n=== Full Analysis Test ===")
    trait_info = {
        "trait": "Sickle Cell Trait",
        "gene": "HBB",
        "reference_sequence": ref_seq,
        "position": 5227002,
        "position_start": 5227002,
        "position_end": 5227098,
        "reference": "G",
        "variant": "A"
    }
    
    result = analyzer.analyze_sequence(var_seq, trait_info)
    print(f"Analysis result: {result}")
    
    return result

if __name__ == "__main__":
    debug_mutation_detection() 