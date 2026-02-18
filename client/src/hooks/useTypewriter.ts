import { useState, useEffect } from "react";

export function useTypewriter(text: string, speed = 22) {
    const [displayed, setDisplayed] = useState("");
    useEffect(() => {
        setDisplayed("");
        let i = 0;
        const id = setInterval(() => {
            if (i < text.length) {
                setDisplayed(text.slice(0, ++i));
            } else {
                clearInterval(id);
            }
        }, speed);
        return () => clearInterval(id);
    }, [text, speed]);
    return displayed;
}
