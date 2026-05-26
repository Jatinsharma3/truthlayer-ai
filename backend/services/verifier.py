import logging
from typing import Dict, Any, List
from backend.services.search import web_search
from backend.services.llm import generate_json_with_fallback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("truthlayer.verifier")

def verify_single_claim(claim: Dict[str, Any]) -> Dict[str, Any]:
    """
    Verifies a single factual claim by searching the live web and comparing
    evidence using the fallback LLM service.
    """
    claim_text = claim.get("claim", "")
    claim_type = claim.get("type", "other")
    
    logger.info(f"Verifying claim: '{claim_text}' of type '{claim_type}'")
    
    if not claim_text.strip():
        return {
            "claim": "",
            "status": "FALSE",
            "confidence": 0,
            "explanation": "No claim text provided for verification.",
            "evidence": "",
            "source": ""
        }
        
    # Step 1: Search the web
    search_results = web_search(claim_text)
    
    # Step 2: Retrieve and clean evidence context
    evidence_blocks = []
    for idx, res in enumerate(search_results):
        evidence_blocks.append(
            f"Source [{idx+1}]: {res['title']}\n"
            f"URL: {res['url']}\n"
            f"Content: {res['content']}\n"
        )
        
    evidence_context = "\n---\n".join(evidence_blocks)
    
    # Step 3: Run LLM comparison
    system_instruction = (
        "You are an objective, rigorous fact-checker. You compare assertions against raw text "
        "evidence and classify them strictly. You must avoid hallucinations and rely only on the "
        "provided search snippets."
    )
    
    prompt = f"""
    Analyze the factual claim against the provided live search results.
    
    Claim to Verify: "{claim_text}"
    Claim Type: {claim_type}
    
    Search Evidence:
    ---
    {evidence_context}
    ---
    
    Instructions:
    1. Compare the claim with the evidence.
    2. Classify the claim status as one of:
       - "VERIFIED": The claim is fully accurate, matches official records, or is fully supported by the search results.
       - "INACCURATE": The claim is partially correct but uses outdated numbers, inflated metrics, or contains slight discrepancies compared to the search evidence.
       - "FALSE": The claim is completely fabricated, has no evidence in search results, or is directly contradicted by search results.
    3. Generate a confidence score (0 to 100) reflecting the strength of the evidence.
    4. Write a concise explanation (2-3 sentences) detailing why this status was chosen, quoting relevant differences in dates or stats if "INACCURATE".
    5. Extract the single best supporting evidence snippet from the search results.
    6. Select the exact URL of the most authoritative source from the search results.
    
    Return the response as a JSON object with this structure:
    {{
      "status": "VERIFIED" | "INACCURATE" | "FALSE",
      "confidence": 95,
      "explanation": "Detailed explanation here...",
      "evidence": "Quoted snippet from search results here...",
      "source": "https://url-of-source.com"
    }}
    """
    
    try:
        verification_json = generate_json_with_fallback(
            prompt=prompt,
            system_instruction=system_instruction
        )
        
        # Merge back the claim details
        result = {
            "claim": claim_text,
            "type": claim_type,
            "status": verification_json.get("status", "FALSE").upper(),
            "confidence": int(verification_json.get("confidence", 50)),
            "explanation": verification_json.get("explanation", "Verification completed with fallback parameters."),
            "evidence": verification_json.get("evidence", "No explicit quote extracted."),
            "source": verification_json.get("source", "")
        }
        
        # Sanitize status in case LLM returned something else
        if result["status"] not in ["VERIFIED", "INACCURATE", "FALSE"]:
            result["status"] = "FALSE"
            
        logger.info(f"Verification completed for: '{claim_text}'. Result: {result['status']} ({result['confidence']}%)")
        return result
        
    except Exception as e:
        logger.error(f"Error verifying claim '{claim_text}': {str(e)}")
        return {
            "claim": claim_text,
            "type": claim_type,
            "status": "FALSE",
            "confidence": 0,
            "explanation": f"System failed to process verification due to API/runtime error: {str(e)}",
            "evidence": "",
            "source": ""
        }

def verify_multiple_claims(claims: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Verifies a list of claims sequentially or in parallel.
    """
    results = []
    for claim in claims:
        res = verify_single_claim(claim)
        results.append(res)
    return results
