// Ported from myUpskill/estore's app/components/ui/CustomFilterFromUrl.tsx
// (URL-driven variant of CustomFilter) — adapted import paths only.
// date/date_range are declared for type parity with the source but not
// rendered: Creaca has no DatePicker/DateRangePicker widget and no current
// filter needs one (same "declared, not implemented" gap the source's own
// non-URL CustomFilter.tsx leaves for multiselect/checkbox).
'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CustomDialog } from '../../../widgets/CustomDialog/CustomDialog';

export interface FilterField {
    name: string;
    type: 'boolean' | 'text' | 'select' | 'multiselect' | 'checkbox' | 'date' | 'date_range' | 'number' | 'number_range';
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    defaultValue?: any;
    width?: string;
    min?: number;
    max?: number;
    step?: number;
    debounceMs?: number;
}

export interface FilterConfig {
    fields: FilterField[];
    searchPlaceholder?: string;
    showSearch?: boolean;
    searchDebounceMs?: number;
    urlParamPrefix?: string; // Prefix for URL params to avoid conflicts
}

interface CustomFilterProps {
    config: FilterConfig;
    onFilterChange?: (filters: Record<string, any>) => void;
    className?: string;
}

// Helper to get value from URL params
const getValueFromUrl = (
    searchParams: URLSearchParams,
    fieldName: string,
    type: FilterField['type'],
    prefix?: string
): any => {
    const paramName = prefix ? `${prefix}_${fieldName}` : fieldName;
    const paramValue = searchParams.get(paramName);

    if (!paramValue) {
        if (type === 'number_range') return { min: '', max: '' };
        if (type === 'date_range') return { from: undefined, to: undefined };
        if (type === 'multiselect') return [];
        return '';
    }

    switch (type) {
        case 'number':
            return isNaN(Number(paramValue)) ? '' : Number(paramValue);
        case 'boolean':
            return paramValue === 'true';
        case 'number_range':
            if (paramValue.includes('min=') || paramValue.includes('max=')) {
                const params = new URLSearchParams(paramValue);
                return {
                    min: params.get('min') || '',
                    max: params.get('max') || '',
                };
            }
            return { min: '', max: '' };
        case 'date_range':
            if (paramValue.includes('from=') || paramValue.includes('to=')) {
                const params = new URLSearchParams(paramValue);
                return {
                    from: params.get('from') ? new Date(params.get('from')!) : undefined,
                    to: params.get('to') ? new Date(params.get('to')!) : undefined,
                };
            }
            return { from: undefined, to: undefined };
        case 'multiselect':
            return paramValue.split(',');
        default:
            return paramValue;
    }
};

// Helper to convert value to URL param string
const valueToUrlParam = (value: any, type: FilterField['type']): string | null => {
    if (value === undefined || value === null || value === '') return null;
    if (type === 'boolean') return value ? 'true' : 'false';

    if (type === 'number_range') {
        if (value.min || value.max) {
            const parts = [];
            if (value.min) parts.push(`min=${value.min}`);
            if (value.max) parts.push(`max=${value.max}`);
            return parts.join('&');
        }
        return null;
    }

    if (type === 'date_range') {
        if (value?.from || value?.to) {
            const parts = [];
            if (value.from) parts.push(`from=${value.from.toISOString()}`);
            if (value.to) parts.push(`to=${value.to.toISOString()}`);
            return parts.join('&');
        }
        return null;
    }

    if (type === 'multiselect') {
        if (Array.isArray(value) && value.length > 0) {
            return value.join(',');
        }
        return null;
    }

    return String(value);
};

