import os
import sys
import logging
from fastapi import FastAPI, UploadFile, Form, HTTPException, Depends, status, File, Body, Request, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import FileResponse, Response, JSONResponse
from Bio import SeqIO
from io import StringIO, BytesIO
import re
from alignment import needleman_wunsch
from mutation_analysis import MutationAnalyzer
from datetime import datetime, timedelta
from database import get_user_by_email, create_user, get_user_by_username, update_user_profile, save_analysis_history, get_user_analysis_history, get_user_by_id, db
from auth import (
    Token, UserCreate, UserLogin, verify_password, get_password_hash,
    create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM
)
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from pydantic import BaseModel
from typing import List, Dict, Any
from pathlib import Path
import json
from jose import JWTError, jwt
from bson import ObjectId

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Log startup information
logger.info("Starting DNA Analysis App...")
logger.info(f"Python version: {sys.version}")
logger.info(f"Working directory: {os.getcwd()}")

try:
    app = FastAPI(title="DNA Analysis API", version="1.0.0")
    logger.info("FastAPI app created successfully")
except Exception as e:
    logger.error(f"Error creating FastAPI app: {e}")
    raise

# Get allowed origins from environment variable
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
logger.info(f"Allowed origins: {ALLOWED_ORIGINS}")

# Configure CORS
try:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("CORS middleware added successfully")
except Exception as e:
    logger.error(f"Error adding CORS middleware: {e}")
    raise

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize mutation analyzer
try:
    mutation_analyzer = MutationAnalyzer()
    logger.info("Mutation analyzer initialized successfully")
except Exception as e:
    logger.error(f"Error initializing mutation analyzer: {e}")
    raise

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def get_user_from_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None
    user = await get_user_by_email(email)
    return user

