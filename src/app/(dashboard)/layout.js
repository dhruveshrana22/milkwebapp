import Navigation from "@/components/Navigation";

export default function DashboardLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="pb-24 pt-4 md:pl-64 md:pt-8 md:pb-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
