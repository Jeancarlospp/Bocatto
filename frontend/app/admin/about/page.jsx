'use client';

import { useState, useEffect } from 'react';

export default function AdminAboutPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch current configuration
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setConfig(data.data);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      showMessage('error', 'Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Generic save handler
  const saveSection = async (endpoint, data) => {
    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/${endpoint}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      if (result.success) {
        showMessage('success', 'Guardado exitosamente');
        fetchConfig();
      } else {
        showMessage('error', result.message || 'Error al guardar');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Image upload handler
  const uploadImage = async (endpoint, file) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        showMessage('success', 'Imagen subida exitosamente');
        fetchConfig();
      } else {
        showMessage('error', result.message || 'Error al subir imagen');
      }
    } catch (error) {
      showMessage('error', 'Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  // Delete gallery image
  const deleteGalleryImage = async (index) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return;
    
    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/gallery/${index}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        showMessage('success', 'Imagen eliminada');
        fetchConfig();
      }
    } catch (error) {
      showMessage('error', 'Error al eliminar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const sections = [
    { id: 'hero', name: 'Hero', icon: '🏠' },
    { id: 'mission', name: 'Misión', icon: '🎯' },
    { id: 'timeline', name: 'Historia', icon: '📅' },
    { id: 'values', name: 'Valores', icon: '❤️' },
    { id: 'team', name: 'Equipo', icon: '👥' },
    { id: 'gallery', name: 'Galería', icon: '🖼️' },
    { id: 'cta', name: 'CTA', icon: '📢' }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Editar "Quiénes Somos"</h1>
          <p className="text-gray-600">Administra todo el contenido de la página</p>
        </div>
        <a 
          href="/about" 
          target="_blank" 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>👁️</span> Ver Página
        </a>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.icon} {section.name}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* HERO SECTION */}
        {activeSection === 'hero' && config && (
          <HeroEditor 
            hero={config.hero} 
            onSave={(data) => saveSection('hero', data)}
            saving={saving}
          />
        )}

        {/* MISSION SECTION */}
        {activeSection === 'mission' && config && (
          <MissionEditor 
            mission={config.mission}
            onSave={(data) => saveSection('mission', data)}
            onUploadImage={(file) => uploadImage('mission/image', file)}
            saving={saving}
          />
        )}

        {/* TIMELINE SECTION */}
        {activeSection === 'timeline' && config && (
          <TimelineEditor 
            timeline={config.timeline}
            onSave={(data) => saveSection('timeline', { timeline: data })}
            onUploadImage={(index, file) => uploadImage(`timeline/${index}/image`, file)}
            saving={saving}
          />
        )}

        {/* VALUES SECTION */}
        {activeSection === 'values' && config && (
          <ValuesEditor 
            values={config.values}
            onSave={(data) => saveSection('values', { values: data })}
            saving={saving}
          />
        )}

        {/* TEAM SECTION */}
        {activeSection === 'team' && config && (
          <TeamEditor 
            team={config.team}
            onSave={(data) => saveSection('team', { team: data })}
            onUploadImage={(index, file) => uploadImage(`team/${index}/image`, file)}
            saving={saving}
          />
        )}

        {/* GALLERY SECTION */}
        {activeSection === 'gallery' && config && (
          <GalleryEditor 
            gallery={config.gallery}
            onUploadImage={(file, caption) => {
              const formData = new FormData();
              formData.append('image', file);
              formData.append('caption', caption);
              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/about/gallery/image`, {
                method: 'POST',
                credentials: 'include',
                body: formData
              }).then(() => {
                showMessage('success', 'Imagen añadida');
                fetchConfig();
              });
            }}
            onDelete={deleteGalleryImage}
            saving={saving}
          />
        )}

        {/* CTA SECTION */}
        {activeSection === 'cta' && config && (
          <CTAEditor 
            cta={config.cta}
            onSave={(data) => saveSection('cta', data)}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// HERO EDITOR
// ==========================================
function HeroEditor({ hero, onSave, saving }) {
  const [title, setTitle] = useState(hero?.title || '');
  const [subtitle, setSubtitle] = useState(hero?.subtitle || '');
  const [stats, setStats] = useState(hero?.stats || []);

  const addStat = () => {
    setStats([...stats, { value: '', label: '' }]);
  };

  const updateStat = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  const removeStat = (index) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">🏠 Sección Hero</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
          placeholder="Nuestra Historia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
        <textarea
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
          rows={3}
          placeholder="Descripción breve de la empresa..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estadísticas</label>
        {stats.map((stat, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={stat.value}
              onChange={(e) => updateStat(index, 'value', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-black bg-white"
              placeholder="Valor (ej: 30+)"
            />
            <input
              type="text"
              value={stat.label}
              onChange={(e) => updateStat(index, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-black bg-white"
              placeholder="Etiqueta (ej: Años de Experiencia)"
            />
            <button
              onClick={() => removeStat(index)}
              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={addStat}
          className="text-orange-600 hover:text-orange-700 font-medium"
        >
          + Añadir estadística
        </button>
      </div>

      <button
        onClick={() => onSave({ title, subtitle, stats })}
        disabled={saving}
        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}

// ==========================================
// MISSION EDITOR
// ==========================================
function MissionEditor({ mission, onSave, onUploadImage, saving }) {
  const [title, setTitle] = useState(mission?.title || '');
  const [description, setDescription] = useState(mission?.description || '');
  const [highlights, setHighlights] = useState(mission?.highlights || []);

  const addHighlight = () => {
    setHighlights([...highlights, { text: '' }]);
  };

  const updateHighlight = (index, value) => {
    const newHighlights = [...highlights];
    newHighlights[index].text = value;
    setHighlights(newHighlights);
  };

  const removeHighlight = (index) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">🎯 Sección Misión</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
              rows={5}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Puntos Destacados</label>
            {highlights.map((h, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={h.text}
                  onChange={(e) => updateHighlight(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-black bg-white"
                  placeholder="Punto destacado..."
                />
                <button
                  onClick={() => removeHighlight(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg"
                >
                  ✕
                </button>
              </div>
            ))}
            <button onClick={addHighlight} className="text-orange-600 font-medium">
              + Añadir punto
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
          {mission?.image ? (
            <div className="relative">
              <img src={mission.image} alt="Mission" className="w-full h-64 object-cover rounded-lg" />
              <label className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-lg cursor-pointer hover:bg-gray-100">
                Cambiar
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(e.target.files[0])} />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-4xl mb-2">📷</span>
              <span className="text-gray-500">Click para subir imagen</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(e.target.files[0])} />
            </label>
          )}
        </div>
      </div>

      <button
        onClick={() => onSave({ title, description, highlights })}
        disabled={saving}
        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}

// ==========================================
// TIMELINE EDITOR
// ==========================================
function TimelineEditor({ timeline, onSave, onUploadImage, saving }) {
  const [items, setItems] = useState(timeline || []);

  const addItem = () => {
    setItems([...items, { year: '', title: '', description: '', image: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    if (confirm('¿Eliminar este período?')) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">📅 Historia / Timeline</h2>
      
      {items.map((item, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
          <button
            onClick={() => removeItem(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <input
                    type="text"
                    value={item.year}
                    onChange={(e) => updateItem(index, 'year', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-black bg-white"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-black bg-white"
                    placeholder="Título del período"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-black bg-white"
                  rows={3}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              {item.image ? (
                <div className="relative">
                  <img src={item.image} alt={item.year} className="w-full h-40 object-cover rounded-lg" />
                  <label className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded cursor-pointer text-sm">
                    Cambiar
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(index, e.target.files[0])} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white">
                  <span className="text-2xl">📷</span>
                  <span className="text-sm text-gray-500">Subir imagen</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(index, e.target.files[0])} />
                </label>
              )}
            </div>
          </div>
        </div>
      ))}

      <button onClick={addItem} className="text-orange-600 font-medium hover:text-orange-700">
        + Añadir período
      </button>

      <div>
        <button
          onClick={() => onSave(items)}
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// VALUES EDITOR
// ==========================================
function ValuesEditor({ values, onSave, saving }) {
  const [items, setItems] = useState(values || []);

  const emojis = ['❤️', '🌱', '👨‍👩‍👧‍👦', '🎯', '🚀', '🤝', '⭐', '💪', '🌟', '🏆', '🔥', '💡'];

  const addItem = () => {
    setItems([...items, { icon: '❤️', title: '', description: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">❤️ Valores</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
            <button
              onClick={() => removeItem(index)}
              className="absolute top-2 right-2 text-red-500"
            >
              ✕
            </button>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={item.icon}
                  onChange={(e) => updateItem(index, 'icon', e.target.value)}
                  className="px-3 py-2 border rounded-lg text-2xl text-black bg-white"
                >
                  {emojis.map((emoji) => (
                    <option key={emoji} value={emoji}>{emoji}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, 'title', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-black bg-white"
                  placeholder="Título del valor"
                />
              </div>
              <textarea
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-black bg-white"
                rows={2}
                placeholder="Descripción..."
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="text-orange-600 font-medium">
        + Añadir valor
      </button>

      <div>
        <button
          onClick={() => onSave(items)}
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// TEAM EDITOR
// ==========================================
function TeamEditor({ team, onSave, onUploadImage, saving }) {
  const [members, setMembers] = useState(team || []);

  const addMember = () => {
    setMembers([...members, { name: '', position: '', description: '', specialty: '', image: '' }]);
  };

  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const removeMember = (index) => {
    if (confirm('¿Eliminar este miembro?')) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">👥 Equipo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
            <button
              onClick={() => removeMember(index)}
              className="absolute top-2 right-2 text-red-500"
            >
              ✕
            </button>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {member.image ? (
                  <div className="relative">
                    <img src={member.image} alt={member.name} className="w-24 h-24 object-cover rounded-lg" />
                    <label className="absolute bottom-0 right-0 bg-white p-1 rounded cursor-pointer text-xs">
                      📷
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(index, e.target.files[0])} />
                    </label>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white">
                    <span className="text-xl">👤</span>
                    <span className="text-xs text-gray-500">Foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onUploadImage(index, e.target.files[0])} />
                  </label>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(index, 'name', e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm text-black bg-white"
                  placeholder="Nombre"
                />
                <input
                  type="text"
                  value={member.position}
                  onChange={(e) => updateMember(index, 'position', e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm text-black bg-white"
                  placeholder="Cargo"
                />
                <input
                  type="text"
                  value={member.specialty}
                  onChange={(e) => updateMember(index, 'specialty', e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm text-black bg-white"
                  placeholder="Especialidad"
                />
                <input
                  type="text"
                  value={member.description}
                  onChange={(e) => updateMember(index, 'description', e.target.value)}
                  className="w-full px-3 py-1 border rounded text-sm text-black bg-white"
                  placeholder="Descripción breve"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addMember} className="text-orange-600 font-medium">
        + Añadir miembro
      </button>

      <div>
        <button
          onClick={() => onSave(members)}
          disabled={saving}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// GALLERY EDITOR
// ==========================================
function GalleryEditor({ gallery, onUploadImage, onDelete, saving }) {
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = () => {
    if (selectedFile) {
      onUploadImage(selectedFile, caption);
      setSelectedFile(null);
      setCaption('');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">🖼️ Galería</h2>
      
      {/* Upload New */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium mb-3">Añadir Nueva Imagen</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Imagen</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full px-3 py-2 border rounded-lg text-black bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-black bg-white"
              placeholder="Descripción de la imagen..."
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || saving}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
          >
            Subir
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gallery?.map((item, index) => (
          <div key={index} className="relative group">
            <img src={item.image} alt={item.caption || `Gallery ${index + 1}`} className="w-full aspect-square object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
              <button
                onClick={() => onDelete(index)}
                className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded-lg"
              >
                Eliminar
              </button>
            </div>
            {item.caption && (
              <p className="text-xs text-gray-500 mt-1 truncate">{item.caption}</p>
            )}
          </div>
        ))}
      </div>

      {(!gallery || gallery.length === 0) && (
        <p className="text-center text-gray-500 py-8">No hay imágenes en la galería. Sube la primera.</p>
      )}
    </div>
  );
}

// ==========================================
// CTA EDITOR
// ==========================================
function CTAEditor({ cta, onSave, saving }) {
  const [title, setTitle] = useState(cta?.title || '');
  const [description, setDescription] = useState(cta?.description || '');

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-2">📢 Call to Action (CTA)</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
          placeholder="¿Listo para vivir la experiencia?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 text-black bg-white"
          rows={3}
          placeholder="Mensaje motivador para el usuario..."
        />
      </div>

      <button
        onClick={() => onSave({ title, description })}
        disabled={saving}
        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
      >
        {saving ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </div>
  );
}