@app.get("/available-traits")
async def get_available_traits():
    """Return the list of available traits from the SNPs database."""
    logger.info("GET /available-traits called")
    try:
        # Get unique traits from SNPs database
        unique_traits = []
        seen_traits = set()
        
        for snp in mutation_analyzer.snps_db["snps"]:
            trait_key = f"{snp['trait']}_{snp['gene']}"
            if trait_key not in seen_traits:
                seen_traits.add(trait_key)
                unique_traits.append({
                    "trait": snp["trait"],
                    "gene": snp["gene"],
                    "description": snp["description"],
                    "rsid": snp["rsid"],
                    "reference_sequence": snp["reference_sequence"],
                    "effect": snp["effect"],
                    "position": snp["position"],
                    "position_start": snp["position_start"],
                    "position_end": snp["position_end"],
                    "reference": snp["reference"],
                    "variant": snp["variant"]
                })
        
        logger.info(f"Returning {len(unique_traits)} unique traits")
        return unique_traits
    except Exception as e:
        logger.error(f"Error in get_available_traits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Authentication endpoints
@app.post("/register", response_model=Token)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    if await get_user_by_email(user_data.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    if await get_user_by_username(user_data.username):
        raise HTTPException(
            status_code=400,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user_dict = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    await create_user(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_data.email},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await get_user_by_email(form_data.username)  # Using email as username
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Example reference sequence (you can replace this with your own reference)
REFERENCE_SEQUENCE = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAG"  # Replace with your reference sequence

def validate_dna_sequence(sequence: str) -> bool:
    """Validate that the sequence contains only valid DNA nucleotides."""
    sequence = sequence.upper()
    is_valid = bool(re.match("^[ATCG]+$", sequence))
    logger.info(f"Sequence validation result: {is_valid}")
    return is_valid

def calculate_gc_content(sequence: str) -> float:
    """Calculate the GC content of a DNA sequence."""
    sequence = sequence.upper()
    gc_count = sequence.count('G') + sequence.count('C')
    total_length = len(sequence)
    return (gc_count / total_length) * 100 if total_length > 0 else 0

def process_sequence(sequence: str):
    """Process and validate a DNA sequence."""
    sequence = sequence.strip().upper()
    logger.info(f"Processing sequence of length: {len(sequence)}")
    
    if not sequence:
        raise HTTPException(status_code=400, detail="Empty sequence provided")
    
    if not validate_dna_sequence(sequence):
        raise HTTPException(status_code=400, detail="Invalid DNA sequence. Only A, T, C, G are allowed.")
    
    return {
        "sequenceLength": len(sequence),
        "gcContent": calculate_gc_content(sequence)
    }

@app.get("/reference-traits")
async def get_reference_traits():
    """Return the list of available reference DNA traits."""
    logger.info(f"GET /reference-traits called, returning {len(reference_traits)} traits")
    try:
        if not isinstance(reference_traits, list):
            logger.error("Reference traits is not a list")
            raise HTTPException(status_code=500, detail="Invalid reference traits data structure")
        return JSONResponse(
            content=reference_traits
        )
    except Exception as e:
        logger.error(f"Error in get_reference_traits: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze")
async def analyze_dna(
    file: UploadFile = File(None),
    sequence: str = Form(None),
    trait_info: str = Form(None),
    request: Request = None
):
    """
    Analyze a DNA sequence for mutations related to a specific trait.
    Args:
        file: Optional file containing DNA sequence
        sequence: Optional DNA sequence string
        trait_info: JSON string containing trait information
    Returns:
        Analysis results including mutations and alignment statistics
    """
    # Try to get user if token is present, otherwise None
    current_user = None
    try:
        token = request.headers.get("authorization") if request else None
        if token and token.lower().startswith("bearer "):
            token_value = token.split(" ", 1)[1]
            current_user = await get_user_from_token(token_value)
    except Exception:
        current_user = None
    try:
        # Get the DNA sequence from either file or direct input
        if file:
            logger.info(f"Processing uploaded file: {file.filename}")
            
            # Validate file type
            if not file.filename.lower().endswith(('.txt', '.fasta', '.fa')):
                raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .txt or .fasta file.")
            
            try:
                content = await file.read()
                dna_sequence = content.decode('utf-8').strip()
                logger.info(f"File content length: {len(dna_sequence)}")
                logger.info(f"File content preview: {dna_sequence[:100]}...")
                
                # Handle FASTA format files
                if file.filename.lower().endswith(('.fasta', '.fa')):
                    lines = dna_sequence.split('\n')
                    sequence_lines = []
                    for line in lines:
                        line = line.strip()
                        if line and not line.startswith('>'):
                            sequence_lines.append(line)
                    dna_sequence = ''.join(sequence_lines)
                    logger.info(f"FASTA parsing: extracted sequence length {len(dna_sequence)}")
                    
            except UnicodeDecodeError:
                raise HTTPException(status_code=400, detail="Invalid file encoding. Please use UTF-8 encoding.")
            except Exception as e:
                logger.error(f"Error reading file: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")
                
        elif sequence:
            logger.info(f"Processing direct sequence input, length: {len(sequence)}")
            dna_sequence = sequence.strip()
        else:
            raise HTTPException(status_code=400, detail="No DNA sequence provided")

        # Clean the sequence
        original_length = len(dna_sequence)
        dna_sequence = ''.join(c for c in dna_sequence.upper() if c in 'ATCG')
        cleaned_length = len(dna_sequence)
        logger.info(f"Sequence cleaning: {original_length} -> {cleaned_length} characters")
        
        if not dna_sequence:
            raise HTTPException(status_code=400, detail="Invalid DNA sequence")

        # Initialize results
        results = {
            "sequenceLength": len(dna_sequence),
            "gcContent": (dna_sequence.count('G') + dna_sequence.count('C')) / len(dna_sequence) * 100
        }

        # Analyze mutations if trait info is provided
        if trait_info:
            try:
                trait_data = json.loads(trait_info)
                logger.info(f"Analyzing mutations for trait: {trait_data['trait']}")
                
                # Analyze the sequence for mutations
                mutation_results = mutation_analyzer.analyze_sequence(dna_sequence, trait_data)
                
                # Extract the matches and alignment statistics
                results["mutations"] = mutation_results.get("matches", [])
                results["alignment_statistics"] = mutation_results.get("alignment_statistics", {})
                
                logger.info(f"Found {len(results['mutations'])} mutations")
                
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid trait info format")
            except Exception as e:
                logger.error(f"Error analyzing mutations: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error analyzing mutations: {str(e)}")

        # Save analysis history only if user is present
        if trait_info and current_user:
            try:
                trait_data = json.loads(trait_info)
                analysis_history_data = {
                    "user_id": str(current_user["_id"]),
                    "analysis_date": datetime.utcnow(),
                    "trait_analyzed": trait_data.get("trait", "Unknown"),
                    "gene": trait_data.get("gene", "Unknown"),
                    "sequence_length": results["sequenceLength"],
                    "mutations_found": len(results.get("mutations", [])),
                    "match_percentage": results.get("alignment_statistics", {}).get(trait_data.get("gene", ""), {}).get("match_percentage", 0),
                    "analysis_summary": {
                        "gc_content": results["gcContent"],
                        "mutations": results.get("mutations", []),
                        "alignment": results.get("alignment_statistics", {})
                    }
                }
                await save_analysis_history(analysis_history_data)
                logger.info(f"Saved analysis history: {analysis_history_data}")
            except Exception as e:
                logger.error(f"Error saving analysis history: {str(e)}")
                # Don't fail the analysis if history saving fails

        return results

    except Exception as e:
        logger.error(f"Error in analyze_dna: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/mutations")
async def analyze_mutations(
    sequence: str = Form(...),
    trait_info: str = Form(None)
):
    """
    Analyze a DNA sequence for known mutations and their associated traits using sequence alignment.
    If trait_info is provided, only analyze for that specific trait.
    """
    logger.info("Received mutation analysis request")
    
    try:
        # Basic sequence validation
        sequence = sequence.strip().upper()
        logger.info(f"Validating sequence of length: {len(sequence)}")
        
        if not sequence:
            raise HTTPException(
                status_code=400,
                detail="Empty sequence provided"
            )
            
        if not re.match("^[ATCG]+$", sequence):
            invalid_chars = set(sequence) - set('ATCG')
            raise HTTPException(
                status_code=400,
                detail=f"Invalid DNA sequence. Found invalid characters: {', '.join(invalid_chars)}. Sequence must contain only A, T, C, and G."
            )

        # Parse trait info if provided
        trait_data = None
        if trait_info:
            try:
                trait_data = json.loads(trait_info)
                logger.info(f"Analyzing for specific trait: {trait_data['trait']} in gene {trait_data['gene']}")
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid trait info format")

        # Analyze sequence for mutations with alignment
        logger.info("Starting mutation analysis with alignment")
        analysis_result = mutation_analyzer.analyze_sequence(sequence, trait_data)
        logger.info(f"Found {len(analysis_result['matches'])} matches")
        
        # Generate detailed summary with alignment information
        summary = mutation_analyzer.get_trait_summary(analysis_result)
        logger.info("Successfully generated trait summary with alignment data")

        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing mutations: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing sequence for mutations: {str(e)}"
        )

class MutationMatch(BaseModel):
    gene: str
    rsid: str
    position: int
    reference: str
    user_value: str
    trait: str
    effect: str
    description: str
    is_variant: bool

class MutationAnalysisReport(BaseModel):
    total_analyzed: int
    matches_found: int
    variants_found: int
    matches: List[MutationMatch]

@app.post("/generate-report")
async def generate_report(analysis: MutationAnalysisReport):
    """Generate a beautiful and humanized PDF report for the mutation analysis results."""
    logger.info("Starting PDF report generation")
    try:
        # Create a buffer for the PDF
        buffer = BytesIO()
        logger.info("Created BytesIO buffer")
        
        # Create the PDF document with better margins
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50
        )
        logger.info("Created PDF document template")
        
        # Get styles and create custom styles
        styles = getSampleStyleSheet()
        
        # Create custom styles for better appearance
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1e40af'),
            alignment=1,  # Center alignment
            fontName='Helvetica-Bold'
        )
        
        subtitle_style = ParagraphStyle(
            'CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=colors.HexColor('#374151'),
            fontName='Helvetica-Bold'
        )
        
        section_style = ParagraphStyle(
            'SectionStyle',
            parent=styles['Heading3'],
            fontSize=14,
            spaceAfter=15,
            spaceBefore=20,
            textColor=colors.HexColor('#4b5563'),
            fontName='Helvetica-Bold'
        )
        
        normal_style = ParagraphStyle(
            'NormalStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            textColor=colors.HexColor('#1f2937'),
            fontName='Helvetica'
        )
        
        highlight_style = ParagraphStyle(
            'HighlightStyle',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            textColor=colors.HexColor('#059669'),
            fontName='Helvetica-Bold'
        )
        
        # Build the document content
        content = []
        
        # Header with date
        current_date = datetime.now().strftime("%B %d, %Y")
        content.append(Paragraph(f"DNA Analysis Report", title_style))
        content.append(Paragraph(f"Generated on {current_date}", normal_style))
        content.append(Spacer(1, 30))
        
        # Executive Summary
        content.append(Paragraph("📊 Executive Summary", subtitle_style))
        content.append(Spacer(1, 15))
        
        # Create summary table
        summary_data = [
            ['Metric', 'Value', 'Interpretation'],
            ['Total SNPs Analyzed', str(analysis.total_analyzed), 'Genetic markers examined'],
            ['Matches Found', str(analysis.matches_found), 'Variations detected'],
            ['Variants Detected', str(analysis.variants_found), 'Significant genetic differences']
        ]
        
        summary_table = Table(summary_data, colWidths=[2*inch, 1.5*inch, 3*inch])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f1f5f9')]),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('WORDWRAP', (0, 0), (-1, -1), True),
        ]))
        
        content.append(summary_table)
        content.append(Spacer(1, 25))
        
        # What This Means Section
        content.append(Paragraph("🔬 Understanding Your Results", subtitle_style))
        content.append(Spacer(1, 15))
        
        interpretation_text = f"""
        Your DNA analysis has revealed {analysis.matches_found} genetic variations out of {analysis.total_analyzed} markers examined. 
        This comprehensive analysis provides insights into your unique genetic profile and potential health-related traits.
        
        <b>Key Findings:</b>
        • {analysis.matches_found} genetic variations were identified
        • {analysis.variants_found} significant variants were detected
        • These results represent your individual genetic fingerprint
        
        <b>Important Note:</b> This analysis is for educational and research purposes only. 
        Always consult with healthcare professionals for medical decisions.
        """
        content.append(Paragraph(interpretation_text, normal_style))
        content.append(Spacer(1, 25))
        
        # Detailed Findings
        if analysis.matches:
            content.append(Paragraph("🧬 Detailed Genetic Findings", subtitle_style))
            content.append(Spacer(1, 15))
            
            # Group mutations by gene for better organization
            gene_groups = {}
            for match in analysis.matches:
                if match.gene not in gene_groups:
                    gene_groups[match.gene] = []
                gene_groups[match.gene].append(match)
            
            for gene, matches in gene_groups.items():
                # Gene header
                content.append(Paragraph(f"Gene: {gene}", section_style))
                content.append(Spacer(1, 10))
                
                # Create detailed table for this gene
                gene_data = [
                    ['Trait', 'Status', 'Effect', 'Description']
                ]
                
                for match in matches:
                    status = "🔴 Variant" if match.is_variant else "🟢 Normal"
                    
                    # Process effect text to make it more readable
                    effect = match.effect if match.effect else "No significant effect"
                    if len(effect) > 50:  # If effect is long, add line breaks
                        effect = effect.replace('. ', '.\n')
                    
                    # Process description text to make it more readable
                    description = match.description if match.description else "Standard genetic variation"
                    if len(description) > 80:  # If description is long, add line breaks
                        description = description.replace('. ', '.\n')
                        description = description.replace(', ', ',\n')
                    
                    gene_data.append([
                        match.trait,
                        status,
                        effect,
                        description
                    ])
                
                gene_table = Table(gene_data, colWidths=[1.5*inch, 1*inch, 2*inch, 3*inch])
                gene_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#059669')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#1f2937')),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                    ('WORDWRAP', (0, 0), (-1, -1), True),
                    ('LEFTPADDING', (0, 0), (-1, -1), 8),
                    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
                    ('TOPPADDING', (0, 0), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 12),
                    ('MINIMUMHEIGHT', (0, 0), (-1, -1), 20),
                ]))
                
                content.append(gene_table)
                content.append(Spacer(1, 20))
        
        # Recommendations Section
        content.append(Paragraph("💡 Recommendations & Next Steps", subtitle_style))
        content.append(Spacer(1, 15))
        
        recommendations_text = """
        <b>Understanding Your Results:</b>
        • Genetic variations are normal and make each person unique
        • Most variations have minimal or no health impact
        • Some variations may influence traits or health factors
        
        <b>Recommended Actions:</b>
        • Discuss significant findings with a healthcare provider
        • Consider genetic counseling for complex results
        • Maintain regular health check-ups
        • Share results with family members if relevant
        
        <b>Privacy & Security:</b>
        • Your genetic data is private and secure
        • Consider data retention policies
        • Be cautious about sharing results online
        """
        content.append(Paragraph(recommendations_text, normal_style))
        content.append(Spacer(1, 25))
        
        # Footer
        footer_text = """
        <b>Disclaimer:</b> This report is generated for educational and research purposes only. 
        It is not intended to diagnose, treat, or prevent any disease. 
        Always consult qualified healthcare professionals for medical advice.
        
        <b>Report Generated By:</b> DNA Analysis Application
        <b>Analysis Date:</b> """ + current_date
        
        content.append(Paragraph(footer_text, normal_style))
        
        logger.info("Building PDF document")
        # Build the PDF
        doc.build(content)
        logger.info("PDF document built successfully")
        
        # Get the value of the BytesIO buffer
        pdf = buffer.getvalue()
        buffer.close()
        
        # Create a new BytesIO object for the response
        response_buffer = BytesIO(pdf)
        logger.info("Created response buffer")
        
        headers = {
            'Content-Disposition': f'attachment; filename=dna-analysis-report-{datetime.now().strftime("%Y%m%d")}.pdf'
        }
        
        return Response(
            content=response_buffer.getvalue(),
            media_type='application/pdf',
            headers=headers
        )
        
    except Exception as e:
        logger.error(f"Error generating PDF report: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF report: {str(e)}"
        )

