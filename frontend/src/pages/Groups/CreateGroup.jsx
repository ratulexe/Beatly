import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Users } from 'lucide-react';
import { useGroups } from '../../hooks/useGroups';
const CreateGroup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const { createGroup, loading, error } = useGroups();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newGroup = await createGroup(formData);
      navigate(`/groups/${newGroup._id || newGroup.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/groups')}
        className="flex items-center gap-2 text-beatly-text-muted hover:text-white transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back to Groups
      </button>

      <div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Create a New Group</h1>
        <p className="text-beatly-text-muted">Start a new community to share music and playlists.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        {/* Cover Image Placeholder */}
        <div className="w-full h-32 bg-beatly-surface-hover rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-beatly-border hover:border-beatly-primary/50 transition-colors cursor-pointer group">
          <ImageIcon className="text-beatly-text-muted group-hover:text-beatly-primary mb-2 transition-colors" size={32} />
          <span className="text-sm font-medium text-beatly-text-muted group-hover:text-white transition-colors">Upload Cover Image</span>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-bold text-white mb-2">Group Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Indie Pop Lovers"
              className="w-full bg-beatly-surface border border-beatly-border rounded-xl px-4 py-3 text-white placeholder-beatly-text-muted focus:outline-none focus:border-beatly-primary transition-colors font-medium"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-bold text-white mb-2">Description</label>
            <textarea 
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this group about?"
              className="w-full bg-beatly-surface border border-beatly-border rounded-xl px-4 py-3 text-white placeholder-beatly-text-muted focus:outline-none focus:border-beatly-primary transition-colors font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-beatly-surface rounded-xl border border-beatly-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-beatly-surface-hover rounded-lg">
                <Users className="text-beatly-text-muted" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Private Group</h4>
                <p className="text-xs text-beatly-text-muted">Only invited members can view or join.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                name="isPrivate" 
                className="sr-only peer" 
                checked={formData.isPrivate}
                onChange={handleChange}
              />
              <div className="w-11 h-6 bg-beatly-surface-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-beatly-primary"></div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-beatly-border">
          <button 
            type="button"
            onClick={() => navigate('/groups')}
            className="px-6 py-2.5 rounded-xl font-bold text-beatly-text-muted hover:text-white hover:bg-beatly-surface transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={!formData.name.trim()}
            className="bg-beatly-primary text-black px-6 py-2.5 rounded-xl font-bold hover:bg-beatly-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
