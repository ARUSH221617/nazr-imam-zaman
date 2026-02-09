"use client";

import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TagMultiSelectProps {
  tags: Array<{ id: string; name: string }>;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyText: string;
  clearText: string;
  selectedCountText: string;
  removeTagText: (name: string) => string;
}

export function TagMultiSelect({
  tags,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  clearText,
  selectedCountText,
  removeTagText,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIds = useMemo(() => new Set(value), [value]);
  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedIds.has(tag.id)),
    [selectedIds, tags],
  );

  const toggleTag = (id: string) => {
    if (selectedIds.has(id)) {
      onChange(value.filter((item) => item !== id));
      return;
    }

    onChange([...value, id]);
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setSearch("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            <span className={cn("truncate", !value.length && "text-muted-foreground")}>
              {value.length ? selectedCountText : placeholder}
            </span>
            <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={setSearch}
            />
            <div className="flex items-center justify-between border-b px-3 py-1.5">
              <span className="text-xs text-muted-foreground">{selectedCountText}</span>
              {value.length ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="h-7 px-2 text-xs"
                >
                  {clearText}
                </Button>
              ) : null}
            </div>
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => {
                  const isSelected = selectedIds.has(tag.id);

                  return (
                    <CommandItem
                      key={tag.id}
                      value={`${tag.name} ${tag.id}`}
                      onSelect={() => toggleTag(tag.id)}
                    >
                      <CheckIcon className={cn("size-4", isSelected ? "opacity-100" : "opacity-0")} />
                      <span className="truncate">{tag.name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="max-w-full gap-1 pe-1">
              <span className="truncate">{tag.name}</span>
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                aria-label={removeTagText(tag.name)}
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
