import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface Trait {
  trait: string;
  gene: string;
  description: string;
  rsid: string;
  reference_sequence: string;
  effect: string;
  position: number;
  position_start: number;
  position_end: number;
  reference: string;
  variant: string;
}

interface MutationMatch {
  gene: string;
  rsid: string;
  position: number;
  reference: string;
  user_value: string;
  trait: string;
  effect: string;
  description: string;
  is_variant: boolean;
  alignment_position: number;
  alignment_context: string;
}

interface AnalysisResult {
  sequenceLength: number;
  gcContent: number;
  mutations?: MutationMatch[];
  alignment?: {
    score: number;
    aligned_seq1: string;
    aligned_seq2: string;
    match_percentage: number;
    gaps: number;
    mutations: number;
  };
  warning?: string;
}

const DnaAnalysis = () => {
  const location = useLocation();
  const [sequence, setSequence] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTrait, setSelectedTrait] = useState<Trait | null>(null);
  const [availableTraits, setAvailableTraits] = useState<Trait[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    fetchAvailableTraits();
  }, []);

  // Prefill sample data if provided via navigation
  useEffect(() => {
    if (location.state && location.state.sampleSequence && location.state.sampleTrait) {
      setSequence(location.state.sampleSequence);
      setSelectedFile(null);
      setSelectedTrait(location.state.sampleTrait);
    }
  }, [location.state]);

  const fetchAvailableTraits = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/available-traits`);
      if (!response.ok) {
        throw new Error('Failed to fetch available traits');
      }
      const traits = await response.json();
      setAvailableTraits(traits);
    } catch (err) {
      setError('Error fetching available traits: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      setSelectedFile(file);
      setSequence('');
    }
  };

  const handleSequenceChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSequence(event.target.value);
    setSelectedFile(null);
  };

  const handleTraitSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const trait = availableTraits.find(t => t.trait === event.target.value);
    if (trait) {
      setSelectedTrait(trait);
    }
  };

  const handleAnalyze = async () => {
    if (!sequence && !selectedFile) {
      setError('Please provide a DNA sequence or upload a file.');
      return;
    }
    if (!selectedTrait) {
      setError('Please select a trait to analyze.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      if (selectedFile) {
        console.log('Adding file to form data:', selectedFile.name);
        formData.append('file', selectedFile);
      } else {
        console.log('Adding sequence to form data, length:', sequence.length);
        formData.append('sequence', sequence);
      }
      
      // Add the selected trait information
      const traitInfo = {
        trait: selectedTrait.trait,
        gene: selectedTrait.gene,
        reference_sequence: selectedTrait.reference_sequence,
        position: selectedTrait.position,
        position_start: selectedTrait.position_start,
        position_end: selectedTrait.position_end,
        reference: selectedTrait.reference,
        variant: selectedTrait.variant
      };
      console.log('Adding trait info to form data:', traitInfo);
      formData.append('trait_info', JSON.stringify(traitInfo));

      const token = localStorage.getItem('token');
      const fetchOptions: RequestInit = {
        method: 'POST',
        body: formData,
        ...(token && { headers: { 'Authorization': `Bearer ${token}` } })
      };
      const response = await fetch(`${API_BASE_URL}/analyze`, fetchOptions);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      console.log('Analysis response:', data);
      
      setResult({
        sequenceLength: data.sequenceLength,
        gcContent: data.gcContent,
        mutations: data.mutations || data.matches || [],
        alignment: data.alignment_statistics?.[selectedTrait.gene] || null,
        warning: data.warning || undefined
      });
      
      // Debug logging
      console.log('Set result with mutations:', data.mutations || data.matches || []);
      console.log('Full result object:', {
        sequenceLength: data.sequenceLength,
        gcContent: data.gcContent,
        mutations: data.mutations || data.matches || [],
        alignment: data.alignment_statistics?.[selectedTrait.gene] || null
      });
    } catch (err) {
      setError('Error analyzing sequence: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const AlignmentDisplay = ({ alignment }: { alignment: AnalysisResult['alignment'] }) => {
    if (!alignment) return null;

    // Create the mutation markers
    const getMutationMarkers = (query: string, ref: string) => {
      let markers = '';
      for (let i = 0; i < query.length; i++) {
        // Only mark actual base changes (not gaps)
        if (query[i] !== '-' && ref[i] !== '-' && query[i] !== ref[i]) {
          // Add spaces before the marker
          while (markers.length < i) {
            markers += ' ';
          }
          markers += '^';
          console.log(`Mutation found at position ${i}: ${ref[i]} -> ${query[i]}`);
        } else if (markers.length === i) {
          markers += ' ';
        }
      }
      return markers;
    };

    // Create position ruler
    const createRuler = (length: number) => {
      let ruler = '';
      for (let i = 0; i < length; i++) {
        if (i % 10 === 0) {
          const numStr = i.toString();
          ruler += numStr;
          i += numStr.length - 1;
        } else {
          ruler += '.';
        }
      }
      return ruler;
    };

    console.log('Aligned sequences:', {
      query: alignment.aligned_seq1,
      reference: alignment.aligned_seq2,
      length: alignment.aligned_seq1.length
    });

    const mutationMarkers = getMutationMarkers(alignment.aligned_seq1, alignment.aligned_seq2);
    const ruler = createRuler(alignment.aligned_seq1.length);

    return (
      <div className="mt-6 bg-gray-50 rounded-lg p-6">
        <h3 className="text-gray-800 font-semibold mb-4">Sequence Alignment</h3>
        <div className="overflow-x-auto">
          <div className="font-mono text-sm whitespace-pre inline-block min-w-full">
            <div className="text-gray-400">Position:  {ruler}</div>
            <div className="text-blue-600">Query:     {alignment.aligned_seq1}</div>
            <div className="text-gray-400">           {mutationMarkers}</div>
            <div className="text-gray-600">Reference: {alignment.aligned_seq2}</div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div>Match percentage: {alignment.match_percentage.toFixed(1)}%</div>
          <div>Mutations found: {alignment.mutations}</div>
          <div>Gaps: {alignment.gaps}</div>
        </div>
      </div>
    );
  };

  const MutationResults = ({ mutations }: { mutations: MutationMatch[] }) => {
    console.log('MutationResults received mutations:', mutations); // Add logging

    // Safety check for mutations
    if (!mutations || !Array.isArray(mutations)) {
      console.error('Invalid mutations data:', mutations);
      return (
        <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">
            Error: Invalid mutation data received. Please try analyzing again.
          </p>
        </div>
      );
    }

    // Group mutations by gene for better organization
    const groupedMutations = mutations.reduce((acc, mutation) => {
      if (!mutation || !mutation.gene) {
        console.warn('Invalid mutation object:', mutation);
        return acc;
      }
      if (!acc[mutation.gene]) {
        acc[mutation.gene] = [];
      }
      acc[mutation.gene].push(mutation);
      return acc;
    }, {} as Record<string, MutationMatch[]>);

    console.log('Grouped mutations:', groupedMutations); // Add logging

    if (mutations.length === 0) {
      return (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            No specific mutations were found in the analyzed sequence. This could mean:
            <ul className="list-disc ml-6 mt-2">
              <li>Your sequence matches the reference sequence for this trait</li>
              <li>Your sequence contains variations that don't match known mutations for this trait</li>
              <li>The sequence might be from a different region than what we analyze</li>
              <li>The sequence might be too short for comprehensive analysis</li>
            </ul>
            <p className="mt-3 text-sm">
              Even without specific mutations, the match percentage above shows how similar your sequence is to the reference.
            </p>
          </p>
        </div>
      );
    }

    const generatePDFReport = async (mutations: MutationMatch[]) => {
      setDownloadLoading(true);
      setDownloadError('');
      
      try {
        const response = await fetch(`${API_BASE_URL}/generate-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            total_analyzed: mutations.length,
            matches_found: mutations.length,
            variants_found: mutations.filter(m => m.is_variant).length,
            matches: mutations.map(match => ({
              gene: match.gene,
              rsid: match.rsid,
              position: match.position,
              reference: match.reference,
              user_value: match.user_value,
              trait: match.trait,
              effect: match.effect,
              description: match.description,
              is_variant: match.is_variant
            }))
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to generate report');
        }

        const blob = await response.blob();
        if (blob.size === 0) {
          throw new Error('Generated PDF is empty');
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dna-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Error generating PDF report:', error);
        setDownloadError(error instanceof Error ? error.message : 'Failed to generate report');
      } finally {
        setDownloadLoading(false);
      }
    };

    return (
      <div className="mt-8 space-y-12">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg">
            <div className="text-sm font-medium text-blue-100 mb-1">Total Mutations</div>
            <div className="text-4xl font-bold text-white">{mutations.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg">
            <div className="text-sm font-medium text-purple-100 mb-1">Known Variants</div>
            <div className="text-4xl font-bold text-white">
              {mutations.filter(m => m && m.rsid && m.rsid !== "unknown").length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg">
            <div className="text-sm font-medium text-indigo-100 mb-1">Genes Affected</div>
            <div className="text-4xl font-bold text-white">{Object.keys(groupedMutations).length}</div>
          </div>
        </div>

        {/* Detailed Findings */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🧬 Detailed Genetic Findings</h3>
          <div className="space-y-8">
            {Object.entries(groupedMutations).map(([gene, geneMutations]) => (
              <div key={gene} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                  <h4 className="text-xl font-semibold text-white">Gene: {gene}</h4>
                  <p className="text-gray-300 text-sm">
                    {geneMutations.length} mutation{geneMutations.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {geneMutations.map((mutation, index) => {
                    // Safety check for each mutation
                    if (!mutation) {
                      console.warn('Null mutation at index:', index);
                      return null;
                    }
                    
                    return (
                      <div key={`${mutation.gene || 'unknown'}_${mutation.position || index}_${index}`} 
                           className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {mutation.trait || 'Unknown Trait'}
                              {mutation.rsid && mutation.rsid !== "unknown" && (
                                <span className="ml-2 text-sm text-gray-500">({mutation.rsid})</span>
                              )}
                            </h5>
                            <p className="text-gray-600 mt-1">{mutation.effect || 'No effect information available'}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Position:</span>
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                              {mutation.position || 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 text-sm">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="text-gray-500">Reference:</span>
                              <span className="ml-2 font-mono">{mutation.reference || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Found:</span>
                              <span className="ml-2 font-mono">{mutation.user_value || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        {mutation.alignment_context && (
                          <div className="mt-3 font-mono text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
                            <div className="whitespace-pre">
                              <div className="text-gray-600">Context: {mutation.alignment_context}</div>
                              <div className="text-gray-400 pl-9">
                                {mutation.reference !== mutation.user_value ? '    ^' : '     '}
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              Position: {mutation.position || 'Unknown'} (Alignment position: {mutation.alignment_position || 'Unknown'})
                            </div>
                          </div>
                        )}
                        <p className="mt-3 text-sm text-gray-600">{mutation.description || 'No description available'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Report Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => generatePDFReport(mutations)}
            disabled={downloadLoading}
            className={`
              inline-flex items-center px-8 py-4 rounded-xl shadow-lg text-lg font-semibold
              ${downloadLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1'
              }
              text-white transition-all duration-300
            `}
          >
            {downloadLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Report...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Detailed Report (PDF)
              </>
            )}
          </button>
        </div>
        
        {downloadError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">Error generating report: {downloadError}</p>
          </div>
        )}
      </div>
    );
  };

  const UnderstandingSection = ({ result }: { result: AnalysisResult | null }) => {
    const getMatchQuality = (percentage: number) => {
      if (percentage >= 90) return 'closely matches';
      if (percentage >= 70) return 'moderately matches';
      return 'has some variations from';
    };

    // Calculate match percentage from alignment data if available
    const matchPercentage = result?.alignment 
      ? result.alignment.match_percentage.toFixed(1)
      : null;

    // Check if we have valid data to show (alignment data is always valid if present)
    const hasValidData = result?.alignment !== undefined;

    return (
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">🔍 Understanding DNA Analysis</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Match Percentage Card - Now Dynamic */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-700 mb-2">
                Match Percentage {hasValidData ? `(${matchPercentage}%)` : ''}
              </h4>
              {hasValidData ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {result?.alignment 
                      ? `Your DNA sequence ${getMatchQuality(parseFloat(matchPercentage || '0'))} the reference sequence for this trait.`
                      : `Your DNA sequence ${getMatchQuality(parseFloat(matchPercentage || '0'))} the reference gene —
                        ${parseFloat(matchPercentage || '0') >= 90 
                          ? ' typical in most healthy individuals.'
                          : parseFloat(matchPercentage || '0') >= 70 
                          ? ' some variations are present but this is common.'
                          : ' indicating significant variations that may be worth discussing with a specialist.'}`
                    }
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        parseFloat(matchPercentage || '0') >= 90 
                          ? 'bg-green-500' 
                          : parseFloat(matchPercentage || '0') >= 70 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${matchPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  {result?.mutations 
                    ? 'No genetic matches were found in the analyzed sequence. This might mean the sequence is too short or from a different region than what we analyze.'
                    : result?.alignment
                      ? 'Alignment data is available but no percentage could be calculated.'
                      : 'Higher match means your genetic profile is similar to the reference population. Most people have 90–95% match in these genes.'}
                </p>
              )}
            </div>

            {/* Variants Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-700 mb-2">Variants</h4>
              <p className="text-sm text-gray-600">
                Differences in your DNA that may influence traits or health factors. These can indicate unique genetic characteristics.
                {result?.mutations && (
                  <span className="block mt-2 font-medium">
                    {result.mutations.length} variant{result.mutations.length !== 1 ? 's' : ''} detected in your sequence.
                  </span>
                )}
              </p>
            </div>

            {/* SNP Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h4 className="font-medium text-blue-700 mb-2">SNP (Single Nucleotide Polymorphism)</h4>
              <p className="text-sm text-gray-600">
                A variation at a specific position in your DNA sequence that may affect traits or health factors.
                {result?.mutations && (
                  <span className="block mt-2 font-medium">
                    {result.mutations.length} SNPs analyzed in your sequence.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        {/* Show backend warning if present */}
        {result && result.warning && (() => {
          // Extract match percentage safely
          const match = result.warning.match(/Match percentage: ([0-9.]+)%/);
          const matchPercentage = match && match[1] ? match[1] : null;
          return (
            <div className="mb-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded shadow text-yellow-900 text-lg">
              <strong>Note:</strong> {result.warning.split('Match percentage:')[0] || ''}
              {matchPercentage && (
                <span className="block mt-2 text-yellow-800 font-bold">
                  Match percentage: {matchPercentage}%
                </span>
              )}
            </div>
          );
        })()}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 sm:px-10">
              <h1 className="text-3xl font-bold text-white text-center">
                DNA Sequence Analysis
              </h1>
              <p className="mt-2 text-blue-100 text-center">
                Upload a file or paste your DNA sequence for analysis
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              {/* User Guidance Info Box */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded shadow text-blue-900">
                <strong>Tip:</strong> For best results, upload a DNA sequence that covers the region of the gene associated with your selected trait. Whole genome or exome data is recommended. If your sequence does not include the relevant region, the app will show a warning and cannot analyze that trait.
              </div>
              <form onSubmit={handleAnalyze} className="space-y-6">
                {/* Trait Selection */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Trait to Analyze</h2>
                  <div className="relative">
                    <select 
                      className="appearance-none block w-full px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out hover:border-blue-400"
                      onChange={handleTraitSelect}
                      value={selectedTrait?.trait || ''}
                    >
                      <option value="" className="text-gray-500">Select a trait...</option>
                      {availableTraits.map((trait) => (
                        <option key={trait.trait} value={trait.trait} className="text-gray-700">
                          {trait.trait} ({trait.gene})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                  {selectedTrait && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm text-blue-800">{selectedTrait.description}</p>
                    </div>
                  )}
                </div>

                {/* Sequence Input */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Input DNA Sequence</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload DNA Sequence File
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".txt,.fasta"
                          onChange={handleFileChange}
                          className="hidden"
                          id="dna-file-input"
                        />
                        <label
                          htmlFor="dna-file-input"
                          className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Choose File
                        </label>
                        {selectedFile && (
                          <div className="mt-2 flex items-center">
                            <span className="text-sm text-gray-500 mr-2">{selectedFile.name}</span>
                            <button
                              type="button"
                              onClick={() => setSelectedFile(null)}
                              className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Or Paste DNA Sequence
                      </label>
                      <div className="relative">
                        <textarea
                          value={sequence}
                          onChange={handleSequenceChange}
                          rows={6}
                          className="block w-full px-4 py-3 text-base text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ease-in-out hover:border-blue-400 font-mono resize-y"
                          placeholder="Enter DNA sequence here..."
                          style={{ minHeight: '150px' }}
                        />
                        {sequence && (
                          <button
                            type="button"
                            onClick={() => setSequence('')}
                            className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                            title="Clear sequence"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>Sequence length: {sequence.length} bases</span>
                        <span>Monospace font enabled for better readability</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {/* Analyze Button */}
                <div className="mb-8">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading || (!sequence && !selectedFile) || !selectedTrait}
                    className={`px-6 py-3 rounded-md text-white font-medium ${
                      loading || (!sequence && !selectedFile) || !selectedTrait
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Analyzing...' : 'Analyze DNA'}
                  </button>
                </div>
              </form>

              {/* Understanding Your Results Section */}
              <UnderstandingSection result={result} />
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-50'}`}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 sm:px-10">
              <h2 className="text-3xl font-bold text-white text-center">
                Analysis Results
              </h2>
              <p className="mt-2 text-emerald-100 text-center">
                {result ? 'DNA sequence analysis complete' : 'Waiting for sequence input...'}
              </p>
            </div>

            <div className="px-6 py-8 sm:px-10">
              {result && (
                <div className="space-y-12">
                  {/* Mutation Results */}
                  {result.mutations && result.mutations.length > 0 && (
                    <MutationResults mutations={result.mutations} />
                  )}

                  {/* Match Percentage Summary */}
                  {result && result.alignment && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">Sequence Match Analysis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-4xl font-bold">{result.alignment.match_percentage.toFixed(1)}%</div>
                          <div className="text-blue-100 text-sm">Match Percentage</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold">{result.alignment.mutations}</div>
                          <div className="text-blue-100 text-sm">Mutations Found</div>
                        </div>
                        <div className="text-center">
                          <div className="text-4xl font-bold">{result.alignment.gaps}</div>
                          <div className="text-blue-100 text-sm">Gaps</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-blue-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              result.alignment.match_percentage >= 90 
                                ? 'bg-green-400' 
                                : result.alignment.match_percentage >= 70 
                                ? 'bg-yellow-400' 
                                : 'bg-red-400'
                            }`}
                            style={{ width: `${result.alignment.match_percentage}%` }}
                          ></div>
                        </div>
                        <div className="mt-2 text-sm text-blue-100">
                          {result.alignment.match_percentage >= 90 
                            ? 'Excellent match - sequence closely matches reference'
                            : result.alignment.match_percentage >= 70 
                            ? 'Good match - some variations present'
                            : 'Low match - significant variations detected'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* No Results Message */}
                  {result && (!result.mutations || result.mutations.length === 0) && (
                    <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800">
                        Analysis completed successfully! No specific mutations were found in your sequence.
                        This could mean your sequence matches the reference exactly, or contains variations 
                        that don't match known mutations for this trait.
                      </p>
                    </div>
                  )}

                  {/* Alignment Display */}
                  {result.alignment && <AlignmentDisplay alignment={result.alignment} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DnaAnalysis; 