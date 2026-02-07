"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";

export function useCounter(type: string, defaultRemaining: number = 5) {
  const t = useTranslations();
  const { toast } = useToast();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [incrementing, setIncrementing] = useState(false);
  const [remaining, setRemaining] = useState<number>(defaultRemaining);
  const [cooldown, setCooldown] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch current count
  const fetchCount = async () => {
    try {
      const response = await fetch(`/api/counter?type=${type}`);
      const data = await response.json();
      if (data.success) {
        setCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching count:", error);
    } finally {
      setLoading(false);
    }
  };

  // Increment counter
  const increment = async () => {
    if (cooldown > 0) {
      setError(t('common.error.rateLimit'));
      setTimeout(() => setError(null), 2000);
      return;
    }

    setIncrementing(true);
    setError(null);

    try {
      const response = await fetch("/api/counter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(t('common.error.rateLimit'));
        setRemaining(data.remaining);
        setCooldown(Math.ceil((data.resetTime - Date.now()) / 1000));
        // Show toast notification for rate limit
        toast({
          title: t('common.error.rateLimit'),
          description: t('common.error.rateLimitMessage'),
          variant: "default",
        });
      } else if (data.success) {
        setCount(data.count);
        setRemaining(data.remaining);
        if (data.remaining === 0) {
          const cooldownSeconds = Math.ceil(
            (data.resetTime - Date.now()) / 1000,
          );
          setCooldown(cooldownSeconds);
          // Show toast notification when hitting limit
          toast({
            title: t('common.error.rateLimit'),
            description: t('common.error.rateLimitMessage'),
            variant: "default",
          });
        }
      } else {
        setError(data.error || t('common.error.increment'));
      }
    } catch (error) {
      setError(t('common.error.connection'));
      console.error("Error incrementing counter:", error);
    } finally {
      setIncrementing(false);
    }
  };

  useEffect(() => {
    fetchCount();
  }, [type]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            setRemaining(defaultRemaining);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown, defaultRemaining]);

  // Auto refresh count every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Only fetch if the tab is visible to save resources
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [type]);

  return {
    count,
    loading,
    incrementing,
    remaining,
    cooldown,
    error,
    increment,
  };
}
