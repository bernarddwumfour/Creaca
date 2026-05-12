'use client'
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

const HomeButtons = ({ lang, nav }: { lang?: string; nav: any }) => {
    const { user } = useAuth()
    return (
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {user ? (
                // If logged in, only show Courses button
                <Button asChild className="w-full sm:w-auto font-bold">
                    <Link href={`/${lang}/courses`}>
                        {nav.curriculum || "Browse Courses"}
                    </Link>
                </Button>
            ) : (
                // If not logged in, show both buttons
                <>
                    <Button asChild className="w-full sm:w-auto font-bold">
                        <Link href={`/${lang}/packages`}>
                            {nav.trial || "View Packages"}
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto font-bold">
                        <Link href={`/${lang}/courses`}>
                            {nav.curriculum || "Browse Courses"}
                        </Link>
                    </Button>
                </>
            )}
        </div>
    )
}

export default HomeButtons