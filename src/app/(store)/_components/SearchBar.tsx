"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const isUserInput = useRef(false);

  // Sync input value from URL when URL changes externally (back/forward nav)
  useEffect(() => {
    if (!isUserInput.current) {
      setValue(searchParams.get("q") ?? "");
    }
  }, [searchParams]);

  // Debounce redirect only on actual user input changes
  useEffect(() => {
    if (!isUserInput.current) return;

    const handler = setTimeout(() => {
      isUserInput.current = false;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      params.delete("page");
      router.push(`/?${params.toString()}`);
    }, 350);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    isUserInput.current = true;
    setValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setValue("");
    isUserInput.current = false;
    inputRef.current?.focus();
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder="Search products..."
        className="pl-9 pr-8 bg-muted/50 border-border focus:bg-white transition-colors"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
