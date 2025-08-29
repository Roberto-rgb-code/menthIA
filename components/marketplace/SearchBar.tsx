import { FiSearch } from "react-icons/fi";

export default function SearchBar({ value, onChange, onSearch }:{
  value: string; onChange: (v:string)=>void; onSearch: ()=>void;
}) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border px-4 py-3">
      <FiSearch className="text-gray-500" />
      <input
        className="flex-1 outline-none text-sm"
        placeholder="Buscar por nombre, descripción o servicio…"
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        onKeyDown={(e)=>e.key==='Enter' && onSearch()}
      />
      <button onClick={onSearch} className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
        Buscar
      </button>
    </div>
  );
}
