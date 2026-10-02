import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useApp } from '../../../context/AppContext';
import { Globe, Save, Upload, Sparkles, AlertCircle } from 'lucide-react';

export const AdminContentPage: React.FC = () => {
  const { showToast } = useApp();

  const [loading, setLoading] = useState(true);
  const [heroBadge, setHeroBadge] = useState('Handcrafted Home Mandirs for Indian Homes');
  const [heroTitle, setHeroTitle] = useState('Handcrafted Teak & Sheesham Temple Mandirs');
  const [heroSubtitle, setHeroSubtitle] = useState('Every mandir is an architectural masterpiece, sculpted from seasoned timber according to Vedic Shilpa Shastra canons.');
  const [announcementText, setAnnouncementText] = useState('✨ Akshar Mandir — Handcrafted Solid Timber Mandirs | Free Pan-India White-Glove Setup');
  const [artisanStoryTitle, setArtisanStoryTitle] = useState('Four Generations of Vedic Woodcarving');
  const [artisanStoryText, setArtisanStoryText] = useState('Our master woodcarvers hail from the historic woodcraft corridor of Saharanpur. Every Gopuram kalash, acoustic bell niche, and floral jaali screen is sculpted by hand with spiritual devotion.');

  useEffect(() => {
    setLoading(true);
    api.content.getPublic()
      .then(res => {
        if (res.success && res.data.content) {
          const c = res.data.content;
          if (c['hero_badge']) setHeroBadge(c['hero_badge']);
          if (c['hero_title']) setHeroTitle(c['hero_title']);
          if (c['hero_subtitle']) setHeroSubtitle(c['hero_subtitle']);
          if (c['announcement_bar']) setAnnouncementText(c['announcement_bar']);
          if (c['artisan_story_title']) setArtisanStoryTitle(c['artisan_story_title']);
          if (c['artisan_story_text']) setArtisanStoryText(c['artisan_story_text']);
        }
      })
      .catch(err => {
        console.error('Error fetching content:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.content.upsertContent('hero_badge', heroBadge, 'Home Banner Badge');
      await api.content.upsertContent('hero_title', heroTitle, 'Hero Headline');
      await api.content.upsertContent('hero_subtitle', heroSubtitle, 'Hero Subtitle');
      await api.content.upsertContent('announcement_bar', announcementText, 'Top Bar Notice');
      await api.content.upsertContent('artisan_story_title', artisanStoryTitle, 'Story Title');
      await api.content.upsertContent('artisan_story_text', artisanStoryText, 'Story Paragraph');
      showToast('Website content updated successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update content.', 'error');
    }
  };

  return (
    <div id="admin-content-page" className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#eae5e2]">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#570000]">Storefront Copy & Storytelling</span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-0.5">
            Website Content Manager
          </h1>
          <p className="text-xs text-gray-500">Edit homepage hero text, top announcements, and artisan heritage narrative.</p>
        </div>
      </div>

      <form onSubmit={handleSaveContent} className="space-y-6 text-xs">
        {/* Section 1: Top Announcement Bar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#570000]" />
            <span>Top Announcement Strip</span>
          </h3>
          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Notice Text</label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 2: Homepage Hero */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#570000]" />
            <span>Homepage Hero Banner</span>
          </h3>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Hero Pill Badge</label>
            <input
              type="text"
              value={heroBadge}
              onChange={(e) => setHeroBadge(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Hero Headline (H1)</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-serif font-bold text-sm focus:outline-hidden"
            />
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Hero Subtitle & Value Pitch</label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Section 3: Artisan Story */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
          <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#570000]" />
            <span>Master Woodcraft Story</span>
          </h3>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Story Section Title</label>
            <input
              type="text"
              value={artisanStoryTitle}
              onChange={(e) => setArtisanStoryTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] font-semibold focus:outline-hidden"
            />
          </div>

          <div>
            <label className="uppercase font-bold text-gray-500 block mb-1">Story Text</label>
            <textarea
              rows={4}
              value={artisanStoryText}
              onChange={(e) => setArtisanStoryText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] focus:outline-hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-[#570000] text-white hover:bg-[#800000] font-bold text-xs shadow-lg flex items-center gap-2 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Website Content</span>
        </button>
      </form>
    </div>
  );
};
