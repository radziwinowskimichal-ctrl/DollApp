"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/lib/context";
import { translateDynamicText } from "@/lib/translator";
import { Loader2 } from "lucide-react";

export function DynamicText({ text }: { text: string }) {
  const { language } = useApp();
  const [translated, setTranslated] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!text) {
      // Avoid synchronous setState in effect
      queueMicrotask(() => {
        if (isMounted) setTranslated("");
      });
      return;
    }
    
    queueMicrotask(() => {
      if (isMounted) setIsLoading(true);
    });
    translateDynamicText(text, language).then(res => {
      if (isMounted) {
        setTranslated(res);
        setIsLoading(false);
      }
    });
    
    return () => { isMounted = false; };
  }, [text, language]);

  if (isLoading) {
    return (
      <span className="inline-flex items-center text-muted-foreground opacity-50">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> {text}
      </span>
    );
  }

  return <>{translated}</>;
}
