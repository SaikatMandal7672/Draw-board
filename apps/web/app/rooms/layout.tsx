'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react";

export default function RoomsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) router.push("/signin");
    },[router])
    
    return <div >
        {children}
        
    </div>
}