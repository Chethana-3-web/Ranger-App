import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * FilterDropdown ΓÇô custom single-select dropdown for filter bars.
 * Shows "Label: Selected" on the button and a menu with a check on the
 * selected option. Supports click-outside, Escape, arrow keys and Enter.
 *
 * @param {{
 *   label: string,
 *   value: string,
 *   options: Array<{ value: string, label: string }>,
 *   onChange: (value: string) => void,
 *   allValue?: string,
 * }} props
 */
export default function FilterDropdown({ label, value, options, onChange, allValue = 'ALL' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];
  const isFiltered = value !== allValue;

  // Close when clicking outside
  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const openMenu = () => {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (option) => {
    onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(options.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(options[activeIndex]);
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div className="filter-dropdown" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className={`filter-dropdown-button${isFiltered ? ' is-filtered' : ''}${open ? ' is-open' : ''}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${activeIndex}` : undefined}
      >
        <span className="filter-dropdown-label">{label}</span>
        <span className="filter-dropdown-value">{selected?.label}</span>
        <ChevronDown size={14} className="filter-dropdown-chevron" />
      </button>

      {open && (
        <ul className="filter-dropdown-menu" id={listId} role="listbox" aria-label={label}>
          {options.map((option, i) => {
            const isSelected = option.value === value;
            return (
              <li
                key={option.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={isSelected}
                className={`filter-dropdown-option${i === activeIndex ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => choose(option)}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} strokeWidth={2.5} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
