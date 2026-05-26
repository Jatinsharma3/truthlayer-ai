import os
import logging
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environmental variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("truthlayer.main")

# Import service layers
from services.extractor import extract_text_from_pdf, extract_claims_from_text
from services.verifier import verify_multiple_claims

app = FastAPI(
    title="TruthLayer AI Backend",
    description="Production-grade API for automated claim extraction and verification",
    version="1.0.0"
)

# CORS setup for frontend communications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for validation
class TextPayload(BaseModel):
    text: str

class ClaimModel(BaseModel):
    claim: str
    type: str

class VerifyPayload(BaseModel):
    claims: List[ClaimModel]

@app.get("/")
def read_root():
    return {"name": "TruthLayer AI API", "status": "active", "version": "1.0.0"}

@app.post("/upload")
def upload_pdf(file: UploadFile = File(...)):
    """
    Accepts PDF upload, parses and extracts text content.
    Uses def instead of async def to allow FastAPI to process pdfplumber file reads
    safely in a background thread pool, preventing CPU block on the event loop.
    """
    logger.info(f"Received file upload request: {file.filename}")
    
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Only PDF files are accepted."
        )
        
    try:
        # Read file contents into memory stream
        text = extract_text_from_pdf(file.file)
        
        if not text:
            raise HTTPException(
                status_code=422,
                detail="Successfully read PDF but no readable text could be extracted."
            )
            
        logger.info(f"Text extraction completed. Character count: {len(text)}")
        return {
            "filename": file.filename,
            "text": text,
            "char_count": len(text)
        }
    except Exception as e:
        logger.error(f"Error processing PDF upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while parsing the PDF: {str(e)}"
        )

@app.post("/extract-claims")
def extract_claims(payload: TextPayload):
    """
    Accepts text payload and extracts verifiable factual claims.
    """
    logger.info("Received claim extraction request.")
    try:
        claims = extract_claims_from_text(payload.text)
        logger.info(f"Extracted {len(claims)} claims.")
        return {"claims": claims}
    except Exception as e:
        logger.error(f"Error extracting claims: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during claim extraction: {str(e)}"
        )

@app.post("/verify")
def verify_claims(payload: VerifyPayload):
    """
    Accepts a list of claims, queries the web, and performs verification.
    """
    logger.info(f"Received claim verification request for {len(payload.claims)} claims.")
    try:
        claims_list = [c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in payload.claims]
        verified_results = verify_multiple_claims(claims_list)
        logger.info("Verification process completed successfully.")
        return {"results": verified_results}
    except Exception as e:
        logger.error(f"Error verifying claims: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred during verification: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    logger.info(f"Starting server on {host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
