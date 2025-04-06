import { useState, useCallback, useMemo } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import * as PopoverPrimitive from '@radix-ui/react-popover';

interface ComboboxOption {
  value: string;
  label: string;
}

interface MultiComboboxProps {
  options: ComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select items...',
  className,
  disabled,
}: MultiComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(
        value.includes(optionValue) ? value.filter(v => v !== optionValue) : [...value, optionValue]
      );
      setInputValue('');
    },
    [onChange, value]
  );

  const handleRemove = useCallback(
    (optionValue: string) => {
      onChange(value.filter(v => v !== optionValue));
    },
    [onChange, value]
  );

  const handleAddCustomValue = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  }, [inputValue, onChange, value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        handleAddCustomValue();
      }
    },
    [handleAddCustomValue, inputValue]
  );

  const displayValue = useMemo(
    () =>
      value.map(v => {
        const option = options.find(opt => opt.value === v);
        return option ? option.label : v;
      }),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const valueInLowerCase = inputValue.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(valueInLowerCase) ||
        option.value.toLowerCase().includes(valueInLowerCase)
    );
  }, [options, inputValue]);

  const selectedItems = useMemo(
    () =>
      value.length > 0 ? (
        value.map((v, i) => (
          <div
            key={`${v}-${i}`}
            className="flex items-center gap-1 bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-md text-sm group"
          >
            <span className="truncate max-w-[120px]">{displayValue[i]}</span>
            <button
              type="button"
              className="rounded-full hover:bg-background p-0.5 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                handleRemove(v);
              }}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))
      ) : (
        <span className="text-muted-foreground">{placeholder}</span>
      ),
    [value, displayValue, placeholder, handleRemove]
  );

  return (
    <div className={cn('relative w-full', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal h-auto min-h-9 overflow-hidden',
              value.length > 0 ? 'pl-3 pr-2 py-1' : 'px-3 py-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 overflow-x-auto max-h-24">{selectedItems}</div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="w-full p-0 bg-popover text-popover-foreground shadow-md rounded-md border z-[9999]"
            align="start"
            sideOffset={4}
            style={{ width: 'var(--radix-popover-trigger-width)' }}
          >
            <div className="border-b px-3 py-2">
              <input
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                placeholder="Search..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="py-1 overflow-auto" style={{ maxHeight: '200px' }}>
              {inputValue.trim() && filteredOptions.length === 0 ? (
                <div
                  className="relative cursor-pointer select-none py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={e => {
                    e.preventDefault();
                    handleAddCustomValue();
                  }}
                >
                  Add "{inputValue.trim()}"
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">No results found.</div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      'relative cursor-pointer select-none py-1.5 pl-8 pr-2 text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      value.includes(option.value) ? 'bg-accent/50' : ''
                    )}
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {value.includes(option.value) && <Check className="h-4 w-4" />}
                    </span>
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}

interface SingleComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SingleCombobox({
  options,
  value,
  onChange,
  placeholder = 'Select item...',
  className,
  disabled,
}: SingleComboboxProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setInputValue('');
      setOpen(false);
    },
    [onChange]
  );

  const handleAddCustomValue = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      onChange(trimmed);
      setInputValue('');
      setOpen(false);
    }
  }, [inputValue, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        handleAddCustomValue();
      }
    },
    [handleAddCustomValue, inputValue]
  );

  const displayValue = useMemo(() => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    const valueInLowerCase = inputValue.toLowerCase();
    return options.filter(
      option =>
        option.label.toLowerCase().includes(valueInLowerCase) ||
        option.value.toLowerCase().includes(valueInLowerCase)
    );
  }, [options, inputValue]);

  return (
    <div className={cn('relative w-full', className)}>
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal h-auto min-h-9',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            disabled={disabled}
          >
            <div className="flex items-center gap-1 overflow-hidden">
              {value ? (
                <span className="truncate">{displayValue}</span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="w-full p-0 bg-popover text-popover-foreground shadow-md rounded-md border z-[9999]"
            align="start"
            sideOffset={4}
            style={{ width: 'var(--radix-popover-trigger-width)' }}
          >
            <div className="border-b px-3 py-2">
              <input
                className="w-full bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                placeholder="Search..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="py-1 overflow-auto" style={{ maxHeight: '200px' }}>
              {inputValue.trim() && filteredOptions.length === 0 ? (
                <div
                  className="relative cursor-pointer select-none py-1.5 px-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={e => {
                    e.preventDefault();
                    handleAddCustomValue();
                  }}
                >
                  Add "{inputValue.trim()}"
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">No results found.</div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.value}
                    className={cn(
                      'relative cursor-pointer select-none py-1.5 pl-8 pr-2 text-sm',
                      'hover:bg-accent hover:text-accent-foreground',
                      value === option.value ? 'bg-accent/50' : ''
                    )}
                    onMouseDown={e => {
                      e.preventDefault();
                      handleSelect(option.value);
                    }}
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      {value === option.value && <Check className="h-4 w-4" />}
                    </span>
                    {option.label}
                  </div>
                ))
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