@app.get("/test-mutation-detection")
async def test_mutation_detection():
    """Test endpoint to verify mutation detection is working."""
    try:
        mutations = mutation_analyzer.test_mutation_detection()
        return {
            "test_result": "success",
            "mutations_found": len(mutations),
            "mutations": mutations
        }
    except Exception as e:
        logger.error(f"Error in test mutation detection: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile information"""
    try:
        # Remove sensitive information
        user_profile = {
            "id": str(current_user["_id"]),
            "username": current_user["username"],
            "email": current_user["email"],
            "profile_picture": current_user.get("profile_picture"),
            "bio": current_user.get("bio"),
            "created_at": current_user["created_at"],
            "last_login": current_user.get("last_login")
        }
        return user_profile
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/profile")
async def update_user_profile_endpoint(
    profile_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update user profile information"""
    try:
        # Allow updating username, profile_picture, and bio
        allowed_updates = ["username", "profile_picture", "bio"]
        updates = {k: v for k, v in profile_data.items() if k in allowed_updates}

        # If username is being updated, check for uniqueness
        if "username" in updates:
            new_username = updates["username"].strip()
            if not new_username:
                raise HTTPException(status_code=400, detail="Username cannot be empty")
            # Only check if username is actually changing
            if new_username.lower() != current_user["username"].lower():
                existing = await get_user_by_username(new_username)
                if existing:
                    raise HTTPException(status_code=400, detail="Username already taken")
                updates["username"] = new_username
            else:
                # Remove username from updates if unchanged
                updates.pop("username")

        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")

        result = await update_user_profile(str(current_user["_id"]), updates)
        if result.modified_count > 0:
            return {"message": "Profile updated successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update profile")
    except Exception as e:
        logger.error(f"Error updating user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analysis-history")
async def get_analysis_history(current_user: dict = Depends(get_current_user)):
    """Get user's analysis history"""
    try:
        history = await get_user_analysis_history(str(current_user["_id"]))
        # Convert ObjectId to string for each record
        for record in history:
            if "_id" in record:
                record["_id"] = str(record["_id"])
            # If you have nested ObjectIds, convert them as well if needed
        return {"analysis_history": history}
    except Exception as e:
        logger.error(f"Error getting analysis history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/analysis-history/{history_id}")
async def delete_analysis_history_item(history_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a single analysis history item by ID for the current user."""
    try:
        try:
            obj_id = ObjectId(history_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid history_id format")
        result = await db.analysis_history.delete_one({"_id": obj_id, "user_id": str(current_user["_id"])})
        if result.deleted_count == 1:
            return {"message": "History item deleted"}
        else:
            raise HTTPException(status_code=404, detail="History item not found")
    except Exception as e:
        logger.error(f"Error deleting analysis history item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/analysis-history")
async def delete_all_analysis_history(current_user: dict = Depends(get_current_user)):
    """Delete all analysis history for the current user."""
    try:
        result = await db.analysis_history.delete_many({"user_id": str(current_user["_id"])})
        return {"message": f"Deleted {result.deleted_count} history items"}
    except Exception as e:
        logger.error(f"Error deleting all analysis history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000) 