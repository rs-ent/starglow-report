"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LocaleSelection() {
    const { artist_id } = useParams();
    const router = useRouter();

    useEffect(() => {
        let locale = "en";
        if (navigator.language.toLowerCase().startsWith("ko")) {
            locale = "ko";
        }
        router.replace(`/${artist_id}/${locale}`);
        
    }, [artist_id, router]);
};