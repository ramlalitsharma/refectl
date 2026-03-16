
import {
    FileText,
    Image as ImageIcon,
    Code,
    Search,
    FileArchive,
    Zap,
    Calculator,
    Hash,
    Type,
    Database,
    Globe,
    Lock,
    Clock
} from 'lucide-react';

export interface FAQItem {
    q: string;
    a: string;
}

export interface ToolMetadata {
    id: string;
    slug: string;
    title: string;
    shortDesc: string;
    description: string;
    category: ToolCategory;
    icon: any; // Lucide icon component
    keywords: string[];
    seoContent: {
        howTo: string[];
        faq: FAQItem[];
        benefits: string[];
    };
    featured?: boolean;
    trending?: boolean;
}

export type ToolCategory =
    | 'pdf'
    | 'image'
    | 'ai'
    | 'developer'
    | 'seo'
    | 'converter'
    | 'generator'
    | 'calculator'
    | 'text'
    | 'security';

export const CATEGORIES: { id: ToolCategory; title: string; icon: any; color: string }[] = [
    { id: 'pdf', title: 'PDF Tools', icon: FileText, color: 'text-red-500' },
    { id: 'image', title: 'Image Tools', icon: ImageIcon, color: 'text-blue-500' },
    { id: 'ai', title: 'AI Tools', icon: Zap, color: 'text-purple-500' },
    { id: 'developer', title: 'Developer Tools', icon: Code, color: 'text-emerald-500' },
    { id: 'seo', title: 'SEO Tools', icon: Search, color: 'text-orange-500' },
    { id: 'converter', title: 'Converters', icon: FileArchive, color: 'text-indigo-500' },
    { id: 'generator', title: 'Generators', icon: Hash, color: 'text-pink-500' },
    { id: 'calculator', title: 'Calculators', icon: Calculator, color: 'text-cyan-500' },
];

