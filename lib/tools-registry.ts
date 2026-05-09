export interface Tool {
  id: string;
  name: string;
  description: string;
  category: 'AI' | 'Media' | 'Developer' | 'Data' | 'Security' | 'Everyday' | 'Marketing' | 'SEO';
  href: string;
  icon: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export const TOOLS_REGISTRY: Tool[] = [
  // --- AI & NLP (Industrial Grade) ---
  { id: 'ai-summarizer', name: 'AI TEXT SUMMARIZER', description: 'Distill long articles into digestible bullet points using neural networks.', category: 'AI', href: '/tools/ai/summarizer', icon: 'Zap', isPopular: true },
  { id: 'ai-rewriter', name: 'CONTENT REWRITE ENGINE', description: 'Rephrase text to improve clarity, tone, and professional engagement.', category: 'AI', href: '/tools/ai/rewriter', icon: 'RefreshCw' },
  { id: 'ai-translator', name: 'CONTEXTUAL TRANSLATOR', description: 'Advanced translation that maintains industry-specific jargon and tone.', category: 'AI', href: '/tools/ai/translator', icon: 'Languages', isPopular: true },
  { id: 'ai-code-debug', name: 'AI CODE DEBUGGER', description: 'Analyze and repair logical errors in multi-language code snippets.', category: 'AI', href: '/tools/ai/code-debug', icon: 'Terminal' },
  { id: 'ai-image-forge', name: 'AI IMAGE FORGE', description: 'Generate high-fidelity assets from complex text descriptions.', category: 'AI', href: '/tools/ai/image-gen', icon: 'Image', isPopular: true },
  { id: 'ai-sentiment', name: 'SENTIMENT ANALYZER', description: 'Determine emotional tone of customer feedback or social posts.', category: 'AI', href: '/tools/ai/sentiment', icon: 'BarChart' },
  { id: 'ai-voice-synth', name: 'NEURAL VOICE SYNTH', description: 'Convert text to ultra-realistic human-like speech samples.', category: 'AI', href: '/tools/ai/voice-gen', icon: 'Mic', isNew: true },

  // --- Image & Media (Production Ready) ---
  { id: 'img-bg-remover', name: 'BG REMOVER PRO', description: 'Instantly strip backgrounds from portraits or product photos.', category: 'Media', href: '/tools/media/bg-remover', icon: 'Scissors', isPopular: true },
  { id: 'img-upscaler', name: '4K IMAGE UPSCALER', description: 'Enhance low-res images into 4K clarity using neural upscaling.', category: 'Media', href: '/tools/media/upscaler', icon: 'Maximize', isNew: true },
  { id: 'img-compress', name: 'SMART COMPRESSOR', description: 'Reduce image file size up to 90% without losing visible quality.', category: 'Media', href: '/tools/media/compress', icon: 'Minimize' },
  { id: 'img-webp-conv', name: 'WEBP CONVERTER', description: 'Convert legacy JPG/PNG to modern high-efficiency WebP format.', category: 'Media', href: '/tools/media/webp-conv', icon: 'RefreshCw' },
  { id: 'img-palette', name: 'PALETTE EXTRACTOR', description: 'Generate professional color schemes from any uploaded image.', category: 'Media', href: '/tools/media/palette', icon: 'Palette' },
  { id: 'img-svg-opt', name: 'SVG OPTIMIZER', description: 'Clean up vector paths to reduce SVG overhead for web performance.', category: 'Media', href: '/tools/media/svg-opt', icon: 'Code' },

  // --- Developer & Logic (Core Tools) ---
  { id: 'dev-json-fmt', name: 'JSON ARCHITECT', description: 'Beautify, validate, and debug complex JSON data structures.', category: 'Developer', href: '/tools/dev/json-fmt', icon: 'Code', isPopular: true },
  { id: 'dev-jwt-decode', name: 'JWT INSPECTOR', description: 'Decode and inspect JSON Web Tokens to view payloads and headers.', category: 'Developer', href: '/tools/dev/jwt', icon: 'ShieldCheck' },
  { id: 'dev-regex-lab', name: 'REGEX LABORATORY', description: 'Build and test regular expressions with real-time matching.', category: 'Developer', href: '/tools/dev/regex', icon: 'Search' },
  { id: 'dev-hash-gen', name: 'HASH GENERATOR', description: 'Generate secure SHA-256, MD5, and Bcrypt hashes.', category: 'Developer', href: '/tools/dev/hashes', icon: 'Lock' },
  { id: 'dev-api-test', name: 'API STRESS TESTER', description: 'Send rapid HTTP requests to test endpoints without external tools.', category: 'Developer', href: '/tools/dev/api-test', icon: 'Activity', isNew: true },
  { id: 'dev-base64', name: 'BASE64 CONVERTER', description: 'Encode and decode strings or files to Base64 instantly.', category: 'Developer', href: '/tools/dev/base64', icon: 'Binary' },

  // --- Data & Analytics (Scale Ready) ---
  { id: 'data-csv-json', name: 'CSV ⇌ JSON FLUX', description: 'Convert data between CSV and JSON formats instantly.', category: 'Data', href: '/tools/data/csv-json', icon: 'Database' },
  { id: 'data-sql-fmt', name: 'SQL BEAUTIFIER', description: 'Prettify messy SQL queries for better readability.', category: 'Data', href: '/tools/data/sql-fmt', icon: 'Database' },
  { id: 'data-mock-gen', name: 'MOCK DATA FORGE', description: 'Generate realistic test datasets for development.', category: 'Data', href: '/tools/data/mock-gen', icon: 'LayoutGrid', isPopular: true },
  { id: 'data-diff-check', name: 'DIFF ANALYZER', description: 'Compare two datasets to find logical differences.', category: 'Data', href: '/tools/data/diff', icon: 'SplitSquareHorizontal' },
  { id: 'data-unix-time', name: 'UNIX TIME HUB', description: 'Convert epoch time to human dates and vice versa.', category: 'Data', href: '/tools/data/unix', icon: 'Clock' },

  // --- Security & Privacy (Shield Level) ---
  { id: 'sec-pwd-gen', name: 'VAULT PASS GEN', description: 'Create ultra-secure, random passwords for any account.', category: 'Security', href: '/tools/sec/pass-gen', icon: 'Lock', isPopular: true },
  { id: 'sec-ip-lookup', name: 'GEO IP LOOKUP', description: 'Identify the geographical location and ISP of any IP address.', category: 'Security', href: '/tools/sec/ip-lookup', icon: 'Globe' },
  { id: 'sec-cors-test', name: 'CORS DEBUGGER', description: 'Test and debug Cross-Origin Resource Sharing headers.', category: 'Security', href: '/tools/sec/cors', icon: 'Shield' },
  { id: 'sec-proxy-check', name: 'PROXY DETECTOR', description: 'Check if an IP address is coming from a known proxy/VPN.', category: 'Security', href: '/tools/sec/proxy', icon: 'ShieldAlert' },

  // --- Marketing & SEO (Growth Engine) ---
  { id: 'seo-kw-analyzer', name: 'KEYWORD STRATEGIST', description: 'Analyze keyword density and SEO competitiveness.', category: 'SEO', href: '/tools/seo/keywords', icon: 'BarChart' },
  { id: 'seo-meta-gen', name: 'META TAG FORGE', description: 'Generate SEO-optimized meta tags for Google and Social.', category: 'SEO', href: '/tools/seo/meta', icon: 'FileText' },
  { id: 'mkt-utm-gen', name: 'UTM TRACKER GEN', description: 'Build standardized UTM parameters for campaigns.', category: 'Marketing', href: '/tools/mkt/utm', icon: 'Link' },
  { id: 'mkt-mail-check', name: 'EMAIL VALIDATOR', description: 'Verify email deliverability and syntax in bulk.', category: 'Marketing', href: '/tools/mkt/email-verify', icon: 'Mail' },

  // --- Everyday Utilities (Elite Hub) ---
  { id: 'util-pdf-merge', name: 'PDF MASTER MERGE', description: 'Combine multiple PDF files into one master document.', category: 'Everyday', href: '/tools/util/pdf-merge', icon: 'FileText', isPopular: true },
  { id: 'util-pdf-split', name: 'PDF SPLITTER', description: 'Extract pages or split a PDF into individual files.', category: 'Everyday', href: '/tools/util/pdf-split', icon: 'Scissors' },
  { id: 'util-qr-forge', name: 'QR CODE FORGE', description: 'Generate custom-branded QR codes with logos.', category: 'Everyday', href: '/tools/util/qr-gen', icon: 'QrCode' },
  { id: 'util-unit-conv', name: 'UNIT CONVERTER', description: 'Scientific and everyday unit conversion engine.', category: 'Everyday', href: '/tools/util/units', icon: 'Zap' },
];
