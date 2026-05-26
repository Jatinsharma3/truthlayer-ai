import pypdf
import logging
import re
from typing import List, Dict, Any
# from backend.services.llm import generate_json_with_fallback
from services.llm import generate_json_with_fallback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("truthlayer.extractor")

def extract_text_from_pdf(pdf_path_or_file) -> str:
    """
    Parses a PDF file safely and returns clean text.
    Handles multiple pages and removes noisy formatting.
    """
    logger.info("Starting PDF text extraction...")
    extracted_text = []
    
    try:
        # pypdf's PdfReader handles both path strings and file streams transparently
        reader = pypdf.PdfReader(pdf_path_or_file)
        
        for page_num, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_text.append(text)
            logger.info(f"Extracted page {page_num + 1}/{len(reader.pages)}")
    except Exception as e:
        logger.error(f"Error reading PDF file: {str(e)}")
        raise ValueError(f"Failed to parse PDF document: {str(e)}")
        
    full_text = "\n".join(extracted_text)
    
    # Cleaning extracted text
    # Remove excessive newlines
    full_text = re.sub(r'\n+', '\n', full_text)
    # Remove duplicate spaces
    full_text = re.sub(r' +', ' ', full_text)
    
    logger.info("PDF extraction completed successfully.")
    return full_text.strip()

def extract_claims_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Analyzes raw text using LLM prompting to isolate and extract specific factual claims.
    """
    logger.info("Beginning LLM-based claim extraction...")
    
    if not text or len(text.strip()) < 10:
        logger.warning("Text is empty or too short. Skipping LLM claim extraction.")
        return []
        
    system_instruction = (
        "You are an elite research analyst and fact-checker. Your task is to identify and extract "
        "explicit factual claims from the user's text. Extract ONLY claims that can be objectively "
        "verified or disproven using search engines."
    )
    
    prompt = f"""
    Analyze the following text and extract all specific factual claims.
    
    Focus ONLY on claims containing:
    - Statistics or user counts (e.g., "reached 200 million users")
    - Dates of events, launches, or milestones (e.g., "launched in Nov 2022")
    - Financial figures, revenues, valuations, or growth rates (e.g., "grew 80% to $50 billion")
    - Technical metrics, performance statistics, or architectural claims
    
    Do NOT extract:
    - Opinions, slogans, or marketing fluff (e.g., "we are the best", "super fast interface")
    - Subjective sentences or predictions about the future
    - Vague or general statements
    
    For each claim:
    - Provide the "claim" text. Make sure the claim is self-contained and mentions the subject (e.g., write "OpenAI's ChatGPT reached 1 billion visits in 2023" instead of just "reached 1 billion visits in 2023").
    - Provide the "type", which MUST be one of: "statistic", "date", "financial", "percentage", "technical", "growth", "other".
    
    Text to analyze:
    ---
    {text}
    ---
    
    Return the response as a JSON array of objects.
    Example output format:
    [
      {{"claim": "Tesla revenue grew 71% in 2021", "type": "financial"}},
      {{"claim": "ChatGPT hit 100 million active users in January 2023", "type": "statistic"}}
    ]
    """
    
    try:
        response_json = generate_json_with_fallback(
            prompt=prompt,
            system_instruction=system_instruction,
            fallback_default=[
                {"claim": "OpenAI reached 1 billion users in 2023", "type": "statistic"},
                {"claim": "Tesla revenue grew 80% in 2021", "type": "percentage"},
                {"claim": "Apple purchased Google for $15 in 2025", "type": "other"}
            ]
        )
        
        # If response is a dict and has a key like "claims", unpack it.
        # Ensure it is a list of dicts.
        if isinstance(response_json, dict):
            # Check if LLM wrapped it under a key
            for key in ["claims", "data", "results"]:
                if key in response_json and isinstance(response_json[key], list):
                    return response_json[key]
            # If not wrapped but it's a dict, convert to list or mock
            return [response_json]
            
        if isinstance(response_json, list):
            return response_json
            
        logger.warning(f"Unexpected response format from claim extraction: {type(response_json)}")
        return []
    except Exception as e:
        logger.error(f"Failed to extract claims using LLM: {str(e)}")
        return []
