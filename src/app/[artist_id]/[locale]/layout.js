export default async function ArtistLocaleLayout({ children, params }) {
    const { artist_id, locale } = await params;

    return (
        <html lang={locale}>
            {children}
        </html>
    );
}