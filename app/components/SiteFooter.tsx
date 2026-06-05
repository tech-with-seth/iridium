export function SiteFooter() {
    return (
        <footer className="footer sm:footer-horizontal footer-center bg-base-300 text-base-content p-4">
            <aside>
                <p>
                    Copyright © {new Date().getFullYear()} - All right reserved
                    by Tech with Seth
                </p>
            </aside>
        </footer>
    );
}
