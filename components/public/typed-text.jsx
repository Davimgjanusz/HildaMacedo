"use client";
import { useEffect, useRef } from "react";
import Typed from "typed.js";
/** Texto dinâmico da Hero (Typed.js). Respeita `prefers-reduced-motion`. */
export function TypedText({ strings }) {
    const el = useRef(null);
    useEffect(() => {
        if (!el.current)
            return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            el.current.textContent = strings[0];
            return;
        }
        const typed = new Typed(el.current, {
            strings,
            typeSpeed: 55,
            backSpeed: 30,
            backDelay: 2200,
            startDelay: 400,
            loop: true,
            smartBackspace: true,
            cursorChar: "|",
        });
        return () => typed.destroy();
    }, [strings]);
    return (<>
      <span className="sr-only">{strings.join(", ")}</span>
      <span ref={el} aria-hidden className="italic text-sand"/>
    </>);
}
