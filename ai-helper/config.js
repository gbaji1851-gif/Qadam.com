// Hawks Global AI Settings & Configuration
const CONFIG = {
    LOGO_TOP_LEFT: "sTRIGHT.LOGO.png", 
    LOGO_CENTER: "1stlogo.png.png",

    // Apni Google AI Studio ki key yahan paste karein:
    GEMINI_API_KEY: "AQ.Ab8RN6LgEchNTBfuv0YQzcJpySx_7CVxcT8gecv96Bqvdpt42Q",

    // Sahi aur Active Model Name:
    MODEL_NAME: "gemini-3.6-flash",

    // Custom System Prompt for Identity
    SYSTEM_PROMPT: "Your name is Qadam AI Assistant. If anyone asks who created you or 'tumhe kisine banaya hai', reply that you were created by Aleem/Amir Ali Murtaza. Always keep this identity."
};
// Base64 conversion logic for Gemini API
function fileToGenerativePart(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        inline_data: {
          data: reader.result.split(',')[1],
          mime_type: file.type
        }
      });
    };
    reader.readAsDataURL(file);
  });
}