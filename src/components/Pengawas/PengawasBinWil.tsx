import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  School, 
  Trash2, 
  ArrowRight, 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  Building2,
  MapPin,
  Save,
  Globe,
  Loader2,
  X,
  Search,
  Navigation,
  Users,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { UserProfile, SchoolInfo } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

// Fix Leaflet marker icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerModalProps {
  initialLat: number;
  initialLng: number;
  onConfirm: (lat: number, lng: number) => void;
  onClose: () => void;
}

function MapPickerModal({ initialLat, initialLng, onConfirm, onClose }: MapPickerModalProps) {
  const [tempPos, setTempPos] = useState({ lat: initialLat, lng: initialLng });
  const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  function MapEvents() {
    const map = useMap();
    useMapEvents({
      click(e) {
        setTempPos({ lat: e.latlng.lat, lng: e.latlng.lng });
      },
    });

    useEffect(() => {
      map.setView([tempPos.lat, tempPos.lng]);
    }, [tempPos]);

    return null;
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setTempPos({ lat: parseFloat(lat), lng: parseFloat(lon) });
      } else {
        alert("Lokasi tidak ditemukan");
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setTempPos(coords);
        setUserPos(coords);
        setIsLocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex flex-col p-4 md:p-10">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl mx-auto flex-1 flex flex-col overflow-hidden shadow-2xl border border-white/20">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center space-x-2">
              <MapIcon className="text-blue-600" size={20} />
              <span>Penentuan Titik Lokasi Sekolah</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gunakan kotak pencarian atau klik pada peta untuk menentukan lokasi</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white text-slate-400 hover:text-rose-500 rounded-2xl transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 relative">
          <MapContainer 
            center={[tempPos.lat, tempPos.lng]} 
            zoom={16} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            <Marker position={[tempPos.lat, tempPos.lng]} />
            {userPos && (
              <CircleMarker 
                center={[userPos.lat, userPos.lng]} 
                radius={8} 
                pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 3 }}
              />
            )}
          </MapContainer>

          {/* Search Box */}
          <div className="absolute top-6 left-6 right-6 z-[1001] flex justify-center pointer-events-none">
            <div className="bg-white/95 backdrop-blur-md w-full max-w-sm flex items-center p-2 rounded-2xl shadow-2xl border border-slate-100 pointer-events-auto">
               <div className="pl-3 pr-2 text-slate-400">
                  {isSearching ? <Loader2 size={18} className="animate-spin text-blue-500" /> : <Search size={18} />}
               </div>
               <input 
                 className="flex-1 bg-transparent text-xs font-bold text-slate-700 outline-none placeholder:text-slate-300"
                 placeholder="Cari nama sekolah atau tempat..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               />
               <button 
                 onClick={handleSearch}
                 disabled={isSearching}
                 className="px-4 py-2 bg-slate-50 text-[10px] font-black text-blue-600 rounded-xl hover:bg-white border border-slate-100 transition-all uppercase tracking-widest ml-2"
               >
                 Cari
               </button>
            </div>
            
            <button 
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="ml-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-100 pointer-events-auto text-blue-600 hover:text-blue-700 transition-all active:scale-95 group relative"
              title="Gunakan Lokasi Saya Saat Ini"
            >
              {isLocating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Navigation size={20} className="group-hover:rotate-12 transition-transform" />
              )}
              {/* Tooltip for desktop */}
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-800 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Lokasi Saya
              </span>
            </button>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 z-[1000] flex justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-[1.5rem] shadow-2xl border border-slate-100 flex flex-col items-center pointer-events-auto">
               <div className="flex items-center space-x-4 mb-4">
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Latitude</p>
                    <p className="text-xs font-mono font-black text-blue-600">{tempPos.lat.toFixed(6)}</p>
                  </div>
                  <div className="w-px h-6 bg-slate-200"></div>
                  <div className="text-center">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Longitude</p>
                    <p className="text-xs font-mono font-black text-blue-600">{tempPos.lng.toFixed(6)}</p>
                  </div>
               </div>
               <button 
                 onClick={() => onConfirm(tempPos.lat, tempPos.lng)}
                 className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
               >
                 <Save size={14} />
                 <span>Terapkan Koordinat</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SchoolMapPickerProps {
  lat: number;
  lng: number;
  radius: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Component to handle map centering
function MapCenterer({ lat, lng }: { lat: number, lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

function DraggableMarker({ lat, lng, onLocationChange }: { lat: number, lng: number, onLocationChange: (lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          onLocationChange(lat, lng);
        }
      },
    }),
    [onLocationChange],
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={[lat, lng]}
      ref={markerRef}
    />
  );
}

