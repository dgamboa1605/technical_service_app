import { useState, useMemo } from "react";
import type { Client } from "../../domain/entities/Client";
import { GetAllClientsUseCase } from "../../application";
import { useRepositories } from "../../context/RepositoriesContext";

interface ClientSelectorProps {
  onClientSelected: (client: Client | null) => void;
  onNewClient: () => void;
}

export default function ClientSelector({ onClientSelected, onNewClient }: ClientSelectorProps) {
  const { clientRepository } = useRepositories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showResults, setShowResults] = useState(false);

  const getAllClientsUseCase = useMemo(() => new GetAllClientsUseCase(clientRepository), [clientRepository]);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Primero intentar buscar por documento
      const clientByDoc = await clientRepository.searchByDocument(term.trim());
      if (clientByDoc) {
        setSearchResults([clientByDoc]);
        setShowResults(true);
        return;
      }
      
      // Si no encuentra por documento, buscar en la lista general
      const allClients = await getAllClientsUseCase.execute();
      const filtered = allClients.filter(
        (c) =>
          c.name.toLowerCase().includes(term.toLowerCase()) ||
          c.phone.includes(term) ||
          (c.email && c.email.toLowerCase().includes(term.toLowerCase())) ||
          (c.documentNumber && c.documentNumber.includes(term))
      );
      setSearchResults(filtered);
      setShowResults(filtered.length > 0);
    } catch (err) {
      console.error("Error searching clients:", err);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm(client.name);
    setShowResults(false);
    onClientSelected(client);
  };

  const handleClearSelection = () => {
    setSelectedClient(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowResults(false);
    onClientSelected(null);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Cliente <span className="text-red-500">*</span>
      </label>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="Buscar por nombre, documento, teléfono..."
            className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            disabled={!!selectedClient}
          />
          
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {selectedClient && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          {/* Dropdown de resultados */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleSelectClient(client)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {client.documentNumber && <span className="mr-3">Doc: {client.documentNumber}</span>}
                    <span>Tel: {client.phone}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onNewClient}
          className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          title="Registrar nuevo cliente"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo
        </button>
      </div>

      {/* Info del cliente seleccionado */}
      {selectedClient && (
        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 dark:text-white">{selectedClient.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-1">
                {selectedClient.documentNumber && <div>Doc: {selectedClient.documentNumber}</div>}
                <div>Tel: {selectedClient.phone}</div>
                {selectedClient.email && <div>Email: {selectedClient.email}</div>}
                {selectedClient.address && <div>Dir: {selectedClient.address}</div>}
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-100">
              ID: {selectedClient.id}
            </span>
          </div>
        </div>
      )}

      {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && !selectedClient && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No se encontraron clientes. Haz clic en "Nuevo" para registrar uno.
        </div>
      )}
    </div>
  );
}
