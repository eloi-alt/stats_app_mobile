'use client'

import { useState, useMemo } from 'react'

// Full list of world countries
const ALL_COUNTRIES = [
    { code: 'AF', name: 'Afghanistan' },
    { code: 'AL', name: 'Albanie' },
    { code: 'DZ', name: 'Algérie' },
    { code: 'AD', name: 'Andorre' },
    { code: 'AO', name: 'Angola' },
    { code: 'AR', name: 'Argentine' },
    { code: 'AM', name: 'Arménie' },
    { code: 'AU', name: 'Australie' },
    { code: 'AT', name: 'Autriche' },
    { code: 'AZ', name: 'Azerbaïdjan' },
    { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahreïn' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'BE', name: 'Belgique' },
    { code: 'BJ', name: 'Bénin' },
    { code: 'BO', name: 'Bolivie' },
    { code: 'BA', name: 'Bosnie-Herzégovine' },
    { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brésil' },
    { code: 'BG', name: 'Bulgarie' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodge' },
    { code: 'CM', name: 'Cameroun' },
    { code: 'CA', name: 'Canada' },
    { code: 'CV', name: 'Cap-Vert' },
    { code: 'CF', name: 'Centrafrique' },
    { code: 'CL', name: 'Chili' },
    { code: 'CN', name: 'Chine' },
    { code: 'CY', name: 'Chypre' },
    { code: 'CO', name: 'Colombie' },
    { code: 'KM', name: 'Comores' },
    { code: 'CG', name: 'Congo' },
    { code: 'CD', name: 'RD Congo' },
    { code: 'KR', name: 'Corée du Sud' },
    { code: 'KP', name: 'Corée du Nord' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'CI', name: "Côte d'Ivoire" },
    { code: 'HR', name: 'Croatie' },
    { code: 'CU', name: 'Cuba' },
    { code: 'DK', name: 'Danemark' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'DO', name: 'Rép. Dominicaine' },
    { code: 'EG', name: 'Égypte' },
    { code: 'AE', name: 'Émirats Arabes Unis' },
    { code: 'EC', name: 'Équateur' },
    { code: 'ER', name: 'Érythrée' },
    { code: 'ES', name: 'Espagne' },
    { code: 'EE', name: 'Estonie' },
    { code: 'US', name: 'États-Unis' },
    { code: 'ET', name: 'Éthiopie' },
    { code: 'FJ', name: 'Fidji' },
    { code: 'FI', name: 'Finlande' },
    { code: 'FR', name: 'France' },
    { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambie' },
    { code: 'GE', name: 'Géorgie' },
    { code: 'GH', name: 'Ghana' },
    { code: 'GR', name: 'Grèce' },
    { code: 'GT', name: 'Guatemala' },
    { code: 'GN', name: 'Guinée' },
    { code: 'GW', name: 'Guinée-Bissau' },
    { code: 'GQ', name: 'Guinée Équatoriale' },
    { code: 'GY', name: 'Guyana' },
    { code: 'HT', name: 'Haïti' },
    { code: 'HN', name: 'Honduras' },
    { code: 'HU', name: 'Hongrie' },
    { code: 'IN', name: 'Inde' },
    { code: 'ID', name: 'Indonésie' },
    { code: 'IQ', name: 'Irak' },
    { code: 'IR', name: 'Iran' },
    { code: 'IE', name: 'Irlande' },
    { code: 'IS', name: 'Islande' },
    { code: 'IL', name: 'Israël' },
    { code: 'IT', name: 'Italie' },
    { code: 'JM', name: 'Jamaïque' },
    { code: 'JP', name: 'Japon' },
    { code: 'JO', name: 'Jordanie' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'KE', name: 'Kenya' },
    { code: 'KG', name: 'Kirghizistan' },
    { code: 'KW', name: 'Koweït' },
    { code: 'LA', name: 'Laos' },
    { code: 'LV', name: 'Lettonie' },
    { code: 'LB', name: 'Liban' },
    { code: 'LR', name: 'Libéria' },
    { code: 'LY', name: 'Libye' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lituanie' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MK', name: 'Macédoine du Nord' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MY', name: 'Malaisie' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' },
    { code: 'MT', name: 'Malte' },
    { code: 'MA', name: 'Maroc' },
    { code: 'MU', name: 'Maurice' },
    { code: 'MR', name: 'Mauritanie' },
    { code: 'MX', name: 'Mexique' },
    { code: 'MD', name: 'Moldavie' },
    { code: 'MC', name: 'Monaco' },
    { code: 'MN', name: 'Mongolie' },
    { code: 'ME', name: 'Monténégro' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibie' },
    { code: 'NP', name: 'Népal' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'NO', name: 'Norvège' },
    { code: 'NZ', name: 'Nouvelle-Zélande' },
    { code: 'OM', name: 'Oman' },
    { code: 'UG', name: 'Ouganda' },
    { code: 'UZ', name: 'Ouzbékistan' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'PS', name: 'Palestine' },
    { code: 'PA', name: 'Panama' },
    { code: 'PG', name: 'Papouasie-N.-Guinée' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'PE', name: 'Pérou' },
    { code: 'PH', name: 'Philippines' },
    { code: 'PL', name: 'Pologne' },
    { code: 'PT', name: 'Portugal' },
    { code: 'QA', name: 'Qatar' },
    { code: 'RO', name: 'Roumanie' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'RU', name: 'Russie' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'SN', name: 'Sénégal' },
    { code: 'RS', name: 'Serbie' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'SG', name: 'Singapour' },
    { code: 'SK', name: 'Slovaquie' },
    { code: 'SI', name: 'Slovénie' },
    { code: 'SO', name: 'Somalie' },
    { code: 'SD', name: 'Soudan' },
    { code: 'SS', name: 'Soudan du Sud' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'SE', name: 'Suède' },
    { code: 'CH', name: 'Suisse' },
    { code: 'SR', name: 'Suriname' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'SY', name: 'Syrie' },
    { code: 'TJ', name: 'Tadjikistan' },
    { code: 'TZ', name: 'Tanzanie' },
    { code: 'TD', name: 'Tchad' },
    { code: 'CZ', name: 'Tchéquie' },
    { code: 'TH', name: 'Thaïlande' },
    { code: 'TL', name: 'Timor Oriental' },
    { code: 'TG', name: 'Togo' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'TM', name: 'Turkménistan' },
    { code: 'TR', name: 'Turquie' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'YE', name: 'Yémen' },
    { code: 'ZM', name: 'Zambie' },
    { code: 'ZW', name: 'Zimbabwe' },
]

interface CountrySelectorProps {
    value: string
    onChange: (code: string) => void
    placeholder?: string
}

export default function CountrySelector({ value, onChange, placeholder = "Sélectionner un pays" }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const selectedCountry = ALL_COUNTRIES.find(c => c.code === value)

    const filteredCountries = useMemo(() => {
        if (!search) return ALL_COUNTRIES
        const searchLower = search.toLowerCase()
        return ALL_COUNTRIES.filter(c =>
            c.name.toLowerCase().includes(searchLower) ||
            c.code.toLowerCase().includes(searchLower)
        )
    }, [search])

    const handleSelect = (code: string) => {
        onChange(code)
        setIsOpen(false)
        setSearch('')
    }

    return (
        <>
            <style jsx>{`
                .country-selector {
                    position: relative;
                    width: 100%;
                }
                
                .selector-trigger {
                    width: 100%;
                    padding: 16px 20px;
                    border: 2px solid var(--border-light);
                    border-radius: 16px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 16px;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.2s;
                }
                
                .selector-trigger:hover,
                .selector-trigger.open {
                    border-color: var(--accent-gold);
                }
                
                .selector-trigger .placeholder {
                    color: var(--text-tertiary);
                }
                
                .chevron {
                    transition: transform 0.2s;
                }
                
                .chevron.open {
                    transform: rotate(180deg);
                }
                
                .dropdown-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 1000;
                    display: flex;
                    align-items: flex-end;
                    animation: fadeIn 0.2s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .dropdown-panel {
                    width: 100%;
                    max-height: 70vh;
                    background: var(--bg-primary);
                    border-radius: 24px 24px 0 0;
                    display: flex;
                    flex-direction: column;
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                
                .dropdown-header {
                    padding: 20px;
                    border-bottom: 1px solid var(--border-light);
                }
                
                .dropdown-title {
                    text-align: center;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 16px;
                }
                
                .search-container {
                    position: relative;
                }
                
                .search-input {
                    width: 100%;
                    padding: 12px 12px 12px 44px;
                    border: 1px solid var(--border-light);
                    border-radius: 12px;
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-size: 15px;
                }
                
                .search-input::placeholder {
                    color: var(--text-tertiary);
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: var(--accent-gold);
                }
                
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-tertiary);
                    font-size: 14px;
                }
                
                .countries-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }
                
                .country-item {
                    width: 100%;
                    padding: 14px 20px;
                    background: none;
                    border: none;
                    color: var(--text-primary);
                    font-size: 15px;
                    text-align: left;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: background 0.15s;
                }
                
                .country-item:hover {
                    background: var(--bg-secondary);
                }
                
                .country-item.selected {
                    background: var(--accent-gold);
                    color: white;
                }
                
                .country-code {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    min-width: 28px;
                }
                
                .country-item.selected .country-code {
                    color: rgba(255,255,255,0.7);
                }
                
                .no-results {
                    padding: 40px 20px;
                    text-align: center;
                    color: var(--text-tertiary);
                }
                
                .close-btn {
                    position: absolute;
                    right: 20px;
                    top: 20px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 18px;
                    cursor: pointer;
                    padding: 8px;
                }
            `}</style>

            <div className="country-selector">
                <button
                    type="button"
                    className={`selector-trigger ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(true)}
                >
                    {selectedCountry ? (
                        <span>{selectedCountry.name}</span>
                    ) : (
                        <span className="placeholder">{placeholder}</span>
                    )}
                    <i className={`fa-solid fa-chevron-down chevron ${isOpen ? 'open' : ''}`} />
                </button>

                {isOpen && (
                    <div className="dropdown-overlay" onClick={() => setIsOpen(false)}>
                        <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
                            <div className="dropdown-header">
                                <button className="close-btn" onClick={() => setIsOpen(false)}>
                                    <i className="fa-solid fa-xmark" />
                                </button>
                                <div className="dropdown-title">Sélectionner un pays</div>
                                <div className="search-container">
                                    <i className="fa-solid fa-magnifying-glass search-icon" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Rechercher..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="countries-list">
                                {filteredCountries.length === 0 ? (
                                    <div className="no-results">Aucun pays trouvé</div>
                                ) : (
                                    filteredCountries.map(country => (
                                        <button
                                            key={country.code}
                                            className={`country-item ${value === country.code ? 'selected' : ''}`}
                                            onClick={() => handleSelect(country.code)}
                                        >
                                            <span className="country-code">{country.code}</span>
                                            <span>{country.name}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
