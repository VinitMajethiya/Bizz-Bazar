import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string | null;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenId = null,
  allowMultiple = false,
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`divide-y divide-line border-t border-b border-line ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);
        const headingId = `accordion-heading-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div key={item.id} className="py-1">
            <h3>
              <button
                type="button"
                id={headingId}
                aria-controls={panelId}
                aria-expanded={isOpen}
                onClick={() => toggle(item.id)}
                className="w-full py-3.5 flex items-center justify-between text-left text-xs font-normal text-ink hover:text-accent transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-none"
              >
                <span>{item.title}</span>
                <span className="text-muted ml-4 flex-shrink-0" aria-hidden="true">
                  {isOpen ? (
                    <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                  )}
                </span>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headingId}
                className="pb-4 pt-1 text-xs text-muted leading-relaxed font-light"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;