export const TOOLS: ToolMetadata[] = [
    {
        id: 'pdf-merge',
        slug: 'pdf-merge',
        title: 'Merge PDF',
        shortDesc: 'Combine multiple PDF files into one document.',
        description: 'The easiest way to combine PDF files. Our 100% client-side tool ensures your files never leave your computer, providing maximum security and privacy.',
        category: 'pdf',
        icon: FileText,
        featured: true,
        keywords: ['pdf merge', 'combine pdf', 'join pdf', 'merge pdf files online'],
        seoContent: {
            howTo: [
                'Select and upload the PDF documents you want to merge.',
                'Reorder the pages or files in your desired sequence.',
                'Click "Generate PDF" to combine them instantly.',
                'Download your merged document safely.'
            ],
            faq: [
                { q: 'Is it safe to merge PDFs here?', a: 'Yes, absolutely. All processing happens in your browser. Your files are never uploaded to any server.' },
                { q: 'Is there a file size limit?', a: 'Only limited by your browser memory. We recommend files under 50MB for the best experience.' }
            ],
            benefits: [
                '100% Free & Unlimited',
                'No Registration Required',
                'Privacy-First (Local Processing)',
                'High-Speed Performance'
            ]
        }
    },
    {
        id: 'json-formatter',
        slug: 'json-formatter',
        title: 'JSON Formatter',
        shortDesc: 'Clean and format messy JSON code.',
        description: 'A powerful tool for developers to prettify and validate JSON data. Features auto-indentation and syntax highlighting.',
        category: 'developer',
        icon: Database,
        keywords: ['json formatter', 'prettify json', 'json beautifier', 'validate json'],
        seoContent: {
            howTo: ['Paste JSON', 'Click Format', 'Copy Clean Code'],
            faq: [{ q: 'Is it safe?', a: 'Yes, 100% local.' }],
            benefits: ['Fast', 'Free', 'Secure']
        }
    },
    {
        id: 'pdf-split',
        slug: 'pdf-split',
        title: 'Split PDF',
        shortDesc: 'Extract pages from your PDF or save each page as a separate PDF.',
        description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
        category: 'pdf',
        icon: FileText,
        featured: true,
        keywords: ['split pdf', 'extract pdf pages', 'separate pdf'],
        seoContent: {
            howTo: ['Upload PDF', 'Select pages', 'Click Split'],
            faq: [{ q: 'Can I split any PDF?', a: 'Yes, as long as it is not password protected.' }],
            benefits: ['Precise', 'Fast', 'Easy']
        }
    },
    {
        id: 'pdf-rotate',
        slug: 'pdf-rotate',
        title: 'Rotate PDF',
        shortDesc: 'Rotate your PDF pages online.',
        description: 'Rotate your PDF pages permanently. You can rotate every page or just a selection.',
        category: 'pdf',
        icon: FileText,
        keywords: ['rotate pdf', 'fix pdf orientation'],
        seoContent: {
            howTo: ['Upload PDF', 'Rotate pages', 'Save result'],
            faq: [{ q: 'Is rotation permanent?', a: 'Yes.' }],
            benefits: ['Visual', 'Simple', 'Instant']
        }
    },
    {
        id: 'pdf-compress',
        slug: 'pdf-compress',
        title: 'Compress PDF',
        shortDesc: 'Reduce the file size of your PDF.',
        description: 'Reduce PDF file size while optimizing for maximal PDF quality.',
        category: 'pdf',
        icon: FileText,
        featured: true,
        keywords: ['compress pdf', 'reduce pdf size'],
        seoContent: {
            howTo: ['Upload PDF', 'Select level', 'Compress'],
            faq: [{ q: 'Does it lose quality?', a: 'Slightly, but optimized for readability.' }],
            benefits: ['Lightweight', 'Fast', 'Mobile-friendly']
        }
    },
    {
        id: 'image-to-pdf',
        slug: 'image-to-pdf',
        title: 'Image to PDF',
        shortDesc: 'Convert JPG, PNG, and more to PDF.',
        description: 'The easiest way to convert images to PDF. Supports all major image formats.',
        category: 'pdf',
        icon: ImageIcon,
        featured: true,
        keywords: ['jpg to pdf', 'png to pdf', 'image to pdf'],
        seoContent: {
            howTo: ['Select images', 'Reorder', 'Convert'],
            faq: [{ q: 'Can I add many images?', a: 'Yes.' }],
            benefits: ['Batch mode', 'High quality', 'Fast']
        }
    },
    {
        id: 'qr-generator',
        slug: 'qr',
        title: 'QR Code Generator',
        shortDesc: 'Create custom QR codes.',
        description: 'Generate high-quality QR codes for URLs, text, and contact info.',
        category: 'generator',
        icon: Hash,
        keywords: ['qr code', 'generate qr'],
        seoContent: {
            howTo: ['Enter content', 'Customize', 'Download'],
            faq: [{ q: 'Do they expire?', a: 'No, they are static.' }],
            benefits: ['High Res', 'Free', 'Customizable']
        }
    },
    {
        id: 'case-converter',
        slug: 'case-converter',
        title: 'Case Converter',
        shortDesc: 'Swap and shift text cases instantly.',
        description: 'Easily convert text between Upper Case, Lower Case, Title Case, Sentence Case, and more. Perfect for cleaning up titles, headers, and code.',
        category: 'text',
        icon: Type,
        keywords: ['case converter', 'upper to lower', 'lower to upper', 'title case', 'swap case'],
        seoContent: {
            howTo: ['Paste your text', 'Select the target case', 'Copy the converted text'],
            faq: [{ q: 'Does it support special characters?', a: 'Yes, it only modifies alphabetic characters.' }],
            benefits: ['Instant conversion', 'Multiple formats', 'Privacy focused']
        }
    },
    {
        id: 'caesar-cipher',
        slug: 'caesar-cipher',
        title: 'Caesar Cipher',
        shortDesc: 'Shift characters with the classic Caesar Cipher.',
        description: 'Encrypt or decrypt text using the classic Caesar Cipher shift. Choose your own shift value for custom encoding.',
        category: 'text',
        icon: Lock,
        keywords: ['caesar cipher', 'text shift', 'string encryption', 'rot13'],
        seoContent: {
            howTo: ['Enter your message', 'Choose a shift value (1-25)', 'Get the encoded/decoded result'],
            faq: [{ q: 'Is this secure encryption?', a: 'No, Caesar Cipher is a simple substitution cipher and easy to crack. Use it for fun or simple obfuscation.' }],
            benefits: ['Educational', 'Adjustable shift', 'Instant preview']
        }
    },
    {
        id: 'base64',
        slug: 'base64',
        title: 'Base64 Encoder/Decoder',
        shortDesc: 'Encode and decode text to Base64 format.',
        description: 'Convert plain text to Base64 and vice versa. Essential for handling binary data in text environments or preparing data for URLs.',
        category: 'developer',
        icon: Code,
        featured: true,
        keywords: ['base64 encode', 'base64 decode', 'text to base64', 'base64 to text'],
        seoContent: {
            howTo: ['Input your text or base64 string', 'Click Encode or Decode', 'Copy the result'],
            faq: [{ q: 'What is Base64?', a: 'Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.' }],
            benefits: ['Instant conversion', 'Client-side processing', 'Clean results']
        }
    },
    {
        id: 'url-encoder',
        slug: 'url-encoder',
        title: 'URL Encoder/Decoder',
        shortDesc: 'Safely encode and decode URLs.',
        description: 'Ensure your URLs are safe for the web by encoding reserved characters. Easily decode complex URLs to read their parameters.',
        category: 'developer',
        icon: Globe,
        featured: true,
        keywords: ['url encode', 'url decode', 'percent encoding', 'uri component'],
        seoContent: {
            howTo: ['Paste your URL or string', 'Select Encode or Decode', 'Use the resulting safe string'],
            faq: [{
                q: "Why encode URLs?", a: "URLs can only contain certain characters. Encoding ensures components like spaces or special symbols don't break the link."
            }],
            benefits: ['RFC 3986 compliant', 'One-click copy', 'Handles deep parameters']
        }
    },
    {
        id: 'word-counter',
        slug: 'word-counter',
        title: 'Word Counter',
        shortDesc: 'Get detailed text statistics and analytics.',
        description: 'Beyond simple counting: analyze word frequency, character counts (with/without spaces), reading time, and speaking time.',
        category: 'text',
        icon: Type,
        keywords: ['word count', 'character counter', 'reading time', 'text analysis'],
        seoContent: {
            howTo: ['Paste your content', 'View real-time statistics', 'Export report if needed'],
            faq: [{ q: 'How is reading time calculated?', a: 'Based on an average reading speed of 225 words per minute.' }],
            benefits: ['Live updates', 'Advanced metrics', 'SEO-friendly counting']
        }
    },
    {
        id: 'lorem-ipsum',
        slug: 'lorem-ipsum',
        title: 'Lorem Ipsum Generator',
        shortDesc: 'Generate professional placeholder text.',
        description: 'Create paragraphs, sentences, or words of Lorem Ipsum for your design layouts. Customizable length and format.',
        category: 'generator',
        icon: Hash,
        keywords: ['lorem ipsum', 'placeholder text', 'dummy text', 'text generator'],
        seoContent: {
            howTo: ['Select paragraphs or words', 'Set the amount', 'Generate and copy'],
            faq: [{ q: 'Where does Lorem Ipsum come from?', a: 'It has roots in a piece of classical Latin literature from 45 BC.' }],
            benefits: ['Clean formatting', 'Instant copy', 'Standard or custom output']
        }
    },
    {
        id: 'json-to-csv',
        slug: 'json-to-csv',
        title: 'JSON to CSV Converter',
        shortDesc: 'Convert JSON data to CSV format.',
        description: 'Easily transform complex JSON arrays into clean CSV files for Excel or Google Sheets. Supports nested objects and custom delimiters.',
        category: 'converter',
        icon: Database,
        keywords: ['json to csv', 'convert json', 'json to excel', 'data transformation'],
        seoContent: {
            howTo: ['Paste your JSON array', 'Click Convert', 'Download the CSV file'],
            faq: [{ q: 'Does it support nested objects?', a: 'Yes, it flattens nested objects into column headers.' }],
            benefits: ['Bulk conversion', 'No data storage', 'Excel compatible']
        }
    },
    {
        id: 'csv-to-json',
        slug: 'csv-to-json',
        title: 'CSV to JSON Converter',
        shortDesc: 'Convert CSV files to JSON format.',
        description: 'Professional tool to convert spreadsheet data into structured JSON. Perfect for developers and data analysts.',
        category: 'converter',
        icon: FileArchive,
        featured: true,
        keywords: ['csv to json', 'convert csv', 'csv to array', 'data formatting'],
        seoContent: {
            howTo: ['Upload your CSV', 'Configure header options', 'Get the JSON output'],
            faq: [{ q: 'Can I choose the delimiter?', a: 'Yes, it supports commas, semicolons, and tabs.' }],
            benefits: ['Fast execution', 'Schema validation', 'One-click copy']
        }
    },
    {
        id: 'hash-generator',
        slug: 'hash-generator',
        title: 'Hash Generator',
        shortDesc: 'Generate MD5, SHA1, and SHA256 hashes.',
        description: 'Securely generate cryptographic hashes for your text and files. Supports multiple standard algorithms for integrity verification.',
        category: 'security',
        icon: Lock,
        featured: true,
        keywords: ['hash generator', 'sha256', 'md5 online', 'checksum'],
        seoContent: {
            howTo: ['Enter your text', 'Select the algorithm', 'Get your secure hash'],
            faq: [{ q: 'What is a hash?', a: 'A cryptographic hash is a one-way function that produces a fixed-width signature for any input.' }],
            benefits: ['Multiple algorithms', 'Local computation', 'High precision']
        }
    },
    {
        id: 'password-generator',
        slug: 'password-generator',
        title: 'Password Generator',
        shortDesc: 'Generate secure, random passwords.',
        description: 'Create strong passwords with customizable length and character sets. Includes a strength meter and one-click copy.',
        category: 'security',
        icon: Lock,
        featured: true,
        keywords: ['password generator', 'secure password', 'random string', 'password strength'],
        seoContent: {
            howTo: ['Set your desired length', 'Toggle character types (Symbols, Numbers)', 'Click Generate and Copy'],
            faq: [{ q: 'Is it safe to generate passwords online?', a: 'Yes, because our tool runs locally in your browser. No passwords are sent to our server.' }],
            benefits: ['Highly secure', 'Customizable', 'Entropy-focused']
        }
    },
    {
        id: 'timestamp-converter',
        slug: 'timestamp-converter',
        title: 'Timestamp Converter',
        shortDesc: 'Convert Unix timestamps to human dates.',
        description: 'Easily bridge the gap between machine time and human time. Supports Unix Epoch, ISO 8601, and local time zones.',
        category: 'developer',
        icon: Clock,
        keywords: ['unix timestamp', 'epoch converter', 'iso 8601', 'date formatter'],
        seoContent: {
            howTo: ['Enter a timestamp or use current time', 'View conversions in all major formats', 'Click to copy desired format'],
            faq: [{ q: 'What is Unix time?', a: 'Unix time is a system for describing a point in time as the number of seconds that have elapsed since January 1, 1970.' }],
            benefits: ['Real-time', 'ISO8601 support', 'Global timezones']
        }
    },
    // Adding fallbacks for others to ensure no crashes
    ...['unit', 'calculator', 'whiteboard', 'ocr', 'image-convert', 'image-compress', 'pdf-to-word', 'pdf-to-excel', 'url-to-pdf', 'pdf-delete', 'pdf-watermark', 'code'].map(id => ({
        id,
        slug: id,
        title: id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
        shortDesc: `Professional ${id} tool.`,
        description: `High-quality ${id} utility for global users.`,
        category: (id.startsWith('pdf') ? 'pdf' : (id.startsWith('image') ? 'image' : 'text')) as any,
        icon: Zap,
        keywords: [id],
        seoContent: {
            howTo: ['Open tool', 'Input data', 'Get result'],
            faq: [{ q: 'Is it free?', a: 'Yes, 100%.' }],
            benefits: ['Secure', 'Fast', 'Simple']
        }
    }))
];