function SchoolMapPicker({ lat, lng, radius, onLocationChange }: SchoolMapPickerProps) {
  const [showEnlarged, setShowEnlarged] = useState(false);

  return (
    <>
      <div 
        onClick={() => setShowEnlarged(true)}
        className="w-full h-44 rounded-2xl overflow-hidden border border-slate-200 mt-2 relative shadow-inner group cursor-zoom-in"
      >
        <MapContainer 
          center={[lat, lng]} 
          zoom={15} 
          scrollWheelZoom={false}
          className="w-full h-full grayscale-[0.2] group-hover:grayscale-0 transition-all"
          zoomControl={false}
          dragging={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterer lat={lat} lng={lng} />
          <Marker position={[lat, lng]} />
        </MapContainer>
        
        {/* Overlay Label */}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-[8px] font-black uppercase tracking-widest text-blue-600 flex items-center space-x-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all z-[400]">
            <MapIcon size={10} />
            <span>Klik untuk Memperbesar</span>
          </div>
        </div>
      </div>

      {showEnlarged && (
        <MapPickerModal
          initialLat={lat}
          initialLng={lng}
          onClose={() => setShowEnlarged(false)}
          onConfirm={(newLat, newLng) => {
            onLocationChange(newLat, newLng);
            setShowEnlarged(false);
          }}
        />
      )}
    </>
  );
}

interface PengawasBinWilProps {
  user: any;
  schools: SchoolInfo[];
  setSchools: (schools: SchoolInfo[]) => void;
  users: UserProfile[];
  setActiveTab: (tab: string) => void;
}

export function PengawasBinWil({ user, schools, setSchools, users, setActiveTab }: PengawasBinWilProps) {
  const { showToast } = useNotifications();
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState<string | null>(null); // schoolId
  const [editingSchool, setEditingSchool] = useState<string | null>(null); // schoolId
  const [editForm, setEditForm] = useState({ lat: '', lng: '', radius: '200', npsn: '' });
  const [newSchoolForm, setNewSchoolForm] = useState({ lat: '-6.4021', lng: '107.4589', radius: '200', npsn: '' });

  const handleAddSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const target = e.target as any;
    const newSchoolName = target.schoolName.value;
    const npsn = newSchoolForm.npsn;
    const lat = parseFloat(newSchoolForm.lat);
    const lng = parseFloat(newSchoolForm.lng);
    const radius = parseInt(newSchoolForm.radius) || 200;

    if (schools.some(s => s.name === newSchoolName || s.npsn === npsn)) {
      showToast('Sekolah atau NPSN sudah ada dalam daftar', 'error');
      return;
    }

    const newSchool: SchoolInfo = {
      id: npsn || Date.now().toString(),
      name: newSchoolName,
      npsn,
      lat: isNaN(lat) ? undefined : lat,
      lng: isNaN(lng) ? undefined : lng,
      radius
    };

    setSchools([...schools, newSchool]);
    setShowAddSchool(false);
    showToast(`Sekolah ${newSchoolName} berhasil ditambahkan ke wilayah binaan`, 'success');
  };

  const handleDeleteSchool = (schoolId: string) => {
    const schoolUsers = users.filter((u: any) => u.schoolId === schoolId);
    if (schoolUsers.length > 0) {
      const sName = schools.find(s => s.id === schoolId)?.name || 'Sekolah';
      showToast(`Tidak dapat menghapus ${sName}. Masih terdapat ${schoolUsers.length} personel terdaftar.`, 'error');
      return;
    }
    setSchoolToDelete(schoolId);
  };

  const confirmDelete = () => {
    if (schoolToDelete) {
      const sName = schools.find(s => s.id === schoolToDelete)?.name || 'Sekolah';
      setSchools(schools.filter((s: SchoolInfo) => s.id !== schoolToDelete));
      showToast(`${sName} telah dihapus dari wilayah binaan`, 'info');
      setSchoolToDelete(null);
    }
  };

  const startEditing = (school: SchoolInfo) => {
    setEditingSchool(school.id);
    setEditForm({
      lat: school.lat?.toString() || '',
      lng: school.lng?.toString() || '',
      radius: school.radius?.toString() || '200',
      npsn: school.npsn || ''
    });
  };

  const saveEdit = (schoolId: string) => {
    const lat = parseFloat(editForm.lat);
    const lng = parseFloat(editForm.lng);
    const radius = parseInt(editForm.radius);
    const npsn = editForm.npsn;

    const sName = schools.find(s => s.id === schoolId)?.name || 'Sekolah';

    setSchools(schools.map(s => s.id === schoolId ? {
      ...s,
      npsn,
      lat: isNaN(lat) ? undefined : lat,
      lng: isNaN(lng) ? undefined : lng,
      radius: isNaN(radius) ? 200 : radius
    } : s));
    
    setEditingSchool(null);
    showToast(`Lokasi ${sName} diperbarui`, 'success');
  };

  const schoolNameForDelete = schools.find(s => s.id === schoolToDelete)?.name || 'Sekolah';

  return (
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {schoolToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSchoolToDelete(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-rose-50/50">
                   <ShieldAlert size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-3">Hapus Satuan Pendidikan?</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  Anda akan menghapus <span className="text-rose-600 font-black uppercase">{schoolNameForDelete}</span> dari database pengawasan. Seluruh integrasi data akan terputus permanen.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setSchoolToDelete(null)}
                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={confirmDelete}
                    className="py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 active:scale-95"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight truncate tracking-tight">Otoritas & Manajemen Lokasi Sekolah</h3>
          <p className="text-sm text-slate-400 font-medium font-mono uppercase tracking-[0.05em] mt-1 truncate">Total Sekolah: {schools.length} Unit • Pengawas: {user.nama}</p>
        </div>
        <button 
          onClick={() => setShowAddSchool(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center space-x-3 active:scale-95"
        >
          <Plus size={18} />
          <span>Tambah Satuan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {schools.map((school: SchoolInfo) => {
          const schoolPersonnel = users.filter((u: any) => u.schoolId === school.id);
          const teachers = schoolPersonnel.filter((u: any) => u.role === 'GURU');
          const ks = schoolPersonnel.find((u: any) => u.role === 'KEPALA_SEKOLAH');
          const isEditing = editingSchool === school.id;

          return (
            <div key={school.id || school.name} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 group overflow-hidden flex flex-col relative min-h-[320px]">
               {/* Decorative Background Icon */}
               <div className="absolute -right-6 -top-6 opacity-[0.03] group-hover:opacity-[0.08] group-hover:rotate-12 transition-all duration-700 pointer-events-none text-blue-600">
                  <School size={160} strokeWidth={1} />
               </div>

               <div className="p-8 pb-4 relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl border transition-all shadow-inner ${isEditing ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500'}`}>
                      <School size={24} />
                    </div>
                    <div className="flex items-center space-x-2">
                       <button 
                         onClick={() => handleDeleteSchool(school.id || school.name)}
                         className="p-2.5 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all border border-rose-100 opacity-0 group-hover:opacity-100"
                       >
                         <Trash2 size={14} />
                       </button>
                    </div>
                  </div>
                  <h4 className="font-black text-slate-800 text-xl leading-tight mb-1 truncate uppercase tracking-tight">{school.name}</h4>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                       <span className="text-[10px] font-black uppercase tracking-widest">NPSN:</span>
                       <span className="text-[10px] font-mono font-black">{school.npsn || '-'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin size={10} className={school.lat ? 'text-emerald-500' : 'text-slate-300'} />
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${school.lat ? 'text-emerald-600' : 'text-slate-400 italic'}`}>
                        {school.lat ? `${school.lat.toFixed(4)}, ${school.lng?.toFixed(4)}` : 'No Coord'}
                      </span>
                    </div>
                  </div>
               </div>

               <div className="px-8 flex-1">
                  {isEditing ? (
                     <div className="space-y-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner mb-6">
                        <div className="space-y-1">
                           <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">NPSN / ID Sekolah</label>
                           <input 
                             value={editForm.npsn}
                             onChange={(e) => setEditForm({...editForm, npsn: e.target.value})}
                             placeholder="69000001"
                             className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none focus:border-blue-500"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                             <input 
                               value={editForm.lat}
                               onChange={(e) => setEditForm({...editForm, lat: e.target.value})}
                               placeholder="-6.4021"
                               className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                             <input 
                               value={editForm.lng}
                               onChange={(e) => setEditForm({...editForm, lng: e.target.value})}
                               placeholder="107.4589"
                               className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                             />
                          </div>
                       </div>
                       
                       <SchoolMapPicker 
                         lat={parseFloat(editForm.lat) || -6.4021}
                         lng={parseFloat(editForm.lng) || 107.4589}
                         radius={parseInt(editForm.radius) || 200}
                         onLocationChange={(lat, lng) => setEditForm({...editForm, lat: lat.toString(), lng: lng.toString()})}
                       />

                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Radius Presensi (Meter)</label>
                          <input 
                            type="number"
                            value={editForm.radius}
                            onChange={(e) => setEditForm({...editForm, radius: e.target.value})}
                            placeholder="200"
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500"
                          />
                       </div>
                       <div className="flex gap-2 pt-2">
                          <button onClick={() => setEditingSchool(null)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest">Batal</button>
                          <button onClick={() => saveEdit(school.id || school.name)} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center space-x-2">
                            <Save size={12} /> <span>Simpan</span>
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="mb-6 space-y-6">
                       <div className="flex -space-x-3">
                          {ks && (
                            <div title={`KS: ${ks.nama}`} className="w-9 h-9 rounded-xl border-4 border-white bg-amber-500 flex items-center justify-center text-[9px] font-black text-white shadow-md z-10 transition-transform hover:-translate-y-1">
                              KS
                            </div>
                          )}
                          {teachers.slice(0, 5).map((u: any) => (
                            <div key={u.id} title={u.nama} className="w-9 h-9 rounded-xl border-4 border-white bg-blue-100 flex items-center justify-center text-[9px] font-black text-blue-600 shadow-sm transition-transform hover:-translate-y-1">
                              {u.nama.charAt(0)}
                            </div>
                          ))}
                          {teachers.length > 5 && (
                            <div className="w-9 h-9 rounded-xl border-4 border-white bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm">
                              +{teachers.length - 5}
                            </div>
                          )}
                          {schoolPersonnel.length === 0 && (
                             <div className="text-[10px] text-slate-300 italic font-medium ml-2">Belum ada personel</div>
                          )}
                       </div>
                       
                       <button 
                         onClick={() => startEditing(school)}
                         className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all group/edit"
                       >
                         <Globe size={14} className="group-hover/edit:rotate-45 transition-transform" />
                         <span>Kelola Titik Koordinat</span>
                       </button>
                    </div>
                  )}
               </div>

               <div className="p-8 pt-0 mt-auto border-t border-slate-50 flex items-center justify-between">
                  <button 
                    onClick={() => setActiveTab('Mutasi & Rotasi')}
                    className="w-full py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all group/edit"
                  >
                    <Users size={14} className="group-hover/edit:rotate-45 transition-transform" />
                    <span className="text-[9px] font-black uppercase tracking-widest px-2">Kelola SDM</span>
                  </button>
               </div>
            </div>
          );
        })}
      </div>      {showAddSchool && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[70] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-slate-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 scale-150 text-emerald-600">
               <Building2 size={140} />
            </div>
            
            <h4 className="text-2xl font-black text-slate-800 mb-2 tracking-tight relative z-10">Daftarkan Sekolah Baru</h4>
            <p className="text-xs text-slate-400 font-medium mb-8 relative z-10 italic">Hubungkan satuan pendidikan ke pusat komando pengawasan.</p>
            
            <form onSubmit={handleAddSchool} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Satuan Pendidikan</label>
                  <input name="schoolName" type="text" required placeholder="SDN 03 Cikampek" className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-black outline-none focus:border-emerald-500 transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NPSN (ID Sekolah)</label>
                  <input 
                    name="npsn" 
                    type="text" 
                    required 
                    value={newSchoolForm.npsn}
                    onChange={(e) => setNewSchoolForm({...newSchoolForm, npsn: e.target.value})}
                    placeholder="Wajib 8 Digit" 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-[1.2rem] text-sm font-black outline-none focus:border-emerald-500 transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                  <input 
                    name="lat" 
                    type="text" 
                    value={newSchoolForm.lat}
                    onChange={(e) => setNewSchoolForm({...newSchoolForm, lat: e.target.value})}
                    placeholder="-6.1234" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                  <input 
                    name="lng" 
                    type="text" 
                    value={newSchoolForm.lng}
                    onChange={(e) => setNewSchoolForm({...newSchoolForm, lng: e.target.value})}
                    placeholder="106.1234" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 shadow-inner" 
                  />
                </div>
              </div>

              <SchoolMapPicker 
                lat={parseFloat(newSchoolForm.lat) || -6.4021}
                lng={parseFloat(newSchoolForm.lng) || 107.4589}
                radius={parseInt(newSchoolForm.radius) || 200}
                onLocationChange={(lat, lng) => setNewSchoolForm({...newSchoolForm, lat: lat.toString(), lng: lng.toString()})}
              />

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Radius Toleransi (Meter)</label>
                <input 
                  name="radius" 
                  type="number" 
                  value={newSchoolForm.radius}
                  onChange={(e) => setNewSchoolForm({...newSchoolForm, radius: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500 shadow-inner" 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddSchool(false)} className="flex-1 py-5 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">Batal</button>
                <button type="submit" className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-95">Sahkan Sekolah</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
