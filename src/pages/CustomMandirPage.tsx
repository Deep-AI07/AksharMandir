import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MandirMaterial, FinishType, MountingType, CustomMandirRequest } from '../types';
import { 
  Sparkles, 
  Ruler, 
  Layers, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Compass, 
  ArrowRight, 
  Check, 
  HelpCircle,
  FileText,
  Hammer
} from 'lucide-react';

export const CustomMandirPage: React.FC = () => {
  const { user, submitCustomRequest, formatPrice, navigateTo } = useApp();

  const [fullName, setFullName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [email, setEmail] = useState(user.email || '');
  const [city, setCity] = useState(user.addresses[0]?.city || 'Bengaluru');
  const [pincode, setPincode] = useState(user.addresses[0]?.pincode || '560038');

  // Dimensions
  const [width, setWidth] = useState('48');
  const [depth, setDepth] = useState('24');
  const [height, setHeight] = useState('60');
  const [unit, setUnit] = useState<'Inches' | 'Feet'>('Inches');

  // Specs
  const [material, setMaterial] = useState<MandirMaterial>('Teak Wood');
  const [finish, setFinish] = useState<FinishType>('Antique Honey');
  const [mounting, setMounting] = useState<MountingType>('Floor Rested');

  // Features
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Backlit Warm Om LED Panel',
    'Solid Brass Bells (8x)',
    'Slide-out Prasad & Aarti Tray',
    'Dual Velvet Drawers'
  ]);

  const [engraving, setEngraving] = useState('Gayatri Mantra carved across the top Shikhara arch');
  const [additionalNotes, setAdditionalNotes] = useState('We have an 18-inch marble Krishna deity vigraha requiring 24-inch mandir interior height clearance.');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<CustomMandirRequest | null>(null);

  const availableFeatures = [
    'Backlit Warm Om LED Panel',
    'Solid Brass Bells (8x)',
    'Slide-out Prasad & Aarti Tray',
    'Dual Velvet Drawers',
    'CNC Laser Lattice / Jaali Doors',
    'Tiered Deity Pedestal Steps',
    'Integrated Dimmable Warm Spotlights',
    'Secret Bottom Storage Locker'
  ];

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  // Dynamic Quote Estimator
  const calculateEstimatedQuote = () => {
    let base = 35000;
    const w = parseFloat(width) || 36;
    const h = parseFloat(height) || 48;
    const volumeFactor = unit === 'Feet' ? (w * h * 100) : (w * h * 0.7);
    base += Math.round(volumeFactor * 10);

    if (material === 'Teak Wood') base += 14000;
    if (material === 'Rosewood') base += 22000;
    if (material === 'Brass Inlay Teak') base += 18000;
    if (material === 'Composite Marble') base += 10000;

    base += selectedFeatures.length * 2500;
    if (engraving.trim()) base += 3500;

    return Math.round(base / 500) * 500;
  };

  const estimatedQuote = calculateEstimatedQuote();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const req = submitCustomRequest({
      fullName,
      phone,
      email,
      city,
      pincode,
      width,
      depth,
      height,
      unit,
      materialPreference: material,
      finishType: finish,
      mounting,
      features: selectedFeatures,
      engravingRequirements: engraving,
      additionalRequirements: additionalNotes,
      referenceImageName: uploadedFileName || 'living_room_corner_blueprint.jpg',
      estimatedQuote
    });
    setSubmittedRequest(req);
  };

  return (
    <div id="custom-mandir-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#3e0000] via-[#570000] to-[#7b581e] text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#fdcc87] bg-black/30 px-3.5 py-1 rounded-full inline-block">
            Atelier Bespoke Service
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#fbf9f8] leading-tight">
            Your Space. Your Design. <br />
            <span className="text-[#fdcc87] italic font-normal">Your Home Mandir.</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
            Every home possesses unique energy and spatial proportions. Share your vision, corner dimensions, and deity specifications. Our master artisans and Vastu consultants will handcraft your dream temple to millimeter accuracy.
          </p>
        </div>
      </div>

      {/* Confirmation State if just submitted */}
      {submittedRequest ? (
        <div className="bg-white rounded-3xl border border-[#eae5e2] p-8 sm:p-12 text-center space-y-6 shadow-xl animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-[#570000] text-[#fdcc87] flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b]">
              Bespoke Request Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Reference Inquiry Ticket: <strong className="font-mono text-[#570000]">{submittedRequest.id}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Our lead architectural woodcarver and Vastu consultant will review your specifications ({submittedRequest.width}" x {submittedRequest.depth}" x {submittedRequest.height}", {submittedRequest.materialPreference}) and prepare a 3D CAD visualization within 24 hours.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#f6f3f2] max-w-md mx-auto border border-[#eae5e2] text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Initial Estimated Quote:</span>
              <span className="font-bold text-[#570000]">{formatPrice(submittedRequest.estimatedQuote)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estimated Crafting Window:</span>
              <span className="font-semibold text-gray-800">18 - 24 Business Days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">White-Glove Assembly:</span>
              <span className="font-semibold text-emerald-700">Complimentary</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo('account')}
              className="px-6 py-3 rounded-xl bg-[#570000] text-white text-xs font-bold shadow-md hover:bg-[#800000]"
            >
              View Inquiries in My Account
            </button>
            <button
              onClick={() => {
                setSubmittedRequest(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50"
            >
              Configure Another Mandir
            </button>
          </div>
        </div>
      ) : (
        /* Main Customization Request Form */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Configuration Steps */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 bg-white rounded-3xl border border-[#eae5e2] p-6 sm:p-10 shadow-sm space-y-8">
            {/* Step 1: Dimensions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eae5e2]">
                <div className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Dimensions & Spatial Layout</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Width ({unit})</label>
                  <input
                    type="number"
                    required
                    value={width}
                    onChange={e => setWidth(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000] font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Depth ({unit})</label>
                  <input
                    type="number"
                    required
                    value={depth}
                    onChange={e => setDepth(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000] font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Height ({unit})</label>
                  <input
                    type="number"
                    required
                    value={height}
                    onChange={e => setHeight(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000] font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000] font-bold"
                  >
                    <option value="Inches">Inches</option>
                    <option value="Feet">Feet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Mounting Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Floor Rested', 'Wall Mounted', 'Convertible (Floor/Wall)'] as MountingType[]).map(m => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setMounting(m)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                        mounting === m ? 'bg-[#570000] text-white border-[#570000]' : 'bg-[#f6f3f2] border-[#eae5e2] text-gray-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Wood & Polish */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eae5e2]">
                <div className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Wood Species & Hand-Rubbed Polish</h3>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Wood Species</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    'Sheesham Wood', 
                    'Teak Wood', 
                    'Rosewood', 
                    'White Cedar', 
                    'Composite Marble', 
                    'Brass Inlay Teak'
                  ] as MandirMaterial[]).map(mat => (
                    <button
                      type="button"
                      key={mat}
                      onClick={() => setMaterial(mat)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                        material === mat ? 'bg-[#7b581e] text-white border-[#7b581e] font-bold shadow' : 'bg-[#f6f3f2] border-[#eae5e2] text-gray-700'
                      }`}
                    >
                      <span>{mat}</span>
                      {material === mat && <Check className="w-3.5 h-3.5 text-[#fdcc87]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Finish Polish</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {([
                    'Natural Teak Polish',
                    'Dark Walnut',
                    'Antique Honey',
                    'Heritage Rosewood',
                    'Matte Ivory & Gold',
                    'Pure White PU'
                  ] as FinishType[]).map(fin => (
                    <button
                      type="button"
                      key={fin}
                      onClick={() => setFinish(fin)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border flex items-center justify-between transition-all ${
                        finish === fin ? 'bg-[#570000] text-white border-[#570000] font-bold shadow' : 'bg-[#f6f3f2] border-[#eae5e2] text-gray-700'
                      }`}
                    >
                      <span className="truncate">{fin}</span>
                      {finish === fin && <Check className="w-3.5 h-3.5 text-[#fdcc87]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Mandir Custom Inclusions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eae5e2]">
                <div className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Mandir Features & Storage Inclusions</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableFeatures.map((feat, idx) => {
                  const isChecked = selectedFeatures.includes(feat);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleFeature(feat)}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-[#570000]/5 border-[#570000] text-[#570000] font-semibold' 
                          : 'bg-[#fbf9f8] border-[#eae5e2] text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                        isChecked ? 'bg-[#570000] border-[#570000] text-white' : 'border-gray-400 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-[#fdcc87]" />}
                      </div>
                      <span className="text-xs">{feat}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Engravings & Sacred Deity Notes */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eae5e2]">
                <div className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Mantras, Vigraha Heights & Blueprints</h3>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mantra / Arch Engraving Requirements</label>
                <input
                  type="text"
                  value={engraving}
                  onChange={e => setEngraving(e.target.value)}
                  placeholder="e.g. Om Namah Shivaya / Gayatri Mantra in Devanagari script..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Additional Spatial Requirements & Deity Vigraha Heights</label>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={e => setAdditionalNotes(e.target.value)}
                  placeholder="Mention idol dimensions, room corner electrical points, or specific Vastu requirements..."
                  className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                />
              </div>

              {/* Upload Reference Photo */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">Upload Living Space Photo / Architectural Blueprint (Optional)</label>
                <div className="border-2 border-dashed border-[#eae5e2] rounded-2xl p-6 text-center hover:border-[#570000] transition-colors bg-[#fbf9f8] relative cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-[#7b581e] mx-auto mb-2" />
                  {uploadedFileName ? (
                    <p className="text-xs font-bold text-[#570000]">
                      Uploaded: {uploadedFileName}
                    </p>
                  ) : (
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Click to upload photo or sketch</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, PDF up to 25MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 5: Contact Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#eae5e2]">
                <div className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center font-bold text-xs">
                  5
                </div>
                <h3 className="font-serif font-bold text-lg text-[#1f1c1b]">Contact & Delivery Location</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number (WhatsApp for CAD preview)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-[#eae5e2] bg-[#fbf9f8] focus:outline-none focus:border-[#570000]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                id="submit-bespoke-mandir-btn"
                className="w-full py-4 px-6 rounded-2xl bg-[#570000] hover:bg-[#800000] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#570000]/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#fdcc87]" />
                <span>Submit Bespoke Mandir Request • Free 3D Mockup</span>
              </button>
            </div>
          </form>

          {/* Right: Live Quote Calculator & Bespoke Process */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Instant Estimate Card */}
            <div className="bg-[#1f1c1b] text-white rounded-3xl p-6 shadow-xl border border-[#3e0000] sticky top-28 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs uppercase font-bold tracking-wider text-[#fdcc87]">Live Estimate</span>
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">Vedic Calculator</span>
              </div>

              <div>
                <p className="text-xs text-gray-400">Estimated Price Range:</p>
                <p className="text-3xl font-serif font-bold text-[#fdcc87] mt-1">{formatPrice(estimatedQuote)}</p>
                <p className="text-[11px] text-gray-400 mt-1">Includes Seasoned Wood, Brass Bells, LED lighting & Multi-coat Wax Polish.</p>
              </div>

              <div className="space-y-2 text-xs border-t border-white/10 pt-4 text-gray-300">
                <div className="flex justify-between">
                  <span>Selected Wood:</span>
                  <span className="font-semibold text-white">{material}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span className="font-semibold text-white">{width}"W × {depth}"D × {height}"H</span>
                </div>
                <div className="flex justify-between">
                  <span>Finish:</span>
                  <span className="font-semibold text-white">{finish}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custom Inclusions:</span>
                  <span className="font-semibold text-white">{selectedFeatures.length} features</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#fdcc87]">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold">Crafting & Delivery Window</span>
                </div>
                <p className="text-gray-300 text-[11px]">18 - 24 business days from 3D CAD design approval.</p>
              </div>

              <div className="space-y-2 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#fdcc87]" />
                  <span>Free White-Glove Installation</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#fdcc87]" />
                  <span>5-Year Termite & Structural Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#fdcc87]" />
                  <span>Personal Master Artisan Video Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* The Bespoke Process Timeline */}
      <section className="bg-white rounded-3xl border border-[#eae5e2] p-8 sm:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#7b581e]">Lineage & Method</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f1c1b] mt-1">
            The Bespoke Mandir Journey
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center text-xs font-bold">1</span>
            <h4 className="font-bold text-xs text-[#1f1c1b]">CAD Blueprint</h4>
            <p className="text-[11px] text-gray-600">3D simulation of dimensions, jaali patterns, and deity clearances for your approval.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center text-xs font-bold">2</span>
            <h4 className="font-bold text-xs text-[#1f1c1b]">Wood Seasoning</h4>
            <p className="text-[11px] text-gray-600">Kiln-seasoned Grade-A timber selected to prevent warping and ensure durability.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center text-xs font-bold">3</span>
            <h4 className="font-bold text-xs text-[#1f1c1b]">Artisan Sculpting</h4>
            <p className="text-[11px] text-gray-600">Master craftsmen chisel intricate jaali arches, brass bells, and Gopuram spires.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center text-xs font-bold">4</span>
            <h4 className="font-bold text-xs text-[#1f1c1b]">Hand Wax Polish</h4>
            <p className="text-[11px] text-gray-600">Multi-coat hand-buffed organic oil polish for rich deep grain protection.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f6f3f2] border border-[#eae5e2] space-y-2">
            <span className="w-7 h-7 rounded-full bg-[#570000] text-white flex items-center justify-center text-xs font-bold">5</span>
            <h4 className="font-bold text-xs text-[#1f1c1b]">White Glove Setup</h4>
            <p className="text-[11px] text-gray-600">Multi-ply wooden crated delivery with inside-room leveling and assembly.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
