import json
from pathlib import Path
from typing import List, Dict, Any, Tuple
import logging
from alignment import needleman_wunsch

logger = logging.getLogger(__name__)

def get_aligned_index(aligned_seq: str, relative_index: int) -> int:
    """
    Convert a relative (non-gap) position to an aligned position.
    
    Args:
        aligned_seq: The aligned sequence containing gaps
        relative_index: The position in the original sequence (without gaps)
        
    Returns:
        The corresponding position in the aligned sequence, or -1 if not found
    """
    non_gap_count = 0
    for i, base in enumerate(aligned_seq):
        if base != '-':
            if non_gap_count == relative_index:
                logger.info(f"Found aligned index {i} for relative index {relative_index}")
                return i
            non_gap_count += 1
    logger.warning(f"Could not find aligned index for relative index {relative_index}")
    return -1  # not found

class MutationAnalyzer:
    def __init__(self):
        try:
            self.snps_db = self._load_snps_db()
            logger.info("Successfully loaded SNPs database")
        except Exception as e:
            logger.error(f"Error during initialization: {str(e)}")
            raise

    def _load_snps_db(self) -> Dict[str, Any]:
        db_path = Path(__file__).parent / "data" / "snps_db.json"
        logger.info(f"Attempting to load SNPs database from: {db_path}")
        try:
            with open(db_path, 'r') as f:
                data = json.load(f)
                logger.info(f"Successfully loaded {len(data['snps'])} SNPs from database")
                return data
        except FileNotFoundError:
            logger.error(f"SNPs database file not found at: {db_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing SNPs database JSON: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error loading SNPs database: {str(e)}")
            raise

    def _align_sequence(self, query: str, reference: str) -> Tuple[str, str, Dict]:
        """
        Align query sequence with reference sequence using Needleman-Wunsch algorithm.
        Returns aligned query, aligned reference, and alignment statistics.
        """
        try:
            logger.info(f"Aligning sequences:\nQuery ({len(query)} bp): {query}\nReference ({len(reference)} bp): {reference}")
            alignment_result = needleman_wunsch(query, reference)
            logger.info(f"Alignment result:\nAligned Query: {alignment_result['aligned_seq1']}\nAligned Ref:   {alignment_result['aligned_seq2']}")
            return (
                alignment_result['aligned_seq1'],  # query
                alignment_result['aligned_seq2'],  # reference
                alignment_result
            )
        except Exception as e:
            logger.error(f"Sequence alignment failed: {str(e)}")
            raise

    def _find_mutations(self, aligned_query: str, aligned_ref: str, snp_info: Dict[str, Any], window_start: int = 0) -> List[Dict[str, Any]]:
        """
        Find mutations by comparing aligned sequences and checking against known SNPs.
        Args:
            aligned_query: Aligned query sequence
            aligned_ref: Aligned reference sequence
            snp_info: SNP information (contains position, gene, reference, variant)
            window_start: Start index of the window in the user's full sequence
        Returns:
            List with mutation dict if mismatch is found at SNP site, else empty list.
        """
        mutations = []
        logger.info(f"Looking for mutation: {snp_info['reference']} -> {snp_info['variant']}")
        logger.info(f"Aligned query: {aligned_query}")
        logger.info(f"Aligned ref:   {aligned_ref}")
        # Check all positions for mutations
        query_index = 0
        for i, (ref_base, query_base) in enumerate(zip(aligned_ref, aligned_query)):
            if ref_base != '-':
                if query_base != '-':
                    # Only increment query_index if not a gap
                    if ref_base != query_base:
                        logger.info(f"Found mutation at position {i}: {ref_base} -> {query_base}")
                        if ref_base == snp_info["reference"] and query_base == snp_info["variant"]:
                            logger.info(f"Mutation matches expected SNP!")
                            start_ctx = max(0, i - 5)
                            end_ctx = min(len(aligned_ref), i + 6)
                            context = aligned_ref[start_ctx:end_ctx]
                            mutation = {
                                "aligned_position": i,
                                "reference_base": ref_base,
                                "query_base": query_base,
                                "context": context,
                                "relative_position": i,
                                "absolute_position": window_start + query_index
                            }
                            logger.info(f"Mutation found: {mutation}")
                            mutations.append(mutation)
                            break  # Found the expected mutation, no need to continue
                    query_index += 1
        if not mutations:
            logger.info("No matching mutations found")
        return mutations

    def analyze_sequence(self, sequence: str, trait_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Analyze a DNA sequence for known mutations using sequence alignment.
        
        Args:
            sequence: The DNA sequence to analyze
            trait_info: Optional trait information for specific analysis
            
        Returns:
            Dictionary containing matches and alignment statistics
        """
        logger.info(f"Starting analysis of sequence (length: {len(sequence)})")
        logger.info(f"Trait info: {trait_info}")
        sequence = sequence.upper()  # Normalize to uppercase
        matches = []
        alignment_stats = {}
        warning = None

        try:
            if trait_info:
                # Find the SNP entry for this trait
                snp_entry = None
                for snp in self.snps_db["snps"]:
                    if snp["trait"] == trait_info["trait"] and snp["gene"] == trait_info["gene"]:
                        snp_entry = snp
                        break
                if not snp_entry:
                    logger.error(f"No SNP entry found for trait {trait_info['trait']}")
                    return {
                        "matches": [],
                        "alignment_statistics": {},
                        "warning": f"No SNP entry found for trait {trait_info['trait']}"
                    }
                logger.info(f"Found SNP entry: {snp_entry}")

                # Efficient region search for long sequences
                ref_seq = snp_entry["reference_sequence"].upper()
                idx = sequence.find(ref_seq[:20])  # Use first 20 bases as anchor
                if idx == -1:
                    # Try to find the best matching window in the user's sequence
                    best_match = 0
                    best_start = 0
                    window_len = len(ref_seq)
                    for i in range(0, len(sequence) - window_len + 1, max(1, window_len // 10)):
                        window = sequence[i:i+window_len]
                        matches = sum(1 for a, b in zip(window, ref_seq) if a == b)
                        match_pct = (matches / window_len) * 100
                        if match_pct > best_match:
                            best_match = match_pct
                            best_start = i
                    
                    # Create alignment statistics for the best match found
                    best_window = sequence[best_start:best_start+window_len]
                    aligned_query, aligned_ref, align_stats = self._align_sequence(best_window, ref_seq)
                    alignment_stats[snp_entry["gene"]] = align_stats
                    
                    warning = f"Reference region for this trait was not detected in your sequence. Best match percentage found: {best_match:.1f}%. This may indicate your sequence is from a different region or contains significant variations."
                    logger.warning(warning)
                    return {
                        "matches": [],
                        "alignment_statistics": alignment_stats,
                        "warning": warning
                    }
                # Extract window ±100 bases around the match
                start = max(0, idx - 100)
                end = min(len(sequence), idx + len(ref_seq) + 100)
                window_seq = sequence[start:end]
                logger.info(f"Extracted window for alignment: {start}-{end} (length {len(window_seq)})")

                # Align only the window to the reference
                aligned_query, aligned_ref, align_stats = self._align_sequence(window_seq, ref_seq)
                alignment_stats[snp_entry["gene"]] = align_stats

                match_percentage = align_stats.get('match_percentage', 0)
                # Always return alignment statistics, even if match percentage is low
                # This allows the frontend to show meaningful match percentages
                if match_percentage < 80:
                    warning = f"Input sequence has low similarity to the reference region for this trait. Match percentage: {match_percentage:.1f}%. This may indicate the sequence is from a different region or contains significant variations."
                    logger.warning(warning)
                
                # Continue with mutation analysis even if match percentage is low
                # This allows us to show the match percentage and any mutations that might be found

                mutations = self._find_mutations(aligned_query, aligned_ref, snp_entry, window_start=start)
                logger.info(f"Found {len(mutations)} mutations for gene {snp_entry['gene']}")
                # Map each mutation to the full output structure
                matches = [self._match_mutation_to_snp(m, snp_entry["gene"], snp_entry["position"], trait_info=snp_entry) for m in mutations]

                logger.info(f"Analysis complete. Found {len(matches)} matches.")
                return {
                    "matches": matches,
                    "alignment_statistics": alignment_stats,
                    **({"warning": warning} if warning else {})
                }

        except Exception as e:
            logger.error(f"Error during sequence analysis: {str(e)}")
            raise

    def get_trait_summary(self, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a summary of the traits found in the sequence.
        
        Args:
            analysis_result: Result from analyze_sequence
            
        Returns:
            Summary of traits and their implications
        """
        try:
            matches = analysis_result["matches"]
            variant_count = sum(1 for match in matches if match["is_variant"])
            known_variant_count = sum(1 for match in matches if match["rsid"] != "unknown")
            
            # Group matches by gene for better organization
            gene_summaries = {}
            for match in matches:
                gene = match["gene"]
                if gene not in gene_summaries:
                    gene_summaries[gene] = {
                        "variants": 0,
                        "known_variants": 0,
                        "total_matches": 0,
                        "alignment_stats": analysis_result["alignment_statistics"].get(gene, {}),
                        "matches": []
                    }
                gene_summaries[gene]["matches"].append(match)
                gene_summaries[gene]["total_matches"] += 1
                if match["is_variant"]:
                    gene_summaries[gene]["variants"] += 1
                    if match["rsid"] != "unknown":
                        gene_summaries[gene]["known_variants"] += 1

            return {
                "total_analyzed": len(self.snps_db["snps"]),
                "matches_found": len(matches),
                "variants_found": variant_count,
                "known_variants": known_variant_count,
                "gene_summaries": gene_summaries,
                "matches": matches
            }
        except Exception as e:
            logger.error(f"Error generating trait summary: {str(e)}")
            raise

    def _match_mutation_to_snp(self, mutation: Dict[str, Any], gene: str, original_pos: int, trait_info: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Match a mutation to known SNPs in the database.
        Returns the matched SNP info or indicates an unknown mutation.
        """
        if trait_info:
            # For specific trait analysis, check if mutation matches the trait's known mutation
            if (trait_info["gene"] == gene and 
                trait_info["position_start"] <= original_pos <= trait_info["position_end"] and 
                trait_info["reference"] == mutation["reference_base"] and 
                trait_info["variant"] == mutation["query_base"]):
                return {
                    "gene": gene,
                    "rsid": trait_info["rsid"],
                    "position": original_pos,
                    "reference": trait_info["reference"],
                    "user_value": mutation["query_base"],
                    "trait": trait_info["trait"],
                    "effect": trait_info.get("effect", "Known variant for this trait"),
                    "description": trait_info.get("description", f"This mutation matches the known variant for {trait_info['trait']}"),
                    "is_variant": True,
                    "alignment_position": mutation["aligned_position"],
                    "alignment_context": mutation["context"]
                }
        
        # Check against all known SNPs
        for snp in self.snps_db["snps"]:
            if (snp["gene"] == gene and 
                snp["position"] == original_pos and 
                snp["reference"] == mutation["reference_base"] and 
                snp["variant"] == mutation["query_base"]):
                return {
                    "gene": gene,
                    "rsid": snp["rsid"],
                    "position": original_pos,
                    "reference": snp["reference"],
                    "user_value": mutation["query_base"],
                    "trait": snp["trait"],
                    "effect": snp["effect"],
                    "description": snp["description"],
                    "is_variant": True,
                    "alignment_position": mutation["aligned_position"],
                    "alignment_context": mutation["context"]
                }
        
        return {
            "gene": gene,
            "rsid": "unknown",
            "position": original_pos,
            "reference": mutation["reference_base"],
            "user_value": mutation["query_base"],
            "trait": "Unknown",
            "effect": "Unknown mutation, no known trait linked",
            "description": "This mutation does not match any known SNPs in our database.",
            "is_variant": True,
            "alignment_position": mutation["aligned_position"],
            "alignment_context": mutation["context"]
        }

    def test_mutation_detection(self):
        """
        Test method to verify mutation detection is working.
        """
        logger.info("Testing mutation detection...")
        
        # Test with HBB sickle cell mutation
        hbb_snp = {
            "gene": "HBB",
            "position": 5227002,
            "reference": "G",
            "variant": "A",
            "rsid": "rs334",
            "trait": "Sickle Cell Trait",
            "position_start": 5227002,
            "position_end": 5227098,
            "reference_sequence": "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"
        }
        
        # Reference sequence (normal)
        ref_seq = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"
        
        # Variant sequence (with sickle cell mutation - G to A at position 6)
        var_seq = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACATGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"
        
        logger.info(f"Reference sequence: {ref_seq}")
        logger.info(f"Variant sequence:  {var_seq}")
        
        # Test with variant sequence
        aligned_query, aligned_ref, align_stats = self._align_sequence(var_seq, ref_seq)
        mutations = self._find_mutations(aligned_query, aligned_ref, hbb_snp)
        
        logger.info(f"Found {len(mutations)} mutations in test")
        for mutation in mutations:
            logger.info(f"Test mutation: {mutation}")
        
        return mutations 