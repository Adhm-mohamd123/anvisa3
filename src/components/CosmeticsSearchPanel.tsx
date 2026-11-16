import React, { useRef, useState } from 'react';
import { Search, Calendar, X } from 'lucide-react';
import {
  normalizeCodeForSearch,
  type CosmeticProduct,
  type SearchCriteria,
} from '../types/cosmetic';

interface CosmeticsSearchPanelProps {
  criteria: SearchCriteria;
  onChangeCriteria: (next: SearchCriteria) => void;
  onSubmitSearch: (next?: SearchCriteria) => void;
  onResetSearch: () => void;
  allProducts: CosmeticProduct[];
  focusField?: 'productName' | 'registrationNumber' | 'snbNumber' | 'processNumber' | null;
}

export const CosmeticsSearchPanel: React.FC<CosmeticsSearchPanelProps> = ({
  criteria,
  onChangeCriteria,
  onSubmitSearch,
  onResetSearch,
  allProducts,
  focusField,
}) => {
  const [snbFeedback, setSnbFeedback] = useState<string | null>(null);
  const [fromInputType, setFromInputType] = useState<'text' | 'date'>('text');
  const [toInputType, setToInputType] = useState<'text' | 'date'>('text');
  const expFromRef = useRef<HTMLInputElement | null>(null);
  const expToRef = useRef<HTMLInputElement | null>(null);

  const handleSnbLookup = () => {
    const queryRaw = criteria.snbNumber.trim().toLowerCase();
    const queryNorm = normalizeCodeForSearch(criteria.snbNumber);
    if (!queryRaw) {
      setSnbFeedback('Informe um código SNB / CNPJ para identificar a empresa fabricante.');
      return;
    }

    const match = allProducts.find((p) => {
      const snbRaw = p.snbNumber.toLowerCase();
      const snbNorm = normalizeCodeForSearch(p.snbNumber);
      return snbRaw.includes(queryRaw) || (queryNorm && snbNorm.includes(queryNorm));
    });

    if (match) {
      setSnbFeedback(null);
      const updated: SearchCriteria = {
        ...criteria,
        manufacturerName: match.manufacturerName,
      };
      onChangeCriteria(updated);
      onSubmitSearch(updated);
    } else {
      setSnbFeedback('Nenhuma empresa encontrada para este código SNB na base verificada.');
      onChangeCriteria({ ...criteria, manufacturerName: '' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSnbFeedback(null);
    onSubmitSearch();
  };

  const handleClear = () => {
    setSnbFeedback(null);
    setFromInputType('text');
    setToInputType('text');
    onResetSearch();
  };

  const openDatePicker = (
    setter: React.Dispatch<React.SetStateAction<'text' | 'date'>>,
    ref: React.RefObject<HTMLInputElement | null>
  ) => {
    setter('date');
    setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      if (typeof el.showPicker === 'function') {
        try {
          el.showPicker();
        } catch {
          // ignore if browser blocks programmatic picker
        }
      }
    }, 0);
  };

  return (
    <section
      aria-labelledby="criterios-consulta-heading"
      className="border border-[#d8dde3] rounded-[3px] bg-white overflow-hidden hc-surface"
    >
      {/* Header bar matching reference screenshot: "Critérios para Consulta" */}
      <div className="bg-[#f2f4f7] border-b border-[#d8dde3] py-2.5 px-4 text-center hc-header-bar">
        <h2
          id="criterios-consulta-heading"
          className="text-[14px] font-medium text-[#333333]"
        >
          Critérios para Consulta
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-4 sm:p-5 space-y-4">
          {/* Row 1: Nome do Produto | Número do Registro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                htmlFor="search-product-name"
                className="block text-[13px] font-bold text-[#333333] mb-1.5"
              >
                Nome do Produto
              </label>
              <input
                id="search-product-name"
                type="text"
                autoFocus={focusField === 'productName'}
                value={criteria.productName}
                onChange={(e) =>
                  onChangeCriteria({ ...criteria, productName: e.target.value })
                }
                className="w-full h-[38px] px-3 text-[13px] text-[#333333] bg-white border border-[#ced4da] rounded-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
              />
            </div>

            <div>
              <label
                htmlFor="search-registration-number"
                className="block text-[13px] font-bold text-[#333333] mb-1.5"
              >
                Número do Registro
              </label>
              <input
                id="search-registration-number"
                type="text"
                autoFocus={focusField === 'registrationNumber'}
                value={criteria.registrationNumber}
                onChange={(e) =>
                  onChangeCriteria({ ...criteria, registrationNumber: e.target.value })
                }
                className="w-full h-[38px] px-3 text-[13px] font-mono tabular-nums text-[#333333] bg-white border border-[#ced4da] rounded-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
              />
            </div>
          </div>

          {/* Row 2: Número SNB da Empresa + Magnifier | Gray Manufacturer box (stacks directly beneath on mobile!) */}
          <div>
            <label
              htmlFor="search-snb-number"
              className="block text-[13px] font-bold text-[#333333] mb-1.5"
            >
              Número SNB / CNPJ da Empresa
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 items-center">
              <div className="flex">
                <input
                  id="search-snb-number"
                  type="text"
                  autoFocus={focusField === 'snbNumber'}
                  value={criteria.snbNumber}
                  onChange={(e) => {
                    setSnbFeedback(null);
                    onChangeCriteria({ ...criteria, snbNumber: e.target.value });
                  }}
                  className="w-full h-[38px] px-3 text-[13px] font-mono tabular-nums text-[#333333] bg-white border border-[#ced4da] rounded-l-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
                />
                <button
                  type="button"
                  onClick={handleSnbLookup}
                  title="Localizar fabricante por SNB"
                  aria-label="Localizar fabricante por SNB"
                  className="w-[42px] h-[38px] bg-[#e9ecef] hover:bg-[#dde2e6] border border-l-0 border-[#ced4da] rounded-r-[3px] flex items-center justify-center text-[#333333] transition-colors cursor-pointer shrink-0"
                >
                  <Search className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>

              <div className="relative">
                <input
                  id="search-manufacturer-name"
                  type="text"
                  aria-label="Empresa Fabricante"
                  value={criteria.manufacturerName}
                  onChange={(e) =>
                    onChangeCriteria({ ...criteria, manufacturerName: e.target.value })
                  }
                  placeholder=""
                  className="w-full h-[38px] px-3 pr-8 text-[13px] text-[#333333] bg-[#e9ecef] focus:bg-white border border-[#ced4da] rounded-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4] transition-colors"
                />
                {criteria.manufacturerName && (
                  <button
                    type="button"
                    onClick={() =>
                      onChangeCriteria({ ...criteria, manufacturerName: '' })
                    }
                    aria-label="Limpar empresa fabricante"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#111111] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
            {snbFeedback && (
              <p className="text-[11px] text-[#b45309] mt-1">{snbFeedback}</p>
            )}
          </div>

          {/* Row 3: Número do Processo | Período de Vencimento do Registro */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label
                htmlFor="search-process-number"
                className="block text-[13px] font-bold text-[#333333] mb-1.5"
              >
                Número do Processo
              </label>
              <input
                id="search-process-number"
                type="text"
                autoFocus={focusField === 'processNumber'}
                value={criteria.processNumber}
                onChange={(e) =>
                  onChangeCriteria({ ...criteria, processNumber: e.target.value })
                }
                className="w-full h-[38px] px-3 text-[13px] font-mono tabular-nums text-[#333333] bg-white border border-[#ced4da] rounded-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
              />
            </div>

            <div>
              <span className="block text-[13px] font-bold text-[#333333] mb-1.5">
                Período de Vencimento do Registro
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Data Inicial */}
                <div className="flex">
                  <input
                    ref={expFromRef}
                    id="search-exp-from"
                    type={criteria.expirationFrom ? 'date' : fromInputType}
                    placeholder="Data Inicial"
                    aria-label="Data Inicial"
                    value={criteria.expirationFrom}
                    onFocus={() => setFromInputType('date')}
                    onBlur={() => {
                      if (!criteria.expirationFrom) setFromInputType('text');
                    }}
                    onChange={(e) =>
                      onChangeCriteria({ ...criteria, expirationFrom: e.target.value })
                    }
                    className="w-full h-[38px] px-3 text-[13px] tabular-nums text-[#333333] placeholder:text-[#777777] bg-white border border-[#ced4da] rounded-l-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(setFromInputType, expFromRef)}
                    aria-label="Selecionar Data Inicial"
                    className="w-[42px] h-[38px] bg-[#e9ecef] hover:bg-[#dde2e6] border border-l-0 border-[#ced4da] rounded-r-[3px] flex items-center justify-center text-[#333333] cursor-pointer shrink-0"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Data Final */}
                <div className="flex">
                  <input
                    ref={expToRef}
                    id="search-exp-to"
                    type={criteria.expirationTo ? 'date' : toInputType}
                    placeholder="Data Final"
                    aria-label="Data Final"
                    value={criteria.expirationTo}
                    onFocus={() => setToInputType('date')}
                    onBlur={() => {
                      if (!criteria.expirationTo) setToInputType('text');
                    }}
                    onChange={(e) =>
                      onChangeCriteria({ ...criteria, expirationTo: e.target.value })
                    }
                    className="w-full h-[38px] px-3 text-[13px] tabular-nums text-[#333333] placeholder:text-[#777777] bg-white border border-[#ced4da] rounded-l-[3px] focus:outline-none focus:border-[#1956b4] focus:ring-1 focus:ring-[#1956b4]"
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(setToInputType, expToRef)}
                    aria-label="Selecionar Data Final"
                    className="w-[42px] h-[38px] bg-[#e9ecef] hover:bg-[#dde2e6] border border-l-0 border-[#ced4da] rounded-r-[3px] flex items-center justify-center text-[#333333] cursor-pointer shrink-0"
                  >
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer action bar matching reference screenshot */}
        <div className="bg-[#f5f7f9] border-t border-[#d8dde3] py-3 px-4 flex items-center justify-center gap-2 hc-header-bar">
          <button
            type="submit"
            className="px-5 py-1.5 text-[13px] font-medium text-white bg-[#1956b4] hover:bg-[#12428c] rounded-[3px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Consultar
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-1.5 text-[13px] font-medium text-[#333333] bg-white hover:bg-[#f0f0f0] border border-[#cccccc] rounded-[3px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Limpar
          </button>
        </div>
      </form>
    </section>
  );
};
