import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
const locales = [
    'en', 'es', 'hi', 'ne', 'zh', 'ja', 'ko', 'fr', 'de', 'it', 'pt',
    'ru', 'ar', 'ur', 'ms', 'id', 'tr', 'vi', 'bn', 'he'
];

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as any)) {
        console.log('i18n: Invalid locale:', locale);
        notFound();
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