// Internal component that uses useSearchParams
function CustomFilterContent({
    config,
    onFilterChange,
    className,
}: CustomFilterProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tempFilters, setTempFilters] = useState<Record<string, any>>({});
    const [tempSearch, setTempSearch] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const searchDebounceTimer = useRef<NodeJS.Timeout>(undefined);

    const searchParamName = config.urlParamPrefix ? `${config.urlParamPrefix}_search` : 'search';

    useEffect(() => {
        const initialFilters: Record<string, any> = {};

        if (config.showSearch !== false) {
            const searchParam = searchParams.get(searchParamName);
            setTempSearch(searchParam || '');
        }

        config.fields.forEach(field => {
            const value = getValueFromUrl(searchParams, field.name, field.type, config.urlParamPrefix);
            initialFilters[field.name] = value;
        });

        setTempFilters(initialFilters);
        setIsInitialized(true);
    }, [config.fields, config.urlParamPrefix, config.showSearch, searchParams, searchParamName]);

    const updateUrl = useCallback((filters: Record<string, any>, search: string) => {
        const params = new URLSearchParams(searchParams);

        if (config.showSearch !== false) {
            if (search) params.set(searchParamName, search);
            else params.delete(searchParamName);
        }

        config.fields.forEach(field => {
            const paramName = config.urlParamPrefix ? `${config.urlParamPrefix}_${field.name}` : field.name;
            params.delete(paramName);
            const value = filters[field.name];
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'object') {
                    if (Object.keys(value).length === 0) return;
                    if (value.min === '' && value.max === '') return;
                    if (!value.from && !value.to) return;
                }

                const paramValue = valueToUrlParam(value, field.type);
                if (paramValue) {
                    params.set(paramName, paramValue);
                }
            }
        });

        params.set('page', '1');

        const newUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        router.replace(newUrl, { scroll: false });
    }, [config, pathname, router, searchParams, searchParamName]);

    useEffect(() => {
        if (!isInitialized) return;

        const currentUrlFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            currentUrlFilters[field.name] = getValueFromUrl(searchParams, field.name, field.type, config.urlParamPrefix);
        });
        const currentUrlSearch = config.showSearch !== false ? (searchParams.get(searchParamName) || '') : '';

        const filtersChanged = JSON.stringify(tempFilters) !== JSON.stringify(currentUrlFilters);
        const searchChanged = tempSearch !== currentUrlSearch;
        setHasChanges(filtersChanged || searchChanged);
    }, [tempFilters, tempSearch, searchParams, config.fields, config.urlParamPrefix, config.showSearch, isInitialized, searchParamName]);

    const handleFieldChange = (fieldName: string, value: any) => {
        const newValue = value === 'all' ? '' : value;
        setTempFilters(prev => ({ ...prev, [fieldName]: newValue }));
    };

    const handleNumberRangeChange = (fieldName: string, type: 'min' | 'max', value: string) => {
        const currentRange = tempFilters[fieldName] || { min: '', max: '' };
        const newRange = { ...currentRange, [type]: value };
        setTempFilters(prev => ({ ...prev, [fieldName]: newRange }));
    };

    const handleSearchChange = (value: string) => {
        setTempSearch(value);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        searchDebounceTimer.current = setTimeout(() => {
            const newFilters = { ...tempFilters };
            updateUrl(newFilters, value);
            if (onFilterChange) {
                onFilterChange({ ...newFilters, search: value });
            }
        }, config.searchDebounceMs || 500);
    };

    const handleApplyFilters = () => {
        Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

        updateUrl(tempFilters, tempSearch);
        if (onFilterChange) {
            onFilterChange({ ...tempFilters, search: tempSearch });
        }
        setHasChanges(false);
    };

    const handleReset = () => {
        Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
        if (searchDebounceTimer.current) clearTimeout(searchDebounceTimer.current);

        const resetFilters: Record<string, any> = {};
        config.fields.forEach(field => {
            resetFilters[field.name] = field.defaultValue !== undefined ? field.defaultValue : '';
        });
        const resetSearch = '';

        setTempFilters(resetFilters);
        setTempSearch(resetSearch);
        updateUrl(resetFilters, resetSearch);
        if (onFilterChange) {
            onFilterChange({ ...resetFilters, search: resetSearch });
        }
        setHasChanges(false);
    };

    const isActiveFilter = (value: any): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value !== '' && value !== 'all';
        if (typeof value === 'boolean') return value === true;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'object') {
            if (value.from || value.to) return true;
            if (value.min !== undefined && value.min !== '') return true;
            if (value.max !== undefined && value.max !== '') return true;
            return false;
        }
        return true;
    };

    const getActiveFilterCount = () => {
        let count = 0;
        for (const value of Object.values(tempFilters)) {
            if (isActiveFilter(value)) count++;
        }
        return count;
    };

    const getDisplayValue = (field: FilterField, value: any) => {
        if (!value || value === '') return null;
        if (field.type === 'select') {
            const option = field.options?.find(opt => opt.value === value);
            if (option) return `${field.placeholder}: ${option.label}`;
        }
        return value;
    };

    const renderField = (field: FilterField, stacked: boolean = false) => {
        const value = tempFilters[field.name] !== undefined ? tempFilters[field.name] : (field.defaultValue !== undefined ? field.defaultValue : '');
        const displayValue = getDisplayValue(field, value);

        switch (field.type) {
            case 'text':
                return (
                    <Input
                        placeholder={field.placeholder || ''}
                        value={value || ''}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        className={cn(
                            "h-10 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                            stacked ? "w-full" : undefined
                        )}
                        style={stacked ? undefined : { width: `${field.width ? parseInt(field.width) : 160}px` }}
                    />
                );

            case 'select': {
                const baseWidth = field.width ? parseInt(field.width) : 140;
                const increasedWidth = Math.round(baseWidth * 1.5);

                return (
                    <Select
                        value={value}
                        onValueChange={(v) => handleFieldChange(field.name, v)}
                    >
                        <SelectTrigger
                            size="lg"
                            className={cn(
                                "text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                                stacked && "w-full"
                            )}
                            style={stacked ? undefined : { width: `${increasedWidth}px` }}
                        >
                            <SelectValue placeholder={field.placeholder || 'All'}>
                                {displayValue && (
                                    <span className="text-zinc-900 dark:text-white">
                                        {displayValue}
                                    </span>
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent
                            className="bg-white dark:bg-black border-zinc-200 dark:border-zinc-800"
                            style={stacked ? undefined : { minWidth: `${increasedWidth}px` }}
                        >
                            <SelectItem value="all" className="text-zinc-900 dark:text-white">
                                All
                            </SelectItem>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="text-zinc-900 dark:text-white">
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            }

            case 'number_range': {
                const rangeValue = value as { min?: string; max?: string } || { min: '', max: '' };
                const rangeWidth = field.width ? parseInt(field.width) : 200;
                return (
                    <div className={cn("flex items-center gap-1", stacked && "w-full")} style={stacked ? undefined : { width: `${rangeWidth}px` }}>
                        <Input
                            type="number"
                            placeholder={`Min ${field.placeholder}`}
                            value={rangeValue.min || ''}
                            onChange={(e) => handleNumberRangeChange(field.name, 'min', e.target.value)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className="h-10 text-xs rounded-lg w-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        />
                        <span className="text-zinc-500">-</span>
                        <Input
                            type="number"
                            placeholder={`Max ${field.placeholder}`}
                            value={rangeValue.max || ''}
                            onChange={(e) => handleNumberRangeChange(field.name, 'max', e.target.value)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            className="h-10 text-xs rounded-lg w-full border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                        />
                    </div>
                );
            }

            // date / date_range: declared for type parity with the ported
            // source but intentionally unimplemented here — Creaca has no
            // DatePicker/DateRangePicker widget and no current filter needs
            // one. Falls through to `default: return null` below, same as
            // the source leaves multiselect/checkbox unimplemented.
            default:
                return null;
        }
    };

    if (!isInitialized) {
        return <div className="h-8 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />;
    }

    const activeCount = getActiveFilterCount();

    const desktopRow = (
        <div className={cn("space-y-2", className)}>
            <div className="flex flex-wrap gap-2 gap-y-4 items-center">
                {config.showSearch !== false && (
                    <div className="relative" style={{ width: '220px' }}>
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                        <Input
                            placeholder={config.searchPlaceholder || "Search..."}
                            value={tempSearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-10 pl-8 text-xs rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                        />
                    </div>
                )}

                {config.fields.map((field) => (
                    <div key={field.name}>
                        {renderField(field)}
                    </div>
                ))}

                <Button
                    variant={hasChanges ? "default" : "secondary"}
                    size="sm"
                    onClick={handleApplyFilters}
                    className={cn(
                        "gap-2 p-5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        hasChanges
                            ? "bg-primary text-white hover:bg-orange-600"
                            : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    )}
                    disabled={!hasChanges}
                >
                    <Filter size={14} />
                    Apply Filters
                </Button>

                {activeCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="gap-1 p-5 shrink-0 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        <X size={14} />
                        Clear
                        <Badge variant="secondary" className="ml-1 h-5 px-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {activeCount}
                        </Badge>
                    </Button>
                )}
            </div>

            {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    You have unsaved filter changes. Click &quot;Apply Filters&quot; to update.
                </div>
            )}
        </div>
    );

    const compactTrigger = (
        <div className="relative inline-block">
            <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileOpen(true)}
                className="gap-2 p-5 rounded-lg text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 text-zinc-700"
            >
                <Filter size={14} />
                Filters
            </Button>
            {activeCount > 0 && (
                <Badge
                    className="absolute -top-2 -right-2 h-5 min-w-5 justify-center rounded-full px-1 text-[10px] border-0 bg-primary text-white pointer-events-none"
                >
                    {activeCount}
                </Badge>
            )}
        </div>
    );

    return (
        <>
            <div className="hidden lg:block">{desktopRow}</div>
            <div className="lg:hidden">{compactTrigger}</div>

            <CustomDialog
                title="Filters"
                description="Narrow the results shown in the table below."
                open={mobileOpen}
                onOpenChange={setMobileOpen}
                contentWidth="max-w-[480px]"
            >
                <div className="space-y-4">
                    {config.showSearch !== false && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                <Input
                                    placeholder={config.searchPlaceholder || "Search..."}
                                    value={tempSearch}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="pl-9 h-9 w-full rounded-lg border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                                />
                            </div>
                        </div>
                    )}

                    {config.fields.map((field) => (
                        <div key={field.name} className="space-y-1.5">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                {field.placeholder}
                            </label>
                            {renderField(field, true)}
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 sticky bottom-0 bg-white dark:bg-[#111114]">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-lg"
                        onClick={handleReset}
                        disabled={activeCount === 0}
                    >
                        Clear
                    </Button>
                    <Button
                        className="flex-1 gap-2 rounded-lg bg-primary text-white hover:bg-orange-600"
                        onClick={() => {
                            handleApplyFilters();
                            setMobileOpen(false);
                        }}
                    >
                        <Filter size={14} />
                        Apply Filters
                    </Button>
                </div>
            </CustomDialog>
        </>
    );
}

// Main exported component with Suspense boundary
export function CustomFilterFromUrl(props: CustomFilterProps) {
    return (
        <Suspense fallback={<div className="h-8 w-full animate-pulse bg-zinc-100 dark:bg-zinc-800 rounded" />}>
            <CustomFilterContent {...props} />
        </Suspense>
    );
}
